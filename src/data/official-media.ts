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
  practiceGroup: {
    url: "https://www.ahmverdun.com/storage/gallery/01K55JQZZC2GV7SY96ZQKZSF67.jpeg",
    sourceUrl: "https://www.ahmverdun.com/storage/gallery/01K55JQZZC2GV7SY96ZQKZSF67.jpeg",
    alt: {
      fr: "Photo réelle AHM Verdun — grand groupe de jeunes en entraînement sur la glace",
      en: "Real AHM Verdun photo — large youth practice group on the ice",
    },
  },
  practiceSkaters: {
    url: "https://www.ahmverdun.com/storage/gallery/01K55JQZZWKV9MS9TQ7D5XKAPW.jpeg",
    sourceUrl: "https://www.ahmverdun.com/storage/gallery/01K55JQZZWKV9MS9TQ7D5XKAPW.jpeg",
    alt: {
      fr: "Photo réelle AHM Verdun — jeunes joueurs pendant un exercice sur glace",
      en: "Real AHM Verdun photo — young players during an on-ice drill",
    },
  },
  practiceGoalie: {
    url: "https://www.ahmverdun.com/storage/gallery/01K55JQZZF4A4JF9VCNQNQK47D.jpeg",
    sourceUrl: "https://www.ahmverdun.com/storage/gallery/01K55JQZZF4A4JF9VCNQNQK47D.jpeg",
    alt: {
      fr: "Photo réelle AHM Verdun — gardien devant le filet",
      en: "Real AHM Verdun photo — goalie in front of the net",
    },
  },
  practicePlayers: {
    url: "https://www.ahmverdun.com/storage/gallery/01K55JQZZHVBKMYWESZZ57ZMB2.jpeg",
    sourceUrl: "https://www.ahmverdun.com/storage/gallery/01K55JQZZHVBKMYWESZZ57ZMB2.jpeg",
    alt: {
      fr: "Photo réelle AHM Verdun — deux jeunes joueurs sur la glace",
      en: "Real AHM Verdun photo — two young players on the ice",
    },
  },
  practiceCoach: {
    url: "https://www.ahmverdun.com/storage/gallery/01K55JQZZR9DJY2FH601VMZ7DM.jpeg",
    sourceUrl: "https://www.ahmverdun.com/storage/gallery/01K55JQZZR9DJY2FH601VMZ7DM.jpeg",
    alt: {
      fr: "Photo réelle AHM Verdun — entraîneur avec un groupe de jeunes joueurs",
      en: "Real AHM Verdun photo — coach with a group of young players",
    },
  },
} as const satisfies Record<string, OfficialMediaAsset>;
