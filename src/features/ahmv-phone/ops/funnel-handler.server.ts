import { authorizeTakatakOpsRequest } from "./auth.server.ts";
import { getAhmvPhoneOpsFunnel } from "./funnel.server.ts";

type Settings = Record<string, string | undefined>;

const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function handleAhmvPhoneOpsFunnel(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/phone-ops/funnel") return null;

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

  try {
    const funnel = await getAhmvPhoneOpsFunnel();
    return new Response(JSON.stringify(funnel), {
      status: 200,
      headers: HEADERS,
    });
  } catch (error) {
    console.error("[AHMV phone ops funnel]", error);
    return new Response(JSON.stringify({ error: "ops_unavailable" }), {
      status: 503,
      headers: HEADERS,
    });
  }
}
