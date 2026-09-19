import type { Localized } from "@/lib/i18n";

export type NewsCategory = "association" | "teams" | "games" | "tournaments" | "camps" | "registration" | "cancellations" | "releases" | "feminine";

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
  /** Body paragraphs. `en` may be undefined when no official translation exists. */
  body: { fr: string[]; en?: string[] };
  date: string;
  author: string;
  category: NewsCategory;
  teamSlugs: string[];
  image?: string;
  season: string;
  /** Full official text still to be provided by the association. */
  contentPending: boolean;
}

export const NEWS: NewsArticle[] = [
  {
    slug: "annulations-22-26-septembre-2026",
    title: { fr: "Annulations d'activités les 22 et 26 septembre 2026", en: "Activity cancellations on September 22 and 26, 2026" },
    excerpt: { fr: "Toutes les activités prévues les 22 et 26 septembre 2026 sont annulées. Consultez les horaires pour les détails.", en: "All activities scheduled on September 22 and 26, 2026 are cancelled. See the schedules for details." },
    body: {
      fr: [
        "L'Association du hockey mineur de Verdun informe les familles que les activités prévues les 22 et 26 septembre 2026 sont annulées.",
        "Le texte complet du communiqué officiel sera intégré à partir du contenu fourni par l'association. Aucune information supplémentaire n'a été inventée pour cette maquette.",
      ],
    },
    date: "2026-09-18",
    author: "AHM Verdun",
    category: "cancellations",
    teamSlugs: [],
    image: "news-cancellation",
    season: "2026-2027",
    contentPending: true,
  },
  {
    slug: "debut-de-saison-m5-m7",
    title: { fr: "Début de saison pour les groupes M5 et M7", en: "Season kickoff for U5 and U7 groups" },
    excerpt: { fr: "Les plus jeunes joueurs de l'association entament leur saison 2026–2027.", en: "The association's youngest players begin their 2026–2027 season." },
    body: {
      fr: [
        "La saison 2026–2027 s'amorce pour les groupes M5 et M7 de l'AHM Verdun.",
        "Le contenu complet de cette nouvelle sera importé à partir de l'article officiel publié par l'association.",
      ],
    },
    date: "2026-09-15",
    author: "AHM Verdun",
    category: "teams",
    teamSlugs: ["m5", "m7"],
    image: "news-season",
    season: "2026-2027",
    contentPending: true,
  },
  {
    slug: "academie-ahmv-remise-des-bourses",
    title: { fr: "Académie AHMV — Remise des bourses", en: "AHMV Academy — Scholarship ceremony" },
    excerpt: { fr: "L'Académie AHMV souligne l'engagement de ses joueurs et joueuses lors de la remise des bourses.", en: "The AHMV Academy recognizes its players' commitment at the scholarship ceremony." },
    body: {
      fr: [
        "L'Académie AHMV a tenu sa remise des bourses.",
        "Le texte officiel, les photos autorisées et les noms des personnes concernées seront ajoutés uniquement après validation par l'association.",
      ],
    },
    date: "2026-09-10",
    author: "AHM Verdun",
    category: "association",
    teamSlugs: [],
    image: "news-academy",
    season: "2026-2027",
    contentPending: true,
  },
];

export const getArticle = (slug: string) => NEWS.find((n) => n.slug === slug);
