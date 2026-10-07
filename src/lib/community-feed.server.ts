import { parseCommunityFeed } from "./community-feed";

const ROUTE = "/api/ahmv/community-feed";
const UPSTREAM = "https://takatak.ca/api/public/ahmv/community-feed";
const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

// Share one bounded request across visitors. An unavailable social provider
// must not flood the upstream or interrupt the public gallery.
export function createCommunityFeedHandler({
  fetcher = fetch,
  now = Date.now,
}: { fetcher?: typeof fetch; now?: () => number } = {}) {
  let cached: Record<string, unknown> | undefined;
  let expiresAt = 0;
  let pending: Promise<Record<string, unknown>> | undefined;

  async function load(): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetcher(UPSTREAM, {
        headers: { accept: "application/json" },
        credentials: "omit",
        redirect: "error",
        signal: controller.signal,
      });
      if (!response.ok) {
        return { connected: false, status: "unavailable", items: [] };
      }
      const text = await response.text();
      if (text.length > 256_000) {
        return { connected: false, status: "unavailable", items: [] };
      }
      const payload: unknown = JSON.parse(text);
      const connected = Boolean(
        payload &&
        typeof payload === "object" &&
        "connected" in payload &&
        payload.connected === true &&
        "items" in payload &&
        Array.isArray(payload.items),
      );
      return {
        connected,
        status: connected ? "connected" : "not_connected",
        items: parseCommunityFeed(payload),
      };
    } catch {
      return { connected: false, status: "unavailable", items: [] };
    } finally {
      clearTimeout(timer);
    }
  }

  return async function handle(request: Request): Promise<Response | null> {
    if (new URL(request.url).pathname !== ROUTE) return null;
    if (request.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { ...HEADERS, Allow: "GET" },
      });
    }
    if (!cached || now() >= expiresAt) {
      if (!pending) {
        pending = load()
          .then((result) => {
            cached = result;
            expiresAt = now() + 60_000;
            return result;
          })
          .finally(() => {
            pending = undefined;
          });
      }
      await pending;
    }
    return new Response(JSON.stringify(cached), { headers: HEADERS });
  };
}

export const handleCommunityFeed = createCommunityFeedHandler();
