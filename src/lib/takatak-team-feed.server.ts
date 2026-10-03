import { getPublicTeamById } from "@/data/team-directory";

const ROUTE = "/api/ahmv/team-feed";
const PUBLIC_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
type Settings = Record<string, string | undefined>;

type PublicFeedItem = {
  id: string;
  platform: "facebook" | "instagram" | "x" | "tiktok" | "youtube";
  publishedAt: string;
  text: string;
  url: string;
  mediaUrl?: string;
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

function sanitizeItem(value: unknown): PublicFeedItem | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const item = value as Record<string, unknown>;
  const id = typeof item["id"] === "string" ? item["id"].slice(0, 160) : "";
  const platform = item["platform"];
  const publishedAt = typeof item["publishedAt"] === "string" ? item["publishedAt"] : "";
  const text = typeof item["text"] === "string" ? item["text"].slice(0, 1200) : "";
  const url = httpsUrl(item["url"]);
  const mediaUrl = httpsUrl(item["mediaUrl"]);
  if (
    !id ||
    !["facebook", "instagram", "x", "tiktok", "youtube"].includes(String(platform)) ||
    !Number.isFinite(Date.parse(publishedAt)) ||
    !url
  ) {
    return undefined;
  }
  return {
    id,
    platform: platform as PublicFeedItem["platform"],
    publishedAt,
    text,
    url,
    ...(mediaUrl ? { mediaUrl } : {}),
  };
}

export async function handleTakatakTeamFeed(
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

  if (settings["TAKATAK_TEAM_FEED_ENABLED"] !== "true") {
    return json({ status: "disabled", items: [] }, 503);
  }

  const teamId = url.searchParams.get("teamId") ?? "";
  const team = getPublicTeamById(teamId);
  if (!team) return json({ status: "unknown_team", items: [] }, 404);

  const originValue = settings["TAKATAK_TEAM_FEED_ORIGIN"];
  const token = settings["TAKATAK_TEAM_FEED_TOKEN"];
  if (!originValue || !token) return json({ status: "unavailable", items: [] }, 503);

  let origin: URL;
  try {
    origin = new URL(originValue);
    if (origin.protocol !== "https:" || origin.origin !== originValue) {
      return json({ status: "unavailable", items: [] }, 503);
    }
  } catch {
    return json({ status: "unavailable", items: [] }, 503);
  }

  const upstream = new URL("/api/integrations/ahmv/team-feed", origin);
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

    if (response.status === 404) return json({ status: "not_connected", items: [] });
    if (response.status === 402 || response.status === 403) {
      return json({ status: "subscription_required", items: [] });
    }
    if (!response.ok) return json({ status: "upstream_unavailable", items: [] }, 502);

    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ status: "invalid_upstream", items: [] }, 502);
    }

    const payload = body as Record<string, unknown>;
    const rawItems = Array.isArray(payload["items"]) ? payload["items"].slice(0, 20) : [];
    const items = rawItems.map(sanitizeItem).filter((item): item is PublicFeedItem => Boolean(item));

    return json({
      status: items.length > 0 ? "active" : "connected",
      teamId: team.legacyScheduleTeamId,
      team: team.name,
      items,
      source: "GROUPE TAKATAK",
    });
  } catch {
    return json({ status: "upstream_unavailable", items: [] }, 502);
  } finally {
    clearTimeout(timer);
  }
}
