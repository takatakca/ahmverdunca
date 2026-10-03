import { authorizeTakatakOpsRequest } from "../ops/auth.server.ts";
import {
  applyTakatakMarketingConsent,
  validateTakatakMarketingConsentInput,
} from "./consent-sync.server.ts";

type Settings = Record<string, string | undefined>;

const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function handleTakatakMarketingConsentSync(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/takatak/marketing-consent") return null;

  if (
    settings["AHMV_TAKATAK_MARKETING_CONSENT_SYNC_ENABLED"] !== "true"
  ) {
    return new Response(JSON.stringify({ error: "consent_sync_disabled" }), {
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

  if (!authorizeTakatakOpsRequest(request, settings)) {
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
  if (Number.isFinite(length) && length > 8192) {
    return new Response(JSON.stringify({ error: "payload_too_large" }), {
      status: 413,
      headers: HEADERS,
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: HEADERS,
    });
  }

  const input = validateTakatakMarketingConsentInput(payload);
  if (!input) {
    return new Response(JSON.stringify({ error: "invalid_consent_event" }), {
      status: 400,
      headers: HEADERS,
    });
  }

  try {
    const result = await applyTakatakMarketingConsent(input);
    const status =
      result.reason === "contact_not_found"
        ? 404
        : result.reason === "identity_mismatch"
          ? 409
          : 200;

    return new Response(
      JSON.stringify({
        ok: status === 200,
        applied: result.applied,
        duplicate: result.duplicate,
        reason: result.reason,
      }),
      { status, headers: HEADERS },
    );
  } catch (error) {
    console.error("[AHMV TAKATAK marketing consent sync]", error);
    return new Response(JSON.stringify({ error: "consent_sync_unavailable" }), {
      status: 503,
      headers: HEADERS,
    });
  }
}
