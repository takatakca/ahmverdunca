import test from "node:test";
import assert from "node:assert/strict";
import {
  lifecycleMessagesDue,
  planPhoneLifecycleMessages,
} from "../src/features/ahmv-phone/messaging/lifecycle.ts";
import { lifecycleMessageText } from "../src/features/ahmv-phone/messaging/templates.ts";
import type { AhmvPhoneContact } from "../src/features/ahmv-phone/contacts/store.server.ts";

function contact(overrides: Partial<AhmvPhoneContact> = {}): AhmvPhoneContact {
  return {
    id: "contact-1",
    phoneE164: "+15145550123",
    language: "fr",
    accessTier: "trial",
    trialExpiresAt: "2026-11-02T12:00:00.000Z",
    smsConsent: true,
    transactionalSmsAllowed: true,
    marketingSmsConsent: false,
    ...overrides,
  };
}

test("transactional trial lifecycle never creates marketing offer without marketing consent", () => {
  const plans = planPhoneLifecycleMessages(
    contact(),
    new Date("2026-10-03T12:00:00.000Z"),
  );
  assert.deepEqual(
    plans.map((plan) => plan.kind),
    ["trial_welcome", "trial_expiry_3d", "trial_expired"],
  );
  assert.equal(plans.some((plan) => plan.consentBasis === "marketing"), false);
});

test("marketing offer exists only after explicit marketing consent", () => {
  const plans = planPhoneLifecycleMessages(
    contact({ marketingSmsConsent: true }),
    new Date("2026-10-03T12:00:00.000Z"),
  );
  const offer = plans.find((plan) => plan.kind === "membership_offer");
  assert.equal(offer?.consentBasis, "marketing");
  assert.equal(offer?.dueAt, "2026-11-03T12:00:00.000Z");
});

test("no SMS lifecycle is planned without requested SMS consent", () => {
  const plans = planPhoneLifecycleMessages(
    contact({ smsConsent: false, marketingSmsConsent: false }),
  );
  assert.deepEqual(plans, []);
});

test("blocked contact receives no lifecycle messages", () => {
  const plans = planPhoneLifecycleMessages(
    contact({ accessTier: "blocked", marketingSmsConsent: true }),
  );
  assert.deepEqual(plans, []);
});

test("due filter does not send future reminders early", () => {
  const plans = planPhoneLifecycleMessages(
    contact(),
    new Date("2026-10-03T12:00:00.000Z"),
  );
  const due = lifecycleMessagesDue(
    plans,
    new Date("2026-10-20T12:00:00.000Z"),
  );
  assert.deepEqual(due.map((plan) => plan.kind), ["trial_welcome"]);
});

test("localized templates keep the service notice separate from the marketing offer", () => {
  const memberUrl = "https://takatak.ca/login";
  assert.match(
    lifecycleMessageText("trial_expired", "fr", memberUrl),
    /période découverte est terminée/,
  );
  assert.match(
    lifecycleMessageText("membership_offer", "en", memberUrl),
    /membership/,
  );
});


test("premium contact receives no trial-expiry lifecycle messages", () => {
  const plans = planPhoneLifecycleMessages(
    contact({
      accessTier: "premium",
      marketingSmsConsent: true,
    }),
    new Date("2026-10-03T12:00:00.000Z"),
  );
  assert.deepEqual(plans, []);
});

test("guest contact receives no trial lifecycle messages", () => {
  const plans = planPhoneLifecycleMessages(
    contact({ accessTier: "guest" }),
    new Date("2026-10-03T12:00:00.000Z"),
  );
  assert.deepEqual(plans, []);
});
