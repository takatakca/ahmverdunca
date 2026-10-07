import { montrealPublicationDate } from "./news-archive";

export type PublicationTime =
  | { precision: "instant"; iso: string; epochMs: number; day: string }
  | { precision: "day"; day: string }
  | { precision: "unknown" };

export type NewsTimeRange = "hour" | "day" | "week" | "month" | "all";

function validDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** An offset-aware timestamp is an instant; a calendar date never gains an invented time. */
export function resolvePublicationTime(metadata: {
  publishedAt?: unknown;
  date?: unknown;
}): PublicationTime {
  if (typeof metadata.publishedAt === "string") {
    const day = montrealPublicationDate(metadata.publishedAt);
    if (day)
      return {
        precision: "instant",
        iso: metadata.publishedAt,
        epochMs: Date.parse(metadata.publishedAt),
        day,
      };
    if (validDay(metadata.publishedAt)) return { precision: "day", day: metadata.publishedAt };
  }
  return validDay(metadata.date)
    ? { precision: "day", day: metadata.date }
    : { precision: "unknown" };
}

/** Invalid corrections cannot replace verified source metadata. Date-only corrections remain date-only. */
export function overridePublicationTime(
  base: PublicationTime,
  candidate: unknown,
): PublicationTime {
  const override = resolvePublicationTime({ publishedAt: candidate });
  return override.precision === "unknown" ? base : override;
}

export function publicationFieldValue(publication: PublicationTime): string | null {
  return publication.precision === "instant"
    ? publication.iso
    : publication.precision === "day"
      ? publication.day
      : null;
}

function montrealDay(now: number): string | undefined {
  if (!Number.isFinite(now)) return undefined;
  const date = new Date(now);
  return Number.isFinite(date.getTime()) ? montrealPublicationDate(date.toISOString()) : undefined;
}

function calendarDayIndex(day: string) {
  return Date.parse(`${day}T00:00:00Z`) / 86_400_000;
}

/** The hour is rolling; today/7/30 days are Montreal calendar windows, inclusive of today. */
export function matchesPublicationRange(
  publication: PublicationTime,
  range: NewsTimeRange,
  now: number,
): boolean {
  const today = montrealDay(now);
  if (!today) return false;
  if (publication.precision === "unknown") return range === "all";
  if (publication.day > today || (publication.precision === "instant" && publication.epochMs > now))
    return false;
  if (range === "all") return true;
  if (range === "hour")
    return publication.precision === "instant" && now - publication.epochMs <= 3_600_000;
  const dayAge = calendarDayIndex(today) - calendarDayIndex(publication.day);
  const span = range === "day" ? 1 : range === "week" ? 7 : 30;
  return dayAge >= 0 && dayAge < span;
}

export function publicationDateLabel(
  publication: PublicationTime,
  lang: "fr" | "en",
  fallback?: string,
  archived = false,
): string {
  if (publication.precision === "unknown")
    return fallback ?? (lang === "fr" ? "Date non indiquée" : "Date not provided");
  const precise = publication.precision === "instant";
  const label = new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: precise ? "America/Toronto" : "UTC",
    ...(precise ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(precise ? publication.epochMs : `${publication.day}T00:00:00Z`));
  return archived ? `${label} · Archive` : label;
}

/** Unknown dates stay last; exact timestamps come first within a day, and date-only ties preserve source order. */
export function sortByPublication<T extends { publication: PublicationTime }>(
  items: T[],
  mode: "newest" | "oldest",
): T[] {
  const direction = mode === "newest" ? -1 : 1;
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const left = a.item.publication;
      const right = b.item.publication;
      if (left.precision === "unknown")
        return right.precision === "unknown" ? a.index - b.index : 1;
      if (right.precision === "unknown") return -1;
      const dayOrder = left.day.localeCompare(right.day);
      if (dayOrder) return dayOrder * direction;
      if (left.precision === "instant" && right.precision === "instant") {
        return (left.epochMs - right.epochMs) * direction || a.index - b.index;
      }
      if (left.precision !== right.precision) return left.precision === "instant" ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}
