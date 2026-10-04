import type { Localized } from "@/lib/i18n";

export interface Team {
  slug: string;
  code: string;
  name: Localized;
  ages: Localized;
  description: Localized;
  feminine?: boolean;
  /** Kept only so historical public links do not break. Never surface as a current 2026–2027 category. */
  legacyOnly?: boolean;
}

/**
 * Public category directory only.
 *
 * Keep this deliberately simple: no inferred sub-team, arena assignment,
 * registration status, roster or hockey-operation data belongs here.
 */
export const TEAMS: Team[] = [
  {
    slug: "m5",
    code: "M5",
    name: { fr: "M5", en: "U5" },
    ages: { fr: "4 ans", en: "Age 4" },
    description: {
      fr: "Horaires, nouvelles et accès utiles pour la catégorie M5.",
      en: "Schedules, news and useful links for the U5 category.",
    },
  },
  {
    slug: "m7",
    code: "M7",
    name: { fr: "M7", en: "U7" },
    ages: { fr: "5–6 ans", en: "Ages 5–6" },
    description: {
      fr: "Horaires, nouvelles et accès utiles pour la catégorie M7.",
      en: "Schedules, news and useful links for the U7 category.",
    },
  },
  {
    slug: "m9",
    code: "M9",
    name: { fr: "M9", en: "U9" },
    ages: { fr: "7–8 ans", en: "Ages 7–8" },
    description: {
      fr: "Horaires, nouvelles et accès utiles pour la catégorie M9.",
      en: "Schedules, news and useful links for the U9 category.",
    },
  },
  {
    slug: "m11",
    code: "M11",
    name: { fr: "M11", en: "U11" },
    ages: { fr: "9–10 ans", en: "Ages 9–10" },
    description: {
      fr: "Horaires, nouvelles, tournoi et accès utiles pour la catégorie M11.",
      en: "Schedules, news, tournament and useful links for the U11 category.",
    },
  },
  {
    slug: "m13",
    code: "M13",
    name: { fr: "M13", en: "U13" },
    ages: { fr: "11–12 ans", en: "Ages 11–12" },
    description: {
      fr: "Horaires, nouvelles et accès utiles pour la catégorie M13.",
      en: "Schedules, news and useful links for the U13 category.",
    },
  },
  {
    slug: "m15",
    code: "M15",
    name: { fr: "M15", en: "U15" },
    ages: { fr: "13–14 ans", en: "Ages 13–14" },
    description: {
      fr: "Horaires, nouvelles et accès utiles pour la catégorie M15.",
      en: "Schedules, news and useful links for the U15 category.",
    },
  },
  {
    slug: "m17",
    code: "M17",
    name: { fr: "M17", en: "U17" },
    ages: { fr: "15–16 ans", en: "Ages 15–16" },
    description: {
      fr: "Catégorie mixte 2026–2027. Les identifiants d’équipe officiels seront ajoutés dès leur publication par les sources hockey.",
      en: "2026–2027 mixed category. Official team identifiers will be added as soon as hockey sources publish them.",
    },
  },
  {
    slug: "m19",
    code: "M19",
    name: { fr: "M19", en: "U19" },
    ages: { fr: "17–18 ans", en: "Ages 17–18" },
    description: {
      fr: "Catégorie mixte 2026–2027. Les identifiants d’équipe officiels seront ajoutés dès leur publication par les sources hockey.",
      en: "2026–2027 mixed category. Official team identifiers will be added as soon as hockey sources publish them.",
    },
  },
  {
    slug: "m22",
    code: "M22",
    name: { fr: "M22", en: "U22" },
    ages: { fr: "19–21 ans", en: "Ages 19–21" },
    description: {
      fr: "Nouvelle structure M22 / Junior pour la saison 2026–2027.",
      en: "New U22 / Junior structure for the 2026–2027 season.",
    },
  },
  {
    slug: "m18",
    code: "M18",
    name: { fr: "M18 historique", en: "Legacy U18" },
    ages: { fr: "Ancienne structure", en: "Previous structure" },
    description: {
      fr: "Route conservée uniquement pour les liens et identifiants historiques publiés avant la classification 2026–2027.",
      en: "Route retained only for legacy links and identifiers published before the 2026–2027 classification.",
    },
    legacyOnly: true,
  },
  {
    slug: "junior",
    code: "JR",
    name: { fr: "Junior historique", en: "Legacy Junior" },
    ages: { fr: "Ancienne structure", en: "Previous structure" },
    description: {
      fr: "Route conservée uniquement pour les liens et identifiants historiques publiés avant la classification 2026–2027.",
      en: "Route retained only for legacy links and identifiers published before the 2026–2027 classification.",
    },
    legacyOnly: true,
  },
  {
    slug: "feminin",
    code: "F",
    name: { fr: "Hockey féminin", en: "Girls' hockey" },
    ages: { fr: "Voir l'inscription officielle", en: "See official registration" },
    description: {
      fr: "Programme féminin 2026–2027 : M9F, M12F et M15F annoncés dans les visuels AHMV, avec horaires, médias et liens officiels regroupés ici.",
      en: "2026–2027 girls program: U9F, U12F and U15F announced in AHMV materials, with schedules, media and official links gathered here.",
    },
    feminine: true,
  },
];

export const CURRENT_TEAMS = TEAMS.filter((team) => !team.legacyOnly);

export const getTeam = (slug: string) => TEAMS.find((team) => team.slug === slug);
