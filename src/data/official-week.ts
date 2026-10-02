export type OfficialActivityStatus = "scheduled" | "cancelled";

export interface OfficialWeekActivity {
  id: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  activity: string;
  group: string;
  status: OfficialActivityStatus;
}

export const WEEKLY_SCHEDULE_DOCUMENTS = [
  {
    week: 4,
    start: "2026-09-28",
    end: "2026-10-04",
    publishedAt: "2026-09-29",
    title: "Horaire AHMV 2026-27 — Semaine 4",
    sourceUrl: "https://ahmverdun.com/storage/5pW35UlsUj1CAOp9lljaN4JAnw5ayAEH70vcajXy.pdf",
    fileSize: "129.56 KB",
  },
  {
    week: 5,
    start: "2026-10-05",
    end: "2026-10-11",
    publishedAt: "2026-09-30",
    title: "Horaire AHMV 2026-27 — Semaine 5",
    sourceUrl: "https://ahmverdun.com/storage/qpfqchDJUtgBnlzuSR9Cig3o0Oeb9gzfphCqlErY.pdf",
    fileSize: "112.46 KB",
  },
] as const;

export const LEGACY_SCHEDULE_DOCUMENTS = [
  {
    title: "20 AVRIL AU 26 AVRIL.xlsx",
    label: { fr: "20 au 26 avril — archive du site précédent", en: "April 20–26 — previous-site archive" },
    sourceUrl: "https://ahmverdun.com/storage/MBd5CgZswbeyVJXUfO6K9MAOUwCsGa1FZ3EEUCeg.xlsx",
    fileSize: "53.66 KB",
  },
] as const;

export const OFFICIAL_WEEK_META = {
  start: "2026-09-28",
  end: "2026-10-04",
  publishedAt: "2026-09-29",
  title: "Horaire AHMV 2026-27 — Semaine 4",
  sourceUrl: "https://ahmverdun.com/storage/5pW35UlsUj1CAOp9lljaN4JAnw5ayAEH70vcajXy.pdf",
  sourceKind: "AHMV weekly PDF",
} as const;

/**
 * Exact public-facing transcription of the currently published AHMV weekly PDF.
 * This snapshot is intentionally kept separate from the normalized demo calendar:
 * no category/team inference is performed when the legacy source uses a raw label.
 */
export const OFFICIAL_WEEK_ACTIVITIES: OfficialWeekActivity[] = [
  { id: "ow-0928-2030", date: "2026-09-28", start: "20:30", end: "22:00", venue: "Centre sportif Dollard-St-Laurent", activity: "Pratique", group: "M22 juniors", status: "scheduled" },

  { id: "ow-0929-1700", date: "2026-09-29", start: "17:00", end: "18:00", venue: "Aréna Denis Savard", activity: "Session", group: "M11 groupe 5", status: "scheduled" },
  { id: "ow-0929-1800", date: "2026-09-29", start: "18:00", end: "19:00", venue: "Aréna Denis Savard", activity: "Hockey sur mesure", group: "Hockey sur mesure", status: "scheduled" },
  { id: "ow-0929-1900", date: "2026-09-29", start: "19:00", end: "20:00", venue: "Aréna Denis Savard", activity: "Hockey sur mesure", group: "Hockey sur mesure", status: "scheduled" },
  { id: "ow-0929-2000", date: "2026-09-29", start: "20:00", end: "21:00", venue: "Aréna Denis Savard", activity: "WLLV - Chacals", group: "WLLV - Chacals", status: "scheduled" },
  { id: "ow-0929-2100", date: "2026-09-29", start: "21:00", end: "22:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M19", status: "scheduled" },

  { id: "ow-0930-2100", date: "2026-09-30", start: "21:00", end: "22:30", venue: "Aréna St-Charles", activity: "WLLV - Chacals", group: "WLLV - Chacals", status: "scheduled" },

  { id: "ow-1001-1700", date: "2026-10-01", start: "17:00", end: "18:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M11 groupe bleu et M11 groupe rouge", status: "scheduled" },
  { id: "ow-1001-1800", date: "2026-10-01", start: "18:00", end: "19:00", venue: "Aréna Denis Savard", activity: "Hockey sur mesure", group: "Hockey sur mesure", status: "scheduled" },
  { id: "ow-1001-1900", date: "2026-10-01", start: "19:00", end: "20:00", venue: "Aréna Denis Savard", activity: "Hockey sur mesure", group: "Hockey sur mesure", status: "scheduled" },
  { id: "ow-1001-2000", date: "2026-10-01", start: "20:00", end: "21:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M17", status: "scheduled" },
  { id: "ow-1001-2100", date: "2026-10-01", start: "21:00", end: "22:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M19", status: "scheduled" },
  { id: "ow-1001-2000-dsl", date: "2026-10-01", start: "20:00", end: "21:00", venue: "Centre sportif Dollard-St-Laurent", activity: "WLLV - Chacals", group: "WLLV - Chacals", status: "scheduled" },
  { id: "ow-1001-2100-dsl", date: "2026-10-01", start: "21:00", end: "22:00", venue: "Centre sportif Dollard-St-Laurent", activity: "WLLV - Chacals", group: "WLLV - Chacals", status: "scheduled" },

  { id: "ow-1002-1700", date: "2026-10-02", start: "17:00", end: "18:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M9", status: "scheduled" },
  { id: "ow-1002-1800", date: "2026-10-02", start: "18:00", end: "19:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M12 fille aux complet", status: "scheduled" },
  { id: "ow-1002-1900", date: "2026-10-02", start: "19:00", end: "20:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M13 groupe bleu et M13 groupe rouge", status: "scheduled" },
  { id: "ow-1002-2000", date: "2026-10-02", start: "20:00", end: "21:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M15", status: "scheduled" },
  { id: "ow-1002-2100", date: "2026-10-02", start: "21:00", end: "22:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M17", status: "scheduled" },

  { id: "ow-1003-1000", date: "2026-10-03", start: "10:00", end: "11:00", venue: "Aréna Denis Savard", activity: "MAHG · Leçon 4", group: "M7", status: "scheduled" },
  { id: "ow-1003-1100", date: "2026-10-03", start: "11:00", end: "12:00", venue: "Aréna Denis Savard", activity: "MAHG · Leçon 4", group: "M9", status: "scheduled" },
  { id: "ow-1003-1200-cancel", date: "2026-10-03", start: "12:00", end: "13:00", venue: "Aréna Denis Savard", activity: "Annulée", group: "M12 Louves aux complet", status: "cancelled" },
  { id: "ow-1003-1200", date: "2026-10-03", start: "12:00", end: "13:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M11 groupe blanc", status: "scheduled" },
  { id: "ow-1003-1300", date: "2026-10-03", start: "13:00", end: "14:00", venue: "Aréna Denis Savard", activity: "Partie", group: "M15", status: "scheduled" },
  { id: "ow-1003-1400", date: "2026-10-03", start: "14:00", end: "15:00", venue: "Aréna Denis Savard", activity: "Partie", group: "M15", status: "scheduled" },
  { id: "ow-1003-1500", date: "2026-10-03", start: "15:00", end: "16:00", venue: "Aréna Denis Savard", activity: "Partie", group: "M13 groupe blanc", status: "scheduled" },
  { id: "ow-1003-1600", date: "2026-10-03", start: "16:00", end: "17:30", venue: "Aréna Denis Savard", activity: "Partie", group: "M13 AA Chacals 3005", status: "scheduled" },
  { id: "ow-1003-1730", date: "2026-10-03", start: "17:30", end: "19:00", venue: "Aréna Denis Savard", activity: "Partie", group: "M13 AA Chacals 3006", status: "scheduled" },

  { id: "ow-1004-0700", date: "2026-10-04", start: "07:00", end: "08:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M5", status: "scheduled" },
  { id: "ow-1004-0800", date: "2026-10-04", start: "08:00", end: "09:00", venue: "Aréna Denis Savard", activity: "MAHG · Leçon 5", group: "M7", status: "scheduled" },
  { id: "ow-1004-0900", date: "2026-10-04", start: "09:00", end: "10:00", venue: "Aréna Denis Savard", activity: "MAHG · Leçon 5", group: "M9", status: "scheduled" },
  { id: "ow-1004-1000", date: "2026-10-04", start: "10:00", end: "11:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M12 Louves aux complet", status: "scheduled" },
  { id: "ow-1004-1100", date: "2026-10-04", start: "11:00", end: "12:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M13 groupe rouge", status: "scheduled" },
  { id: "ow-1004-1200", date: "2026-10-04", start: "12:00", end: "13:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "M11 groupe blanc", status: "scheduled" },
  { id: "ow-1004-1300", date: "2026-10-04", start: "13:00", end: "14:00", venue: "Aréna Denis Savard", activity: "Partie", group: "M15", status: "scheduled" },
  { id: "ow-1004-1400", date: "2026-10-04", start: "14:00", end: "15:00", venue: "Aréna Denis Savard", activity: "Partie", group: "M15", status: "scheduled" },
  { id: "ow-1004-1500", date: "2026-10-04", start: "15:00", end: "16:00", venue: "Aréna Denis Savard", activity: "Partie", group: "M17", status: "scheduled" },
  { id: "ow-1004-1600", date: "2026-10-04", start: "16:00", end: "17:30", venue: "Aréna Denis Savard", activity: "Pratique", group: "M19", status: "scheduled" },
  { id: "ow-1004-1730", date: "2026-10-04", start: "17:30", end: "19:00", venue: "Aréna Denis Savard", activity: "Pratique", group: "Chacals M13 AA", status: "scheduled" },
];
