import { getArenaForVenue } from "@/data/arenas";
import {
  OFFICIAL_WEEK_ACTIVITIES,
  OFFICIAL_WEEK_META,
  type OfficialWeekActivity,
} from "@/data/official-week";

export interface OfficialWeekSnapshotEvent {
  id: string;
  type: string;
  team: string;
  category?: string;
  startsAt: string;
  endsAt: string;
  status: "scheduled" | "cancelled";
  venue: string;
  venueAddress?: string;
  officialUrl: string;
  sourceUrl: string;
}

export interface OfficialWeekSnapshot {
  status: "active";
  updatedAt: string;
  sourceUrl: string;
  events: OfficialWeekSnapshotEvent[];
}

function partsInToronto(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    hour: Number(value("hour")),
    minute: Number(value("minute")),
    second: Number(value("second")),
  };
}

export function torontoLocalToIso(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Invalid Toronto local date/time.");
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let candidate = desiredAsUtc;

  // Two passes are enough to resolve the Toronto UTC offset even around DST.
  for (let index = 0; index < 2; index += 1) {
    const represented = partsInToronto(new Date(candidate));
    const representedAsUtc = Date.UTC(
      represented.year,
      represented.month - 1,
      represented.day,
      represented.hour,
      represented.minute,
      represented.second,
    );
    candidate += desiredAsUtc - representedAsUtc;
  }

  const verified = partsInToronto(new Date(candidate));
  if (
    verified.year !== year ||
    verified.month !== month ||
    verified.day !== day ||
    verified.hour !== hour ||
    verified.minute !== minute
  ) {
    throw new Error(`Toronto local time could not be resolved: ${date} ${time}`);
  }

  return new Date(candidate).toISOString();
}

function sourceCategory(activity: OfficialWeekActivity) {
  const scope = `${activity.group} ${activity.activity}`;
  const category = scope.match(/\bM(?:5|7|9|11|12|13|15|17|18|19|22)\b/i)?.[0];
  if (category) return category.toUpperCase();
  if (/hockey sur mesure/i.test(scope)) return "Hockey sur mesure";
  if (/WLLV|Chacals/i.test(scope)) return "WLLV";
  if (/junior/i.test(scope)) return "Junior";
  return undefined;
}

function torontoDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function validateOfficialWeekSourceTimestamp(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new Error(
      "AHMV weekly source timestamp must be an offset-aware ISO timestamp.",
    );
  }

  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error("AHMV weekly source timestamp is invalid.");
  }

  if (torontoDate(parsed.toISOString()) !== OFFICIAL_WEEK_META.publishedAt) {
    throw new Error(
      `AHMV weekly source timestamp must fall on published date ${OFFICIAL_WEEK_META.publishedAt} in America/Toronto.`,
    );
  }

  return parsed.toISOString();
}

export function buildOfficialWeekSnapshot(sourceUpdatedAt: string): OfficialWeekSnapshot {
  const updatedAt = validateOfficialWeekSourceTimestamp(sourceUpdatedAt);

  const events = OFFICIAL_WEEK_ACTIVITIES.map((activity) => {
    const arena = getArenaForVenue(activity.venue);
    const category = sourceCategory(activity);
    return {
      id: activity.id,
      type: activity.activity,
      team: activity.group,
      ...(category ? { category } : {}),
      startsAt: torontoLocalToIso(activity.date, activity.start),
      endsAt: torontoLocalToIso(activity.date, activity.end),
      status: activity.status,
      venue: activity.venue,
      ...(arena?.addressVerified ? { venueAddress: arena.address } : {}),
      officialUrl: OFFICIAL_WEEK_META.sourceUrl,
      sourceUrl: OFFICIAL_WEEK_META.sourceUrl,
    };
  });

  return {
    status: "active",
    updatedAt,
    sourceUrl: OFFICIAL_WEEK_META.sourceUrl,
    events,
  };
}
