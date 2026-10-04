import test from "node:test";
import assert from "node:assert/strict";
import { normalizeExtractedScheduleRows } from "../src/lib/weekly-schedule-normalizer.ts";

const context = {
  week: 5,
  weekStart: "2026-10-05",
  weekEnd: "2026-10-11",
  sourceUrl: "https://ahmverdun.com/storage/week5.pdf",
  method: "visual-transcription" as const,
};

test("visual PDF rows normalize without inventing hockey facts", () => {
  const result = normalizeExtractedScheduleRows([
    {
      rowId: "page1-row7",
      date: "2026-10-07",
      start: "21:00",
      end: "22:00",
      venue: "À DENIS",
      activity: "Pratique",
      group: "M19",
      sourcePage: 1,
    },
  ], context);

  assert.deepEqual(result.errors, []);
  assert.equal(result.activities.length, 1);
  assert.equal(result.activities[0]?.arenaSlug, "auditorium-de-verdun");
  assert.equal(result.activities[0]?.venue, "À DENIS");
  assert.equal(result.activities[0]?.group, "M19");
  assert.equal(result.activities[0]?.provenance.method, "visual-transcription");
  assert.equal(result.activities[0]?.provenance.sourcePage, 1);
});

test("unknown venues stay unknown instead of being guessed", () => {
  const result = normalizeExtractedScheduleRows([
    {
      rowId: "page2-row1",
      date: "2026-10-08",
      start: "18:00",
      end: "19:00",
      venue: "Glace inconnue",
      activity: "Pratique",
      group: "M9",
    },
  ], context);

  assert.deepEqual(result.errors, []);
  assert.equal(result.activities[0]?.arenaSlug, undefined);
  assert.equal(result.activities[0]?.venue, "Glace inconnue");
});

test("invalid rows are rejected rather than inferred", () => {
  const result = normalizeExtractedScheduleRows([
    {
      rowId: "bad-time",
      date: "2026-10-09",
      start: "9h12",
      end: "",
      venue: "À DENIS",
      activity: "Match",
      group: "M7",
    },
  ], context);

  assert.equal(result.activities.length, 0);
  assert.equal(result.errors.length, 1);
});
