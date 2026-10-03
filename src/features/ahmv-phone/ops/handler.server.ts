import { timingSafeEqual } from "node:crypto";
import { getAhmvPhoneOpsSummary } from "./summary.server.ts";

type Settings = Record<string, string | undefined>;

const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

function secureTokenMatch(expected: string, supplied: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function handleAhmvPhoneOpsSummary(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/phone-ops/summary") return null;

  if (settings["AHMV_PHONE_OPS_ENABLED"] !== "true") {
    return new Response(JSON.stringify({ error: "ops_disabled" }), {
      status: 404,
      headers: HEADERS,
    });
  }

  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...HEADERS, Allow: "GET" },
    });
  }

  const expected = settings["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim() ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!expected || !supplied || !secureTokenMatch(expected, supplied)) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: HEADERS,
    });
  }

  try {
    const summary = await getAhmvPhoneOpsSummary();
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: HEADERS,
    });
  } catch (error) {
    console.error("[AHMV phone ops summary]", error);
    return new Response(JSON.stringify({ error: "ops_unavailable" }), {
      status: 503,
      headers: HEADERS,
    });
  }
}
