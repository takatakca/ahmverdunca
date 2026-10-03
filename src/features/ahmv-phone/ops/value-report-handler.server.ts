import { authorizeTakatakOpsRequest } from "./auth.server.ts";
import { getAhmvVoiceValueReport } from "./value-report.server.ts";

type Settings = Record<string, string | undefined>;

const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function handleAhmvVoiceValueReport(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/phone-ops/value-report") return null;

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
    const report = await getAhmvVoiceValueReport();
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: HEADERS,
    });
  } catch (error) {
    console.error("[AHMV Voice value report]", error);
    return new Response(JSON.stringify({ error: "value_report_unavailable" }), {
      status: 503,
      headers: HEADERS,
    });
  }
}
