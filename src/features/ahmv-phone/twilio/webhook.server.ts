import {
  TWILIO_ROOT,
  TWILIO_ROUTES,
  webhookFailure,
  type TwilioSettings,
} from "./common.server.ts";
import { validateTwilioWebhookRequest } from "./request.server.ts";
import { handleTwilioSms } from "./sms.server.ts";
import { handleTwilioStatus } from "./status.server.ts";
import { handleTwilioVoice } from "./voice.server.ts";

export async function handleAhmvTwilio(
  request: Request,
  settings: TwilioSettings = process.env,
): Promise<Response | null> {
  const requestedUrl = new URL(request.url);
  if (!TWILIO_ROUTES.has(requestedUrl.pathname)) return null;

  const validation = await validateTwilioWebhookRequest(request, settings);
  if (!validation.ok) return validation.response;

  const context = validation.value;
  const { url, params, log } = context;

  if (url.pathname === `${TWILIO_ROOT}/status`) {
    return await handleTwilioStatus(context);
  }

  if (
    params["To"] !==
    (settings["AHMV_PUBLIC_PHONE"] ?? "+15816666246")
  ) {
    return webhookFailure(403);
  }

  try {
    if (url.pathname === `${TWILIO_ROOT}/sms`) {
      return await handleTwilioSms(context);
    }

    if (url.pathname === `${TWILIO_ROOT}/voice`) {
      return await handleTwilioVoice(context);
    }

    return webhookFailure(400);
  } catch (error) {
    console.error("[AHMV Twilio webhook]", error);
    log("configuration-error");
    return webhookFailure(503);
  }
}
