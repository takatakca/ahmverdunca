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
