import type { Localized } from "@/lib/i18n";

export type CoachCategory = "forms" | "recruitment" | "medical" | "ethics" | "training";

export const COACH_CATEGORIES: { id: CoachCategory; label: Localized }[] = [
  { id: "forms", label: { fr: "Formulaires", en: "Forms" } },
  { id: "recruitment", label: { fr: "Devenir entraîneur", en: "Becoming a coach" } },
  { id: "medical", label: { fr: "Fiche médicale", en: "Medical form" } },
  { id: "ethics", label: { fr: "Respect et sport", en: "Respect in Sport" } },
  { id: "training", label: { fr: "Formations", en: "Trainings" } },
];

export interface CoachResource {
  id: string;
  title: Localized;
  description: Localized;
  category: CoachCategory;
  /** Link currently published by the legacy AHM Verdun site. */
  url: string;
  /** True when the document can contain sensitive information once completed. */
  sensitive: boolean;
  verifiedAt: string;
}

export const COACH_RESOURCES: CoachResource[] = [
  {
    id: "c1",
    title: { fr: "Formulaire Médaille ESSO", en: "ESSO Medal form" },
    description: {
      fr: "Formulaire public actuellement référencé par l'AHM Verdun.",
      en: "Public form currently referenced by AHM Verdun.",
    },
    category: "forms",
    url: "https://www.publicationsports.com/ressources/files/775/esso.pdf?t=1675447459",
    sensitive: false,
    verifiedAt: "2026-10-01",
  },
  {
    id: "c2",
    title: { fr: "Devenir entraîneur", en: "Becoming a coach" },
    description: {
      fr: "Accès au parcours d'inscription actuellement publié par l'AHM Verdun.",
      en: "Access to the registration flow currently published by AHM Verdun.",
    },
    category: "recruitment",
    url: "https://page.spordle.com/fr/ahm-de-verdun/register/1f082885-9400-678a-bb33-02b729a8ae7b",
    sensitive: false,
    verifiedAt: "2026-10-01",
  },
  {
    id: "c3",
    title: { fr: "Fiche médicale", en: "Medical information form" },
    description: {
      fr: "Formulaire Hockey Canada. Téléchargez-le et remettez-le uniquement selon la procédure officielle; aucune donnée médicale n'est enregistrée sur ce site.",
      en: "Hockey Canada form. Download and submit it only through the official process; no medical data is stored on this site.",
    },
    category: "medical",
    url: "https://www.publicationsports.com/ressources/files/775/player_med_info_f.pdf",
    sensitive: true,
    verifiedAt: "2026-10-01",
  },
  {
    id: "c4",
    title: { fr: "Respect et sport", en: "Respect in Sport" },
    description: {
      fr: "Programme Respect et sport pour responsables d'activités de Hockey Canada / Hockey Québec.",
      en: "Respect in Sport program for Hockey Canada / Hockey Québec activity leaders.",
    },
    category: "ethics",
    url: "https://hq.respectgroupinc.com/",
    sensitive: false,
    verifiedAt: "2026-10-01",
  },
  {
    id: "c5",
    title: { fr: "Formation M7–M9 — Entraîneur 1", en: "U7–U9 Training — Coach 1" },
    description: {
      fr: "Lien de clinique Spordle actuellement publié par l'AHM Verdun.",
      en: "Spordle clinic link currently published by AHM Verdun.",
    },
    category: "training",
    url: "https://page.spordle.com/fr/hq/clinics/1ef7538a-44c0-639a-908c-0243b7c607a7",
    sensitive: false,
    verifiedAt: "2026-10-01",
  },
  {
    id: "c6",
    title: { fr: "Formation M11–Junior — Entraîneur 2", en: "U11–Junior Training — Coach 2" },
    description: {
      fr: "Lien de clinique Spordle actuellement publié par l'AHM Verdun.",
      en: "Spordle clinic link currently published by AHM Verdun.",
    },
    category: "training",
    url: "https://page.spordle.com/fr/hq/clinics/1ef7463b-e50e-64fc-a0b6-021c3865613b",
    sensitive: false,
    verifiedAt: "2026-10-01",
  },
  {
    id: "c7",
    title: { fr: "Soigneur — entraîneur-chef seulement", en: "Trainer — head coach only" },
    description: {
      fr: "Lien de clinique Spordle actuellement publié par l'AHM Verdun.",
      en: "Spordle clinic link currently published by AHM Verdun.",
    },
    category: "training",
    url: "https://page.spordle.com/fr/hq/clinics/1ef74f69-f59b-6a72-9376-021c3865613b",
    sensitive: false,
    verifiedAt: "2026-10-01",
  },
];
