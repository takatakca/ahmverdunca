/**
 * DEMO schedule data. Every entry is fictitious and exists only to validate
 * the calendar UI. Reference weeks: 14–20 and 21–27 September 2026.
 * Future sources: CSV/XLSX import, manual entry, authorized API.
 */
export type EventStatus = "confirmed" | "modified" | "cancelled" | "pending";
export type EventType = "practice" | "game" | "event" | "tryout";

export interface ScheduleEvent {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string;
  teamSlug: string;
  type: EventType;
  arenaSlug: string;
  rink?: string;
  status: EventStatus;
  opponent?: string;
  note?: { fr: string; en: string };
  demo: true;
}

export const SCHEDULE_META = {
  version: "démo-0.1",
  publishedAt: "2026-09-12",
  lastModified: "2026-09-18",
  source: { fr: "Données de démonstration (aucune source officielle connectée)", en: "Demo data (no official source connected)" },
};

const e = (
  id: string, date: string, start: string, end: string, teamSlug: string, type: EventType,
  arenaSlug: string, status: EventStatus = "confirmed", extra: Partial<ScheduleEvent> = {},
): ScheduleEvent => ({ id, date, start, end, teamSlug, type, arenaSlug, status, demo: true, ...extra });

export const SCHEDULE: ScheduleEvent[] = [
  // Week of 14 Sept 2026
  e("d01", "2026-09-14", "17:00", "17:50", "m9", "practice", "auditorium-de-verdun", "confirmed", { rink: "Auditorium" }),
  e("d02", "2026-09-14", "18:00", "19:00", "m11", "practice", "auditorium-de-verdun", "confirmed", { rink: "Auditorium" }),
  e("d03", "2026-09-14", "19:15", "20:15", "m13", "practice", "auditorium-de-verdun", "confirmed", { rink: "Denis-Savard" }),
  e("d04", "2026-09-15", "17:30", "18:30", "m7", "practice", "auditorium-de-verdun", "confirmed", { rink: "Denis-Savard" }),
  e("d05", "2026-09-15", "18:45", "19:45", "m15", "practice", "samuel-moskovitch", "modified", { note: { fr: "Heure modifiée (précédemment 18 h 00).", en: "Time changed (previously 6:00 PM)." } }),
  e("d06", "2026-09-16", "18:00", "19:00", "m11", "practice", "jacques-lemaire", "confirmed"),
  e("d07", "2026-09-16", "19:15", "20:30", "m18", "practice", "auditorium-de-verdun", "confirmed", { rink: "Auditorium" }),
  e("d08", "2026-09-17", "17:00", "18:00", "feminin", "practice", "auditorium-de-verdun", "confirmed", { rink: "Denis-Savard" }),
  e("d09", "2026-09-17", "18:15", "19:15", "m13", "practice", "pete-morin", "pending"),
  e("d10", "2026-09-18", "18:00", "19:00", "m9", "practice", "dollard-saint-laurent", "confirmed"),
  e("d11", "2026-09-18", "20:00", "21:15", "junior", "practice", "auditorium-de-verdun", "confirmed", { rink: "Auditorium" }),
  e("d12", "2026-09-19", "08:00", "08:50", "m5", "event", "auditorium-de-verdun", "confirmed", { rink: "Denis-Savard", note: { fr: "Séance d'accueil (exemple).", en: "Welcome session (example)." } }),
  e("d13", "2026-09-19", "09:00", "10:00", "m7", "practice", "auditorium-de-verdun", "confirmed", { rink: "Denis-Savard" }),
  e("d14", "2026-09-19", "11:00", "12:15", "m11", "game", "auditorium-de-verdun", "confirmed", { rink: "Auditorium", opponent: "Adversaire (démo)" }),
  e("d15", "2026-09-19", "13:00", "14:15", "m13", "game", "auditorium-de-verdun", "pending", { rink: "Auditorium", opponent: "Adversaire (démo)" }),
  e("d16", "2026-09-19", "15:30", "16:45", "m15", "game", "raymond-bourque", "confirmed", { opponent: "Adversaire (démo)" }),
  e("d17", "2026-09-20", "09:00", "10:00", "m9", "practice", "auditorium-de-verdun", "confirmed", { rink: "Denis-Savard" }),
  e("d18", "2026-09-20", "10:30", "11:45", "feminin", "game", "westmount", "confirmed", { opponent: "Adversaire (démo)" }),
  e("d19", "2026-09-20", "14:00", "15:15", "m18", "game", "auditorium-de-verdun", "confirmed", { rink: "Auditorium", opponent: "Adversaire (démo)" }),

  // Week of 21 Sept 2026
  e("d20", "2026-09-21", "17:00", "17:50", "m9", "practice", "auditorium-de-verdun", "confirmed", { rink: "Auditorium" }),
  e("d21", "2026-09-21", "18:00", "19:00", "m11", "practice", "auditorium-de-verdun", "confirmed", { rink: "Auditorium" }),
  e("d22", "2026-09-21", "19:15", "20:15", "m13", "practice", "auditorium-de-verdun", "confirmed", { rink: "Denis-Savard" }),
  e("d23", "2026-09-22", "17:30", "18:30", "m7", "practice", "auditorium-de-verdun", "cancelled", { rink: "Denis-Savard", note: { fr: "Activités annulées le 22 septembre 2026.", en: "Activities cancelled on September 22, 2026." } }),
  e("d24", "2026-09-22", "18:45", "19:45", "m15", "practice", "samuel-moskovitch", "cancelled", { note: { fr: "Activités annulées le 22 septembre 2026.", en: "Activities cancelled on September 22, 2026." } }),
  e("d25", "2026-09-22", "20:00", "21:00", "junior", "practice", "auditorium-de-verdun", "cancelled", { rink: "Auditorium", note: { fr: "Activités annulées le 22 septembre 2026.", en: "Activities cancelled on September 22, 2026." } }),
  e("d26", "2026-09-23", "18:00", "19:00", "m11", "practice", "jacques-lemaire", "confirmed"),
  e("d27", "2026-09-23", "19:15", "20:30", "m18", "practice", "auditorium-de-verdun", "confirmed", { rink: "Auditorium" }),
  e("d28", "2026-09-24", "17:00", "18:00", "feminin", "practice", "auditorium-de-verdun", "confirmed", { rink: "Denis-Savard" }),
  e("d29", "2026-09-24", "18:15", "19:15", "m13", "practice", "martin-lapointe", "modified", { note: { fr: "Changement d'aréna (précédemment Pete-Morin).", en: "Arena changed (previously Pete-Morin)." } }),
  e("d30", "2026-09-25", "18:00", "19:00", "m9", "practice", "dollard-saint-laurent", "confirmed"),
  e("d31", "2026-09-25", "19:15", "20:30", "m15", "practice", "legion-memorial", "pending"),
  e("d32", "2026-09-26", "08:00", "08:50", "m5", "practice", "auditorium-de-verdun", "cancelled", { rink: "Denis-Savard", note: { fr: "Activités annulées le 26 septembre 2026.", en: "Activities cancelled on September 26, 2026." } }),
  e("d33", "2026-09-26", "09:00", "10:00", "m7", "practice", "auditorium-de-verdun", "cancelled", { rink: "Denis-Savard", note: { fr: "Activités annulées le 26 septembre 2026.", en: "Activities cancelled on September 26, 2026." } }),
  e("d34", "2026-09-26", "11:00", "12:15", "m11", "game", "auditorium-de-verdun", "cancelled", { rink: "Auditorium", opponent: "Adversaire (démo)", note: { fr: "Activités annulées le 26 septembre 2026.", en: "Activities cancelled on September 26, 2026." } }),
  e("d35", "2026-09-26", "13:00", "14:15", "m13", "game", "auditorium-de-verdun", "cancelled", { rink: "Auditorium", opponent: "Adversaire (démo)", note: { fr: "Activités annulées le 26 septembre 2026.", en: "Activities cancelled on September 26, 2026." } }),
  e("d36", "2026-09-27", "09:00", "10:00", "m9", "practice", "auditorium-de-verdun", "confirmed", { rink: "Denis-Savard" }),
  e("d37", "2026-09-27", "10:30", "11:45", "feminin", "game", "outremont", "confirmed", { opponent: "Adversaire (démo)" }),
  e("d38", "2026-09-27", "12:15", "13:30", "m11", "game", "mont-royal", "pending", { opponent: "Adversaire (démo)" }),
  e("d39", "2026-09-27", "14:00", "15:15", "m18", "game", "cegep-saint-laurent", "confirmed", { opponent: "Adversaire (démo)" }),
];

/** The demo "current week" anchors on the brief's reference weeks. */
export const DEMO_TODAY = "2026-09-19";
