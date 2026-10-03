import assert from "node:assert/strict";
import {
  emptyVoiceMetrics,
  normalizedVoiceMetrics,
  recordArenaLookup,
  recordHumanHandoff,
  recordScheduleLookup,
} from "../src/metrics.js";

const session = { metrics: emptyVoiceMetrics() };

recordScheduleLookup(session, {
  ok: true,
  status: "verified_live",
  matches: [{ id: "game-1" }],
});
recordScheduleLookup(session, {
  ok: true,
  status: "source_expired",
  matches: [],
});
recordArenaLookup(session, {
  ok: true,
  status: "no_match",
  matches: [],
});
recordHumanHandoff(session, {
  ok: true,
  requested: true,
  duplicate: false,
});
recordHumanHandoff(session, {
  ok: true,
  requested: true,
  duplicate: true,
});

assert.deepEqual(normalizedVoiceMetrics(session.metrics), {
  scheduleLookups: 2,
  scheduleAuthoritative: 1,
  scheduleMatched: 1,
  arenaLookups: 1,
  arenaAuthoritative: 1,
  arenaMatched: 0,
  humanHandoffRequests: 1,
});

console.log(JSON.stringify({
  ok: true,
  test: "voice-value-metrics",
  expiredSourcesCountAsAuthoritative: false,
  duplicateHandoffsCountTwice: false,
}, null, 2));
