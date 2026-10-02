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
export const REQUIRED_PUBLIC_ALBUM_COUNT = 4;
