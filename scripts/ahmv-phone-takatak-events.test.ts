import test from "node:test";
import assert from "node:assert/strict";
import {
  takatakContactSyncEvent,
  takatakInteractionEvent,
} from "../src/features/ahmv-phone/takatak/events.ts";
import { publishTakatakAhmvEvent } from "../src/features/ahmv-phone/takatak/events.server.ts";
import type { AhmvPhoneContact } from "../src/features/ahmv-phone/contacts/store.server.ts";

const contact: AhmvPhoneContact = {
  id: "contact-1",
  phoneE164: "+15145550123",
  language: "fr",
  accessTier: "trial",
  trialExpiresAt: "2026-11-02T12:00:00.000Z",
  smsConsent: true,
  transactionalSmsAllowed: true,
  marketingSmsConsent: false,
};

test("contact sync is the only event that needs the raw phone for TAKATAK identity resolution", () => {
  const sync = takatakContactSyncEvent(
    contact,
    new Date("2026-10-03T12:00:00.000Z"),
  );
  assert.equal(sync.phoneE164, "+15145550123");

  const interaction = takatakInteractionEvent({
    contact,
    channel: "sms",
    intent: "next-event",
    outcome: "scheduled",
    now: new Date("2026-10-03T12:01:00.000Z"),
  });
  assert.equal("phoneE164" in interaction, false);
  assert.equal(interaction.contactRef, "contact-1");
});

test("TAKATAK event publishing safely skips when integration is not configured", async () => {
  const event = takatakInteractionEvent({
    contact,
    channel: "voice",
    outcome: "scheduled",
  });
  const result = await publishTakatakAhmvEvent(event, {});
  assert.deepEqual(result, { delivered: false, skipped: true });
});

test("TAKATAK event publisher refuses insecure HTTP endpoints", async () => {
  const event = takatakInteractionEvent({
    contact,
    channel: "sms",
    outcome: "scheduled",
  });
  const result = await publishTakatakAhmvEvent(event, {
    TAKATAK_AHMV_EVENTS_URL: "http://takatak.ca/api/events",
    TAKATAK_AHMV_SERVICE_TOKEN: "secret",
  });
  assert.deepEqual(result, { delivered: false, skipped: true });
});
