const NETWORKS = ["website", "facebook", "instagram", "tiktok", "youtube"] as const;

export type CommunityFeedItem = {
  id: string;
  source: "official" | "community";
  publishedAt: string;
  text: string | null;
  url: string | null;
  imageUrl: string | null;
  network?: (typeof NETWORKS)[number];
  association?: string;
  teamSlugs?: string[];
};

function publicHttps(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
export function parseCommunityFeed(payload: unknown): CommunityFeedItem[] {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("connected" in payload) ||
    payload.connected !== true ||
    !("items" in payload) ||
    !Array.isArray(payload.items)
  )
    return [];
  return payload.items
    .filter((item): item is CommunityFeedItem =>
      Boolean(
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        (item.source === "official" || item.source === "community") &&
        typeof item.publishedAt === "string" &&
        Number.isFinite(Date.parse(item.publishedAt)),
      ),
    )
    .slice(0, 12)
    .map((item) => {
      const network = NETWORKS.find((value) => value === item.network);
      const association =
        typeof item.association === "string" && item.association.trim()
          ? item.association.trim().slice(0, 80)
          : undefined;
      const teamSlugs = Array.isArray(item.teamSlugs)
        ? item.teamSlugs.filter((slug): slug is string => typeof slug === "string" && /^[a-z0-9-]{1,40}$/.test(slug)).slice(0, 8)
        : [];
      return {
        id: item.id,
        source: item.source,
        publishedAt: item.publishedAt,
        text: typeof item.text === "string" ? item.text : null,
        url: publicHttps(item.url),
        imageUrl: publicHttps(item.imageUrl),
        ...(network ? { network } : {}),
        ...(association ? { association } : {}),
        ...(teamSlugs.length ? { teamSlugs } : {}),
      };
    });
}
