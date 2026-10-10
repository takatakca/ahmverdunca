/**
 * Week 6 (12–18 October 2026) — review-only transcription of the PDF
 * supplied by the AHMV owner. This is NOT the active/public schedule.
 *
 * sha256: e443691035483254c23e4880ff5e5716e7c72f19b9184200e6e0b758bd238466
 * PDF: qlqGtQQ8RybwASnN4799LED8HLQHpABGIs35CJ6L.pdf, page 1
 * Published label on document: 5 octobre 2026.
 * Groups and unusual provider labels are preserved, not corrected by guessing.
 */
import type { ScheduleDraftDocument, ScheduleDraftRow } from "@/lib/schedule-revision-plan";

const DENIS = "Aréna Denis Savard";
const DOLLARD = "Centre sportif Dollard-St-Laurent";
const ST_CHARLES = "Aréna St-Charles";

type PdfEntry = readonly [date: string, start: string, end: string, venue: string, activity: string, group: string, note?: string];

/** Page 1, chronological by column. Names are verbatim where meaningful. */
const entries: readonly PdfEntry[] = [
  ["2026-10-12", "20:30", "22:00", DOLLARD, "WLLV - Chacals", "WLLV - Chacals"],
  ["2026-10-13", "17:00", "18:00", DENIS, "Pratique", "M11 Leafs et M11 Coyotes"],
  ["2026-10-13", "18:00", "19:00", DENIS, "Hockey sur mesure", "Hockey sur mesure"],
  ["2026-10-13", "19:00", "20:00", DENIS, "Hockey sur mesure", "Hockey sur mesure"],
  ["2026-10-13", "20:00", "21:00", DENIS, "Pratique", "M15 Leafs et M13 Broncos"],
  ["2026-10-13", "21:00", "22:00", DENIS, "Pratique", "M19 et M17"],
  ["2026-10-14", "21:00", "22:30", ST_CHARLES, "WLLV - Chacals", "WLLV - Chacals"],
  ["2026-10-15", "17:00", "18:00", DENIS, "Pratique", "M13 Leafs et M13 Coyotes"],
  ["2026-10-15", "18:00", "19:00", DENIS, "Hockey sur mesure", "Hockey sur mesure"],
  ["2026-10-15", "19:00", "20:00", DENIS, "Hockey sur mesure", "Hockey sur mesure"],
  ["2026-10-15", "20:00", "21:00", DENIS, "Pratique", "M17 Bulldogs"],
  ["2026-10-15", "20:00", "21:00", DOLLARD, "WLLV - Chacals", "WLLV - Chacals"],
  ["2026-10-15", "21:00", "22:00", DENIS, "Pratique", "M19 Bulldogs"],
  ["2026-10-15", "21:00", "22:00", DOLLARD, "WLLV - Chacals", "WLLV - Chacals"],
  ["2026-10-16", "17:00", "18:00", DENIS, "Pratique", "M9"],
  ["2026-10-16", "18:00", "19:00", DENIS, "Pratique", "M12 Louves"],
  ["2026-10-16", "19:00", "20:00", DENIS, "Pratique", "M11 Bulldogs et M11 Broncos"],
  ["2026-10-16", "20:00", "21:00", DENIS, "Pratique", "M13 Leafs et M13 Bulldogs"],
  ["2026-10-16", "21:00", "22:00", DENIS, "Pratique", "M15 Bulldogs et M15 Coyotes"],
  ["2026-10-17", "10:00", "11:00", DENIS, "MAHG · Leçon 8", "M7"],
  ["2026-10-17", "11:00", "12:00", DENIS, "MAHG · Leçon 8", "M9"],
  ["2026-10-17", "12:00", "13:00", DENIS, "Pratique", "M13 Broncos"],
  ["2026-10-17", "13:00", "14:00", DENIS, "Pratique", "M13 Coyotes"],
  ["2026-10-17", "14:00", "15:00", DENIS, "Pratique", "M13 Bulldogs"],
  ["2026-10-17", "15:00", "16:00", DENIS, "Pratique", "M12 B Louves (697955)", "Numéro 697955 présent dans la source; cette activité est qualifiée de pratique."],
  ["2026-10-17", "16:00", "17:00", DENIS, "Pratique", "M13 Leafs"],
  ["2026-10-17", "17:00", "18:00", DENIS, "Pratique", "M11 Broncos"],
  ["2026-10-17", "18:00", "19:00", DENIS, "Pratique", "M11 Bulldogs"],
  ["2026-10-18", "07:00", "08:00", DENIS, "Pratique", "M5"],
  ["2026-10-18", "08:00", "09:00", DENIS, "MAHG · Leçon 9", "M7"],
  ["2026-10-18", "09:00", "10:00", DENIS, "MAHG · Leçon 9", "M9"],
  ["2026-10-18", "10:00", "11:00", DENIS, "Pratique", "M12 Fille Louves"],
  ["2026-10-18", "11:00", "12:00", DENIS, "Pratique", "M11 Coyotes"],
  ["2026-10-18", "12:00", "13:00", DENIS, "Pratique", "M11 Leafs"],
  ["2026-10-18", "13:00", "14:30", DENIS, "Pratique", "M15 lefs et M15 Bulldogs", "Source imprime « M15 lefs »; probable faute, correction non autorisée."],
  ["2026-10-18", "14:30", "16:00", DENIS, "Pratique", "M15 AA partie Chacals 4018", "Libellé combiné « pratique / partie » du PDF, à confirmer."],
  ["2026-10-18", "16:00", "17:30", DENIS, "Pratique", "M17 AA partie Chacals 5017", "Libellé combiné « pratique / partie » du PDF, à confirmer."],
  ["2026-10-18", "17:30", "19:00", DENIS, "Pratique", "M19 AA partie Chacals 6016", "Libellé combiné « pratique / partie » du PDF, à confirmer."],
] as const;

export const AHMV_WEEK6_REVIEW_DOCUMENT: ScheduleDraftDocument = {
  week: 6,
  weekStart: "2026-10-12",
  weekEnd: "2026-10-18",
  sourceName: "Horaire AHMV 2026-27 — Semaine 6 (PDF transmis)",
  sourceSha256: "e443691035483254c23e4880ff5e5716e7c72f19b9184200e6e0b758bd238466",
  rows: entries.map((entry, index): ScheduleDraftRow => ({
    rowId: "w6-p1-" + String(index + 1).padStart(2, "0"),
    date: entry[0],
    start: entry[1],
    end: entry[2],
    venue: entry[3],
    activity: entry[4],
    group: entry[5],
    sourcePage: 1,
    ...(entry[6] ? { note: entry[6] } : {}),
  })),
};
