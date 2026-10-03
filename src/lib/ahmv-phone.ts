import {
  OFFICIAL_WEEK_ACTIVITIES,
  OFFICIAL_WEEK_META,
  type OfficialWeekActivity,
} from "../data/official-week.ts";

export type PhoneLanguage = "fr" | "en";
export interface ScheduleSnapshot {
  start: string;
  end: string;
  activities: readonly OfficialWeekActivity[];
}

export const officialPhoneSchedule: ScheduleSnapshot = {
  ...OFFICIAL_WEEK_META,
  activities: OFFICIAL_WEEK_ACTIVITIES,
};

export function normalizeTeam(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function localClock(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (key: string) => parts.find((item) => item.type === key)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

export function scheduleAnswer(
  query: string,
  lang: PhoneLanguage,
  snapshot: ScheduleSnapshot = officialPhoneSchedule,
  now = new Date(),
  aliases: Record<string, string> = {},
) {
  const clock = localClock(now);
  const groups = [...new Set(snapshot.activities.map((item) => item.group))];
  const key = normalizeTeam(query);
  // Aliases must be explicitly approved by AHMV. Never infer M12B -> M11.
  const alias = aliases[key];
  const group = groups.find((item) => normalizeTeam(item) === normalizeTeam(alias ?? query));
  const link = `https://ahmverdun.ca/horaires?q=${encodeURIComponent(group ?? query.slice(0, 80))}`;
  if (!key || clock.date > snapshot.end) {
    return {
      outcome: "unavailable",
      text:
        lang === "fr"
          ? `Horaire actuel non disponible dans la source intégrée. Consultez ${link}`
          : `Current schedule unavailable in the integrated source. Check ${link}`,
    };
  }
  const next = snapshot.activities
    .filter(
      (item) =>
        item.group === group &&
        item.date >= snapshot.start &&
        item.date <= snapshot.end &&
        (item.date > clock.date || (item.date === clock.date && item.start > clock.time)),
    )
    .slice()
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))[0];
  if (!next) {
    return {
      outcome: "unpublished",
      text:
        lang === "fr"
          ? `Aucun prochain événement confirmé dans la source intégrée pour ${query.slice(0, 80)}. Horaire possiblement à venir. ${link}`
          : `No upcoming event confirmed in the integrated source for ${query.slice(0, 80)}. Schedule may still be pending. ${link}`,
    };
  }
  const cancelled = next.status === "cancelled";
  return {
    outcome: cancelled ? "cancelled" : "scheduled",
    text: `${cancelled ? (lang === "fr" ? "ANNULÉ — " : "CANCELLED — ") : ""}${next.group}: ${next.date} ${next.start}, ${next.activity}, ${next.venue}. ${link}`,
  };
}

export function parseSms(body: string) {
  const value = body.trim().slice(0, 160);
  const prefix = /^(FR|EN)(?:\s+|$)/i.exec(value);
  return {
    lang: prefix?.[1]?.toUpperCase() === "EN" ? ("en" as const) : ("fr" as const),
    query: prefix ? value.slice(prefix[0].length).trim() : value,
  };
}
