export type CommunityFeedItem = {
  id: string;
  source: "official" | "community";
  publishedAt: string;
  text: string | null;
  url: string | null;
  imageUrl: string | null;
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
    .map((item) => ({
      id: item.id,
      source: item.source,
      publishedAt: item.publishedAt,
      text: typeof item.text === "string" ? item.text : null,
      url: publicHttps(item.url),
      imageUrl: publicHttps(item.imageUrl),
    }));
}
