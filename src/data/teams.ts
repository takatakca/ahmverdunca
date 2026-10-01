import type { Localized } from "@/lib/i18n";

export interface Team {
  slug: string;
  code: string;
  name: Localized;
  ages: Localized;
  description: Localized;
  feminine?: boolean;
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
    slug: "m18",
    code: "M18",
    name: { fr: "M18", en: "U18" },
    ages: { fr: "15–17 ans", en: "Ages 15–17" },
    description: {
      fr: "Horaires, nouvelles et accès utiles pour la catégorie M18.",
      en: "Schedules, news and useful links for the U18 category.",
    },
  },
  {
    slug: "junior",
    code: "JR",
    name: { fr: "Junior", en: "Junior" },
    ages: { fr: "18–21 ans", en: "Ages 18–21" },
    description: {
      fr: "Horaires, nouvelles et accès utiles pour la catégorie Junior.",
      en: "Schedules, news and useful links for the Junior category.",
    },
  },
  {
    slug: "feminin",
    code: "F",
    name: { fr: "Hockey féminin", en: "Girls' hockey" },
    ages: { fr: "Voir l'inscription officielle", en: "See official registration" },
    description: {
      fr: "Accès au programme féminin, aux horaires et aux liens officiels.",
      en: "Access to the girls' program, schedules and official links.",
    },
    feminine: true,
  },
];

export const getTeam = (slug: string) => TEAMS.find((team) => team.slug === slug);
