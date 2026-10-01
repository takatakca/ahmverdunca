import type { Localized } from "@/lib/i18n";

export type NewsCategory =
  | "association"
  | "teams"
  | "games"
  | "tournaments"
  | "camps"
  | "registration"
  | "cancellations"
  | "releases"
  | "feminine";

export const NEWS_CATEGORIES: { id: NewsCategory; label: Localized }[] = [
  { id: "association", label: { fr: "Association", en: "Association" } },
  { id: "teams", label: { fr: "Équipes", en: "Teams" } },
  { id: "games", label: { fr: "Matchs", en: "Games" } },
  { id: "tournaments", label: { fr: "Tournois", en: "Tournaments" } },
  { id: "camps", label: { fr: "Camps", en: "Camps" } },
  { id: "registration", label: { fr: "Inscriptions", en: "Registration" } },
  { id: "cancellations", label: { fr: "Annulations", en: "Cancellations" } },
  { id: "releases", label: { fr: "Communiqués", en: "Releases" } },
  { id: "feminine", label: { fr: "Hockey féminin", en: "Girls' hockey" } },
];

export interface NewsArticle {
  slug: string;
  title: Localized;
  excerpt: Localized;
  /** Body paragraphs. English may be absent when no official translation exists. */
  body: { fr: string[]; en?: string[] };
  date: string;
  author: string;
  category: NewsCategory;
  teamSlugs: string[];
  image?: string;
  season: string;
  /** Original AHMV public article when this item was migrated from the legacy site. */
  sourceUrl?: string;
  /** True only when the public article still needs official text or factual confirmation. */
  contentPending: boolean;
}

export const NEWS: NewsArticle[] = [
  {
    slug: "annulations-22-26-septembre-2026",
    title: {
      fr: "Annulations d'activités les 22 et 26 septembre 2026",
      en: "Activity cancellations on September 22 and 26, 2026",
    },
    excerpt: {
      fr: "Toutes les activités prévues les 22 et 26 septembre 2026 ont été annulées en raison d'une grève.",
      en: "All activities scheduled for September 22 and 26, 2026 were cancelled because of a strike.",
    },
    body: {
      fr: [
        "L'AHM Verdun a annoncé l'annulation de toutes les activités prévues le mardi 22 septembre et le samedi 26 septembre 2026 en raison d'une grève.",
        "L'association invite les familles à consulter l'horaire hebdomadaire pour la version la plus récente des activités.",
      ],
      en: [
        "AHM Verdun announced that all activities scheduled for Tuesday, September 22 and Saturday, September 26, 2026 were cancelled because of a strike.",
        "Families are directed to the weekly schedule for the most recent activity information.",
      ],
    },
    date: "2026-09-18",
    author: "AHM Verdun Communication",
    category: "cancellations",
    teamSlugs: [],
    image: "news-cancellation",
    season: "2026-2027",
    sourceUrl: "https://www.ahmverdun.com/news/39",
    contentPending: false,
  },
  {
    slug: "debut-de-saison-m5-m7",
    title: {
      fr: "Début de saison pour les groupes M5 et M7",
      en: "Season kickoff for U5 and U7 groups",
    },
    excerpt: {
      fr: "Les groupes M5 et M7 amorcent leur saison, tandis que le hockey sur mesure doit suivre la semaine suivante.",
      en: "The U5 and U7 groups are starting their season, with customized hockey set to follow the next week.",
    },
    body: {
      fr: [
        "L'AHM Verdun a confirmé le début de saison pour ses groupes M5 et M7 et a souhaité une bonne saison aux jeunes et aux familles.",
        "Le hockey sur mesure devait pour sa part amorcer sa saison la semaine suivante. Les familles sont dirigées vers la page des horaires hebdomadaires pour les détails.",
      ],
      en: [
        "AHM Verdun confirmed the season start for its U5 and U7 groups and wished players and families a great season.",
        "Customized hockey was expected to begin the following week. Families are directed to the weekly schedules page for details.",
      ],
    },
    date: "2026-09-15",
    author: "AHM Verdun Communication",
    category: "teams",
    teamSlugs: ["m5", "m7"],
    image: "news-season",
    season: "2026-2027",
    sourceUrl: "https://www.ahmverdun.com/news/38",
    contentPending: false,
  },
  {
    slug: "academie-ahmv-remise-des-bourses",
    title: {
      fr: "Académie AHMV — Remise des bourses",
      en: "AHMV Academy — Scholarship ceremony",
    },
    excerpt: {
      fr: "L'Académie AHMV a souligné les efforts scolaires de jeunes de l'association avec l'appui de partenaires locaux.",
      en: "The AHMV Academy recognized the academic efforts of young association members with support from local partners.",
    },
    body: {
      fr: [
        "L'Académie AHMV a tenu une remise de bourses pour souligner les efforts, la persévérance et les réussites scolaires de jeunes hockeyeurs et hockeyeuses.",
        "Avec l'appui de Desjardins et du Club Richelieu Verdun, des bourses, des crédits applicables aux frais d'inscription et d'autres récompenses ont été remis. L'association a également annoncé le retour de l'Académie pour la nouvelle saison.",
      ],
      en: [
        "The AHMV Academy held a scholarship presentation recognizing effort, perseverance and academic achievement among young hockey players.",
        "With support from Desjardins and Club Richelieu Verdun, scholarships, registration credits and other recognition were awarded. The association also announced the Academy's return for the new season.",
      ],
    },
    date: "2026-09-10",
    author: "AHM Verdun Communication",
    category: "association",
    teamSlugs: [],
    image: "news-academy",
    season: "2026-2027",
    sourceUrl: "https://www.ahmverdun.com/news/37",
    contentPending: false,
  },
];

export const getArticle = (slug: string) => NEWS.find((n) => n.slug === slug);
