import { ALERTS } from "../src/data/alerts";
import { ARENAS } from "../src/data/arenas";
import { ALBUMS } from "../src/data/gallery";
import { NEWS } from "../src/data/news";
import { SCHEDULE } from "../src/data/schedule";
import { OFFICIAL_WEEK_ACTIVITIES, OFFICIAL_WEEK_META } from "../src/data/official-week";
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
requireUnique("ALBUMS.slug", ALBUMS.map((album) => album.slug));
requireUnique("SCHEDULE.id", SCHEDULE.map((event) => event.id));
requireUnique("OFFICIAL_WEEK_ACTIVITIES.id", OFFICIAL_WEEK_ACTIVITIES.map((event) => event.id));
requireUnique("ALERTS.id", ALERTS.map((alert) => alert.id));
requireUnique("FAQ.id", FAQ.map((item) => item.id));
requireUnique("FAQ_TOPICS.id", FAQ_TOPICS.map((topic) => topic.id));
requireUnique("TEAM_SOCIAL_LINKS.teamPlatform", TEAM_SOCIAL_LINKS.map((item) => `${item.teamSlug}:${item.platform}`));
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

for (const arena of ARENAS) {
  if (arena.website) requireHttps(`Arena "${arena.slug}" website`, arena.website);
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

for (const social of TEAM_SOCIAL_LINKS) {
  if (!teamSlugs.has(social.teamSlug)) {
    errors.push(`Team social link references unknown team "${social.teamSlug}".`);
  }
  requireHttps(`TEAM_SOCIAL_LINKS ${social.teamSlug}/${social.platform}`, social.url);
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
