import {
  localClock,
  normalizeTeam,
  officialPhoneSchedule,
  type PhoneLanguage,
  type ScheduleSnapshot,
} from "../../../lib/ahmv-phone";

export type ScheduleRange = "today" | "tomorrow" | "week";

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year!, month! - 1, day! + days));
  return value.toISOString().slice(0, 10);
}

function resolveGroup(
  query: string,
  snapshot: ScheduleSnapshot,
  aliases: Record<string, string>,
) {
  const key = normalizeTeam(query);
  const requested = aliases[key] ?? query;
  return [...new Set(snapshot.activities.map((item) => item.group))]
    .find((group) => normalizeTeam(group) === normalizeTeam(requested));
}

export function scheduleRangeAnswer(
  query: string,
  range: ScheduleRange,
  lang: PhoneLanguage,
  snapshot: ScheduleSnapshot = officialPhoneSchedule,
  now = new Date(),
  aliases: Record<string, string> = {},
) {
  const clock = localClock(now);
  const group = resolveGroup(query, snapshot, aliases);
  const start = range === "tomorrow" ? addDays(clock.date, 1) : clock.date;
  const end = range === "today" ? start : range === "tomorrow" ? start : snapshot.end;
  const link = `https://ahmverdun.ca/horaires?q=${encodeURIComponent(group ?? query.slice(0, 80))}`;

  if (!group || clock.date > snapshot.end) {
    return {
      outcome: "unavailable" as const,
      group,
      text:
        lang === "fr"
          ? `Horaire détaillé non disponible pour ${query.slice(0, 80)}. ${link}`
          : `Detailed schedule unavailable for ${query.slice(0, 80)}. ${link}`,
      events: [],
      link,
    };
  }

  const events = snapshot.activities
    .filter((item) => item.group === group && item.date >= start && item.date <= end)
    .filter((item) => range !== "week" || item.date > clock.date || item.start >= clock.time)
    .slice()
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))
    .slice(0, 8);

  if (!events.length) {
    return {
      outcome: "empty" as const,
      group,
      text:
        lang === "fr"
          ? `Aucun événement confirmé pour ${group} dans cette période. ${link}`
          : `No confirmed events for ${group} in this period. ${link}`,
      events,
      link,
    };
  }

  const label =
    range === "today"
      ? lang === "fr" ? "Aujourd'hui" : "Today"
      : range === "tomorrow"
        ? lang === "fr" ? "Demain" : "Tomorrow"
        : lang === "fr" ? "Cette semaine" : "This week";
  const lines = events.map((event) => {
    const cancelled = event.status === "cancelled"
      ? lang === "fr" ? "ANNULÉ " : "CANCELLED "
      : "";
    return `${cancelled}${event.date} ${event.start} — ${event.activity} — ${event.venue}`;
  });
  return {
    outcome: "scheduled" as const,
    group,
    text: `${label} — ${group}:\n${lines.join("\n")}\n${link}`,
    events,
    link,
  };
}
