import { ALERTS } from "../src/data/alerts";
import { ARENAS } from "../src/data/arenas";
import { ALBUMS } from "../src/data/gallery";
import { NEWS } from "../src/data/news";
import { SCHEDULE } from "../src/data/schedule";
import { TEAMS } from "../src/data/teams";

const errors: string[] = [];

function duplicateValues(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function requireUnique(label: string, values: string[]) {
  for (const value of duplicateValues(values)) {
    errors.push(`${label} contains duplicate value "${value}".`);
  }
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

function validTime(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

const teamSlugs = new Set(TEAMS.map((team) => team.slug));
const arenaSlugs = new Set(ARENAS.map((arena) => arena.slug));
const newsSlugs = new Set(NEWS.map((article) => article.slug));

requireUnique("TEAMS.slug", TEAMS.map((team) => team.slug));
requireUnique("ARENAS.slug", ARENAS.map((arena) => arena.slug));
requireUnique("NEWS.slug", NEWS.map((article) => article.slug));
requireUnique("ALBUMS.slug", ALBUMS.map((album) => album.slug));
requireUnique("SCHEDULE.id", SCHEDULE.map((event) => event.id));
requireUnique("ALERTS.id", ALERTS.map((alert) => alert.id));

for (const team of TEAMS) {
  for (const arenaSlug of team.arenaSlugs) {
    if (!arenaSlugs.has(arenaSlug)) {
      errors.push(`Team "${team.slug}" references unknown arena "${arenaSlug}".`);
    }
  }
}

for (const event of SCHEDULE) {
  if (!teamSlugs.has(event.teamSlug)) {
    errors.push(`Schedule event "${event.id}" references unknown team "${event.teamSlug}".`);
  }
  if (!arenaSlugs.has(event.arenaSlug)) {
    errors.push(`Schedule event "${event.id}" references unknown arena "${event.arenaSlug}".`);
  }
  if (!validDate(event.date)) {
    errors.push(`Schedule event "${event.id}" has invalid date "${event.date}".`);
  }
  if (!validTime(event.start) || !validTime(event.end)) {
    errors.push(`Schedule event "${event.id}" has invalid time range "${event.start}-${event.end}".`);
  }
  if (event.start >= event.end) {
    errors.push(`Schedule event "${event.id}" must end after it starts.`);
  }
}

for (const article of NEWS) {
  if (!validDate(article.date)) {
    errors.push(`News article "${article.slug}" has invalid date "${article.date}".`);
  }
  for (const teamSlug of article.teamSlugs) {
    if (!teamSlugs.has(teamSlug)) {
      errors.push(`News article "${article.slug}" references unknown team "${teamSlug}".`);
    }
  }
}

for (const album of ALBUMS) {
  if (!validDate(album.date)) {
    errors.push(`Album "${album.slug}" has invalid date "${album.date}".`);
  }
  for (const teamSlug of album.teamSlugs) {
    if (!teamSlugs.has(teamSlug)) {
      errors.push(`Album "${album.slug}" references unknown team "${teamSlug}".`);
    }
  }
}

for (const alert of ALERTS) {
  if (!validDate(alert.publishedAt) || !validDate(alert.expiresAt)) {
    errors.push(`Alert "${alert.id}" has an invalid published or expiry date.`);
  }
  for (const date of alert.dates) {
    if (!validDate(date)) {
      errors.push(`Alert "${alert.id}" has invalid affected date "${date}".`);
    }
  }

  if (alert.linkTo?.startsWith("/nouvelles/")) {
    const slug = alert.linkTo.slice("/nouvelles/".length);
    if (!newsSlugs.has(slug)) {
      errors.push(`Alert "${alert.id}" links to unknown news slug "${slug}".`);
    }
  }
}

if (errors.length) {
  console.error("\nAHM Verdun data integrity check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.\n`);
  process.exit(1);
}

console.log(
  [
    "AHM Verdun data integrity check passed.",
    `Teams: ${TEAMS.length}`,
    `Arenas: ${ARENAS.length}`,
    `Schedule events: ${SCHEDULE.length}`,
    `News: ${NEWS.length}`,
    `Albums: ${ALBUMS.length}`,
    `Alerts: ${ALERTS.length}`,
  ].join("\n"),
);
