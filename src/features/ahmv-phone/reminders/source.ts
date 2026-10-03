import { PUBLIC_TEAM_DIRECTORY } from "../../../data/team-directory.ts";
import type { ScheduleSnapshot } from "../../../lib/ahmv-phone.ts";
import type { AuthoritativeEventSnapshot } from "./change-detector.ts";

type Settings = Record<string, string | undefined>;

function validTeamIds() {
  return new Set(PUBLIC_TEAM_DIRECTORY.map((team) => team.legacyScheduleTeamId));
}

export function approvedReminderTeamMap(
  settings: Settings = process.env,
): Record<string, string> {
  const raw = settings["AHMV_REMINDER_TEAM_MAP_JSON"];
  if (!raw) return {};

  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AHMV_REMINDER_TEAM_MAP_JSON must be an object");
  }

  const allowed = validTeamIds();
  const result: Record<string, string> = {};

  for (const [group, teamId] of Object.entries(parsed)) {
    if (
      !group.trim() ||
      typeof teamId !== "string" ||
      !allowed.has(teamId)
    ) {
      throw new Error("Invalid reminder team mapping");
    }
    result[group.trim()] = teamId;
  }

  return result;
}

function timeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

export function torontoLocalDateTimeToIso(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Invalid local event date/time");
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (
    !year ||
    !month ||
    !day ||
    hour === undefined ||
    minute === undefined ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("Invalid local event date/time");
  }

  const wallClockUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let candidate = wallClockUtc;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = timeZoneParts(new Date(candidate), "America/Toronto");
    const represented = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const offset = represented - candidate;
    candidate = wallClockUtc - offset;
  }

  const verification = timeZoneParts(new Date(candidate), "America/Toronto");
  if (
    verification.year !== year ||
    verification.month !== month ||
    verification.day !== day ||
    verification.hour !== hour ||
    verification.minute !== minute
  ) {
    throw new Error("Local event time is ambiguous or invalid in America/Toronto");
  }

  return new Date(candidate).toISOString();
}

export function authoritativeEventsFromSchedule(
  snapshot: ScheduleSnapshot,
  teamMap: Record<string, string>,
): AuthoritativeEventSnapshot[] {
  const events: AuthoritativeEventSnapshot[] = [];

  for (const activity of snapshot.activities) {
    const publicTeamId = teamMap[activity.group];
    if (!publicTeamId) continue;

    events.push({
      providerEventId: activity.id,
      publicTeamId,
      startsAt: torontoLocalDateTimeToIso(activity.date, activity.start),
      venue: activity.venue,
      status: activity.status,
    });
  }

  return events;
}
