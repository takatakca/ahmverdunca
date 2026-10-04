import { getArenaForVenue } from "@/data/arenas";
import type { OfficialActivityStatus, OfficialWeekActivity } from "@/data/official-week";

export type ScheduleExtractionMethod = "visual-transcription" | "pdf-text" | "official-feed";

export interface ExtractedScheduleRow {
  rowId: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  activity: string;
  group: string;
  status?: OfficialActivityStatus;
  sourcePage?: number;
}

export interface ScheduleExtractionContext {
  week: number;
  weekStart: string;
  weekEnd: string;
  sourceUrl: string;
  method: ScheduleExtractionMethod;
}

export interface NormalizedScheduleActivity extends OfficialWeekActivity {
  arenaSlug?: string;
  provenance: {
    week: number;
    sourceUrl: string;
    method: ScheduleExtractionMethod;
    sourcePage?: number;
    sourceRowId: string;
  };
}

export interface ScheduleNormalizationResult {
  activities: NormalizedScheduleActivity[];
  errors: string[];
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T12:00:00Z"));
}

function validTime(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeExtractedScheduleRows(
  rows: readonly ExtractedScheduleRow[],
  context: ScheduleExtractionContext,
): ScheduleNormalizationResult {
  const errors: string[] = [];
  const activities: NormalizedScheduleActivity[] = [];
  const ids = new Set<string>();

  if (!context.sourceUrl.startsWith("https://")) {
    return { activities: [], errors: ["Schedule source URL must use HTTPS."] };
  }
  if (!validDate(context.weekStart) || !validDate(context.weekEnd) || context.weekStart > context.weekEnd) {
    return { activities: [], errors: ["Schedule extraction context has an invalid week range."] };
  }

  rows.forEach((row, index) => {
    const rowLabel = row.rowId || String(index + 1);
    const date = clean(row.date);
    const start = clean(row.start);
    const end = clean(row.end);
    const venue = clean(row.venue);
    const activity = clean(row.activity);
    const group = clean(row.group);

    if (!validDate(date) || date < context.weekStart || date > context.weekEnd) {
      errors.push("Row " + rowLabel + " has an invalid or out-of-range date.");
      return;
    }
    if (!validTime(start) || !validTime(end) || start >= end) {
      errors.push("Row " + rowLabel + " has an invalid time range.");
      return;
    }
    if (!venue || !activity || !group) {
      errors.push("Row " + rowLabel + " is missing venue, activity or group.");
      return;
    }

    const id = "w" + context.week + "-" + date.replaceAll("-", "") + "-" + start.replace(":", "") + "-" + clean(row.rowId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 36);
    if (ids.has(id)) {
      errors.push("Duplicate normalized schedule id " + id + ".");
      return;
    }
    ids.add(id);

    const arena = getArenaForVenue(venue);
    activities.push({
      id,
      date,
      start,
      end,
      venue,
      activity,
      group,
      status: row.status ?? "scheduled",
      ...(arena ? { arenaSlug: arena.slug } : {}),
      provenance: {
        week: context.week,
        sourceUrl: context.sourceUrl,
        method: context.method,
        ...(row.sourcePage ? { sourcePage: row.sourcePage } : {}),
        sourceRowId: rowLabel,
      },
    });
  });

  activities.sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
  return { activities, errors };
}
