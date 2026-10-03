import { authorizeTakatakOpsRequest } from "./auth.server.ts";
import { getAhmvPhoneInternalHealth } from "./health.server.ts";

type Settings = Record<string, string | undefined>;

const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function handleAhmvPhoneOpsHealth(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/phone-ops/health") return null;

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

  if (!authorizeTakatakOpsRequest(request, settings)) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: HEADERS,
    });
  }

  const health = await getAhmvPhoneInternalHealth(settings);
  const ready =
    health.database.ready &&
    health.phone.numberConfigured &&
    health.phone.webhookOriginConfigured;

  return new Response(JSON.stringify({ ...health, ready }), {
    status: ready ? 200 : 503,
    headers: HEADERS,
  });
}
