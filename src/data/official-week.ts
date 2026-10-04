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
    week: 5,
    start: "2026-10-05",
    end: "2026-10-11",
    publishedAt: "2026-10-02",
    title: "Horaire AHMV 2026-27 — Semaine 5",
    sourceUrl: "https://ahmverdun.com/storage/90Cjd82i6cWwdFbIKvMD50CVxwud8InYzSR9S0v6.pdf",
    fileSize: "Source officielle AHMV",
  },
  {
    week: 4,
    start: "2026-09-28",
    end: "2026-10-04",
    publishedAt: "2026-09-27",
    title: "Horaire AHMV 2026-27 — Semaine 4",
    sourceUrl: "https://ahmverdun.com/storage/5pW35UlsUj1CAOp9lljaN4JAnw5ayAEH70vcajXy.pdf",
    fileSize: "101.18 KB",
  },
] as const;

export const LATEST_PUBLISHED_SCHEDULE_DOCUMENT = WEEKLY_SCHEDULE_DOCUMENTS[0];

export const HAS_NEWER_PUBLISHED_SCHEDULE =
  Boolean(LATEST_PUBLISHED_SCHEDULE_DOCUMENT) &&
  LATEST_PUBLISHED_SCHEDULE_DOCUMENT.start > OFFICIAL_WEEK_META.end;

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
  publishedAt: "2026-09-27",
  title: "Horaire AHMV 2026-27 — Semaine 4",
  sourceUrl: "https://ahmverdun.com/storage/rTTG5UC6QPhZRxneJEW2szpFCJoJJnNEm7FCysuX.pdf",
  sourceKind: "AHMV weekly PDF",
} as const;

/**
 * Exact public-facing transcription of the latest AHMV weekly PDF that has been
 * structurally integrated into the application.
 *
 * The source currently publishes Monday and Tuesday only. Wednesday through
 * Sunday are explicitly marked "Horaire à venir", so no activities are inferred
 * or copied from older/unverified snapshots.
 */
export const OFFICIAL_WEEK_ACTIVITIES: OfficialWeekActivity[] = [
  {
    id: "ow-0928-2100",
    date: "2026-09-28",
    start: "21:00",
    end: "22:30",
    venue: "Aréna St-Charles",
    activity: "Pratique",
    group: "Junior",
    status: "scheduled",
  },
  {
    id: "ow-0929-1700",
    date: "2026-09-29",
    start: "17:00",
    end: "18:00",
    venue: "À DENIS",
    activity: "Pratique",
    group: "M11 groupe 5",
    status: "scheduled",
  },
  {
    id: "ow-0929-1800",
    date: "2026-09-29",
    start: "18:00",
    end: "19:00",
    venue: "À DENIS",
    activity: "Hockey sur mesure",
    group: "Hockey sur mesure",
    status: "scheduled",
  },
  {
    id: "ow-0929-1900",
    date: "2026-09-29",
    start: "19:00",
    end: "20:00",
    venue: "À DENIS",
    activity: "Hockey sur mesure",
    group: "Hockey sur mesure",
    status: "scheduled",
  },
  {
    id: "ow-0929-2000",
    date: "2026-09-29",
    start: "20:00",
    end: "21:00",
    venue: "À DENIS",
    activity: "WLLV - Chacals",
    group: "WLLV - Chacals",
    status: "scheduled",
  },
  {
    id: "ow-0929-2100",
    date: "2026-09-29",
    start: "21:00",
    end: "22:00",
    venue: "À DENIS",
    activity: "Pratique",
    group: "M19",
    status: "scheduled",
  },
];
