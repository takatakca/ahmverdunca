import twilio from "twilio";
import {
  TWILIO_HEADERS,
  type TwilioLog,
  type TwilioSettings,
  twilioReferenceHash,
  webhookFailure,
} from "./common.server.ts";

export interface ValidatedTwilioRequest {
  url: URL;
  params: Record<string, string>;
  settings: TwilioSettings;
  reference: string;
  log: TwilioLog;
}

export type TwilioValidationResult =
  | { ok: true; value: ValidatedTwilioRequest }
  | { ok: false; response: Response };

export async function validateTwilioWebhookRequest(
  request: Request,
  settings: TwilioSettings,
): Promise<TwilioValidationResult> {
  if (request.method !== "POST") {
    return {
      ok: false,
      response: new Response("Method not allowed", {
        status: 405,
        headers: { ...TWILIO_HEADERS, Allow: "POST" },
      }),
    };
  }

  if (settings["AHMV_PHONE_ENABLED"] !== "true") {
    return { ok: false, response: webhookFailure(503) };
  }

  const token = settings["TWILIO_AUTH_TOKEN"];
  const account = settings["TWILIO_ACCOUNT_SID"];
  const origin = settings["AHMV_WEBHOOK_ORIGIN"];
  if (!token || !account || !origin) {
    return { ok: false, response: webhookFailure(503) };
  }

  let publicOrigin: URL;
  try {
    publicOrigin = new URL(origin);
    if (publicOrigin.protocol !== "https:" || publicOrigin.origin !== origin) {
      return { ok: false, response: webhookFailure(503) };
    }
  } catch {
    return { ok: false, response: webhookFailure(503) };
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return { ok: false, response: webhookFailure(415) };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false, response: webhookFailure(400) };

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 16_384) {
        await reader.cancel();
        return { ok: false, response: webhookFailure(413) };
      }
      chunks.push(chunk.value);
    }
  } catch {
    return { ok: false, response: webhookFailure(400) };
  }

  const body = Buffer.concat(chunks);
  const form = new URLSearchParams(body.toString("utf8"));
  const params: Record<string, string> = Object.create(null);

  for (const [key, value] of form) {
    if (Object.hasOwn(params, key)) {
      return { ok: false, response: webhookFailure(400) };
    }
    params[key] = value;
  }

  const url = new URL(request.url);
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const publicUrl = `${publicOrigin.origin}${url.pathname}${url.search}`;

  if (
    !signature ||
    !twilio.validateRequest(token, signature, publicUrl, params) ||
    params["AccountSid"] !== account
  ) {
    return { ok: false, response: webhookFailure(403) };
  }

  const sid = params["MessageSid"] ?? params["CallSid"] ?? "";
  const reference = twilioReferenceHash(sid);
  const log: TwilioLog = (outcome) => {
    console.info(
      JSON.stringify({
        service: "ahmv-phone",
        channel: url.pathname.split("/").pop(),
        reference,
        outcome,
      }),
    );
  };

  return {
    ok: true,
    value: {
      url,
      params,
      settings,
      reference,
      log,
    },
  };
}
