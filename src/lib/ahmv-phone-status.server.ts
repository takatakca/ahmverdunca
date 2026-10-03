import { SITE } from "./site.ts";

type Settings = Record<string, string | undefined>;

export interface AhmvPhonePublicStatus {
  public: boolean;
  display: string;
  e164: string;
}

function validWebhookOrigin(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === value && url.origin === SITE.domain;
  } catch {
    return false;
  }
}

export function getAhmvPhonePublicStatus(
  settings: Settings = process.env,
): AhmvPhonePublicStatus {
  const configured =
    settings["AHMV_PHONE_ENABLED"] === "true" &&
    settings["AHMV_PHONE_PUBLIC"] === "true" &&
    Boolean(settings["TWILIO_ACCOUNT_SID"]?.trim()) &&
    Boolean(settings["TWILIO_AUTH_TOKEN"]?.trim()) &&
    validWebhookOrigin(settings["AHMV_WEBHOOK_ORIGIN"]) &&
    settings["AHMV_PUBLIC_PHONE"] === SITE.phoneE164;

  return {
    public: configured,
    display: SITE.phoneDisplay,
    e164: SITE.phoneE164,
  };
}

export function handleAhmvPhoneStatus(
  request: Request,
  settings: Settings = process.env,
): Response | null {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/phone-status") return null;

  const headers = {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "X-Robots-Tag": "noindex, nofollow",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...headers, Allow: "GET, HEAD" },
    });
  }

  const body = JSON.stringify(getAhmvPhonePublicStatus(settings));
  return new Response(request.method === "HEAD" ? null : body, {
    status: 200,
    headers,
  });
}
