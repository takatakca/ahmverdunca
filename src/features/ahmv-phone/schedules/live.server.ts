import type { OfficialWeekActivity } from "../../../data/official-week.ts";
import type { ScheduleSnapshot } from "../../../lib/ahmv-phone.ts";


type Settings = Record<string, string | undefined>;

export type AhmvLiveScheduleStatus =
  | "active"
  | "no_match"
  | "not_configured"
  | "upstream_unavailable"
  | "invalid_upstream"
  | "stale";

export interface AhmvLiveScheduleEvent {
  id: string;
  type: string;
  team?: string;
  category?: string;
  startsAt: string;
  endsAt?: string;
  status: string;
  opponent?: string;
  venue?: string;
  venueAddress?: string;
  officialUrl?: string;
  sourceUrl?: string;
}

export interface AhmvLiveScheduleResult {
  status: AhmvLiveScheduleStatus;
  updatedAt?: string;
  sourceUrl?: string;
  events: AhmvLiveScheduleEvent[];
  reason?: string;
}

function text(value: unknown, max = 300) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, max) : undefined;
}

function https(value: unknown) {
  const candidate = text(value, 1200);
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function iso(value: unknown) {
  const candidate = text(value, 80);
  if (!candidate || !Number.isFinite(Date.parse(candidate))) return undefined;
  return new Date(candidate).toISOString();
}

function maxAgeMinutes(settings: Settings) {
  const parsed = Number(settings["AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES"] ?? "360");
  return Number.isInteger(parsed) && parsed >= 5 && parsed <= 10080 ? parsed : 360;
}

function normalizeEvent(value: unknown): AhmvLiveScheduleEvent | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  const id = text(raw["id"], 160);
  const startsAt = iso(raw["startsAt"] ?? raw["starts_at"]);
  if (!id || !startsAt) return undefined;

  const event: AhmvLiveScheduleEvent = {
    id,
    type: text(raw["type"], 80) ?? "activity",
    startsAt,
    status: text(raw["status"], 40) ?? "scheduled",
  };
  const endsAt = iso(raw["endsAt"] ?? raw["ends_at"]);
  const team = text(raw["team"], 160);
  const category = text(raw["category"], 80);
  const opponent = text(raw["opponent"], 160);
  const venue = text(raw["venue"] ?? raw["arena"], 180);
  const venueAddress = text(raw["venueAddress"] ?? raw["venue_address"] ?? raw["arenaAddress"], 500);
  const officialUrl = https(raw["officialUrl"] ?? raw["official_url"]);
  const sourceUrl = https(raw["sourceUrl"] ?? raw["source_url"]);
  if (endsAt) event.endsAt = endsAt;
  if (team) event.team = team;
  if (category) event.category = category;
  if (opponent) event.opponent = opponent;
  if (venue) event.venue = venue;
  if (venueAddress) event.venueAddress = venueAddress;
  if (officialUrl) event.officialUrl = officialUrl;
  if (sourceUrl) event.sourceUrl = sourceUrl;
  return event;
}

export function normalizeLiveSchedulePayload(
  payload: unknown,
  settings: Settings = process.env,
  now = new Date(),
): AhmvLiveScheduleResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { status: "invalid_upstream", events: [], reason: "payload_not_object" };
  }
  const raw = payload as Record<string, unknown>;
  const updatedAt = iso(raw["updatedAt"] ?? raw["updated_at"]);
  const sourceUrl = https(raw["sourceUrl"] ?? raw["source_url"]);
  if (!updatedAt || !sourceUrl) {
    return { status: "invalid_upstream", events: [], reason: "missing_provenance" };
  }
  const ageMs = now.getTime() - Date.parse(updatedAt);
  if (ageMs < -5 * 60_000 || ageMs > maxAgeMinutes(settings) * 60_000) {
    return { status: "stale", updatedAt, sourceUrl, events: [], reason: "feed_age" };
  }

  const events = (Array.isArray(raw["events"]) ? raw["events"] : [])
    .slice(0, 100)
    .map(normalizeEvent)
    .filter((event): event is AhmvLiveScheduleEvent => Boolean(event))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const declared = text(raw["status"], 40);
  const status: AhmvLiveScheduleStatus =
    declared === "no_match" || events.length === 0 ? "no_match" : "active";
  return { status, updatedAt, sourceUrl, events };
}

export async function fetchLiveSchedule(
  input: { team?: string; category?: string; date?: string } = {},
  settings: Settings = process.env,
): Promise<AhmvLiveScheduleResult> {
  const endpoint = settings["TAKATAK_AHMV_SCHEDULE_URL"]?.trim();
  const token = settings["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim();
  if (!endpoint || !token) return { status: "not_configured", events: [] };

  let url: URL;
  try {
    url = new URL(endpoint);
    if (url.protocol !== "https:") throw new Error("https required");
  } catch {
    return { status: "not_configured", events: [], reason: "invalid_endpoint" };
  }

  if (input.team) url.searchParams.set("team", input.team.slice(0, 80));
  if (input.category) url.searchParams.set("category", input.category.slice(0, 80));
  if (input.date) url.searchParams.set("date", input.date.slice(0, 10));

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
        "x-ahmv-tenant": "ahmverdun",
      },
      redirect: "error",
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) {
      return { status: "upstream_unavailable", events: [], reason: `http_${response.status}` };
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return { status: "invalid_upstream", events: [], reason: "content_type" };
    }
    const raw = await response.text();
    if (raw.length > 512 * 1024) {
      return { status: "invalid_upstream", events: [], reason: "response_too_large" };
    }
    return normalizeLiveSchedulePayload(JSON.parse(raw), settings);
  } catch (error) {
    return {
      status: "upstream_unavailable",
      events: [],
      reason: error instanceof Error ? error.name.slice(0, 80) : "fetch_failed",
    };
  }
}

function torontoParts(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

export function liveEventToVoiceMatch(event: AhmvLiveScheduleEvent) {
  const start = torontoParts(event.startsAt);
  const end = event.endsAt ? torontoParts(event.endsAt) : undefined;
  const destination = event.venueAddress;
  const encoded = destination ? encodeURIComponent(destination) : null;
  return {
    id: event.id,
    type: event.type,
    team: event.team ?? null,
    category: event.category ?? null,
    date: start.date,
    time: start.time,
    endTime: end?.date === start.date ? end.time : null,
    status: event.status,
    opponent: event.opponent ?? null,
    arena: event.venue ?? null,
    arenaAddress: destination ?? null,
    mapsUrl: encoded ? `https://www.google.com/maps/dir/?api=1&destination=${encoded}` : null,
    wazeUrl: encoded ? `https://www.waze.com/ul?q=${encoded}&navigate=yes` : null,
    appleMapsUrl: encoded ? `https://maps.apple.com/?daddr=${encoded}` : null,
    sourceUrl: event.officialUrl ?? event.sourceUrl ?? null,
  };
}

export function liveScheduleIsReady(result: AhmvLiveScheduleResult) {
  return result.status === "active" || result.status === "no_match";
}


export function liveEventToPhoneActivity(
  event: AhmvLiveScheduleEvent,
  fallbackGroup: string,
): OfficialWeekActivity {
  const start = torontoParts(event.startsAt);
  const end = event.endsAt ? torontoParts(event.endsAt) : undefined;
  return {
    id: event.id,
    date: start.date,
    start: start.time,
    end: end?.date === start.date ? end.time : start.time,
    venue: event.venue ?? "Lieu non publié",
    activity: event.type || "Activité",
    group: event.team ?? event.category ?? fallbackGroup,
    status:
      event.status.toLowerCase() === "cancelled"
        ? "cancelled"
        : "scheduled",
  };
}

export function liveScheduleToPhoneSnapshot(
  result: AhmvLiveScheduleResult,
  fallbackGroup: string,
): ScheduleSnapshot | null {
  if (!liveScheduleIsReady(result) || result.events.length === 0) {
    return null;
  }

  const activities = result.events.map((event) =>
    liveEventToPhoneActivity(event, fallbackGroup)
  );
  const dates = activities.map((event) => event.date).sort();

  return {
    start: dates[0]!,
    end: dates[dates.length - 1]!,
    activities,
  };
}
