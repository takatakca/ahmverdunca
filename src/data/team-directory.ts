export interface PublicTeamDirectoryEntry {
  categorySlug: string;
  level: string;
  name: string;
  /** Public team identifier used by the legacy AHMV schedule surface. */
  legacyScheduleTeamId: string;
}

const scheduleUrl = (teamId: string) => `https://ahmverdun.com/schedules?teamId=${teamId}`;

/**
 * Team names, levels and public schedule identifiers mirrored from the public
 * AHM Verdun / GameData directory.
 *
 * Keep duplicate display names when the source publishes distinct team IDs.
 * This is a public directory only: no roster, birth date, private contact,
 * or other personal information is mirrored here.
 */
export const PUBLIC_TEAM_DIRECTORY: PublicTeamDirectoryEntry[] = [
  { categorySlug: "m7", level: "Récréatif", name: "DUCKS M7-0 VERDUN", legacyScheduleTeamId: "2025191400017305" },
  { categorySlug: "m7", level: "Récréatif", name: "FLAMES M7-2 VERDUN", legacyScheduleTeamId: "2025191400017103" },
  { categorySlug: "m7", level: "Récréatif", name: "JETS M7-2 VERDUN", legacyScheduleTeamId: "2025191400017099" },
  { categorySlug: "m7", level: "Récréatif", name: "OILERS M7-1 VERDUN", legacyScheduleTeamId: "2025191400016760" },

  { categorySlug: "m9", level: "Hockey sur mesure", name: "Hockey sur mesure 2015-2018", legacyScheduleTeamId: "2025191400041974" },
  { categorySlug: "m9", level: "A", name: "LEAFS VERDUN", legacyScheduleTeamId: "2025191400017862" },
  { categorySlug: "m9", level: "B", name: "BULLDOGS VERDUN", legacyScheduleTeamId: "2025191400017621" },
  { categorySlug: "m9", level: "C", name: "COYOTES VERDUN", legacyScheduleTeamId: "2025191400018212" },
  { categorySlug: "m9", level: "D", name: "DYNAMOS VERDUN", legacyScheduleTeamId: "2025191400018509" },

  { categorySlug: "m11", level: "A", name: "LEAFS VERDUN", legacyScheduleTeamId: "2025191400018816" },
  { categorySlug: "m11", level: "A", name: "LEAFS VERDUN", legacyScheduleTeamId: "20261914019128" },
  { categorySlug: "m11", level: "B", name: "BRONCOS VERDUN", legacyScheduleTeamId: "2025191400036563" },
  { categorySlug: "m11", level: "B", name: "BULLDOGS VERDUN", legacyScheduleTeamId: "2025191400019259" },
  { categorySlug: "m11", level: "C", name: "COYOTES VERDUN", legacyScheduleTeamId: "2025191400019495" },

  { categorySlug: "feminin", level: "M12 A féminin", name: "LOUVES VERDUN", legacyScheduleTeamId: "2025191400035012" },

  { categorySlug: "m13", level: "A", name: "LEAFS VERDUN", legacyScheduleTeamId: "2025191400022838" },
  { categorySlug: "m13", level: "B", name: "BULLDOGS VERDUN", legacyScheduleTeamId: "2025191400023172" },
  { categorySlug: "m13", level: "C", name: "COYOTES VERDUN", legacyScheduleTeamId: "2025191400028967" },

  { categorySlug: "m15", level: "A", name: "LEAFS VERDUN", legacyScheduleTeamId: "2025191400023578" },
  { categorySlug: "m15", level: "B", name: "BULLDOGS VERDUN", legacyScheduleTeamId: "2025191400023783" },

  { categorySlug: "m18", level: "A", name: "LEAFS VERDUN", legacyScheduleTeamId: "2025191400024357" },
  { categorySlug: "m18", level: "B", name: "BULLDOGS VERDUN", legacyScheduleTeamId: "2025191400033752" },

  { categorySlug: "junior", level: "C", name: "LEAFS VERDUN", legacyScheduleTeamId: "2025191400035011" },
  { categorySlug: "junior", level: "D", name: "LEAFS VERDUN", legacyScheduleTeamId: "2025191400025121" },
];

export const teamsForCategory = (categorySlug: string) =>
  PUBLIC_TEAM_DIRECTORY.filter((entry) => entry.categorySlug === categorySlug);

export const getPublicTeamById = (teamId: string) =>
  PUBLIC_TEAM_DIRECTORY.find((entry) => entry.legacyScheduleTeamId === teamId);

export const publicTeamHubPath = (entry: PublicTeamDirectoryEntry) =>
  `/equipes/${entry.categorySlug}/${entry.legacyScheduleTeamId}`;

export const legacyTeamScheduleUrl = (entry: PublicTeamDirectoryEntry) =>
  scheduleUrl(entry.legacyScheduleTeamId);

/**
 * Today the legacy public team surface exposes schedule + standings from the
 * same GameData entry point. Keep a semantically separate helper so a future
 * direct results connector can change independently without rewriting pages.
 */
export const officialTeamResultsUrl = (entry: PublicTeamDirectoryEntry) =>
  scheduleUrl(entry.legacyScheduleTeamId);
