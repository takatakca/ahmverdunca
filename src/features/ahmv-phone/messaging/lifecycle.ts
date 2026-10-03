import type { AhmvPhoneContact } from "../contacts/store.server";

export type LifecycleMessageKind =
  | "trial_welcome"
  | "trial_expiry_3d"
  | "trial_expired"
  | "membership_offer";

export type LifecycleConsentBasis = "requested" | "service" | "marketing";

export interface LifecycleMessagePlan {
  kind: LifecycleMessageKind;
  consentBasis: LifecycleConsentBasis;
  dueAt: string;
  dedupeKey: string;
}

function iso(value: Date) {
  return value.toISOString();
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 86_400_000);
}

function parseDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

function notBeforeNow(value: Date, now: Date) {
  return value.getTime() < now.getTime() ? now : value;
}

export function planPhoneLifecycleMessages(
  contact: AhmvPhoneContact,
  now = new Date(),
): LifecycleMessagePlan[] {
  if (contact.accessTier !== "trial") return [];

  const expiry = parseDate(contact.trialExpiresAt);
  if (!expiry) return [];

  const plans: LifecycleMessagePlan[] = [];
  const trialActive = expiry.getTime() > now.getTime();

  if (contact.smsConsent && contact.transactionalSmsAllowed) {
    if (trialActive) {
      plans.push({
        kind: "trial_welcome",
        consentBasis: "requested",
        dueAt: iso(now),
        dedupeKey: `contact:${contact.id}:trial_welcome`,
      });

      plans.push({
        kind: "trial_expiry_3d",
        consentBasis: "service",
        dueAt: iso(notBeforeNow(addDays(expiry, -3), now)),
        dedupeKey: `contact:${contact.id}:trial_expiry_3d:${expiry.toISOString().slice(0, 10)}`,
      });
    }

    plans.push({
      kind: "trial_expired",
      consentBasis: "service",
      dueAt: iso(notBeforeNow(expiry, now)),
      dedupeKey: `contact:${contact.id}:trial_expired:${expiry.toISOString().slice(0, 10)}`,
    });
  }

  if (contact.marketingSmsConsent && contact.transactionalSmsAllowed) {
    plans.push({
      kind: "membership_offer",
      consentBasis: "marketing",
      dueAt: iso(notBeforeNow(addDays(expiry, 1), now)),
      dedupeKey: `contact:${contact.id}:membership_offer:${expiry.toISOString().slice(0, 10)}`,
    });
  }

  return plans;
}

export function lifecycleMessagesDue(
  plans: readonly LifecycleMessagePlan[],
  now = new Date(),
) {
  return plans.filter((plan) => Date.parse(plan.dueAt) <= now.getTime());
}

export function lifecycleConsentStillValid(
  contact: AhmvPhoneContact,
  basis: LifecycleConsentBasis,
) {
  if (contact.accessTier !== "trial") return false;
  if (!contact.transactionalSmsAllowed) return false;
  if (basis === "marketing") return contact.marketingSmsConsent;
  return contact.smsConsent;
}

export function lifecycleRetryDelayMinutes(attempt: number) {
  if (!Number.isInteger(attempt) || attempt < 1) return 5;
  return Math.min(60, 5 * 2 ** Math.min(attempt - 1, 4));
}
