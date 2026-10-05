import test from "node:test";
import assert from "node:assert/strict";
import { normalizeExtractedScheduleRows } from "../src/lib/weekly-schedule-normalizer.ts";
import { officialWeekActivityMatchesPublicTeam } from "../src/lib/official-schedule-team.ts";
import { PUBLIC_TEAM_DIRECTORY } from "../src/data/team-directory.ts";
import { OFFICIAL_WEEK_ACTIVITIES } from "../src/data/official-week.ts";

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


test("team pages never infer colour-only groups as exact teams", () => {
  const getTeam = (id: string) => {
    const found = PUBLIC_TEAM_DIRECTORY.find((team) => team.legacyScheduleTeamId === id);
    assert.ok(found);
    return found;
  };
  const getActivity = (id: string) => {
    const found = OFFICIAL_WEEK_ACTIVITIES.find((activity) => activity.id === id);
    assert.ok(found);
    return found;
  };

  const m11Leafs = getTeam("2025191400018816");
  const m11Broncos = getTeam("2025191400036563");
  const m11Bulldogs = getTeam("2025191400019259");
  const m11Coyotes = getTeam("2025191400019495");
  const m13Leafs = getTeam("2025191400022838");
  const m13Coyotes = getTeam("2025191400028967");
  const m15Leafs = getTeam("2025191400023578");
  const m15Bulldogs = getTeam("2025191400023783");
  const louves = getTeam("2025191400035012");
  const customHockey = getTeam("2025191400041974");

  const namedM11 = getActivity("ow-1010-1200-m11");
  assert.equal(officialWeekActivityMatchesPublicTeam(namedM11, m11Leafs), true);
  assert.equal(officialWeekActivityMatchesPublicTeam(namedM11, m11Coyotes), true);
  assert.equal(officialWeekActivityMatchesPublicTeam(namedM11, m11Broncos), false);
  assert.equal(officialWeekActivityMatchesPublicTeam(namedM11, m11Bulldogs), false);

  const colourOnly = getActivity("ow-1006-1700-m11");
  for (const candidate of [m11Leafs, m11Broncos, m11Bulldogs, m11Coyotes]) {
    assert.equal(officialWeekActivityMatchesPublicTeam(colourOnly, candidate), false);
  }

  const m13CoyotesOnly = getActivity("ow-1010-1700-m13-coyotes");
  assert.equal(officialWeekActivityMatchesPublicTeam(m13CoyotesOnly, m13Coyotes), true);
  assert.equal(officialWeekActivityMatchesPublicTeam(m13CoyotesOnly, m13Leafs), false);

  const genericM15 = getActivity("ow-1011-1300-m15");
  assert.equal(officialWeekActivityMatchesPublicTeam(genericM15, m15Leafs), true);
  assert.equal(officialWeekActivityMatchesPublicTeam(genericM15, m15Bulldogs), true);
  assert.equal(officialWeekActivityMatchesPublicTeam(genericM15, m13Leafs), false);

  assert.equal(officialWeekActivityMatchesPublicTeam(getActivity("ow-1009-1800-louves"), louves), true);
  assert.equal(officialWeekActivityMatchesPublicTeam(getActivity("ow-1006-1800-hsm"), customHockey), true);
  assert.equal(officialWeekActivityMatchesPublicTeam(getActivity("ow-1006-1800-hsm"), m11Leafs), false);
});
