import test from "node:test";
import assert from "node:assert/strict";
import {
  liveEventToVoiceMatch,
  liveScheduleIsReady,
  normalizeLiveSchedulePayload,
} from "../src/features/ahmv-phone/schedules/live.server.ts";

test("fresh authoritative schedule feed is accepted with provenance", () => {
  const result = normalizeLiveSchedulePayload(
    {
      status: "active",
      updatedAt: "2026-10-03T12:00:00-04:00",
      sourceUrl: "https://official.example/schedule",
      events: [{
        id: "evt-1",
        type: "game",
        team: "M13 A LEAFS VERDUN",
        startsAt: "2026-10-05T18:30:00-04:00",
        endsAt: "2026-10-05T19:50:00-04:00",
        status: "scheduled",
        venue: "Auditorium de Verdun",
        venueAddress: "4110 Boulevard LaSalle, Montréal, QC",
        officialUrl: "https://official.example/event/evt-1",
      }],
    },
    { AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES: "360" },
    new Date("2026-10-03T14:00:00-04:00"),
  );
  assert.equal(result.status, "active");
  assert.equal(liveScheduleIsReady(result), true);
  assert.equal(result.events.length, 1);
  const voice = liveEventToVoiceMatch(result.events[0]!);
  assert.equal(voice.date, "2026-10-05");
  assert.equal(voice.time, "18:30");
  assert.equal(voice.endTime, "19:50");\n  assert.match(voice.mapsUrl ?? "", /^https:\/\/www\\.google\\.com\/maps\/dir/);\n  assert.match(voice.wazeUrl ?? "", /^https:\/\/www\\.waze\\.com\/ul/);\n  assert.match(voice.appleMapsUrl ?? "", /^https:\/\/maps\\.apple\\.com/);
});

test("stale live schedule is rejected instead of overriding the fallback", () => {
  const result = normalizeLiveSchedulePayload(
    {
      status: "active",
      updatedAt: "2026-10-01T12:00:00-04:00",
      sourceUrl: "https://official.example/schedule",
      events: [{ id: "evt-1", startsAt: "2026-10-05T18:30:00-04:00" }],
    },
    { AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES: "60" },
    new Date("2026-10-03T14:00:00-04:00"),
  );
  assert.equal(result.status, "stale");
  assert.equal(liveScheduleIsReady(result), false);
  assert.equal(result.events.length, 0);
});

test("feed without HTTPS provenance is rejected", () => {
  const result = normalizeLiveSchedulePayload(
    {
      status: "active",
      updatedAt: "2026-10-03T13:30:00-04:00",
      sourceUrl: "http://untrusted.example/schedule",
      events: [],
    },
    {},
    new Date("2026-10-03T14:00:00-04:00"),
  );
  assert.equal(result.status, "invalid_upstream");
  assert.equal(result.reason, "missing_provenance");
});
