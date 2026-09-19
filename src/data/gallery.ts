import type { Localized } from "@/lib/i18n";

export interface Album {
  slug: string;
  title: Localized;
  description: Localized;
  date: string;
  season: string;
  teamSlugs: string[];
  eventType: Localized;
  cover?: string;
  /** Number of photos in the official album — unknown until media are provided. */
  photoCount?: number;
  /** Photos pending official files + consent review for minors. */
  photosPending: boolean;
}

export const ALBUMS: Album[] = [
  { slug: "fete-fin-annee-2025-2026", title: { fr: "Fête de fin d'année des équipes 2025/2026", en: "2025/2026 teams' year-end party" }, description: { fr: "Retour sur la célébration de fin de saison.", en: "Looking back at the season-end celebration." }, date: "2026-04-25", season: "2025-2026", teamSlugs: [], eventType: { fr: "Événement", en: "Event" }, cover: "gallery-party", photosPending: true },
  { slug: "porte-ouverte-hockey-feminin", title: { fr: "Journée porte ouverte hockey féminin", en: "Girls' hockey open house" }, description: { fr: "Découverte du programme féminin de l'AHMV.", en: "Discovering the AHMV girls' program." }, date: "2026-08-29", season: "2026-2027", teamSlugs: ["feminin"], eventType: { fr: "Porte ouverte", en: "Open house" }, cover: "gallery-feminine", photosPending: true },
  { slug: "tournoi-m11-2025", title: { fr: "Tournoi M11 2025", en: "2025 U11 Tournament" }, description: { fr: "Les moments forts du tournoi M11.", en: "Highlights from the U11 tournament." }, date: "2025-12-06", season: "2025-2026", teamSlugs: ["m11"], eventType: { fr: "Tournoi", en: "Tournament" }, cover: "gallery-tournament", photosPending: true },
];

export const getAlbum = (slug: string) => ALBUMS.find((a) => a.slug === slug);
