import test from "node:test";
import assert from "node:assert/strict";
import {
  lifecycleConsentStillValid,
  lifecycleMessagesDue,
  lifecycleRetryDelayMinutes,
  planPhoneLifecycleMessages,
} from "../src/features/ahmv-phone/messaging/lifecycle.ts";
import { lifecycleMessageText } from "../src/features/ahmv-phone/messaging/templates.ts";
import type { AhmvPhoneContact } from "../src/features/ahmv-phone/contacts/store.server.ts";
import { handleAhmvPhoneLifecycleCron } from "../src/features/ahmv-phone/messaging/lifecycle-handler.server.ts";

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


test("expired trial skips stale welcome and J-3 messages", () => {
  const plans = planPhoneLifecycleMessages(
    contact({
      trialExpiresAt: "2026-10-01T12:00:00.000Z",
      marketingSmsConsent: true,
    }),
    new Date("2026-10-03T12:00:00.000Z"),
  );
  assert.deepEqual(
    plans.map((plan) => plan.kind),
    ["trial_expired", "membership_offer"],
  );
  assert.equal(plans.every((plan) => plan.dueAt === "2026-10-03T12:00:00.000Z"), true);
});

test("inside final 3 days schedules expiry warning immediately, not in the past", () => {
  const now = new Date("2026-10-31T12:00:00.000Z");
  const plans = planPhoneLifecycleMessages(contact(), now);
  const warning = plans.find((plan) => plan.kind === "trial_expiry_3d");
  assert.equal(warning?.dueAt, now.toISOString());
});

test("consent is revalidated at delivery time", () => {
  const current = contact();
  assert.equal(lifecycleConsentStillValid(current, "requested"), true);
  assert.equal(lifecycleConsentStillValid(current, "service"), true);
  assert.equal(lifecycleConsentStillValid(current, "marketing"), false);
  assert.equal(
    lifecycleConsentStillValid(
      contact({ marketingSmsConsent: true }),
      "marketing",
    ),
    true,
  );
  assert.equal(
    lifecycleConsentStillValid(
      contact({ accessTier: "premium", marketingSmsConsent: true }),
      "marketing",
    ),
    false,
  );
  assert.equal(
    lifecycleConsentStillValid(
      contact({ transactionalSmsAllowed: false, marketingSmsConsent: true }),
      "marketing",
    ),
    false,
  );
});

test("provider retry backoff is bounded", () => {
  assert.equal(lifecycleRetryDelayMinutes(1), 5);
  assert.equal(lifecycleRetryDelayMinutes(2), 10);
  assert.equal(lifecycleRetryDelayMinutes(3), 20);
  assert.equal(lifecycleRetryDelayMinutes(9), 60);
});

test("lifecycle cron is disabled by default", async () => {
  const response = await handleAhmvPhoneLifecycleCron(
    new Request("https://ahmverdun.ca/api/ahmv/cron/phone-lifecycle", {
      method: "POST",
    }),
    {},
  );
  assert.equal(response?.status, 404);
});

test("lifecycle cron remains POST-only before cron authentication", async () => {
  const response = await handleAhmvPhoneLifecycleCron(
    new Request("https://ahmverdun.ca/api/ahmv/cron/phone-lifecycle"),
    { AHMV_PHONE_LIFECYCLE_ENABLED: "true" },
  );
  assert.equal(response?.status, 405);
});
