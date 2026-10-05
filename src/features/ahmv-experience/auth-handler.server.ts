import {
  ahmvExperienceClearCookie,
  ahmvExperienceSetCookie,
} from "./session.server";

type ExchangeResponse = {
  ok?: boolean;
  session?: {
    active?: boolean;
    identityId?: string;
    displayName?: string | null;
    product?: string;
    entitlement?: string;
    planCode?: string | null;
    status?: string | null;
    expiresAt?: string;
  };
};

type ExchangeSession = NonNullable<ExchangeResponse["session"]>;

function enabled() {
  return process.env["AHMV_EXPERIENCE_ENABLED"] === "true";
}

function requiredHttpsUrl(name: string): URL {
  const raw = process.env[name]?.trim() ?? "";
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error(`${name} must use HTTPS.`);
  return url;
}

function noStoreRedirect(url: URL | string, status = 303) {
  return new Response(null, {
    status,
    headers: {
      location: url.toString(),
      "cache-control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

async function exchangeLaunchCode(code: string): Promise<ExchangeSession | null> {
  const token = process.env["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim() ?? "";
  if (token.length < 32) throw new Error("TAKATAK_AHMV_SERVICE_TOKEN is not configured.");

  const response = await fetch(requiredHttpsUrl("TAKATAK_AHMV_EXCHANGE_URL"), {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ code }),
    redirect: "error",
    cache: "no-store",
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as ExchangeResponse;
  const session = payload.session;
  if (
    payload.ok !== true ||
    !session?.active ||
    typeof session.identityId !== "string" ||
    session.product !== "ahmv" ||
    session.entitlement !== "ahmv_access" ||
    typeof session.expiresAt !== "string"
  ) {
    return null;
  }

  const expiry = Date.parse(session.expiresAt);
  if (!Number.isFinite(expiry) || expiry <= Date.now()) return null;
  return session;
}

export async function handleAhmvExperienceAuth(
  request: Request,
): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!path.startsWith("/api/ahmv/experience/")) return null;

  if (!enabled()) {
    return new Response("Not found", {
      status: 404,
      headers: { "cache-control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  if (path === "/api/ahmv/experience/login" && request.method === "GET") {
    return noStoreRedirect(requiredHttpsUrl("TAKATAK_AHMV_LAUNCH_URL"));
  }

  if (path === "/api/ahmv/experience/callback" && request.method === "GET") {
    const code = url.searchParams.get("code")?.trim() ?? "";
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(code)) {
      return new Response("Invalid launch code", { status: 400, headers: { "cache-control": "no-store" } });
    }

    const session = await exchangeLaunchCode(code);
    if (!session) {
      return new Response("AHMV access denied", {
        status: 403,
        headers: { "cache-control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
      });
    }

    const response = noStoreRedirect(new URL("/experience", url.origin));
    response.headers.append(
      "set-cookie",
      ahmvExperienceSetCookie({
        identityId: session.identityId!,
        displayName: session.displayName ?? null,
        product: "ahmv",
        entitlement: "ahmv_access",
        planCode: session.planCode ?? null,
        exp: Date.parse(session.expiresAt!),
      }),
    );
    return response;
  }

  if (path === "/api/ahmv/experience/logout" && request.method === "POST") {
    if (request.headers.get("origin") !== url.origin) {
      return new Response("Forbidden", { status: 403, headers: { "cache-control": "no-store" } });
    }
    const response = noStoreRedirect(new URL("/", url.origin));
    response.headers.append("set-cookie", ahmvExperienceClearCookie());
    return response;
  }

  return null;
}
