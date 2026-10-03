import { authenticateCronRequest } from "../../../integrations/supabase/cron-auth.ts";
import { runPhoneReminderWorker } from "./worker.server.ts";

type Settings = Record<string, string | undefined>;

const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function handleAhmvPhoneReminderCron(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/cron/phone-reminders") return null;

  if (settings["AHMV_PHONE_REMINDERS_ENABLED"] !== "true") {
    return new Response(JSON.stringify({ error: "reminders_disabled" }), {
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
    const result = await runPhoneReminderWorker(settings);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: HEADERS,
    });
  } catch (error) {
    console.error("[AHMV phone reminders cron]", error);
    return new Response(JSON.stringify({ error: "reminders_unavailable" }), {
      status: 503,
      headers: HEADERS,
    });
  }
}
