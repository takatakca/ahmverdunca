import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

test("home makes the on-ice team tools visible ahead of secondary content", () => {
  const home = read("src/routes/index.tsx");
  const tools = read("src/components/home/home-parent-command.tsx");
  const picker = read("src/components/team-picker.tsx");

  assert.ok(home.indexOf("<HomeParentCommand />") > 0);
  assert.ok(home.indexOf("<OfficialWeekPreview />") > home.indexOf("<HomeParentCommand />"));
  assert.match(tools, /<TeamPicker\s*\/>/);
  assert.match(tools, /publicTeamScheduleUrl\(team\)/);
  assert.match(picker, /removeSelectedTeam\(team\.legacyScheduleTeamId\)/);
  assert.match(home, /ahmv:install-open/);
  assert.match(home, /Télécharger l’application/);
});

test("news and social posts live in the News Centre rather than duplicated on home", () => {
  const home = read("src/routes/index.tsx");
  const news = read("src/routes/nouvelles.index.tsx");
  const centre = read("src/components/news/news-centre.tsx");

  assert.doesNotMatch(home, /<AhmvCommunityFeed\s*\/>/);
  assert.doesNotMatch(home, /Salle de presse AHMV/);
  assert.match(news, /<NewsCentre\s*\/>/);
  assert.match(centre, /\/api\/ahmv\/community-feed/);
});

test("web and installed app share the session-scoped hockey launch, with reduced motion", () => {
  const splash = read("src/components/layout/app-launch-splash.tsx");
  assert.doesNotMatch(splash, /if\s*\(!isStandaloneApp\(\)\)\s*return/);
  assert.match(splash, /sessionStorage/);
  assert.match(splash, /prefersReducedMotion/);
  assert.match(splash, /isStandaloneApp\(\) \? 1450 : 950/);
  assert.match(splash, /role="progressbar"/);
});

test("match scoreboards are based on published results, and arena cards link to profiles", () => {
  const matches = read("src/components/team-game-center.tsx");
  const arenas = read("src/routes/arenas.index.tsx");
  assert.match(matches, /Number\.isFinite\(latestResult\.homeScore\)/);
  assert.match(matches, /Number\.isFinite\(latestResult\.awayScore\)/);
  assert.match(matches, /hasPublishedScore && latestResult/);
  assert.match(arenas, /arena\.photoUrl \?/);
  assert.match(arenas, /to="\/arenas\/\$slug"/);
  assert.match(arenas, /Explorer la fiche aréna/);
});
