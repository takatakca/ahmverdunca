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

/**
 * AHMV weekly PDFs, newest first. `publishedAt` is the America/Toronto date of
 * the file's upload on ahmverdun.com (HTTP Last-Modified).
 */
export const WEEKLY_SCHEDULE_DOCUMENTS = [
  {
    week: 11,
    start: "2026-11-16",
    end: "2026-11-22",
    publishedAt: "2026-11-04",
    title: "Horaire AHMV 2026-27 — Semaine 11",
    sourceUrl: "https://ahmverdun.com/storage/pages/files/0W9JCV9B1D3N8uVWDv6DkrGaTW3P8EfB5lkfvYtR.pdf",
    fileSize: "133.46 KB",
  },
  {
    week: 10,
    start: "2026-11-09",
    end: "2026-11-15",
    publishedAt: "2026-11-02",
    title: "Horaire AHMV 2026-27 — Semaine 10",
    sourceUrl: "https://ahmverdun.com/storage/pages/files/fOenBwp76EVBzxcBxxyrlWasatuyjDYQXbgclfKO.pdf",
    fileSize: "135.38 KB",
  },
  {
    week: 9,
    start: "2026-11-02",
    end: "2026-11-08",
    publishedAt: "2026-10-23",
    title: "Horaire AHMV 2026-27 — Semaine 9",
    sourceUrl: "https://ahmverdun.com/storage/pages/files/8e29Taya0lqRoqJzfxIj6jv2DmNh3P8mL2En9aAn.pdf",
    fileSize: "142.64 KB",
  },
  {
    week: 5,
    start: "2026-10-05",
    end: "2026-10-11",
    publishedAt: "2026-10-02",
    title: "Horaire AHMV 2026-27 — Semaine 5",
    sourceUrl: "https://ahmverdun.com/storage/90Cjd82i6cWwdFbIKvMD50CVxwud8InYzSR9S0v6.pdf",
    fileSize: "109.88 KB",
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

export type WeeklyScheduleDocument = (typeof WEEKLY_SCHEDULE_DOCUMENTS)[number];

/** Weeks whose activities are transcribed below (contiguous, newest first). */
export const INTEGRATED_SCHEDULE_DOCUMENTS: readonly WeeklyScheduleDocument[] = WEEKLY_SCHEDULE_DOCUMENTS.slice(0, 3);

export const LEGACY_SCHEDULE_DOCUMENTS = [
  {
    title: "20 AVRIL AU 26 AVRIL.xlsx",
    label: { fr: "20 au 26 avril — archive du site précédent", en: "April 20–26 — previous-site archive" },
    sourceUrl: "https://ahmverdun.com/storage/MBd5CgZswbeyVJXUfO6K9MAOUwCsGa1FZ3EEUCeg.xlsx",
    fileSize: "53.66 KB",
  },
] as const;

/**
 * The integrated period: from the oldest to the newest transcribed week. The
 * publication date and source are those of the newest published PDF.
 */
export const OFFICIAL_WEEK_META = {
  start: "2026-11-02",
  end: "2026-11-22",
  publishedAt: "2026-11-04",
  title: "Horaire AHMV 2026-27 — Semaines 9 à 11",
  sourceUrl: "https://ahmverdun.com/storage/pages/files/0W9JCV9B1D3N8uVWDv6DkrGaTW3P8EfB5lkfvYtR.pdf",
  sourceKind: "AHMV weekly PDF",
} as const;

export const LATEST_PUBLISHED_SCHEDULE_DOCUMENT = WEEKLY_SCHEDULE_DOCUMENTS[0];

export const HAS_NEWER_PUBLISHED_SCHEDULE =
  Boolean(LATEST_PUBLISHED_SCHEDULE_DOCUMENT) &&
  LATEST_PUBLISHED_SCHEDULE_DOCUMENT.start > OFFICIAL_WEEK_META.end;

/** The integrated weekly PDF that published a given date, if any. */
export const scheduleDocumentForDate = (date: string) =>
  INTEGRATED_SCHEDULE_DOCUMENTS.find((document) => date >= document.start && date <= document.end);

const DENIS_SAVARD = "Aréna Denis Savard";
const DOLLARD = "Centre sportif Dollard-St-Laurent";
const SAINT_CHARLES = "Aréna St-Charles";
const CHACALS = "WLLV - Chacals";
const HSM = "Hockey sur mesure";

type Row = [id: string, date: string, start: string, end: string, venue: string, activity: string, group: string];

/**
 * Faithful public-facing transcription of the AHMV weekly PDFs for weeks 9–11
 * (week 10: revised file of Nov 2). Group labels stay as published; opponents
 * and game numbers are kept in the activity. Colour groups are never mapped to
 * a named team unless the source itself names that team.
 */
const ROWS: Row[] = [
  // Semaine 9 — 2 au 8 novembre
  ["ow-1102-2030-chacals", "2026-11-02", "20:30", "22:00", DOLLARD, CHACALS, CHACALS],
  ["ow-1103-1700-m11", "2026-11-03", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M11 Leafs et M11 Coyotes"],
  ["ow-1103-1800-hsm", "2026-11-03", "18:00", "19:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1103-1900-hsm", "2026-11-03", "19:00", "20:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1103-2000-m15-m13", "2026-11-03", "20:00", "21:00", DENIS_SAVARD, "Pratique", "M15 Bulldogs et M13 Broncos"],
  ["ow-1103-2100-m19", "2026-11-03", "21:00", "22:00", DENIS_SAVARD, "Pratique", "M19"],
  ["ow-1104-2100-chacals", "2026-11-04", "21:00", "22:30", SAINT_CHARLES, CHACALS, CHACALS],
  ["ow-1105-1700-m13", "2026-11-05", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M13 Leafs et M13 Coyotes"],
  ["ow-1105-1800-hsm", "2026-11-05", "18:00", "19:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1105-1900-hsm", "2026-11-05", "19:00", "20:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1105-2000-m17", "2026-11-05", "20:00", "21:00", DENIS_SAVARD, "Pratique", "M17"],
  ["ow-1105-2000-chacals", "2026-11-05", "20:00", "21:00", DOLLARD, CHACALS, CHACALS],
  ["ow-1105-2100-m19", "2026-11-05", "21:00", "22:00", DENIS_SAVARD, "Partie contre Blizzars (#63033)", "M19"],
  ["ow-1105-2100-chacals", "2026-11-05", "21:00", "22:00", DOLLARD, CHACALS, CHACALS],
  ["ow-1106-1700-m9", "2026-11-06", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M9"],
  ["ow-1106-1800-louves", "2026-11-06", "18:00", "19:00", DENIS_SAVARD, "Pratique", "M12 Louves A et M12 Louves B"],
  ["ow-1106-1900-m11", "2026-11-06", "19:00", "20:00", DENIS_SAVARD, "Pratique", "M11 Bulldogs et M11 Broncos"],
  ["ow-1106-2000-m13", "2026-11-06", "20:00", "21:00", DENIS_SAVARD, "Pratique", "M13 Bulldogs et M13 Coyotes"],
  ["ow-1106-2100-m15", "2026-11-06", "21:00", "22:00", DENIS_SAVARD, "Pratique", "M15 Leafs et M15 Coyotes"],
  ["ow-1107-1000-m7", "2026-11-07", "10:00", "11:00", DENIS_SAVARD, "MAHG · Leçon 14", "M7"],
  ["ow-1107-1100-m9", "2026-11-07", "11:00", "12:00", DENIS_SAVARD, "MAHG · Leçon 14", "M9"],
  ["ow-1107-1200-louves-b", "2026-11-07", "12:00", "13:00", DENIS_SAVARD, "Partie contre MRO (#4131)", "M12 Louves B"],
  ["ow-1107-1300-louves-a", "2026-11-07", "13:00", "14:00", DENIS_SAVARD, "Partie contre DDO (#3092)", "M12 Louves A"],
  ["ow-1107-1400-m15-coyotes", "2026-11-07", "14:00", "15:00", DENIS_SAVARD, "Partie contre Titans (#46047)", "M15 Coyotes"],
  ["ow-1107-1500-m15-bulldogs", "2026-11-07", "15:00", "16:00", DENIS_SAVARD, "Partie (#43053)", "M15 Bulldogs"],
  ["ow-1107-1600-m15-leafs", "2026-11-07", "16:00", "17:00", DENIS_SAVARD, "Partie contre Rapides (#40023)", "M15 Leafs"],
  ["ow-1107-1700-m13", "2026-11-07", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M13 Leafs et M13 Broncos"],
  ["ow-1107-1800-m19", "2026-11-07", "18:00", "19:00", DENIS_SAVARD, "Pratique", "M19"],
  ["ow-1108-0700-m5", "2026-11-08", "07:00", "08:00", DENIS_SAVARD, "Pratique", "M5"],
  ["ow-1108-0800-m7", "2026-11-08", "08:00", "09:00", DENIS_SAVARD, "MAHG · Leçon 15", "M7"],
  ["ow-1108-0900-m11-coyotes", "2026-11-08", "09:00", "10:00", DENIS_SAVARD, "Partie contre Lynx (#26064)", "M11 Coyotes"],
  ["ow-1108-1000-m11-bulldogs", "2026-11-08", "10:00", "11:00", DENIS_SAVARD, "Partie contre Pumas (#23081)", "M11 Bulldogs"],
  ["ow-1108-1100-m11-broncos", "2026-11-08", "11:00", "12:00", DENIS_SAVARD, "Partie contre Rapides (#23084)", "M11 Broncos"],
  ["ow-1108-1200-m11-leafs", "2026-11-08", "12:00", "13:00", DENIS_SAVARD, "Partie contre Diables (#20055)", "M11 Leafs"],
  ["ow-1108-1300-m13-coyotes", "2026-11-08", "13:00", "14:00", DENIS_SAVARD, "Partie contre Lynx (#36071)", "M13 Coyotes"],
  ["ow-1108-1400-m13-bulldogs", "2026-11-08", "14:00", "15:00", DENIS_SAVARD, "Partie contre Panthers (#33089)", "M13 Bulldogs"],
  ["ow-1108-1500-m13-broncos", "2026-11-08", "15:00", "16:00", DENIS_SAVARD, "Partie contre Canucks (#33092)", "M13 Broncos"],
  ["ow-1108-1600-m13-leafs", "2026-11-08", "16:00", "17:00", DENIS_SAVARD, "Partie contre Lions (#30047)", "M13 Leafs"],
  ["ow-1108-1700-m17", "2026-11-08", "17:00", "18:00", DENIS_SAVARD, "Partie contre Pumas (#53069)", "M17 Bulldogs"],
  ["ow-1108-1800-m19", "2026-11-08", "18:00", "19:00", DENIS_SAVARD, "Partie contre Pumas (#63041)", "M19 Bulldogs"],

  // Semaine 10 — 9 au 15 novembre (version révisée)
  ["ow-1109-2030-chacals", "2026-11-09", "20:30", "22:00", DOLLARD, CHACALS, CHACALS],
  ["ow-1110-1700-m11", "2026-11-10", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M11 Leafs et M11 Coyotes"],
  ["ow-1110-1800-hsm", "2026-11-10", "18:00", "19:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1110-1900-hsm", "2026-11-10", "19:00", "20:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1110-2000-m15-bulldogs", "2026-11-10", "20:00", "21:00", DENIS_SAVARD, "Partie contre Knights (#43303)", "M15 Bulldogs B"],
  ["ow-1110-2100-m19", "2026-11-10", "21:00", "22:00", DENIS_SAVARD, "Pratique", "M19 Bulldogs"],
  ["ow-1111-2100-m17", "2026-11-11", "21:00", "22:30", SAINT_CHARLES, "Pratique", "M17 Bulldogs"],
  ["ow-1112-1700-m13", "2026-11-12", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M13 Leafs et M13 Coyotes"],
  ["ow-1112-1800-hsm", "2026-11-12", "18:00", "19:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1112-1900-hsm", "2026-11-12", "19:00", "20:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1112-2000-m17", "2026-11-12", "20:00", "21:00", DENIS_SAVARD, "Partie contre Warriers", "M17 Bulldogs"],
  ["ow-1112-2000-chacals", "2026-11-12", "20:00", "21:00", DOLLARD, CHACALS, CHACALS],
  ["ow-1112-2100-m19", "2026-11-12", "21:00", "22:00", DENIS_SAVARD, "Partie contre Panthers (#63051)", "M19 Bulldogs"],
  ["ow-1112-2100-chacals", "2026-11-12", "21:00", "22:00", DOLLARD, CHACALS, CHACALS],
  ["ow-1113-1700-m9", "2026-11-13", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M9"],
  ["ow-1113-1800-m13", "2026-11-13", "18:00", "19:00", DENIS_SAVARD, "Partie", "M13 B Broncos contre M13 B Bulldogs"],
  ["ow-1113-2000-louves", "2026-11-13", "20:00", "21:00", DENIS_SAVARD, "Pratique", "M12 Louves A et B"],
  ["ow-1113-2100-m15", "2026-11-13", "21:00", "22:00", DENIS_SAVARD, "Pratique", "M15 Leafs et M15 Bulldogs"],
  ["ow-1114-1000-m7", "2026-11-14", "10:00", "11:00", DENIS_SAVARD, "MAHG · Leçon 15", "M7"],
  ["ow-1114-1100-m9", "2026-11-14", "11:00", "12:00", DENIS_SAVARD, "MAHG · Leçon 15", "M9"],
  ["ow-1114-1200-m11-coyotes", "2026-11-14", "12:00", "13:00", DENIS_SAVARD, "Partie contre Vicomtes (#26078)", "M11 Coyotes"],
  ["ow-1114-1300-m11-broncos", "2026-11-14", "13:00", "14:00", DENIS_SAVARD, "Partie contre Braves (#23092)", "M11 Broncos"],
  ["ow-1114-1400-m11-leafs", "2026-11-14", "14:00", "15:00", DENIS_SAVARD, "Partie contre Leopards (#20065)", "M11 Leafs"],
  ["ow-1114-1500-louves-b", "2026-11-14", "15:00", "16:00", DENIS_SAVARD, "Partie contre Banshees (#4169)", "M12 Louves B"],
  ["ow-1114-1600-louves-a", "2026-11-14", "16:00", "17:00", DENIS_SAVARD, "Partie contre Mistral (#3117)", "M12 Louves A"],
  ["ow-1114-1700-m13", "2026-11-14", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M13 Leafs"],
  ["ow-1114-1800-m15", "2026-11-14", "18:00", "19:00", DENIS_SAVARD, "Pratique", "M15 Coyotes"],
  ["ow-1115-0700-m5", "2026-11-15", "07:00", "08:00", DENIS_SAVARD, "Pratique", "M5"],
  ["ow-1115-0800-m7", "2026-11-15", "08:00", "09:00", DENIS_SAVARD, "MAHG · Leçon 16", "M7"],
  ["ow-1115-0900-m9", "2026-11-15", "09:00", "10:00", DENIS_SAVARD, "MAHG · Leçon 16", "M9"],
  ["ow-1115-1000-m11", "2026-11-15", "10:00", "11:00", DENIS_SAVARD, "Pratique", "M11 Leafs et M11 Broncos"],
  ["ow-1115-1100-m11-b", "2026-11-15", "11:00", "12:00", DENIS_SAVARD, "Pratique", "M11 Bulldogs et M11 Coyotes"],
  ["ow-1115-1200-m15-m13", "2026-11-15", "12:00", "13:00", DENIS_SAVARD, "Pratique", "M15 Bulldogs et M13 Coyotes"],
  ["ow-1115-1300-m13-broncos", "2026-11-15", "13:00", "14:00", DENIS_SAVARD, "Partie contre Rapides (#33415)", "M13 Broncos"],
  ["ow-1115-1400-chacals-bb", "2026-11-15", "14:00", "15:00", DENIS_SAVARD, "Partie contre White (#2611)", "M11 BB Chacals"],
  ["ow-1115-1500-chacals-bb", "2026-11-15", "15:00", "16:00", DENIS_SAVARD, "Partie contre Silver (#2612)", "M11 BB Chacals"],
  ["ow-1115-1600-chacals-bb", "2026-11-15", "16:00", "17:00", DENIS_SAVARD, "Partie contre Teal (#2613)", "M11 BB Chacals"],
  ["ow-1115-1700-chacals-aa", "2026-11-15", "17:00", "18:00", DENIS_SAVARD, "Partie contre National (#2089)", "M11 AA Chacals"],
  ["ow-1115-1800-chacals-aa", "2026-11-15", "18:00", "19:00", DENIS_SAVARD, "Partie contre Olympique (#2090)", "M11 AA Chacals"],

  // Semaine 11 — 16 au 22 novembre
  ["ow-1116-2030-chacals", "2026-11-16", "20:30", "22:00", DOLLARD, CHACALS, CHACALS],
  ["ow-1117-1700-m11", "2026-11-17", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M11 Leafs et M11 Coyotes"],
  ["ow-1117-1800-hsm", "2026-11-17", "18:00", "19:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1117-1900-hsm", "2026-11-17", "19:00", "20:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1117-2000-m15-m13", "2026-11-17", "20:00", "21:00", DENIS_SAVARD, "Pratique", "M15 Coyotes et M13 Broncos"],
  ["ow-1117-2100-m17", "2026-11-17", "21:00", "22:00", DENIS_SAVARD, "Pratique", "M17 Bulldogs"],
  ["ow-1118-2100-m19", "2026-11-18", "21:00", "22:30", SAINT_CHARLES, "Pratique", "M19 Bulldogs"],
  ["ow-1119-1700-m13", "2026-11-19", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M13 Leafs et M13 Coyotes"],
  ["ow-1119-1800-hsm", "2026-11-19", "18:00", "19:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1119-1900-hsm", "2026-11-19", "19:00", "20:00", DENIS_SAVARD, HSM, HSM],
  ["ow-1119-2000-m17", "2026-11-19", "20:00", "21:00", DENIS_SAVARD, "Pratique", "M17 Bulldogs"],
  ["ow-1119-2000-chacals", "2026-11-19", "20:00", "21:00", DOLLARD, CHACALS, CHACALS],
  ["ow-1119-2100-m19", "2026-11-19", "21:00", "22:00", DENIS_SAVARD, "Partie contre Panthers (#63066)", "M19 Bulldogs"],
  ["ow-1119-2100-chacals", "2026-11-19", "21:00", "22:00", DOLLARD, CHACALS, CHACALS],
  ["ow-1120-1700-m9", "2026-11-20", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M9"],
  ["ow-1120-1800-louves", "2026-11-20", "18:00", "19:00", DENIS_SAVARD, "Pratique", "M12 Louves A et B"],
  ["ow-1120-1900-m11", "2026-11-20", "19:00", "20:00", DENIS_SAVARD, "Pratique", "M11 Coyotes et M11 Broncos"],
  ["ow-1120-2000-m13-broncos", "2026-11-20", "20:00", "21:00", DENIS_SAVARD, "Partie contre Diables (#33416)", "M13 Broncos"],
  ["ow-1120-2100-m15", "2026-11-20", "21:00", "22:00", DENIS_SAVARD, "Pratique", "M15 Bulldogs"],
  ["ow-1121-1000-m7", "2026-11-21", "10:00", "11:00", DENIS_SAVARD, "MAHG · Leçon", "M7"],
  ["ow-1121-1100-m9", "2026-11-21", "11:00", "12:00", DENIS_SAVARD, "MAHG · Leçon", "M9"],
  ["ow-1121-1200-m11-coyotes", "2026-11-21", "12:00", "13:00", DENIS_SAVARD, "Partie contre Canucks (#26100)", "M11 Coyotes"],
  ["ow-1121-1300-m11-broncos", "2026-11-21", "13:00", "14:00", DENIS_SAVARD, "Partie contre Canucks (#23116)", "M11 Broncos"],
  ["ow-1121-1400-m11-leafs", "2026-11-21", "14:00", "15:00", DENIS_SAVARD, "Partie contre Devils (#20082)", "M11 Leafs"],
  ["ow-1121-1500-louves-a", "2026-11-21", "15:00", "16:00", DENIS_SAVARD, "Partie contre Avalanches (#3138)", "M12 Louves A"],
  ["ow-1121-1600-louves-b-m13", "2026-11-21", "16:00", "17:00", DENIS_SAVARD, "Pratique", "M12 Louves B et M13 Coyotes"],
  ["ow-1121-1700-m13", "2026-11-21", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M13 Leafs et M13 Bulldogs"],
  ["ow-1121-1800-m15", "2026-11-21", "18:00", "19:00", DENIS_SAVARD, "Pratique", "M15 Coyotes et M15 Leafs"],
  ["ow-1122-0700-m5", "2026-11-22", "07:00", "08:00", DENIS_SAVARD, "Pratique", "M5"],
  ["ow-1122-0800-m7", "2026-11-22", "08:00", "09:00", DENIS_SAVARD, "MAHG · Leçon", "M7"],
  ["ow-1122-0900-m9", "2026-11-22", "09:00", "10:00", DENIS_SAVARD, "MAHG · Leçon", "M9"],
  ["ow-1122-1000-m11-bulldogs", "2026-11-22", "10:00", "11:00", DENIS_SAVARD, "Partie contre Huskies (#23126)", "M11 Bulldogs"],
  ["ow-1122-1100-m13-broncos", "2026-11-22", "11:00", "12:00", DENIS_SAVARD, "Partie contre Canucks (#33139)", "M13 Broncos"],
  ["ow-1122-1200-m13-leafs", "2026-11-22", "12:00", "13:00", DENIS_SAVARD, "Partie contre Barons (#30072)", "M13 Leafs"],
  ["ow-1122-1300-m15-coyotes", "2026-11-22", "13:00", "14:00", DENIS_SAVARD, "Partie contre Hawks (#46079)", "M15 Coyotes"],
  ["ow-1122-1400-m15-bulldogs", "2026-11-22", "14:00", "15:00", DENIS_SAVARD, "Partie contre Chevaliers (#43100)", "M15 Bulldogs"],
  ["ow-1122-1500-m15-leafs", "2026-11-22", "15:00", "16:00", DENIS_SAVARD, "Partie contre Jaguars (#40062)", "M15 Leafs"],
  ["ow-1122-1600-m11-coyotes", "2026-11-22", "16:00", "17:00", DENIS_SAVARD, "Pratique", "M11 Coyotes"],
  ["ow-1122-1700-m11-leafs", "2026-11-22", "17:00", "18:00", DENIS_SAVARD, "Pratique", "M11 Leafs"],
  ["ow-1122-1800-chacals", "2026-11-22", "18:00", "19:00", DENIS_SAVARD, CHACALS, CHACALS],
];

export const OFFICIAL_WEEK_ACTIVITIES: OfficialWeekActivity[] = ROWS.map(
  ([id, date, start, end, venue, activity, group]) => ({
    id,
    date,
    start,
    end,
    venue,
    activity,
    group,
    status: "scheduled",
  }),
);
