import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CURRENT_TEAMS } from "../src/data/teams.ts";
import { teamVisualForCategory } from "../src/data/team-visuals.ts";
import { teamsForCategory } from "../src/data/team-directory.ts";
import { officialScheduleQueryForTeam } from "../src/lib/official-schedule-team.ts";

const carousel = readFileSync("src/components/schedule-team-carousel.tsx", "utf8");
const page = readFileSync("src/routes/horaires.tsx", "utf8");

test("all published 2026-27 categories are selectable with existing library photographs", () => {
  const slugs = CURRENT_TEAMS.map((team) => team.slug);
  assert.deepEqual(slugs, ["m5", "m7", "m9", "m11", "m13", "m15", "m17", "m19", "m22", "feminin"]);
  assert.equal(slugs.includes("m8"), false, "Do not invent a new M8 team without source evidence");
  for (const team of CURRENT_TEAMS) {
    const visual = teamVisualForCategory(team.slug);
    assert.ok(visual?.url.startsWith("/"), `Missing approved AHMV media for ${team.slug}`);
    assert.match(team.slug, /^[a-z][a-z0-9-]*$/);
  }
});

test("the carousel is first and is touch-, keyboard- and screen-reader-friendly", () => {
  assert.ok(page.indexOf("<ScheduleTeamCarousel") > 0);
  assert.ok(page.indexOf("<ScheduleTeamCarousel") < page.indexOf("<OfficialWeekSchedule"));
  assert.doesNotMatch(page, /<MediaZoomTrigger|<PageHeader/);
  assert.match(carousel, /snap-x snap-mandatory/);
  assert.match(carousel, /overflow-x-auto/);
  assert.match(carousel, /overscroll-x-contain/);
  assert.match(carousel, /data-ahmv-carousel-prev/);
  assert.match(carousel, /data-ahmv-carousel-next/);
  assert.match(carousel, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(carousel, /focus-visible:ring-4/);
  assert.match(carousel, /aria-labelledby="schedule-choose-team"/);
  assert.match(carousel, /scrollBy\(/);
  assert.match(carousel, /data-ahmv-team-category=\{team.slug\}/);
  assert.match(carousel, /teamVisualForCategory\(team.slug\)/);
});

test("category selection filters published schedule using existing documented logic", () => {
  assert.match(carousel, /\/horaires\?team=\$\{encodeURIComponent\(team.slug\)\}#horaire-publie/);
  assert.match(page, /const scheduleTeamSlug = selectedTeam \?\? preferredTeam/);
  assert.match(page, /officialScheduleQueryForTeam\(scheduleTeam\)/);
  assert.match(page, /OfficialWeekSchedule initialQuery=\{officialInitialQuery\}/);
  assert.match(page, /onClick=\{\(\) => savePreferredTeam\("".*\)\}/);
  assert.equal(officialScheduleQueryForTeam(CURRENT_TEAMS.find(t => t.slug === "m7")), "M7");
  assert.equal(officialScheduleQueryForTeam(CURRENT_TEAMS.find(t => t.slug === "feminin")), "Louves");
});

test("girls hockey preserves exact-team identity and does not fake its season", () => {
  const historical = teamsForCategory("feminin");
  assert.ok(historical.length > 0);
  assert.ok(historical.some(t => t.level.includes("M12 A")));
  assert.match(page, /href="\/equipes\/louves-m12b"/);
  assert.match(page, /Répertoire historique/);
  assert.match(page, /heures M12B attendent leur validation officielle/);
  assert.match(page, /FEMALE_DIRECTORY_ENTRIES\.map/);
  assert.doesNotMatch(page, /M8|resultsCount|fakeScore/);
});

test("existing saved team and external-calendar links are preserved but secondary", () => {
  assert.match(page, /selectedTeams\.map/);
  assert.match(page, /publicTeamHubUrl\(entry\)/);
  assert.match(page, /EXTERNAL_LINKS\.officialGirlsSchedule/);
  assert.ok(page.indexOf("<OfficialWeekSchedule") < page.indexOf("<details"));
});
