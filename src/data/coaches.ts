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
  /** Official link or document — to be provided by the association. */
  url?: string;
  restricted: boolean; // sensitive → secured area only
  updatedAt: string;
}

export const COACH_RESOURCES: CoachResource[] = [
  { id: "c1", title: { fr: "Formulaire Médaille ESSO", en: "ESSO Medal form" }, description: { fr: "Formulaire de mise en candidature pour les médailles ESSO.", en: "Nomination form for the ESSO medals." }, category: "forms", restricted: false, updatedAt: "2026-09-01" },
  { id: "c2", title: { fr: "Devenir entraîneur", en: "Becoming a coach" }, description: { fr: "Étapes, exigences et personnes-ressources pour se joindre à l'encadrement.", en: "Steps, requirements and contacts to join the coaching staff." }, category: "recruitment", restricted: false, updatedAt: "2026-09-01" },
  { id: "c3", title: { fr: "Fiche médicale", en: "Medical form" }, description: { fr: "Document confidentiel. Accessible uniquement dans un environnement sécurisé réservé aux responsables autorisés.", en: "Confidential document. Available only in a secured area for authorized staff." }, category: "medical", restricted: true, updatedAt: "2026-09-01" },
  { id: "c4", title: { fr: "Respect et sport", en: "Respect in Sport" }, description: { fr: "Formation obligatoire sur le respect et la prévention des abus.", en: "Mandatory training on respect and abuse prevention." }, category: "ethics", restricted: false, updatedAt: "2026-09-01" },
  { id: "c5", title: { fr: "Formation M7–M9 — Entraîneur 1", en: "U7–U9 Training — Coach 1" }, description: { fr: "Programme de certification pour les entraîneurs des catégories M7 et M9.", en: "Certification program for U7 and U9 coaches." }, category: "training", restricted: false, updatedAt: "2026-09-01" },
  { id: "c6", title: { fr: "Formation M11–Junior — Entraîneur 2", en: "U11–Junior Training — Coach 2" }, description: { fr: "Programme de certification pour les entraîneurs des catégories M11 à Junior.", en: "Certification program for U11 to Junior coaches." }, category: "training", restricted: false, updatedAt: "2026-09-01" },
  { id: "c7", title: { fr: "Soigneur — entraîneur-chef", en: "Trainer — head coach" }, description: { fr: "Exigences et formation du soigneur et de l'entraîneur-chef.", en: "Requirements and training for the trainer and head coach." }, category: "training", restricted: false, updatedAt: "2026-09-01" },
];
