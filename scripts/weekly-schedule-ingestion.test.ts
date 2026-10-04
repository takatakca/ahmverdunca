import test from "node:test";
import assert from "node:assert/strict";
import { validateWeeklyScheduleImport } from "../src/lib/weekly-schedule-ingestion.ts";

const sourceUrl = "https://ahmverdun.com/storage/90Cjd82i6cWwdFbIKvMD50CVxwud8InYzSR9S0v6.pdf";

function payload(overrides: Record<string, unknown> = {}) {
  return {
    week: 5,
    start: "2026-10-05",
    end: "2026-10-11",
    publishedAt: "2026-10-02",
    sourceUrl,
    method: "visual-transcription" as const,
    rows: [
      {
        rowId: "p1-r1",
        date: "2026-10-05",
        start: "18:00",
        end: "19:00",
        venue: "À DENIS",
        activity: "Pratique",
        group: "M11 groupe 5",
        sourcePage: 1,
      },
    ],
    ...overrides,
  };
}

test("accepts a transcription only when it matches the published weekly document", () => {
  const result = validateWeeklyScheduleImport(payload());
  assert.deepEqual(result.errors, []);
  assert.equal(result.activities.length, 1);
  assert.equal(result.activities[0]?.arenaSlug, "auditorium-de-verdun");
  assert.equal(result.activities[0]?.provenance.sourceUrl, sourceUrl);
});

test("rejects a transcription attached to the wrong official PDF", () => {
  const result = validateWeeklyScheduleImport(payload({ sourceUrl: "https://example.com/wrong.pdf" }));
  assert.equal(result.activities.length, 0);
  assert.match(result.errors.join(" "), /source URL does not match/i);
});

test("rejects an unmapped venue instead of guessing a destination", () => {
  const result = validateWeeklyScheduleImport(payload({
    rows: [{
      rowId: "p1-r2",
      date: "2026-10-05",
      start: "19:00",
      end: "20:00",
      venue: "Glace mystère",
      activity: "Pratique",
      group: "M13",
    }],
  }));
  assert.equal(result.activities.length, 0);
  assert.deepEqual(result.unmappedVenues, ["Glace mystère"]);
  assert.match(result.errors.join(" "), /not mapped to a verified arena/i);
});

test("rejects ambiguous human time notation rather than normalizing it", () => {
  const result = validateWeeklyScheduleImport(payload({
    rows: [{
      rowId: "p1-r3",
      date: "2026-10-05",
      start: "9h12",
      end: "10h12",
      venue: "À DENIS",
      activity: "Match",
      group: "M7",
    }],
  }));
  assert.equal(result.activities.length, 0);
  assert.match(result.errors.join(" "), /invalid time range/i);
});

test("rejects a week not registered in the official document directory", () => {
  const result = validateWeeklyScheduleImport(payload({ week: 99 }));
  assert.equal(result.activities.length, 0);
  assert.match(result.errors.join(" "), /not present in WEEKLY_SCHEDULE_DOCUMENTS/);
});
