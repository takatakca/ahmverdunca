/**
 * Verified public AHM Verdun archive media.
 *
 * These files are hosted on the association's legacy public domain and are
 * intentionally kept separate from synthetic/illustrative assets. Every entry
 * includes its public AHMV source context so rendering surfaces can stay honest
 * about archive imagery.
 */
export interface OfficialMediaAsset {
  url: string;
  sourceUrl: string;
  alt: { fr: string; en: string };
}

export const OFFICIAL_MEDIA = {
  tournamentM11Primary: {
    url: "https://www.ahmverdun.com/storage/gallery/01K40QJQ198BHQMXAK39C6T48H.jpg",
    sourceUrl: "https://www.ahmverdun.com/albums/1",
    alt: {
      fr: "Archive publique AHM Verdun — Tournoi M11 2025",
      en: "AHM Verdun public archive — 2025 U11 Tournament",
    },
  },
  tournamentM11Secondary: {
    url: "https://www.ahmverdun.com/storage/gallery/01K40QJQ1DPS9TF869VCHTA2NG.jpg",
    sourceUrl: "https://www.ahmverdun.com/albums/1",
    alt: {
      fr: "Archive publique AHM Verdun — Tournoi M11 2025",
      en: "AHM Verdun public archive — 2025 U11 Tournament",
    },
  },
  tournamentM11Tertiary: {
    url: "https://www.ahmverdun.com/storage/gallery/01K40QJQ1F4D2CBZVZWXMDW94W.jpg",
    sourceUrl: "https://www.ahmverdun.com/albums/1",
    alt: {
      fr: "Archive publique AHM Verdun — Tournoi M11 2025",
      en: "AHM Verdun public archive — 2025 U11 Tournament",
    },
  },
  volunteerArchive: {
    url: "https://www.ahmverdun.com/storage/gallery/01K40VSP15YFS9QQMM1QYM1WHR.jpg",
    sourceUrl: "https://www.ahmverdun.com/albums/2",
    alt: {
      fr: "Archive publique AHM Verdun — journée des bénévoles",
      en: "AHM Verdun public archive — Volunteer Day",
    },
  },
} as const satisfies Record<string, OfficialMediaAsset>;
