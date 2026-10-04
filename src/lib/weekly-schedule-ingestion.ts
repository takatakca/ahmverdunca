import { WEEKLY_SCHEDULE_DOCUMENTS } from "@/data/official-week";
import {
  normalizeExtractedScheduleRows,
  type ExtractedScheduleRow,
  type NormalizedScheduleActivity,
  type ScheduleExtractionMethod,
} from "@/lib/weekly-schedule-normalizer";

export interface WeeklyScheduleImportPayload {
  week: number;
  start: string;
  end: string;
  publishedAt: string;
  sourceUrl: string;
  method: ScheduleExtractionMethod;
  rows: ExtractedScheduleRow[];
}

export interface WeeklyScheduleImportResult {
  activities: NormalizedScheduleActivity[];
  errors: string[];
  unmappedVenues: string[];
}

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "fr-CA"));
}

export function validateWeeklyScheduleImport(
  payload: WeeklyScheduleImportPayload,
): WeeklyScheduleImportResult {
  const errors: string[] = [];
  const official = WEEKLY_SCHEDULE_DOCUMENTS.find((item) => item.week === payload.week);

  if (!official) {
    return {
      activities: [],
      unmappedVenues: [],
      errors: [`Week ${payload.week} is not present in WEEKLY_SCHEDULE_DOCUMENTS.`],
    };
  }

  if (payload.start !== official.start) {
    errors.push(`Week ${payload.week} start does not match the published document.`);
  }
  if (payload.end !== official.end) {
    errors.push(`Week ${payload.week} end does not match the published document.`);
  }
  if (payload.publishedAt !== official.publishedAt) {
    errors.push(`Week ${payload.week} publication date does not match the published document.`);
  }
  if (payload.sourceUrl !== official.sourceUrl) {
    errors.push(`Week ${payload.week} source URL does not match the published document.`);
  }
  if (payload.method !== "visual-transcription" && payload.method !== "pdf-text" && payload.method !== "official-feed") {
    errors.push("Unsupported schedule extraction method.");
  }
  if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
    errors.push("Schedule import must contain at least one transcribed row.");
  }

  if (errors.length) return { activities: [], errors, unmappedVenues: [] };

  const normalized = normalizeExtractedScheduleRows(payload.rows, {
    week: payload.week,
    weekStart: payload.start,
    weekEnd: payload.end,
    sourceUrl: payload.sourceUrl,
    method: payload.method,
  });

  errors.push(...normalized.errors);

  const unmappedVenues = unique(
    normalized.activities
      .filter((activity) => !activity.arenaSlug)
      .map((activity) => activity.venue),
  );

  for (const venue of unmappedVenues) {
    errors.push(`Venue "${venue}" is not mapped to a verified arena. Add or verify the arena mapping before integration.`);
  }

  return {
    activities: errors.length ? [] : normalized.activities,
    errors,
    unmappedVenues,
  };
}
