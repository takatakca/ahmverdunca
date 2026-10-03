#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const phoneNumber = (process.env.TWILIO_PHONE_NUMBER || "+15816666246").trim();

if (!accountSid || !authToken) {
  throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
}
if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
  throw new Error("TWILIO_PHONE_NUMBER must be E.164");
}

const client = twilio(accountSid, authToken);
const matches = await client.incomingPhoneNumbers.list({ phoneNumber, limit: 20 });
if (matches.length !== 1) {
  throw new Error(`Expected exactly one Twilio IncomingPhoneNumber for ${phoneNumber}; found ${matches.length}`);
}

const n = matches[0];
const snapshot = {
  capturedAt: new Date().toISOString(),
  accountSid,
  phoneNumber: n.phoneNumber,
  incomingPhoneNumberSid: n.sid,
  friendlyName: n.friendlyName ?? null,
  voiceUrl: n.voiceUrl ?? null,
  voiceMethod: n.voiceMethod ?? null,
  voiceFallbackUrl: n.voiceFallbackUrl ?? null,
  voiceFallbackMethod: n.voiceFallbackMethod ?? null,
  voiceApplicationSid: n.voiceApplicationSid ?? null,
  trunkSid: n.trunkSid ?? null,
  statusCallback: n.statusCallback ?? null,
  statusCallbackMethod: n.statusCallbackMethod ?? null
};

await mkdir(".local", { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-");
const file = path.resolve(".local", `twilio-rollback-${stamp}.json`);
await writeFile(file, JSON.stringify(snapshot, null, 2) + "\n", { mode: 0o600 });

console.log(JSON.stringify({
  ok: true,
  saved: file,
  phoneNumber: snapshot.phoneNumber,
  incomingPhoneNumberSid: snapshot.incomingPhoneNumberSid,
  voiceUrl: snapshot.voiceUrl,
  voiceMethod: snapshot.voiceMethod,
  voiceApplicationSid: snapshot.voiceApplicationSid,
  trunkSid: snapshot.trunkSid
}, null, 2));
