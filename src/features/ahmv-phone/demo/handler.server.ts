import { simulatePhoneDemo, type PhoneDemoInput } from "./simulator";

type Settings = Record<string, string | undefined>;

const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function handleAhmvPhoneDemo(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/phone-demo") return null;

  if (settings["AHMV_PHONE_DEMO_ENABLED"] !== "true") {
    return new Response(JSON.stringify({ error: "demo_disabled" }), {
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

  const expected = settings["AHMV_PHONE_DEMO_TOKEN"]?.trim();
  const supplied = request.headers.get("x-ahmv-demo-token")?.trim();
  if (!expected || !supplied || supplied !== expected) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: HEADERS,
    });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return new Response(JSON.stringify({ error: "unsupported_media_type" }), {
      status: 415,
      headers: HEADERS,
    });
  }

  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > 4096) {
    return new Response(JSON.stringify({ error: "payload_too_large" }), {
      status: 413,
      headers: HEADERS,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: HEADERS,
    });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return new Response(JSON.stringify({ error: "invalid_request" }), {
      status: 400,
      headers: HEADERS,
    });
  }

  const value = body as Record<string, unknown>;
  const channel = value["channel"];
  const message = value["message"];
  const lang = value["lang"];
  const access = value["access"];
  const wantsSms = value["wantsSms"];

  if (
    !["sms", "voice"].includes(String(channel)) ||
    typeof message !== "string" ||
    message.length > 160 ||
    (lang !== undefined && !["fr", "en"].includes(String(lang))) ||
    (access !== undefined && !["guest", "trial", "expired", "premium"].includes(String(access))) ||
    (wantsSms !== undefined && typeof wantsSms !== "boolean")
  ) {
    return new Response(JSON.stringify({ error: "invalid_request" }), {
      status: 400,
      headers: HEADERS,
    });
  }

  const input: PhoneDemoInput = {
    channel: channel as PhoneDemoInput["channel"],
    message,
    ...(lang ? { lang: lang as PhoneDemoInput["lang"] } : {}),
    ...(access ? { access: access as PhoneDemoInput["access"] } : {}),
    ...(typeof wantsSms === "boolean" ? { wantsSms } : {}),
  };

  return new Response(JSON.stringify(simulatePhoneDemo(input)), {
    status: 200,
    headers: HEADERS,
  });
}
