#!/usr/bin/env node
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { getExpectedTwilioSignature } = require("twilio/lib/webhooks/webhooks");

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const target = new URL(process.argv[2] || process.env.VOICE_WEBHOOK_URL || "https://voice.ahmverdun.ca/twilio/voice");

if (!accountSid || !authToken) {
  throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
}
if (target.protocol !== "https:") throw new Error("Voice webhook smoke target must use HTTPS");

const eventData = {
  AccountSid: accountSid,
  CallSid: "CA00000000000000000000000000000000",
  From: "+15145550123",
  To: process.env.TWILIO_PHONE_NUMBER?.trim() || "+15816666246"
};
const body = new URLSearchParams(eventData).toString();
const signature = getExpectedTwilioSignature(authToken, target.toString(), eventData);

const valid = await fetch(target, {
  method: "POST",
  redirect: "error",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    "x-twilio-signature": signature
  },
  body,
  signal: AbortSignal.timeout(8000)
});
const validText = await valid.text();

if (valid.status !== 200) {
  throw new Error(`Signed webhook returned HTTP ${valid.status}: ${validText.slice(0, 300)}`);
}
if (!/<Gather\b/i.test(validText)) {
  throw new Error("Signed /twilio/voice response is missing the press-1 <Gather> gate");
}
if (/<ConversationRelay\b/i.test(validText)) {
  throw new Error("ConversationRelay started before the caller pressed 1");
}

const invalid = await fetch(target, {
  method: "POST",
  redirect: "error",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    "x-twilio-signature": "invalid-signature"
  },
  body,
  signal: AbortSignal.timeout(8000)
});

if (invalid.status !== 403) {
  throw new Error(`Invalid Twilio signature should return 403, got ${invalid.status}`);
}

console.log(JSON.stringify({
  ok: true,
  target: target.origin + target.pathname,
  signedStatus: valid.status,
  invalidSignatureStatus: invalid.status,
  pressOneGate: true,
  conversationRelayBeforeActivation: false
}, null, 2));
