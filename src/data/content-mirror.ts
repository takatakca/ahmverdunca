/**
 * Canonical inventory of the legacy/public AHM Verdun surface being migrated.
 * CI uses this inventory so content coverage cannot silently regress.
 */
export const LEGACY_CONTENT_SOURCES = {
  home: "https://www.ahmverdun.com/",
  weeklySchedules: "https://www.ahmverdun.com/pages/14",
  news: "https://www.ahmverdun.com/news",
  photos: "https://www.ahmverdun.com/photos",
  contact: "https://www.ahmverdun.com/contact",
} as const;

export const REQUIRED_LEGACY_NAV_LABELS = [
  "Horaire et Classements",
  "Horaires Hebdomadaire",
  "Inscriptions 2026/2027",
  "Tournoi M11",
  "WLLV AA/BB",
  "Contactez-nous",
  "Photos",
  "Zone Entraineur",
  "Arénas",
  "F.A.Q",
  "Liens Externes",
  "Nouvelles",
  "Connexion",
] as const;

export const REQUIRED_COACH_RESOURCE_TITLES = [
  "Formulaire Médaille ESSO",
  "Devenir entraîneur",
  "Fiche médicale",
  "Respect et sport",
  "Formation M7–M9 — Entraîneur 1",
  "Formation M11–Junior — Entraîneur 2",
  "Soigneur — entraîneur-chef seulement",
] as const;

// 12 facilities from the legacy arena directory + Saint-Charles, now referenced by the current official weekly schedule.
export const REQUIRED_ARENA_COUNT = 13;
export const REQUIRED_PUBLIC_ALBUM_COUNT = 5;
export const REQUIRED_PUBLIC_TEAM_DIRECTORY_COUNT = 24;

export const LEGACY_CONTENT_AUDIT = {
  checkedAt: "2026-10-02",
  shellContactShownByLegacyPlatform: "info@hockeycms.ca",
  teamNotifications: "https://icescheduling.ca/team-notifications/register",
  legacyFaqDocuments: {
    girlsHockeyFr: "https://verdun.gamedata.ca/storage/documents/01K3YR6PCE54DZ6W1PAENGZ7NZ.pdf",
    girlsHockeyEn: "https://verdun.gamedata.ca/storage/documents/01K40A93P35TPAMZZKRNQCY4B6.pdf",
    equipment: "https://verdun.gamedata.ca/storage/documents/01K439WZ8X3WXW7BXR5480FNVK.pdf",
  },
  legacyPlatformLegal: {
    terms: "https://www.gamedata.ca/consent/terms.php",
    privacy: "https://www.gamedata.ca/consent/privacy.php",
    cookies: "https://www.gamedata.ca/consent/cookies.php",
  },
} as const;

export const REQUIRED_LEGACY_TEAM_SCHEDULE_IDS = [
  "2025191400017305",
  "2025191400017103",
  "2025191400017099",
  "2025191400016760",
  "2025191400041974",
  "2025191400017862",
  "2025191400017621",
  "2025191400018212",
  "2025191400018509",
  "2025191400018816",
  "20261914019128",
  "2025191400036563",
  "2025191400019259",
  "2025191400019495",
  "2025191400035012",
  "2025191400022838",
  "2025191400023172",
  "2025191400028967",
  "2025191400023578",
  "2025191400023783",
  "2025191400024357",
  "2025191400033752",
  "2025191400035011",
  "2025191400025121",
] as const;
