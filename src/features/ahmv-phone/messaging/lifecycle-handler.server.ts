import { authenticateCronRequest } from "../../../integrations/supabase/cron-auth.ts";
import { runPhoneLifecycleWorker } from "./lifecycle-worker.server.ts";

type Settings = Record<string, string | undefined>;

const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function handleAhmvPhoneLifecycleCron(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/cron/phone-lifecycle") return null;

  if (settings["AHMV_PHONE_LIFECYCLE_ENABLED"] !== "true") {
    return new Response(JSON.stringify({ error: "lifecycle_disabled" }), {
      status: 404,
      headers: HEADERS,
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...HEADERS, Allow: "POST" },
    });
  }

  const authResponse = await authenticateCronRequest(request);
  if (authResponse) return authResponse;

  try {
    const result = await runPhoneLifecycleWorker(settings);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: HEADERS,
    });
  } catch (error) {
    console.error("[AHMV phone lifecycle cron]", error);
    return new Response(JSON.stringify({ error: "lifecycle_unavailable" }), {
      status: 503,
      headers: HEADERS,
    });
  }
}
