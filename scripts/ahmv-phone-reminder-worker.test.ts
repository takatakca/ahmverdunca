import test from "node:test";
import assert from "node:assert/strict";
import {
  approvedReminderTeamMap,
  authoritativeEventsFromSchedule,
  torontoLocalDateTimeToIso,
} from "../src/features/ahmv-phone/reminders/source.ts";
import { gameReminderText } from "../src/features/ahmv-phone/reminders/templates.ts";
import { handleAhmvPhoneReminderCron } from "../src/features/ahmv-phone/reminders/handler.server.ts";
import type { ScheduleSnapshot } from "../src/lib/ahmv-phone.ts";

test("Toronto local event time converts correctly during daylight time", () => {
  assert.equal(
    torontoLocalDateTimeToIso("2026-10-03", "17:00"),
    "2026-10-03T21:00:00.000Z",
  );
});

test("Toronto local event time converts correctly during standard time", () => {
  assert.equal(
    torontoLocalDateTimeToIso("2027-01-03", "17:00"),
    "2027-01-03T22:00:00.000Z",
  );
});

test("reminder mapping accepts only explicit known public team IDs", () => {
  const map = approvedReminderTeamMap({
    AHMV_REMINDER_TEAM_MAP_JSON:
      '{"Junior":"2025191400035011","M13 A":"2025191400022838"}',
  });
  assert.equal(map["Junior"], "2025191400035011");
  assert.throws(
    () =>
      approvedReminderTeamMap({
        AHMV_REMINDER_TEAM_MAP_JSON: '{"Junior":"unknown-team"}',
      }),
    /Invalid reminder team mapping/,
  );
});

test("schedule adapter ignores unmapped groups instead of guessing", () => {
  const snapshot: ScheduleSnapshot = {
    start: "2026-10-03",
    end: "2026-10-04",
    activities: [
      {
        id: "event-1",
        date: "2026-10-03",
        start: "17:00",
        end: "18:00",
        venue: "Aréna St-Charles",
        activity: "Match",
        group: "Junior",
        status: "scheduled",
      },
      {
        id: "event-2",
        date: "2026-10-03",
        start: "18:00",
        end: "19:00",
        venue: "À DENIS",
        activity: "Match",
        group: "Unmapped group",
        status: "scheduled",
      },
    ],
  };

  const events = authoritativeEventsFromSchedule(snapshot, {
    Junior: "2025191400035011",
  });

  assert.equal(events.length, 1);
  assert.equal(events[0]?.providerEventId, "event-1");
  assert.equal(events[0]?.publicTeamId, "2025191400035011");
  assert.equal(events[0]?.startsAt, "2026-10-03T21:00:00.000Z");
});

test("game reminder text includes verified navigation destination", () => {
  const text = gameReminderText(
    {
      providerEventId: "event-1",
      publicTeamId: "2025191400035011",
      startsAt: "2026-10-03T21:00:00.000Z",
      venue: "Aréna St-Charles",
      status: "scheduled",
    },
    "fr",
  );
  assert.match(text, /Rappel/);
  assert.match(text, /Aréna St-Charles/);
  assert.match(text, /google\.com\/maps/);
});

test("reminder cron is disabled by default", async () => {
  const response = await handleAhmvPhoneReminderCron(
    new Request("https://ahmverdun.ca/api/ahmv/cron/phone-reminders", {
      method: "POST",
    }),
    {},
  );
  assert.equal(response?.status, 404);
});

test("reminder cron remains POST-only before cron authentication", async () => {
  const response = await handleAhmvPhoneReminderCron(
    new Request("https://ahmverdun.ca/api/ahmv/cron/phone-reminders"),
    { AHMV_PHONE_REMINDERS_ENABLED: "true" },
  );
  assert.equal(response?.status, 405);
});
