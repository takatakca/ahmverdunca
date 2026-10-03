import test from "node:test";
import assert from "node:assert/strict";
import {
  createSignedCalendarLink,
  validateCalendarLink,
} from "../src/features/ahmv-phone/calendar/link.server.ts";
import {
  calendarIcs,
  googleCalendarUrl,
} from "../src/features/ahmv-phone/calendar/event.ts";
import { handleAhmvCalendarLink } from "../src/features/ahmv-phone/calendar/handler.server.ts";

const settings = {
  AHMV_CALENDAR_LINKS_ENABLED: "true",
  AHMV_CALENDAR_LINK_SECRET: "12345678901234567890123456789012",
};

test("calendar links are disabled without the release flag", () => {
  assert.equal(
    createSignedCalendarLink("ow-0929-1700", {
      AHMV_CALENDAR_LINK_SECRET: settings.AHMV_CALENDAR_LINK_SECRET,
    }),
    null,
  );
});

test("calendar link is signed expiring and does not expose the secret", () => {
  const now = new Date("2026-10-03T12:00:00.000Z");
  const link = createSignedCalendarLink(
    "ow-0929-1700",
    settings,
    now,
    3600,
  );
  assert.ok(link);
  assert.doesNotMatch(link ?? "", /12345678901234567890123456789012/);

  const url = new URL(link!);
  assert.equal(
    validateCalendarLink(
      {
        eventId: url.searchParams.get("event") ?? "",
        expires: url.searchParams.get("exp") ?? "",
        signature: url.searchParams.get("sig") ?? "",
      },
      settings,
      now,
    ),
    true,
  );

  assert.equal(
    validateCalendarLink(
      {
        eventId: "ow-0929-1700",
        expires: url.searchParams.get("exp") ?? "",
        signature: "00000000000000000000000000000000",
      },
      settings,
      now,
    ),
    false,
  );
});

test("expired calendar link is rejected", () => {
  const createdAt = new Date("2026-10-03T12:00:00.000Z");
  const link = createSignedCalendarLink(
    "ow-0929-1700",
    settings,
    createdAt,
    60,
  );
  const url = new URL(link!);

  assert.equal(
    validateCalendarLink(
      {
        eventId: url.searchParams.get("event") ?? "",
        expires: url.searchParams.get("exp") ?? "",
        signature: url.searchParams.get("sig") ?? "",
      },
      settings,
      new Date("2026-10-03T12:02:00.000Z"),
    ),
    false,
  );
});

test("ICS export uses exact Toronto event time and arena destination", () => {
  const ics = calendarIcs(
    "ow-0929-1700",
    new Date("2026-10-03T12:00:00.000Z"),
  );
  assert.ok(ics);
  assert.match(ics ?? "", /BEGIN:VCALENDAR/);
  assert.match(ics ?? "", /DTSTART:20260929T210000Z/);
  assert.match(ics ?? "", /DTEND:20260929T220000Z/);
  assert.match(ics ?? "", /LOCATION:/);
  assert.match(ics ?? "", /4110/);
  assert.match(ics ?? "", /ahmverdun\.ca/);
});

test("Google Calendar template is generated from the same event", () => {
  const link = googleCalendarUrl("ow-0929-1700");
  assert.ok(link);
  const url = new URL(link!);
  assert.equal(url.hostname, "calendar.google.com");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.match(url.searchParams.get("dates") ?? "", /20260929T210000Z/);
});

test("calendar endpoint is disabled by default", () => {
  const response = handleAhmvCalendarLink(
    new Request("https://ahmverdun.ca/api/ahmv/calendar/add"),
    {},
  );
  assert.equal(response?.status, 404);
});

test("signed calendar landing exposes calendar and directions actions", async () => {
  const link = createSignedCalendarLink(
    "ow-0929-1700",
    settings,
    new Date(),
    3600,
  );
  const response = handleAhmvCalendarLink(new Request(link!), settings);
  assert.equal(response?.status, 200);
  assert.match(response?.headers.get("X-Robots-Tag") ?? "", /noindex/);
  assert.match(
    response?.headers.get("content-security-policy") ?? "",
    /default-src 'none'/,
  );
  const body = await response!.text();
  assert.match(body, /Google Calendar/);
  assert.match(body, /Apple \/ Outlook \/ \.ics/);
  assert.match(body, /Directions/);
});

test("same signed link can download an ICS file", async () => {
  const link = createSignedCalendarLink(
    "ow-0929-1700",
    settings,
    new Date(),
    3600,
  );
  const url = new URL(link!);
  url.searchParams.set("format", "ics");
  const response = handleAhmvCalendarLink(new Request(url), settings);
  assert.equal(response?.status, 200);
  assert.match(response?.headers.get("content-type") ?? "", /text\/calendar/);
  assert.match(await response!.text(), /BEGIN:VEVENT/);
});


test("signed calendar landing follows Spanish language preference", async () => {
  const link = createSignedCalendarLink(
    "ow-0929-1700",
    settings,
    new Date(),
    3600,
  );
  const url = new URL(link!);
  url.searchParams.set("lang", "es");
  const response = handleAhmvCalendarLink(new Request(url), settings);
  assert.equal(response?.status, 200);
  assert.equal(response?.headers.get("content-language"), "es");
  const body = await response!.text();
  assert.match(body, /Agregar al calendario/);
  assert.match(body, /Cómo llegar/);
  assert.match(body, /Servicio AHMV impulsado por GROUPE TAKATAK/);
});
