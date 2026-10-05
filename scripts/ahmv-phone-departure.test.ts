import test from "node:test";
import assert from "node:assert/strict";
import {
  createSignedDepartureLink,
  validateDepartureLink,
} from "../src/features/ahmv-phone/departure/link.server.ts";
import {
  arrivalBufferMinutes,
  recommendedDepartureAt,
  resolveRouteEstimate,
} from "../src/features/ahmv-phone/departure/route-provider.server.ts";
import { handleAhmvDeparture } from "../src/features/ahmv-phone/departure/handler.server.ts";

const settings = {
  AHMV_SMART_DEPARTURE_ENABLED: "true",
  AHMV_DEPARTURE_LINK_SECRET: "abcdefghijklmnopqrstuvwxyz123456",
};

test("smart-departure link is signed without phone or identity data", () => {
  const now = new Date("2026-10-03T12:00:00.000Z");
  const link = createSignedDepartureLink(
    "ow-1006-2000-m15",
    settings,
    now,
    3600,
  );
  assert.ok(link);
  assert.doesNotMatch(link ?? "", /1514|phone|contact|identity|abcdefghijklmnopqrstuvwxyz/);

  const url = new URL(link!);
  assert.equal(
    validateDepartureLink(
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
});

test("smart-departure link rejects wrong or expired signatures", () => {
  const now = new Date("2026-10-03T12:00:00.000Z");
  const link = createSignedDepartureLink(
    "ow-1006-2000-m15",
    settings,
    now,
    60,
  );
  const url = new URL(link!);

  assert.equal(
    validateDepartureLink(
      {
        eventId: "ow-1006-2000-m15",
        expires: url.searchParams.get("exp") ?? "",
        signature: "00000000000000000000000000000000",
      },
      settings,
      now,
    ),
    false,
  );

  assert.equal(
    validateDepartureLink(
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

test("departure recommendation includes traffic duration and arrival buffer", () => {
  assert.equal(
    recommendedDepartureAt({
      eventStartsAt: "2026-10-04T21:00:00.000Z",
      trafficDurationMinutes: 45,
      arrivalBufferMinutes: 30,
    }),
    "2026-10-04T19:45:00.000Z",
  );
  assert.equal(arrivalBufferMinutes({}), 30);
  assert.equal(
    arrivalBufferMinutes({ AHMV_DEPARTURE_ARRIVAL_BUFFER_MINUTES: "45" }),
    45,
  );
});

test("route provider cleanly falls back when no provider is configured", async () => {
  const result = await resolveRouteEstimate(
    {
      origin: { latitude: 45.5, longitude: -73.57 },
      destination: "4110 Boulevard LaSalle, Montréal, QC",
      eventStartsAt: "2026-10-04T21:00:00.000Z",
    },
    {},
  );
  assert.deepEqual(result, {
    available: false,
    reason: "not_configured",
  });
});

test("departure page is disabled by default", async () => {
  const response = await handleAhmvDeparture(
    new Request("https://ahmverdun.ca/api/ahmv/departure"),
    {},
  );
  assert.equal(response?.status, 404);
});

test("signed departure page requests geolocation only after a button action", async () => {
  const link = createSignedDepartureLink(
    "ow-1006-2000-m15",
    settings,
    new Date(),
    3600,
  );
  const response = await handleAhmvDeparture(
    new Request(link!),
    settings,
  );
  assert.equal(response?.status, 200);
  assert.match(response?.headers.get("Permissions-Policy") ?? "", /geolocation/);
  assert.match(response?.headers.get("X-Robots-Tag") ?? "", /noindex/);
  const body = await response!.text();
  assert.match(body, /Utiliser ma position/);
  assert.match(body, /navigator\.geolocation/);
  assert.match(body, /Aucun GPS n’est déduit de votre numéro de téléphone/);
  assert.match(body, /Ouvrir Waze/);
});

test("estimate endpoint rejects an invalid signed request before using location", async () => {
  const response = await handleAhmvDeparture(
    new Request("https://ahmverdun.ca/api/ahmv/departure/estimate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "ow-1006-2000-m15",
        exp: "9999999999",
        sig: "00000000000000000000000000000000",
        origin: { latitude: 45.5, longitude: -73.57 },
      }),
    }),
    settings,
  );
  assert.equal(response?.status, 403);
  assert.doesNotMatch(await response!.text(), /45\.5|-73\.57/);
});


test("signed smart-departure page follows Spanish language preference", async () => {
  const link = createSignedDepartureLink(
    "ow-1006-2000-m15",
    settings,
    new Date(),
    3600,
  );
  const url = new URL(link!);
  url.searchParams.set("lang", "es");
  const response = await handleAhmvDeparture(new Request(url), settings);
  assert.equal(response?.status, 200);
  assert.equal(response?.headers.get("content-language"), "es");
  const body = await response!.text();
  assert.match(body, /Salida inteligente/);
  assert.match(body, /Usar mi ubicación/);
  assert.match(body, /Abrir Waze/);
  assert.match(body, /No se deduce ninguna ubicación GPS/);
});
