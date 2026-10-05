import { describe, expect, test } from "bun:test";
import { OFFICIAL_WEEK_ACTIVITIES, type OfficialWeekActivity } from "../src/data/official-week";
import { PUBLIC_TEAM_DIRECTORY } from "../src/data/team-directory";
import { officialWeekActivityMatchesPublicTeam } from "../src/lib/official-schedule-team";

const team = (id: string) => {
  const found = PUBLIC_TEAM_DIRECTORY.find((item) => item.legacyScheduleTeamId === id);
  if (!found) throw new Error(`Missing test team ${id}`);
  return found;
};

const m11Leafs = team("2025191400018816");
const m11Broncos = team("2025191400036563");
const m11Bulldogs = team("2025191400019259");
const m11Coyotes = team("2025191400019495");
const m13Leafs = team("2025191400022838");
const m13Coyotes = team("2025191400028967");
const m15Leafs = team("2025191400023578");
const m15Bulldogs = team("2025191400023783");
const louves = team("2025191400035012");
const customHockey = team("2025191400041974");

function actual(id: string) {
  const found = OFFICIAL_WEEK_ACTIVITIES.find((item) => item.id === id);
  if (!found) throw new Error(`Missing official activity ${id}`);
  return found;
}

describe("official weekly exact-team matching", () => {
  test("explicit named teams only match the published nickname", () => {
    const m11Named = actual("ow-1010-1200-m11");
    expect(officialWeekActivityMatchesPublicTeam(m11Named, m11Leafs)).toBe(true);
    expect(officialWeekActivityMatchesPublicTeam(m11Named, m11Coyotes)).toBe(true);
    expect(officialWeekActivityMatchesPublicTeam(m11Named, m11Broncos)).toBe(false);
    expect(officialWeekActivityMatchesPublicTeam(m11Named, m11Bulldogs)).toBe(false);

    const m13CoyotesActivity = actual("ow-1010-1700-m13-coyotes");
    expect(officialWeekActivityMatchesPublicTeam(m13CoyotesActivity, m13Coyotes)).toBe(true);
    expect(officialWeekActivityMatchesPublicTeam(m13CoyotesActivity, m13Leafs)).toBe(false);
  });

  test("colour-only groups are never guessed onto an exact public team", () => {
    const sharedColours = actual("ow-1006-1700-m11");
    const whiteGroup = actual("ow-1011-1100-m11-blanc");

    for (const candidate of [m11Leafs, m11Broncos, m11Bulldogs, m11Coyotes]) {
      expect(officialWeekActivityMatchesPublicTeam(sharedColours, candidate)).toBe(false);
      expect(officialWeekActivityMatchesPublicTeam(whiteGroup, candidate)).toBe(false);
    }
  });

  test("generic category practices remain visible to teams in that category", () => {
    const m15 = actual("ow-1011-1300-m15");
    expect(officialWeekActivityMatchesPublicTeam(m15, m15Leafs)).toBe(true);
    expect(officialWeekActivityMatchesPublicTeam(m15, m15Bulldogs)).toBe(true);
    expect(officialWeekActivityMatchesPublicTeam(m15, m13Leafs)).toBe(false);
  });

  test("Louves and hockey-sur-mesure keep their exact public scopes", () => {
    expect(officialWeekActivityMatchesPublicTeam(actual("ow-1009-1800-louves"), louves)).toBe(true);
    expect(officialWeekActivityMatchesPublicTeam(actual("ow-1006-1800-hsm"), customHockey)).toBe(true);
    expect(officialWeekActivityMatchesPublicTeam(actual("ow-1006-1800-hsm"), m11Leafs)).toBe(false);
  });

  test("unknown colour labels fail closed", () => {
    const synthetic: OfficialWeekActivity = {
      id: "synthetic",
      date: "2026-10-10",
      start: "12:00",
      end: "13:00",
      venue: "Aréna Denis Savard",
      activity: "Pratique",
      group: "M13 groupe bleu",
      status: "scheduled",
    };
    expect(officialWeekActivityMatchesPublicTeam(synthetic, m13Leafs)).toBe(false);
    expect(officialWeekActivityMatchesPublicTeam(synthetic, m13Coyotes)).toBe(false);
  });
});
