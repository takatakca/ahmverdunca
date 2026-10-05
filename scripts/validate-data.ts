import { ALERTS } from "../src/data/alerts";
import { ARENAS, arenaDirectionsTargetForVenue } from "../src/data/arenas";
import { ALBUMS } from "../src/data/gallery";
import { CURRENT_LEGACY_NEWS_IDS, DISCOVERED_ARCHIVE_NEWS_IDS, NEWS } from "../src/data/news";
import { PUBLIC_TEAM_DIRECTORY, officialTeamResultsUrl, publicTeamHubUrl, publicTeamScheduleUrl } from "../src/data/team-directory";
import { TAKATAK_TEAM_PORTAL_CONTRACT, teamPortalServices } from "../src/data/team-portal";
import { REQUIRED_ARENA_COUNT, REQUIRED_COACH_RESOURCE_TITLES, REQUIRED_LEGACY_TEAM_SCHEDULE_IDS, REQUIRED_PUBLIC_ALBUM_COUNT, REQUIRED_PUBLIC_TEAM_DIRECTORY_COUNT } from "../src/data/content-mirror";
import { SCHEDULE } from "../src/data/schedule";
import { HAS_NEWER_PUBLISHED_SCHEDULE, LATEST_PUBLISHED_SCHEDULE_DOCUMENT, LEGACY_SCHEDULE_DOCUMENTS, OFFICIAL_WEEK_ACTIVITIES, OFFICIAL_WEEK_META, WEEKLY_SCHEDULE_DOCUMENTS } from "../src/data/official-week";
import { TEAMS } from "../src/data/teams";
import { COACH_RESOURCES } from "../src/data/coaches";
import { RESOURCES } from "../src/data/resources";
import { SPONSORS } from "../src/data/sponsors";
import { FAQ, FAQ_TOPICS } from "../src/data/faq";
import { TEAM_SOCIAL_LINKS } from "../src/data/team-social";
import { EXTERNAL_LINKS, MAIN_NAV, MORE_NAV, SITE } from "../src/lib/site";
import { AHMV_SOCIAL_ARCHIVE_REFERENCES, HOCKEY_HERITAGE } from "../src/data/heritage";
import { TEAM_COMMUNITY_POSTS, TEAM_DOCUMENTS, TEAM_FUNDRAISING_CAMPAIGNS, TEAM_VOLUNTEER_NEEDS } from "../src/data/team-community";
import { UPLOADED_AHMV_MEDIA } from "../src/data/uploaded-media";
import { FACEBOOK_TEAM_ALBUM_MANIFEST } from "../src/data/facebook-team-albums";

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
requireUnique("FACEBOOK_TEAM_ALBUM_MANIFEST.publicTeamId", FACEBOOK_TEAM_ALBUM_MANIFEST.map((item) => item.publicTeamId));
requireUnique("FACEBOOK_TEAM_ALBUM_MANIFEST.reconciliationKey", FACEBOOK_TEAM_ALBUM_MANIFEST.map((item) => item.reconciliationKey));
requireUnique("FACEBOOK_TEAM_ALBUM_MANIFEST.expectedAlbumName", FACEBOOK_TEAM_ALBUM_MANIFEST.map((item) => item.expectedAlbumName));
requireUnique("ALBUMS.slug", ALBUMS.map((album) => album.slug));
requireUnique("UPLOADED_AHMV_MEDIA.id", UPLOADED_AHMV_MEDIA.map((asset) => String(asset.id)));
requireUnique("UPLOADED_AHMV_MEDIA.url", UPLOADED_AHMV_MEDIA.map((asset) => asset.url));
requireUnique("UPLOADED_AHMV_MEDIA.sourceUrl", UPLOADED_AHMV_MEDIA.map((asset) => asset.sourceUrl));
requireUnique("SCHEDULE.id", SCHEDULE.map((event) => event.id));
requireUnique("OFFICIAL_WEEK_ACTIVITIES.id", OFFICIAL_WEEK_ACTIVITIES.map((event) => event.id));
requireUnique("ALERTS.id", ALERTS.map((alert) => alert.id));
requireUnique("FAQ.id", FAQ.map((item) => item.id));
requireUnique("FAQ_TOPICS.id", FAQ_TOPICS.map((topic) => topic.id));
requireUnique("TEAM_SOCIAL_LINKS.targetPlatform", TEAM_SOCIAL_LINKS.map((item) => `${item.publicTeamId ?? item.teamSlug ?? "missing"}:${item.platform}`));
requireUnique("AHMV_SOCIAL_ARCHIVE_REFERENCES.id", AHMV_SOCIAL_ARCHIVE_REFERENCES.map((item) => item.id));
requireUnique("AHMV_SOCIAL_ARCHIVE_REFERENCES.url", AHMV_SOCIAL_ARCHIVE_REFERENCES.map((item) => item.url));
requireUnique("TEAM_COMMUNITY_POSTS.id", TEAM_COMMUNITY_POSTS.map((item) => item.id));
requireUnique("TEAM_VOLUNTEER_NEEDS.id", TEAM_VOLUNTEER_NEEDS.map((item) => item.id));
requireUnique("TEAM_FUNDRAISING_CAMPAIGNS.id", TEAM_FUNDRAISING_CAMPAIGNS.map((item) => item.id));
requireUnique("TEAM_DOCUMENTS.id", TEAM_DOCUMENTS.map((item) => item.id));
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

requireHttps("HOCKEY_HERITAGE.sourceUrl", HOCKEY_HERITAGE.sourceUrl);
for (const reference of AHMV_SOCIAL_ARCHIVE_REFERENCES) {
  requireHttps(`AHMV_SOCIAL_ARCHIVE_REFERENCES.${reference.id}`, reference.url);
}
requireHttps("OFFICIAL_WEEK_META.sourceUrl", OFFICIAL_WEEK_META.sourceUrl);
for (const document of WEEKLY_SCHEDULE_DOCUMENTS) {
  requireHttps(`WEEKLY_SCHEDULE_DOCUMENTS week ${document.week}`, document.sourceUrl);
  if (!validDate(document.start) || !validDate(document.end) || !validDate(document.publishedAt)) {
    errors.push(`Weekly schedule document week ${document.week} has an invalid date.`);
  }
}

for (let index = 1; index < WEEKLY_SCHEDULE_DOCUMENTS.length; index += 1) {
  const previous = WEEKLY_SCHEDULE_DOCUMENTS[index - 1];
  const current = WEEKLY_SCHEDULE_DOCUMENTS[index];
  if (previous.start < current.start) {
    errors.push("WEEKLY_SCHEDULE_DOCUMENTS must be ordered newest first.");
    break;
  }
}
if (LATEST_PUBLISHED_SCHEDULE_DOCUMENT !== WEEKLY_SCHEDULE_DOCUMENTS[0]) {
  errors.push("LATEST_PUBLISHED_SCHEDULE_DOCUMENT must reference the first weekly schedule document.");
}
if (
  LATEST_PUBLISHED_SCHEDULE_DOCUMENT &&
  (
    LATEST_PUBLISHED_SCHEDULE_DOCUMENT.start !== OFFICIAL_WEEK_META.start ||
    LATEST_PUBLISHED_SCHEDULE_DOCUMENT.end !== OFFICIAL_WEEK_META.end ||
    LATEST_PUBLISHED_SCHEDULE_DOCUMENT.publishedAt !== OFFICIAL_WEEK_META.publishedAt ||
    LATEST_PUBLISHED_SCHEDULE_DOCUMENT.title !== OFFICIAL_WEEK_META.title ||
    LATEST_PUBLISHED_SCHEDULE_DOCUMENT.sourceUrl !== OFFICIAL_WEEK_META.sourceUrl
  )
) {
  errors.push("OFFICIAL_WEEK_META must exactly match the newest weekly schedule document.");
}
if (
  HAS_NEWER_PUBLISHED_SCHEDULE !==
  Boolean(LATEST_PUBLISHED_SCHEDULE_DOCUMENT && LATEST_PUBLISHED_SCHEDULE_DOCUMENT.start > OFFICIAL_WEEK_META.end)
) {
  errors.push("HAS_NEWER_PUBLISHED_SCHEDULE is inconsistent with the latest published document.");
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
  if (arena.officialPhotoPage) requireHttps(`Arena "${arena.slug}" officialPhotoPage`, arena.officialPhotoPage);
  if (arena.phone && !/^\d{3}-\d{3}-\d{4}$/.test(arena.phone)) {
    errors.push(`Arena "${arena.slug}" has invalid public phone "${arena.phone}".`);
  }
  if (arena.sourceVerifiedAt && !validDate(arena.sourceVerifiedAt)) {
    errors.push(`Arena "${arena.slug}" has invalid sourceVerifiedAt "${arena.sourceVerifiedAt}".`);
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

if (FACEBOOK_TEAM_ALBUM_MANIFEST.length !== PUBLIC_TEAM_DIRECTORY.length) {
  errors.push(
    `Facebook team album manifest must contain exactly one entry per public team: expected ${PUBLIC_TEAM_DIRECTORY.length}, found ${FACEBOOK_TEAM_ALBUM_MANIFEST.length}.`,
  );
}

for (const album of FACEBOOK_TEAM_ALBUM_MANIFEST) {
  const team = PUBLIC_TEAM_DIRECTORY.find((entry) => entry.legacyScheduleTeamId === album.publicTeamId);
  if (!team) {
    errors.push(`Facebook team album manifest references unknown public team ID "${album.publicTeamId}".`);
    continue;
  }
  if (
    album.categorySlug !== team.categorySlug ||
    album.level !== team.level ||
    album.teamName !== team.name
  ) {
    errors.push(`Facebook team album manifest metadata does not match public team "${album.publicTeamId}".`);
  }
  if (album.season !== SITE.season) {
    errors.push(`Facebook team album manifest season must match SITE.season for "${album.publicTeamId}".`);
  }
  if (album.reconciliationKey !== `ahmv:facebook:team:${album.publicTeamId}`) {
    errors.push(`Facebook reconciliation key is invalid for "${album.publicTeamId}".`);
  }
  if (!album.expectedAlbumName.includes(team.name) || !album.expectedAlbumName.includes(SITE.season)) {
    errors.push(`Facebook album name must contain the exact team name and current season for "${album.publicTeamId}".`);
  }
  if (!album.expectedDescription.fr.trim() || !album.expectedDescription.en.trim()) {
    errors.push(`Facebook album description is missing FR/EN copy for "${album.publicTeamId}".`);
  }
}

const mirroredScheduleIds = new Set(PUBLIC_TEAM_DIRECTORY.map((entry) => entry.legacyScheduleTeamId));

for (const post of TEAM_COMMUNITY_POSTS) {
  if (!mirroredScheduleIds.has(post.publicTeamId)) {
    errors.push(`Team community post "${post.id}" references unknown public team ID "${post.publicTeamId}".`);
  }
  if (post.sourceUrl) requireHttps(`Team community post "${post.id}" sourceUrl`, post.sourceUrl);
}
for (const need of TEAM_VOLUNTEER_NEEDS) {
  if (!mirroredScheduleIds.has(need.publicTeamId)) {
    errors.push(`Team volunteer need "${need.id}" references unknown public team ID "${need.publicTeamId}".`);
  }
}
for (const campaign of TEAM_FUNDRAISING_CAMPAIGNS) {
  if (!mirroredScheduleIds.has(campaign.publicTeamId)) {
    errors.push(`Team fundraising campaign "${campaign.id}" references unknown public team ID "${campaign.publicTeamId}".`);
  }
  if (!campaign.beneficiary.trim() || campaign.goalCents <= 0) {
    errors.push(`Team fundraising campaign "${campaign.id}" must have a beneficiary and a positive goal.`);
  }
  if (campaign.status === "active" && !campaign.paymentVerified) {
    errors.push(`Active team fundraising campaign "${campaign.id}" must have a verified payment link.`);
  }
  requireHttps(`Team fundraising campaign "${campaign.id}" paymentUrl`, campaign.paymentUrl);
}
for (const document of TEAM_DOCUMENTS) {
  if (!mirroredScheduleIds.has(document.publicTeamId)) {
    errors.push(`Team document "${document.id}" references unknown public team ID "${document.publicTeamId}".`);
  }
  requireHttps(`Team document "${document.id}" url`, document.url);
}

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
if (TAKATAK_TEAM_PORTAL_CONTRACT.authority !== "GROUPE TAKATAK") {
  errors.push("Team portal authority must remain GROUPE TAKATAK.");
}

for (const entry of PUBLIC_TEAM_DIRECTORY) {
  const services = teamPortalServices(entry);
  requireUnique(
    `TEAM_PORTAL.${entry.legacyScheduleTeamId}.module`,
    services.map((service) => service.module),
  );
  const scheduleService = services.find((service) => service.module === "schedule");
  const resultsService = services.find((service) => service.module === "results");
  const socialService = services.find((service) => service.module === "social");
  const fundraisingService = services.find((service) => service.module === "fundraising");
  if (scheduleService?.provider !== "official-hockey" || resultsService?.provider !== "official-hockey") {
    errors.push(`Official hockey authority is missing for team ${entry.legacyScheduleTeamId}.`);
  }
  if (socialService?.provider !== "GROUPE TAKATAK" || fundraisingService?.provider !== "GROUPE TAKATAK") {
    errors.push(`GROUPE TAKATAK authority is missing for team portal services on ${entry.legacyScheduleTeamId}.`);
  }

  const hubUrl = publicTeamHubUrl(entry);
  const scheduleUrl = publicTeamScheduleUrl(entry);
  const resultsUrl = officialTeamResultsUrl(entry);
  const expectedPrefix = `/equipes/${entry.categorySlug}?teamId=`;
  if (!hubUrl.startsWith(expectedPrefix) || !hubUrl.includes(encodeURIComponent(entry.legacyScheduleTeamId))) {
    errors.push(`Public team hub URL is invalid for "${entry.name}" (${entry.legacyScheduleTeamId}): "${hubUrl}".`);
  }
  if (scheduleUrl !== `${hubUrl}#match-center`) {
    errors.push(`Integrated team schedule URL is invalid for "${entry.name}" (${entry.legacyScheduleTeamId}): "${scheduleUrl}".`);
  }
  if (!resultsUrl.startsWith("https://ahmverdun.com/schedules?teamId=") || !resultsUrl.endsWith(entry.legacyScheduleTeamId)) {
    errors.push(`Official results URL is invalid for "${entry.name}" (${entry.legacyScheduleTeamId}): "${resultsUrl}".`);
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
  if (album.photosPending && album.pendingReason !== "consent" && !album.sourceUrl) {
    errors.push(`Album "${album.slug}" has protected media but no official source URL.`);
  }
  if (album.pendingReason === "consent" && (album.photos?.length ?? 0) > 0) {
    errors.push(`Album "${album.slug}" is consent-blocked but still renders imported media.`);
  }
  if (album.pendingReason === "consent" && !album.photosPending) {
    errors.push(`Album "${album.slug}" declares consent blocking without a pending state.`);
  }
  if (album.sourceUrl) requireHttps(`Album "${album.slug}" sourceUrl`, album.sourceUrl);
  for (const teamSlug of album.teamSlugs) {
    if (!teamSlugs.has(teamSlug)) {
      errors.push(`Album "${album.slug}" references unknown team "${teamSlug}".`);
    }
  }

  const albumPhotos = album.photos ?? [];
  requireUnique(`Album "${album.slug}" photo URLs`, albumPhotos.map((photo) => photo.url));

  if (!album.photosPending && album.photoCount !== undefined && album.photoCount !== albumPhotos.length) {
    errors.push(
      `Album "${album.slug}" photoCount ${album.photoCount} does not match rendered photos ${albumPhotos.length}.`,
    );
  }

  if (!album.photosPending && album.coverUrl && albumPhotos.length > 0 && !albumPhotos.some((photo) => photo.url === album.coverUrl)) {
    errors.push(`Album "${album.slug}" coverUrl must reference one of its rendered photos.`);
  }

  for (const photo of albumPhotos) {
    if (photo.season && !/^\d{4}-\d{4}$/.test(photo.season)) {
      errors.push(`Album "${album.slug}" photo has invalid season provenance "${photo.season}".`);
    }
    for (const teamSlug of photo.teamSlugs ?? []) {
      if (!teamSlugs.has(teamSlug)) {
        errors.push(`Album "${album.slug}" photo references unknown team "${teamSlug}".`);
      }
    }
  }

  const importedPhotos = (album.photos ?? []).filter((photo) =>
    photo.url.includes("/imports/2026-10-04/public/"),
  );
  if (importedPhotos.length > 0 && importedPhotos.length === (album.photos?.length ?? 0)) {
    const provenTeams = [...new Set(importedPhotos.flatMap((photo) => photo.teamSlugs ?? []))].sort();
    const albumTeams = [...album.teamSlugs].sort();
    if (JSON.stringify(provenTeams) !== JSON.stringify(albumTeams)) {
      errors.push(
        `Album "${album.slug}" team links must exactly match media provenance: expected [${provenTeams.join(", ")}], found [${albumTeams.join(", ")}].`,
      );
    }

    const provenSeasons = [...new Set(importedPhotos.flatMap((photo) => photo.season ? [photo.season] : []))];
    const everyPhotoHasSeason = importedPhotos.every((photo) => Boolean(photo.season));
    const exactImportedSeason =
      everyPhotoHasSeason && provenSeasons.length === 1 ? provenSeasons[0] : undefined;

    if (exactImportedSeason) {
      if (album.season !== exactImportedSeason) {
        errors.push(
          `Album "${album.slug}" season must match media provenance: expected "${exactImportedSeason}", found "${album.season}".`,
        );
      }
    } else if (album.season !== "Archives") {
      errors.push(
        `Album "${album.slug}" must use season "Archives" until every imported photo proves the same season.`,
      );
    }

    if (
      album.season === "Archives" &&
      /2026[-–]2027/.test(`${album.title.fr} ${album.title.en} ${album.description.fr} ${album.description.en}`)
    ) {
      errors.push(
        `Album "${album.slug}" must not advertise 2026-2027 in public copy while its imported media season is mixed or unknown.`,
      );
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
    `Social archive references: ${AHMV_SOCIAL_ARCHIVE_REFERENCES.length}`,
    `Official week events: ${OFFICIAL_WEEK_ACTIVITIES.length}`,
    `Validated external links: ${Object.keys(EXTERNAL_LINKS).length}`,
    `Navigation routes: ${MAIN_NAV.length + MORE_NAV.length}`,
  ].join("\n"),
);
