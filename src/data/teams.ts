import type { Localized } from "@/lib/i18n";

export interface Team {
  slug: string;
  code: string; // Short label shown on cards (M5, M7...)
  name: Localized;
  ages: Localized;
  description: Localized;
  /** Arena slugs commonly used (demo association, to validate) */
  arenaSlugs: string[];
  /** Registration category confirmed on Spordle? Unknown until validated. */
  registrationStatus: "open" | "closed" | "unknown";
  feminine?: boolean;
}

export const TEAMS: Team[] = [
  { slug: "m5", code: "M5", name: { fr: "M5 — Initiation", en: "U5 — Initiation" }, ages: { fr: "4 ans", en: "Age 4" }, description: { fr: "Premiers coups de patin et découverte du jeu dans un cadre ludique.", en: "First strides and discovering the game in a playful setting." }, arenaSlugs: ["auditorium-de-verdun"], registrationStatus: "unknown" },
  { slug: "m7", code: "M7", name: { fr: "M7 — Pré-novice", en: "U7 — Pre-Novice" }, ages: { fr: "5–6 ans", en: "Ages 5–6" }, description: { fr: "Apprentissage des habiletés de base sur demi-glace.", en: "Learning basic skills on half-ice." }, arenaSlugs: ["auditorium-de-verdun"], registrationStatus: "unknown" },
  { slug: "m9", code: "M9", name: { fr: "M9 — Novice", en: "U9 — Novice" }, ages: { fr: "7–8 ans", en: "Ages 7–8" }, description: { fr: "Développement des habiletés et premiers matchs structurés.", en: "Skill development and first structured games." }, arenaSlugs: ["auditorium-de-verdun", "dollard-saint-laurent"], registrationStatus: "unknown" },
  { slug: "m11", code: "M11", name: { fr: "M11 — Atome", en: "U11 — Atom" }, ages: { fr: "9–10 ans", en: "Ages 9–10" }, description: { fr: "Jeu pleine glace, esprit d'équipe et progression technique.", en: "Full-ice play, team spirit and technical progression." }, arenaSlugs: ["auditorium-de-verdun", "jacques-lemaire"], registrationStatus: "unknown" },
  { slug: "m13", code: "M13", name: { fr: "M13 — Pee-wee", en: "U13 — Peewee" }, ages: { fr: "11–12 ans", en: "Ages 11–12" }, description: { fr: "Approfondissement tactique et compétition régionale.", en: "Tactical depth and regional competition." }, arenaSlugs: ["auditorium-de-verdun", "pete-morin"], registrationStatus: "unknown" },
  { slug: "m15", code: "M15", name: { fr: "M15 — Bantam", en: "U15 — Bantam" }, ages: { fr: "13–14 ans", en: "Ages 13–14" }, description: { fr: "Intensité, discipline et développement athlétique.", en: "Intensity, discipline and athletic development." }, arenaSlugs: ["auditorium-de-verdun", "samuel-moskovitch"], registrationStatus: "unknown" },
  { slug: "m18", code: "M18", name: { fr: "M18 — Midget", en: "U18 — Midget" }, ages: { fr: "15–17 ans", en: "Ages 15–17" }, description: { fr: "Hockey compétitif pour les joueurs d'âge secondaire.", en: "Competitive hockey for high-school-age players." }, arenaSlugs: ["auditorium-de-verdun", "raymond-bourque"], registrationStatus: "unknown" },
  { slug: "junior", code: "JR", name: { fr: "Junior", en: "Junior" }, ages: { fr: "18–21 ans", en: "Ages 18–21" }, description: { fr: "La suite du parcours pour les joueurs adultes de l'association.", en: "The next step for the association's adult players." }, arenaSlugs: ["auditorium-de-verdun"], registrationStatus: "unknown" },
  { slug: "feminin", code: "F", name: { fr: "Hockey féminin", en: "Girls' & women's hockey" }, ages: { fr: "Toutes catégories", en: "All categories" }, description: { fr: "Programme féminin de l'AHM Verdun. Catégories réelles à confirmer avec l'association.", en: "AHM Verdun girls' program. Actual categories to be confirmed with the association." }, arenaSlugs: ["auditorium-de-verdun"], registrationStatus: "unknown", feminine: true },
];

export const getTeam = (slug: string) => TEAMS.find((t) => t.slug === slug);
