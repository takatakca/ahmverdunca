import type { Localized } from "@/lib/i18n";

export interface Alert {
  id: string;
  level: "urgent" | "info";
  title: Localized;
  message: Localized;
  dates: string[]; // affected dates
  publishedAt: string;
  expiresAt: string; // after this date, admin can archive
  linkTo?: string;
  archived: boolean;
}

export const ALERTS: Alert[] = [
  {
    id: "m11-direction-2026-10-04",
    level: "urgent",
    title: {
      fr: "Urgent — direction M11 recherchée",
      en: "Urgent — U11 level director needed",
    },
    message: {
      fr: "L’AHMV recherche une personne bénévole pour assurer la direction du M11 et faire le lien entre le CA, les entraîneurs et les parents. Les personnes intéressées peuvent écrire à operation@ahmverdun.com.",
      en: "AHMV is seeking a volunteer U11 level director to connect the board, coaches and parents. Interested volunteers can write to operation@ahmverdun.com.",
    },
    dates: ["2026-10-04"],
    publishedAt: "2026-10-04",
    expiresAt: "2026-10-18",
    linkTo: "/nouvelles/directeurs-niveau-m11-m13-m15",
    archived: false,
  },
  {
    id: "a1",
    level: "urgent",
    title: { fr: "Annulations d'activités", en: "Activity cancellations" },
    message: { fr: "Toutes les activités des 22 et 26 septembre 2026 sont annulées.", en: "All activities on September 22 and 26, 2026 are cancelled." },
    dates: ["2026-09-22", "2026-09-26"],
    publishedAt: "2026-09-18",
    expiresAt: "2026-09-27",
    linkTo: "/nouvelles/annulations-22-26-septembre-2026",
    archived: false,
  },
];
