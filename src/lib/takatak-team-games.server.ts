import { getPublicTeamById } from "@/data/team-directory";

const ROUTE = "/api/ahmv/team-games";
const PUBLIC_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
type Settings = Record<string, string | undefined>;

type PublicTeamGame = {
  id: string;
  startsAt: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  venueAddress?: string;
  status?: "scheduled" | "final" | "cancelled";
  officialUrl?: string;
  scoresheetUrl?: string;
};

type PublicStanding = {
  rank?: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  points?: number;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: PUBLIC_HEADERS });
}

function httpsUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : undefined;
}

function sanitizeGame(value: unknown): PublicTeamGame | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const game = value as Record<string, unknown>;

  const id = text(game["id"], 160);
  const startsAt = text(game["startsAt"], 80);
  const homeTeam = text(game["homeTeam"], 180);
  const awayTeam = text(game["awayTeam"], 180);
  if (!id || !homeTeam || !awayTeam || !Number.isFinite(Date.parse(startsAt))) {
    return undefined;
  }

  const statusValue = game["status"];
  const status = ["scheduled", "final", "cancelled"].includes(String(statusValue))
    ? statusValue as PublicTeamGame["status"]
    : undefined;
  const homeScore = nonNegativeInteger(game["homeScore"]);
  const awayScore = nonNegativeInteger(game["awayScore"]);
  const venue = text(game["venue"], 220) || undefined;
  const venueAddress = text(game["venueAddress"], 320) || undefined;
  const officialUrl = httpsUrl(game["officialUrl"]);
  const scoresheetUrl = httpsUrl(game["scoresheetUrl"]);

  return {
    id,
    startsAt,
    homeTeam,
    awayTeam,
    ...(homeScore !== undefined ? { homeScore } : {}),
    ...(awayScore !== undefined ? { awayScore } : {}),
    ...(venue ? { venue } : {}),
    ...(venueAddress ? { venueAddress } : {}),
    ...(status ? { status } : {}),
    ...(officialUrl ? { officialUrl } : {}),
    ...(scoresheetUrl ? { scoresheetUrl } : {}),
  };
}

function sanitizeStanding(value: unknown): PublicStanding | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const standing = value as Record<string, unknown>;
  const clean: PublicStanding = {};

  for (const key of ["rank", "gamesPlayed", "wins", "losses", "ties", "points"] as const) {
    const item = nonNegativeInteger(standing[key]);
    if (item !== undefined) clean[key] = item;
  }

  return Object.keys(clean).length > 0 ? clean : undefined;
}

export async function handleTakatakTeamGames(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== ROUTE) return null;

  if (request.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { ...PUBLIC_HEADERS, Allow: "GET" },
    });
  }

  if (settings["TAKATAK_TEAM_GAMES_ENABLED"] !== "true") {
    return json({ status: "disabled" }, 503);
  }

  const teamId = url.searchParams.get("teamId") ?? "";
  const team = getPublicTeamById(teamId);
  if (!team) return json({ status: "unknown_team" }, 404);

  const originValue = settings["TAKATAK_TEAM_GAMES_ORIGIN"];
  const token = settings["TAKATAK_TEAM_GAMES_TOKEN"];
  if (!originValue || !token) return json({ status: "unavailable" }, 503);

  let origin: URL;
  try {
    origin = new URL(originValue);
    if (origin.protocol !== "https:" || origin.origin !== originValue) {
      return json({ status: "unavailable" }, 503);
    }
  } catch {
    return json({ status: "unavailable" }, 503);
  }

  const upstream = new URL("/api/integrations/ahmv/team-games", origin);
  upstream.searchParams.set("teamId", team.legacyScheduleTeamId);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
        "x-ahmv-team-id": team.legacyScheduleTeamId,
      },
      signal: controller.signal,
    });

    if (response.status === 404) return json({ status: "not_connected" });
    if (!response.ok) return json({ status: "upstream_unavailable" }, 502);

    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ status: "invalid_upstream" }, 502);
    }

    const payload = body as Record<string, unknown>;
    const nextGame = sanitizeGame(payload["nextGame"]);
    const latestResult = sanitizeGame(payload["latestResult"]);
    const recentResults = Array.isArray(payload["recentResults"])
      ? payload["recentResults"]
          .slice(0, 8)
          .map(sanitizeGame)
          .filter((game): game is PublicTeamGame => Boolean(game))
      : [];
    const standing = sanitizeStanding(payload["standing"]);
    const sourceUrl = httpsUrl(payload["sourceUrl"]);
    const updatedAtValue = text(payload["updatedAt"], 80);
    const updatedAt = Number.isFinite(Date.parse(updatedAtValue)) ? updatedAtValue : undefined;

    return json({
      status: nextGame || latestResult || recentResults.length > 0 || standing ? "active" : "not_connected",
      teamId: team.legacyScheduleTeamId,
      team: team.name,
      ...(updatedAt ? { updatedAt } : {}),
      ...(sourceUrl ? { sourceUrl } : {}),
      ...(nextGame ? { nextGame } : {}),
      ...(latestResult ? { latestResult } : {}),
      recentResults,
      ...(standing ? { standing } : {}),
      source: "GROUPE TAKATAK",
    });
  } catch {
    return json({ status: "upstream_unavailable" }, 502);
  } finally {
    clearTimeout(timer);
  }
}
