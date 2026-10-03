import {
  localClock,
  normalizeTeam,
  officialPhoneSchedule,
  type PhoneLanguage,
} from "../../../lib/ahmv-phone.ts";
import { phoneText } from "../i18n.ts";
import { nextEventService } from "./service.ts";
import {
  scheduleRangeAnswer,
  type ScheduleRange,
} from "./range.ts";
import {
  fetchLiveSchedule,
  liveScheduleIsReady,
  liveScheduleToPhoneSnapshot,
  type AhmvLiveScheduleResult,
} from "./live.server.ts";

type Settings = Record<string, string | undefined>;

export interface AuthoritativeScheduleMeta {
  source: "live" | "published_snapshot" | "unavailable";
  liveStatus: AhmvLiveScheduleResult["status"];
  liveUpdatedAt?: string | undefined;
  liveSourceUrl?: string | undefined;
}

function approvedQuery(
  teamQuery: string,
  aliases: Record<string, string>,
) {
  return aliases[normalizeTeam(teamQuery)] ?? teamQuery;
}

function scheduleLink(teamQuery: string) {
  return "https://ahmverdun.ca/horaires?q=" +
    encodeURIComponent(teamQuery.slice(0, 80));
}

function liveNoMatch(
  teamQuery: string,
  lang: PhoneLanguage,
  live: AhmvLiveScheduleResult,
) {
  const link = scheduleLink(teamQuery);
  return {
    outcome: "unpublished" as const,
    group: undefined,
    link,
    event: undefined,
    directions: undefined,
    smsText: phoneText(lang, {
      fr: `AHMV: aucun prochain événement confirmé dans la source officielle actuelle pour ${teamQuery.slice(0, 80)}. ${link}`,
      en: `AHMV: no upcoming event is confirmed in the current official source for ${teamQuery.slice(0, 80)}. ${link}`,
      es: `AHMV: no hay un próximo evento confirmado en la fuente oficial actual para ${teamQuery.slice(0, 80)}. ${link}`,
    }),
    text: phoneText(lang, {
      fr: `Aucun prochain événement confirmé dans la source officielle actuelle pour ${teamQuery.slice(0, 80)}. ${link}`,
      en: `No upcoming event is confirmed in the current official source for ${teamQuery.slice(0, 80)}. ${link}`,
      es: `No hay un próximo evento confirmado en la fuente oficial actual para ${teamQuery.slice(0, 80)}. ${link}`,
    }),
    scheduleMeta: {
      source: "live" as const,
      liveStatus: live.status,
      liveUpdatedAt: live.updatedAt,
      liveSourceUrl: live.sourceUrl,
    },
  };
}

function staticSnapshotStillPublished(now: Date) {
  return localClock(now).date <= officialPhoneSchedule.end;
}

export async function nextEventServiceAuthoritative(
  teamQuery: string,
  lang: PhoneLanguage,
  aliases: Record<string, string> = {},
  settings: Settings = process.env,
  now = new Date(),
) {
  const requested = approvedQuery(teamQuery, aliases);
  const live = await fetchLiveSchedule({ team: requested }, settings);

  if (liveScheduleIsReady(live)) {
    if (live.status === "no_match" || live.events.length === 0) {
      return liveNoMatch(requested, lang, live);
    }

    const snapshot = liveScheduleToPhoneSnapshot(live, requested);
    if (snapshot) {
      return {
        ...nextEventService(
          requested,
          lang,
          {},
          now,
          snapshot,
        ),
        scheduleMeta: {
          source: "live" as const,
          liveStatus: live.status,
          liveUpdatedAt: live.updatedAt,
          liveSourceUrl: live.sourceUrl,
        },
      };
    }
  }

  if (staticSnapshotStillPublished(now)) {
    return {
      ...nextEventService(
        teamQuery,
        lang,
        aliases,
        now,
        officialPhoneSchedule,
      ),
      scheduleMeta: {
        source: "published_snapshot" as const,
        liveStatus: live.status,
        liveUpdatedAt: live.updatedAt,
        liveSourceUrl: live.sourceUrl,
      },
    };
  }

  const fallback = nextEventService(
    teamQuery,
    lang,
    aliases,
    now,
    officialPhoneSchedule,
  );

  return {
    ...fallback,
    scheduleMeta: {
      source: "unavailable" as const,
      liveStatus: live.status,
      liveUpdatedAt: live.updatedAt,
      liveSourceUrl: live.sourceUrl,
    },
  };
}

function rangeDate(
  range: ScheduleRange,
  now: Date,
) {
  const clock = localClock(now);
  if (range === "today") return clock.date;
  if (range !== "tomorrow") return undefined;
  const [year, month, day] = clock.date.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! + 1))
    .toISOString()
    .slice(0, 10);
}

function emptyRangeText(
  teamQuery: string,
  range: ScheduleRange,
  lang: PhoneLanguage,
) {
  const link = scheduleLink(teamQuery);
  const label = phoneText(lang, {
    fr:
      range === "today"
        ? "aujourd'hui"
        : range === "tomorrow"
          ? "demain"
          : "cette semaine",
    en:
      range === "today"
        ? "today"
        : range === "tomorrow"
          ? "tomorrow"
          : "this week",
    es:
      range === "today"
        ? "hoy"
        : range === "tomorrow"
          ? "mañana"
          : "esta semana",
  });

  return {
    outcome: "empty" as const,
    group: undefined,
    events: [],
    link,
    text: phoneText(lang, {
      fr: `Aucun événement confirmé ${label} pour ${teamQuery.slice(0, 80)} dans la source officielle actuelle. ${link}`,
      en: `No event is confirmed ${label} for ${teamQuery.slice(0, 80)} in the current official source. ${link}`,
      es: `No hay eventos confirmados ${label} para ${teamQuery.slice(0, 80)} en la fuente oficial actual. ${link}`,
    }),
  };
}

export async function scheduleRangeAnswerAuthoritative(
  teamQuery: string,
  range: ScheduleRange,
  lang: PhoneLanguage,
  aliases: Record<string, string> = {},
  settings: Settings = process.env,
  now = new Date(),
) {
  const requested = approvedQuery(teamQuery, aliases);
  const date = rangeDate(range, now);
  const live = await fetchLiveSchedule(
    {
      team: requested,
      ...(date ? { date } : {}),
    },
    settings,
  );

  if (liveScheduleIsReady(live)) {
    if (live.status === "no_match" || live.events.length === 0) {
      return {
        ...emptyRangeText(requested, range, lang),
        scheduleMeta: {
          source: "live" as const,
          liveStatus: live.status,
          liveUpdatedAt: live.updatedAt,
          liveSourceUrl: live.sourceUrl,
        },
      };
    }

    const snapshot = liveScheduleToPhoneSnapshot(live, requested);
    if (snapshot) {
      return {
        ...scheduleRangeAnswer(
          requested,
          range,
          lang,
          snapshot,
          now,
          {},
        ),
        scheduleMeta: {
          source: "live" as const,
          liveStatus: live.status,
          liveUpdatedAt: live.updatedAt,
          liveSourceUrl: live.sourceUrl,
        },
      };
    }
  }

  if (staticSnapshotStillPublished(now)) {
    return {
      ...scheduleRangeAnswer(
        teamQuery,
        range,
        lang,
        officialPhoneSchedule,
        now,
        aliases,
      ),
      scheduleMeta: {
        source: "published_snapshot" as const,
        liveStatus: live.status,
        liveUpdatedAt: live.updatedAt,
        liveSourceUrl: live.sourceUrl,
      },
    };
  }

  return {
    ...scheduleRangeAnswer(
      teamQuery,
      range,
      lang,
      officialPhoneSchedule,
      now,
      aliases,
    ),
    scheduleMeta: {
      source: "unavailable" as const,
      liveStatus: live.status,
      liveUpdatedAt: live.updatedAt,
      liveSourceUrl: live.sourceUrl,
    },
  };
}
