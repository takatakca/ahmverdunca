import { ALERTS } from "../src/data/alerts";
import { ARENAS, arenaDirectionsTargetForVenue } from "../src/data/arenas";
import { ALBUMS } from "../src/data/gallery";
import { CURRENT_LEGACY_NEWS_IDS, DISCOVERED_ARCHIVE_NEWS_IDS, NEWS } from "../src/data/news";
import { PUBLIC_TEAM_DIRECTORY, publicTeamHubUrl } from "../src/data/team-directory";
import { REQUIRED_ARENA_COUNT, REQUIRED_COACH_RESOURCE_TITLES, REQUIRED_LEGACY_TEAM_SCHEDULE_IDS, REQUIRED_PUBLIC_ALBUM_COUNT, REQUIRED_PUBLIC_TEAM_DIRECTORY_COUNT } from "../src/data/content-mirror";
import { SCHEDULE } from "../src/data/schedule";
import { LEGACY_SCHEDULE_DOCUMENTS, OFFICIAL_WEEK_ACTIVITIES, OFFICIAL_WEEK_META, WEEKLY_SCHEDULE_DOCUMENTS } from "../src/data/official-week";
import { TEAMS } from "../src/data/teams";
import { COACH_RESOURCES } from "../src/data/coaches";
import { RESOURCES } from "../src/data/resources";
import { SPONSORS } from "../src/data/sponsors";
import { FAQ, FAQ_TOPICS } from "../src/data/faq";
import { TEAM_SOCIAL_LINKS } from "../src/data/team-social";
import { EXTERNAL_LINKS, MAIN_NAV, MORE_NAV, SITE } from "../src/lib/site";

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
const faqTopics = new Set(FAQ_TOPICS.map((topic) => topic.id));
const faqSourcePaths = new Set([
  "/horaires",
  "/equipes",
  "/equipes/feminin",
  "/inscriptions",
  "/tournois",
  "/nouvelles",
  "/galerie",
  "/wllv",
  "/entraineurs",
  "/arenas",
  "/faq",
  "/ressources",
  "/partenaires",
  "/contact",
  "/connexion",
  "/confidentialite",
]);

requireUnique("TEAMS.slug", TEAMS.map((team) => team.slug));
requireUnique("ARENAS.slug", ARENAS.map((arena) => arena.slug));
requireUnique("NEWS.slug", NEWS.map((article) => article.slug));
requireUnique("NEWS.legacyId", NEWS.flatMap((article) => article.legacyId === undefined ? [] : [String(article.legacyId)]));
requireUnique("PUBLIC_TEAM_DIRECTORY.legacyScheduleTeamId", PUBLIC_TEAM_DIRECTORY.map((entry) => entry.legacyScheduleTeamId));
requireUnique("PUBLIC_TEAM_DIRECTORY.hubUrl", PUBLIC_TEAM_DIRECTORY.map(publicTeamHubUrl));
requireUnique("ALBUMS.slug", ALBUMS.map((album) => album.slug));
requireUnique("SCHEDULE.id", SCHEDULE.map((event) => event.id));
requireUnique("OFFICIAL_WEEK_ACTIVITIES.id", OFFICIAL_WEEK_ACTIVITIES.map((event) => event.id));
requireUnique("ALERTS.id", ALERTS.map((alert) => alert.id));
requireUnique("FAQ.id", FAQ.map((item) => item.id));
requireUnique("FAQ_TOPICS.id", FAQ_TOPICS.map((topic) => topic.id));
requireUnique("TEAM_SOCIAL_LINKS.targetPlatform", TEAM_SOCIAL_LINKS.map((item) => `${item.publicTeamId ?? item.teamSlug ?? "missing"}:${item.platform}`));
requireUnique("NAV.key", [...MAIN_NAV, ...MORE_NAV].map((item) => item.key));
requireUnique("NAV.to", [...MAIN_NAV, ...MORE_NAV].map((item) => item.to));

function requireHttps(label: string, value: string) {
  if (!value.startsWith("https://")) {
    errors.push(`${label} must use HTTPS: "${value}".`);
  }
}

requireHttps("SITE.domain", SITE.domain);

if (SITE.domain.endsWith("/")) {
  errors.push("SITE.domain must not end with a slash.");
}

for (const [label, email] of [
  ["SITE.operationsEmail", SITE.operationsEmail],
  ["SITE.girlsHockeyEmail", SITE.girlsHockeyEmail],
] as const) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.push(`${label} is not a valid email address: "${email}".`);
  }
}

if (!/^\+1\d{10}$/.test(SITE.phoneE164)) {
  errors.push(`SITE.phoneE164 is not a valid +1 E.164 number: "${SITE.phoneE164}".`);
}

for (const [key, value] of Object.entries(EXTERNAL_LINKS)) {
  requireHttps(`EXTERNAL_LINKS.${key}`, value);
}

requireHttps("OFFICIAL_WEEK_META.sourceUrl", OFFICIAL_WEEK_META.sourceUrl);
for (const document of WEEKLY_SCHEDULE_DOCUMENTS) {
  requireHttps(`WEEKLY_SCHEDULE_DOCUMENTS week ${document.week}`, document.sourceUrl);
  if (!validDate(document.start) || !validDate(document.end) || !validDate(document.publishedAt)) {
    errors.push(`Weekly schedule document week ${document.week} has an invalid date.`);
  }
}
for (const document of LEGACY_SCHEDULE_DOCUMENTS) {
  requireHttps(`LEGACY_SCHEDULE_DOCUMENTS "${document.title}"`, document.sourceUrl);
  if (!document.fileSize.trim()) errors.push(`Legacy schedule document "${document.title}" is missing its published file size.`);
}

if (!validDate(OFFICIAL_WEEK_META.start) || !validDate(OFFICIAL_WEEK_META.end) || !validDate(OFFICIAL_WEEK_META.publishedAt)) {
  errors.push("OFFICIAL_WEEK_META contains an invalid start, end or publication date.");
}
if (OFFICIAL_WEEK_META.start > OFFICIAL_WEEK_META.end) {
  errors.push("OFFICIAL_WEEK_META start must not be after its end.");
}
if (OFFICIAL_WEEK_META.publishedAt > OFFICIAL_WEEK_META.end) {
  errors.push("OFFICIAL_WEEK_META publication date must not be after the published week ends.");
}

for (const arena of ARENAS) {
  if (!arena.address.trim()) {
    errors.push(`Arena "${arena.slug}" is missing an address.`);
  }
  if (!arena.addressVerified) {
    errors.push(`Arena "${arena.slug}" must not be presented publicly as verified until its address is approved.`);
  }
  if (!arena.website) {
    errors.push(`Arena "${arena.slug}" is missing its official municipal/institutional source.`);
  } else {
    requireHttps(`Arena "${arena.slug}" website`, arena.website);
  }
}

for (const resource of COACH_RESOURCES) {
  requireHttps(`COACH_RESOURCES.${resource.id}.url`, resource.url);
}

for (const resource of RESOURCES) {
  requireHttps(`RESOURCES.${resource.id}.url`, resource.url);
}

for (const sponsor of SPONSORS) {
  if (sponsor.websiteVerified && !sponsor.website) {
    errors.push(`Sponsor "${sponsor.name}" is marked websiteVerified without a website.`);
  }
  if (sponsor.website) requireHttps(`Sponsor "${sponsor.name}" website`, sponsor.website);
}

for (const navItem of [...MAIN_NAV, ...MORE_NAV]) {
  if (!navItem.to.startsWith("/")) {
    errors.push(`Navigation item "${navItem.key}" must use an internal absolute path.`);
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

for (const event of OFFICIAL_WEEK_ACTIVITIES) {
  if (!validDate(event.date)) {
    errors.push(`Official week event "${event.id}" has invalid date "${event.date}".`);
  }
  if (!validTime(event.start) || !validTime(event.end)) {
    errors.push(`Official week event "${event.id}" has invalid time range "${event.start}-${event.end}".`);
  }
  if (event.start >= event.end) {
    errors.push(`Official week event "${event.id}" must end after it starts.`);
  }
  if (event.date < OFFICIAL_WEEK_META.start || event.date > OFFICIAL_WEEK_META.end) {
    errors.push(`Official week event "${event.id}" falls outside the published week.`);
  }
  if (!event.group.trim() || !event.venue.trim() || !event.activity.trim()) {
    errors.push(`Official week event "${event.id}" is missing a public label, venue or activity.`);
  }
}

for (const article of NEWS) {
  if (article.sourceUrl) requireHttps(`News article "${article.slug}" sourceUrl`, article.sourceUrl);
  if (article.date && !validDate(article.date)) {
    errors.push(`News article "${article.slug}" has invalid date "${article.date}".`);
  }
  if (!article.date && !article.publishedLabel) {
    errors.push(`News article "${article.slug}" must have an exact date or a publishedLabel.`);
  }
  for (const link of article.links ?? []) requireHttps(`News article "${article.slug}" related link`, link.url);
  for (const teamSlug of article.teamSlugs) {
    if (!teamSlugs.has(teamSlug)) {
      errors.push(`News article "${article.slug}" references unknown team "${teamSlug}".`);
    }
  }
}

const mirroredLegacyIds = new Set(NEWS.flatMap((article) => article.legacyId === undefined ? [] : [article.legacyId]));
for (const legacyId of CURRENT_LEGACY_NEWS_IDS) {
  if (!mirroredLegacyIds.has(legacyId)) errors.push(`Current legacy news ID ${legacyId} is missing from NEWS.`);
}
for (const legacyId of DISCOVERED_ARCHIVE_NEWS_IDS) {
  if (!mirroredLegacyIds.has(legacyId)) errors.push(`Discovered archive news ID ${legacyId} is missing from NEWS.`);
}
if (ARENAS.length !== REQUIRED_ARENA_COUNT) {
  errors.push(`Expected ${REQUIRED_ARENA_COUNT} mirrored public arenas, found ${ARENAS.length}.`);
}
for (const venue of new Set(OFFICIAL_WEEK_ACTIVITIES.map((item) => item.venue))) {
  if (arenaDirectionsTargetForVenue(venue) === venue) {
    errors.push(`Official weekly venue "${venue}" has no verified arena address mapping.`);
  }
}
if (ALBUMS.length !== REQUIRED_PUBLIC_ALBUM_COUNT) {
  errors.push(`Expected ${REQUIRED_PUBLIC_ALBUM_COUNT} mirrored public albums, found ${ALBUMS.length}.`);
}
if (PUBLIC_TEAM_DIRECTORY.length !== REQUIRED_PUBLIC_TEAM_DIRECTORY_COUNT) {
  errors.push(`Expected ${REQUIRED_PUBLIC_TEAM_DIRECTORY_COUNT} mirrored public team entries, found ${PUBLIC_TEAM_DIRECTORY.length}.`);
}
const mirroredScheduleIds = new Set(PUBLIC_TEAM_DIRECTORY.map((entry) => entry.legacyScheduleTeamId));
for (const teamId of REQUIRED_LEGACY_TEAM_SCHEDULE_IDS) {
  if (!mirroredScheduleIds.has(teamId)) {
    errors.push(`Legacy public schedule team ID ${teamId} is missing from PUBLIC_TEAM_DIRECTORY.`);
  }
}
const coachTitles = new Set(COACH_RESOURCES.map((resource) => resource.title.fr));
for (const title of REQUIRED_COACH_RESOURCE_TITLES) {
  if (!coachTitles.has(title)) {
    errors.push(`Required legacy coach resource "${title}" is missing.`);
  }
}
for (const entry of PUBLIC_TEAM_DIRECTORY) {
  const hubUrl = publicTeamHubUrl(entry);
  const expectedPrefix = `/equipes/${entry.categorySlug}?teamId=`;
  if (!hubUrl.startsWith(expectedPrefix) || !hubUrl.includes(encodeURIComponent(entry.legacyScheduleTeamId))) {
    errors.push(`Public team hub URL is invalid for "${entry.name}" (${entry.legacyScheduleTeamId}): "${hubUrl}".`);
  }
  if (!teamSlugs.has(entry.categorySlug)) {
    errors.push(`Public team directory entry "${entry.name}" references unknown category "${entry.categorySlug}".`);
  }
  if (!/^\d+$/.test(entry.legacyScheduleTeamId)) {
    errors.push(`Public team directory entry "${entry.name}" has invalid legacy schedule team ID "${entry.legacyScheduleTeamId}".`);
  }
}

for (const album of ALBUMS) {
  if (!validDate(album.date)) {
    errors.push(`Album "${album.slug}" has invalid date "${album.date}".`);
  }
  if (album.photosPending && !album.sourceUrl) {
    errors.push(`Album "${album.slug}" has protected media but no official source URL.`);
  }
  if (album.sourceUrl) requireHttps(`Album "${album.slug}" sourceUrl`, album.sourceUrl);
  for (const teamSlug of album.teamSlugs) {
    if (!teamSlugs.has(teamSlug)) {
      errors.push(`Album "${album.slug}" references unknown team "${teamSlug}".`);
    }
  }
}

for (const faq of FAQ) {
  if (!faqTopics.has(faq.topic)) {
    errors.push(`FAQ "${faq.id}" references unknown topic "${faq.topic}".`);
  }
  if (!faq.question.fr.trim() || !faq.question.en.trim() || !faq.answer.fr.trim() || !faq.answer.en.trim()) {
    errors.push(`FAQ "${faq.id}" is missing FR/EN question or answer text.`);
  }
  if (faq.sourcePath && !faqSourcePaths.has(faq.sourcePath)) {
    errors.push(`FAQ "${faq.id}" sourcePath is not an approved public route: "${faq.sourcePath}".`);
  }
}

const publicTeamIds = new Set(PUBLIC_TEAM_DIRECTORY.map((entry) => entry.legacyScheduleTeamId));
for (const social of TEAM_SOCIAL_LINKS) {
  const targetCount = Number(Boolean(social.teamSlug)) + Number(Boolean(social.publicTeamId));
  if (targetCount !== 1) {
    errors.push(`Team social link must target exactly one category slug or public team ID for ${social.platform}.`);
  }
  if (social.teamSlug && !teamSlugs.has(social.teamSlug)) {
    errors.push(`Team social link references unknown team category "${social.teamSlug}".`);
  }
  if (social.publicTeamId && !publicTeamIds.has(social.publicTeamId)) {
    errors.push(`Team social link references unknown public team ID "${social.publicTeamId}".`);
  }
  requireHttps(
    `TEAM_SOCIAL_LINKS ${social.publicTeamId ?? social.teamSlug ?? "missing"}/${social.platform}`,
    social.url,
  );
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
    `FAQ: ${FAQ.length}`,
    `Approved team social links: ${TEAM_SOCIAL_LINKS.length}`,
    `Official week events: ${OFFICIAL_WEEK_ACTIVITIES.length}`,
    `Validated external links: ${Object.keys(EXTERNAL_LINKS).length}`,
    `Navigation routes: ${MAIN_NAV.length + MORE_NAV.length}`,
  ].join("\n"),
);
