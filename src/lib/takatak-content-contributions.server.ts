const CONTENT_TYPES = new Set([
  "news","post","photo","image","gallery","schedule","arena","team","page","faq","sponsor","other",
]);
const ACTIONS = new Set(["create","update","replace_media","correct_fact","remove"]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function config() {
  const enabled = import.meta.env["TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED"] === "true";
  const rawOrigin =
    import.meta.env["TAKATAK_CONTENT_ORIGIN"]?.trim() ||
    "https://takatak.ca";
  const token = import.meta.env["TAKATAK_AHMV_CONTENT_TOKEN"]?.trim() ?? "";

  let origin: URL | undefined;
  try {
    const candidate = new URL(rawOrigin);
    if (candidate.protocol === "https:") origin = candidate;
  } catch {
    origin = undefined;
  }

  return {
    enabled,
    origin,
    token,
    ready: enabled && Boolean(origin) && token.length >= 32,
  };
}

function safeString(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  return clean ? clean.slice(0, max) : undefined;
}

function safeStringArray(value: unknown, maxItems = 8, maxLen = 1200) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function safeObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function sanitizeContribution(value: unknown) {
  const row = safeObject(value);
  if (!row) return undefined;
  const resourceType = safeString(row.resourceType, 40);
  const resourceKey = safeString(row.resourceKey, 180);
  const action = safeString(row.action, 40);
  const idempotencyKey = safeString(row.idempotencyKey, 120);
  const proposedPatch = safeObject(row.proposedPatch);

  if (
    !resourceType ||
    !CONTENT_TYPES.has(resourceType) ||
    !resourceKey ||
    !action ||
    !ACTIONS.has(action) ||
    !idempotencyKey ||
    !proposedPatch
  ) {
    return undefined;
  }

  const originalVersion =
    typeof row.originalVersion === "number" &&
    Number.isInteger(row.originalVersion) &&
    row.originalVersion >= 1
      ? row.originalVersion
      : undefined;

  return {
    resourceType,
    resourceKey,
    action,
    idempotencyKey,
    proposedPatch,
    ...(safeString(row.targetUrl, 1200) ? { targetUrl: safeString(row.targetUrl, 1200)! } : {}),
    ...(originalVersion ? { originalVersion } : {}),
    ...(safeObject(row.originalSnapshot) ? { originalSnapshot: safeObject(row.originalSnapshot)! } : {}),
    ...(safeString(row.reason, 2000) ? { reason: safeString(row.reason, 2000)! } : {}),
    evidenceUrls: safeStringArray(row.evidenceUrls),
    attachmentUrls: safeStringArray(row.attachmentUrls),
  };
}

async function takatakRequest(path: string, init?: RequestInit) {
  const settings = config();
  if (!settings.ready || !settings.origin) {
    return { response: json({ ok: false, status: "not_connected" }, 503), settings };
  }

  const url = new URL(path, settings.origin);
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${settings.token}`,
      "x-ahmv-tenant": "ahmverdun",
    },
    cache: "no-store",
  });

  return { response, settings };
}

async function submitContribution(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 75_000) {
    return json({ ok: false, error: "Contribution payload is too large." }, 413);
  }

  const body = await request.json().catch(() => null);
  const contribution = sanitizeContribution(body);
  if (!contribution) {
    return json({ ok: false, error: "Invalid contribution payload." }, 400);
  }

  try {
    const upstream = await takatakRequest("/api/integrations/ahmv/contributions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(contribution),
    });
    const payload = await upstream.response.json().catch(() => ({ ok: false }));
    return json(payload, upstream.response.status);
  } catch {
    return json({ ok: false, status: "upstream_unavailable" }, 503);
  }
}

function sanitizePublications(value: unknown) {
  const root = safeObject(value);
  if (!root || root.ok !== true || !Array.isArray(root.publications)) return [];

  return root.publications
    .slice(0, 1000)
    .map((raw) => {
      const row = safeObject(raw);
      if (!row) return null;
      const id = safeString(row.id, 80);
      const resourceType = safeString(row.resourceType, 40);
      const resourceKey = safeString(row.resourceKey, 180);
      const patch = safeObject(row.patch);
      const version = typeof row.version === "number" && Number.isInteger(row.version) ? row.version : undefined;
      if (!id || !resourceType || !CONTENT_TYPES.has(resourceType) || !resourceKey || !patch || !version) return null;
      return { id, resourceType, resourceKey, patch, version };
    })
    .filter(Boolean);
}

async function readOverlays() {
  try {
    const upstream = await takatakRequest("/api/integrations/ahmv/content/overlays");
    if (!upstream.response.ok) {
      return json({ ok: false, status: upstream.response.status === 503 ? "not_connected" : "upstream_unavailable", publications: [] }, 200);
    }
    const payload = await upstream.response.json().catch(() => null);
    return json({ ok: true, publications: sanitizePublications(payload) });
  } catch {
    return json({ ok: false, status: "upstream_unavailable", publications: [] }, 200);
  }
}

export async function handleTakatakContentContributions(request: Request) {
  const url = new URL(request.url);

  if (url.pathname === "/api/ahmv/contributions" && request.method === "POST") {
    return submitContribution(request);
  }

  if (url.pathname === "/api/ahmv/content-overlays" && request.method === "GET") {
    return readOverlays();
  }

  return null;
}
