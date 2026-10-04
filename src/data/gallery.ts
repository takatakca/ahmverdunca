import type { Localized } from "@/lib/i18n";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { UPLOADED_AHMV_MEDIA } from "@/data/uploaded-media";

export interface Album {
  slug: string;
  title: Localized;
  description: Localized;
  date: string;
  season: string;
  teamSlugs: string[];
  eventType: Localized;
  cover?: string;
  /** Verified public archive preview already published by AHM Verdun. */
  coverUrl?: string;
  /** Number of photos in the official album — unknown until media are provided. */
  photoCount?: number;
  /** Verified public images rendered directly in this album. */
  photos?: readonly {
    url: string;
    sourceUrl: string;
    alt: { fr: string; en: string };
    label?: { fr: string; en: string };
    category?: string;
    categoryLabel?: { fr: string; en: string };
    kind?: string;
    containsMinors?: boolean;
  }[];
  /** Public legacy AHMV album retained as the complete archive source. */
  sourceUrl?: string;
  /** Full local migration is still incomplete even when a verified cover is available. */
  photosPending: boolean;
}

export const ALBUMS: Album[] = [
  {
    slug: "mediatheque-ahmv-2026-2027",
    title: { fr: "Médiathèque AHMV — saison 2026-2027", en: "AHMV Media Library — 2026-2027 season" },
    description: {
      fr: "Collection de 54 photos, affiches, horaires, documents et souvenirs AHM Verdun fournis à l’association et regroupés par catégorie.",
      en: "Collection of 54 AHM Verdun photos, posters, schedules, documents and memories supplied to the association and grouped by category.",
    },
    date: "2026-10-04",
    season: "2026-2027",
    teamSlugs: ["m5", "m7", "m9", "m11", "m13", "m15", "m17", "m19", "m22", "feminin"],
    eventType: { fr: "Médiathèque", en: "Media library" },
    coverUrl: UPLOADED_AHMV_MEDIA[0]?.url,
    photos: UPLOADED_AHMV_MEDIA,
    photoCount: UPLOADED_AHMV_MEDIA.length,
    photosPending: false,
  },
  {
    slug: "fete-fin-annee-2025-2026",
    title: { fr: "Fête de fin d'année des équipes 2025/2026", en: "2025/2026 teams' year-end party" },
    description: { fr: "Retour sur la célébration de fin de saison.", en: "Looking back at the season-end celebration." },
    date: "2026-03-29",
    season: "2025-2026",
    teamSlugs: [],
    eventType: { fr: "Événement", en: "Event" },
    cover: "gallery-party",
    sourceUrl: "https://www.ahmverdun.com/albums/4",
    photosPending: true,
  },
  {
    slug: "porte-ouverte-hockey-feminin",
    title: { fr: "Journée porte ouverte hockey féminin", en: "Girls' hockey open house" },
    description: { fr: "Découverte du programme féminin de l'AHMV.", en: "Discovering the AHMV girls' program." },
    date: "2025-09-14",
    season: "2025-2026",
    teamSlugs: ["feminin"],
    eventType: { fr: "Porte ouverte", en: "Open house" },
    cover: "gallery-feminine",
    sourceUrl: "https://www.ahmverdun.com/albums/3",
    photosPending: true,
  },
  {
    slug: "tournoi-m11-2025",
    title: { fr: "Tournoi M11 2025", en: "2025 U11 Tournament" },
    description: { fr: "Les moments forts du tournoi M11.", en: "Highlights from the U11 tournament." },
    date: "2025-08-31",
    season: "2025-2026",
    teamSlugs: ["m11"],
    eventType: { fr: "Tournoi", en: "Tournament" },
    cover: "gallery-tournament",
    coverUrl: OFFICIAL_MEDIA.tournamentM11Secondary.url,
    sourceUrl: OFFICIAL_MEDIA.tournamentM11Secondary.sourceUrl,
    photos: [
      OFFICIAL_MEDIA.tournamentM11Primary,
      OFFICIAL_MEDIA.tournamentM11Champions,
      OFFICIAL_MEDIA.tournamentM11Finalist,
      OFFICIAL_MEDIA.tournamentM11Secondary,
      OFFICIAL_MEDIA.tournamentM11ChampionB,
      OFFICIAL_MEDIA.tournamentM11Tertiary,
    ],
    photoCount: 6,
    photosPending: false,
  },
  {
    slug: "journee-benevoles-2024",
    title: { fr: "Journée des bénévoles 2024", en: "2024 Volunteer Day" },
    description: { fr: "Album historique consacré aux bénévoles de l'association.", en: "Historical album recognizing association volunteers." },
    date: "2025-08-31",
    season: "2024-2025",
    teamSlugs: [],
    eventType: { fr: "Communauté", en: "Community" },
    coverUrl: OFFICIAL_MEDIA.volunteerArchive.url,
    sourceUrl: OFFICIAL_MEDIA.volunteerArchive.sourceUrl,
    photosPending: true,
  },
  {
    slug: "entrainements-ahmv-2026",
    title: { fr: "Entraînements AHMV — automne 2026", en: "AHMV practices — Fall 2026" },
    description: {
      fr: "Photos réelles de séances sur glace de l’Association du hockey mineur de Verdun : jeunes joueurs, gardien, entraîneurs et groupe de pratique.",
      en: "Real on-ice photos from Verdun Minor Hockey Association practices: young players, goalie, coaches and practice group.",
    },
    date: "2026-10-03",
    season: "2026-2027",
    teamSlugs: ["m5", "m7", "m9", "m11", "m13", "m15", "feminin"],
    eventType: { fr: "Entraînement", en: "Practice" },
    coverUrl: OFFICIAL_MEDIA.practiceGroup.url,
    sourceUrl: OFFICIAL_MEDIA.practiceGroup.sourceUrl,
    photos: [
      OFFICIAL_MEDIA.practiceGroup,
      OFFICIAL_MEDIA.practiceSkaters,
      OFFICIAL_MEDIA.practiceGoalie,
      OFFICIAL_MEDIA.practicePlayers,
      OFFICIAL_MEDIA.practiceCoach,
    ],
    photoCount: 5,
    photosPending: false,
  },
];

export const getAlbum = (slug: string) => ALBUMS.find((a) => a.slug === slug);
