import test from "node:test";
import assert from "node:assert/strict";
import {
  liveEventToVoiceMatch,
  liveScheduleIsReady,
  normalizeLiveSchedulePayload,
} from "../src/features/ahmv-phone/schedules/live.server.ts";
import {
  nextEventServiceAuthoritative,
  scheduleRangeAnswerAuthoritative,
} from "../src/features/ahmv-phone/schedules/authoritative.server.ts";

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
  assert.equal(voice.endTime, "19:50");
  assert.match(voice.mapsUrl ?? "", /^https:\/\/www\.google\.com\/maps\/dir/);
  assert.match(voice.wazeUrl ?? "", /^https:\/\/www\.waze\.com\/ul/);
  assert.match(voice.appleMapsUrl ?? "", /^https:\/\/maps\.apple\.com/);
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


const liveSettings = {
  TAKATAK_AHMV_SCHEDULE_URL: "https://schedule.example/ahmv",
  TAKATAK_AHMV_SERVICE_TOKEN: "server-token",
  AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES: "360",
};

test("authoritative next-event service prefers fresh live feed over bundled snapshot", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          status: "active",
          updatedAt: "2026-10-03T13:30:00-04:00",
          sourceUrl: "https://official.example/schedule",
          events: [{
            id: "live-junior-1",
            type: "Match",
            team: "Junior",
            startsAt: "2026-10-03T20:00:00-04:00",
            endsAt: "2026-10-03T21:30:00-04:00",
            status: "scheduled",
            venue: "Auditorium de Verdun",
            venueAddress: "4110 Boulevard LaSalle, Montréal, QC",
          }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );

    const result = await nextEventServiceAuthoritative(
      "Junior",
      "fr",
      {},
      liveSettings,
      new Date("2026-10-03T14:00:00-04:00"),
    );

    assert.equal(result.outcome, "scheduled");
    assert.equal(result.scheduleMeta.source, "live");
    assert.equal(result.scheduleMeta.liveStatus, "active");
    assert.match(result.smsText, /2026-10-03 20:00/);
    assert.match(result.smsText, /Auditorium de Verdun/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authoritative service preserves a verified live no-match instead of falling back to unrelated snapshot data", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          status: "no_match",
          updatedAt: "2026-10-03T13:30:00-04:00",
          sourceUrl: "https://official.example/schedule",
          events: [],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );

    const result = await nextEventServiceAuthoritative(
      "M13 A",
      "en",
      {},
      liveSettings,
      new Date("2026-10-03T14:00:00-04:00"),
    );

    assert.equal(result.outcome, "unpublished");
    assert.equal(result.scheduleMeta.source, "live");
    assert.match(result.smsText, /no upcoming event is confirmed/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("stale live feed can use the still-valid published weekly snapshot, but is labeled as snapshot fallback", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          status: "active",
          updatedAt: "2026-09-26T08:00:00-04:00",
          sourceUrl: "https://official.example/schedule",
          events: [{
            id: "stale",
            type: "Match",
            team: "Junior",
            startsAt: "2026-09-28T22:00:00-04:00",
            status: "scheduled",
          }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );

    const result = await nextEventServiceAuthoritative(
      "Junior",
      "fr",
      {},
      { ...liveSettings, AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES: "60" },
      new Date("2026-09-28T18:00:00-04:00"),
    );

    assert.equal(result.scheduleMeta.source, "published_snapshot");
    assert.equal(result.scheduleMeta.liveStatus, "stale");
    assert.equal(result.outcome, "scheduled");
    assert.match(result.smsText, /21:00/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("after bundled snapshot expiry, stale live feed fails closed instead of inventing an event", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          status: "active",
          updatedAt: "2026-10-01T08:00:00-04:00",
          sourceUrl: "https://official.example/schedule",
          events: [{
            id: "stale",
            type: "Match",
            team: "Junior",
            startsAt: "2026-10-05T18:00:00-04:00",
            status: "scheduled",
          }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );

    const result = await nextEventServiceAuthoritative(
      "Junior",
      "fr",
      {},
      { ...liveSettings, AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES: "60" },
      new Date("2026-10-05T12:00:00-04:00"),
    );

    assert.equal(result.scheduleMeta.source, "unavailable");
    assert.equal(result.scheduleMeta.liveStatus, "stale");
    assert.equal(result.outcome, "unavailable");
    assert.match(result.smsText, /Horaire actuel non disponible/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authoritative weekly member range uses the live feed", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          status: "active",
          updatedAt: "2026-10-03T13:30:00-04:00",
          sourceUrl: "https://official.example/schedule",
          events: [
            {
              id: "live-junior-1",
              type: "Match",
              team: "Junior",
              startsAt: "2026-10-03T20:00:00-04:00",
              endsAt: "2026-10-03T21:30:00-04:00",
              status: "scheduled",
              venue: "Auditorium de Verdun",
            },
            {
              id: "live-junior-2",
              type: "Pratique",
              team: "Junior",
              startsAt: "2026-10-04T17:00:00-04:00",
              endsAt: "2026-10-04T18:00:00-04:00",
              status: "scheduled",
              venue: "Aréna St-Charles",
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );

    const result = await scheduleRangeAnswerAuthoritative(
      "Junior",
      "week",
      "fr",
      {},
      liveSettings,
      new Date("2026-10-03T14:00:00-04:00"),
    );

    assert.equal(result.scheduleMeta.source, "live");
    assert.equal(result.outcome, "scheduled");
    assert.match(result.text, /2026-10-03 20:00/);
    assert.match(result.text, /2026-10-04 17:00/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
