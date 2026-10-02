export interface PublicTeamDirectoryEntry {
  categorySlug: string;
  level: string;
  name: string;
}

/**
 * Team names and levels mirrored from the public AHM Verdun / GameData directory.
 * This is a public directory only: no roster, birth date, contact, private schedule
 * or other personal information is mirrored here.
 */
export const PUBLIC_TEAM_DIRECTORY: PublicTeamDirectoryEntry[] = [
  {
    "categorySlug": "m7",
    "level": "Récréatif",
    "name": "DUCKS M7-0 VERDUN"
  },
  {
    "categorySlug": "m7",
    "level": "Récréatif",
    "name": "FLAMES M7-2 VERDUN"
  },
  {
    "categorySlug": "m7",
    "level": "Récréatif",
    "name": "JETS M7-2 VERDUN"
  },
  {
    "categorySlug": "m7",
    "level": "Récréatif",
    "name": "OILERS M7-1 VERDUN"
  },
  {
    "categorySlug": "m9",
    "level": "Hockey sur mesure",
    "name": "Hockey sur mesure 2015-2018"
  },
  {
    "categorySlug": "m9",
    "level": "A",
    "name": "LEAFS VERDUN"
  },
  {
    "categorySlug": "m9",
    "level": "B",
    "name": "BULLDOGS VERDUN"
  },
  {
    "categorySlug": "m9",
    "level": "C",
    "name": "COYOTES VERDUN"
  },
  {
    "categorySlug": "m9",
    "level": "D",
    "name": "DYNAMOS VERDUN"
  },
  {
    "categorySlug": "m11",
    "level": "A",
    "name": "LEAFS VERDUN"
  },
  {
    "categorySlug": "m11",
    "level": "B",
    "name": "BRONCOS VERDUN"
  },
  {
    "categorySlug": "m11",
    "level": "B",
    "name": "BULLDOGS VERDUN"
  },
  {
    "categorySlug": "m11",
    "level": "C",
    "name": "COYOTES VERDUN"
  },
  {
    "categorySlug": "feminin",
    "level": "M12 A féminin",
    "name": "LOUVES VERDUN"
  },
  {
    "categorySlug": "m13",
    "level": "A",
    "name": "LEAFS VERDUN"
  },
  {
    "categorySlug": "m13",
    "level": "B",
    "name": "BULLDOGS VERDUN"
  },
  {
    "categorySlug": "m13",
    "level": "C",
    "name": "COYOTES VERDUN"
  },
  {
    "categorySlug": "m15",
    "level": "A",
    "name": "LEAFS VERDUN"
  },
  {
    "categorySlug": "m15",
    "level": "B",
    "name": "BULLDOGS VERDUN"
  },
  {
    "categorySlug": "m18",
    "level": "A",
    "name": "LEAFS VERDUN"
  },
  {
    "categorySlug": "m18",
    "level": "B",
    "name": "BULLDOGS VERDUN"
  },
  {
    "categorySlug": "junior",
    "level": "C",
    "name": "LEAFS VERDUN"
  },
  {
    "categorySlug": "junior",
    "level": "D",
    "name": "LEAFS VERDUN"
  }
];

export const teamsForCategory = (categorySlug: string) =>
  PUBLIC_TEAM_DIRECTORY.filter((entry) => entry.categorySlug === categorySlug);
