import { updateSmsDeliveryStatus } from "../messaging/send.server.ts";
import { TWILIO_HEADERS } from "./common.server.ts";
import type { ValidatedTwilioRequest } from "./request.server.ts";

export async function handleTwilioStatus(
  context: ValidatedTwilioRequest,
): Promise<Response> {
  const { params, log } = context;

  try {
    await updateSmsDeliveryStatus(
      params["MessageSid"] ?? "",
      params["MessageStatus"] ?? "",
    );
  } catch (error) {
    console.error("[AHMV SMS delivery callback]", error);
  }

  log("status-received");
  return new Response(null, {
    status: 204,
    headers: TWILIO_HEADERS,
  });
}
