import { readFile } from "node:fs/promises";
import { validateWeeklyScheduleImport, type WeeklyScheduleImportPayload } from "../src/lib/weekly-schedule-ingestion.ts";

const inputPath = Bun.argv[2];
if (!inputPath) {
  console.error("Usage: bun scripts/prepare-weekly-schedule-import.ts <transcription.json>");
  process.exit(2);
}

let payload: WeeklyScheduleImportPayload;
try {
  payload = JSON.parse(await readFile(inputPath, "utf8")) as WeeklyScheduleImportPayload;
} catch (error) {
  console.error("Unable to read or parse schedule transcription JSON.");
  if (error instanceof Error) console.error(error.message);
  process.exit(2);
}

const result = validateWeeklyScheduleImport(payload);
if (result.errors.length) {
  console.error("\nWeekly schedule import refused:\n");
  for (const error of result.errors) console.error("- " + error);
  process.exit(1);
}

console.log(JSON.stringify({
  week: payload.week,
  start: payload.start,
  end: payload.end,
  publishedAt: payload.publishedAt,
  sourceUrl: payload.sourceUrl,
  method: payload.method,
  activityCount: result.activities.length,
  activities: result.activities,
}, null, 2));
