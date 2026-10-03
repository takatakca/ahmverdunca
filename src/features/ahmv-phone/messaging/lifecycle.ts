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

export function planPhoneLifecycleMessages(
  contact: AhmvPhoneContact,
  now = new Date(),
): LifecycleMessagePlan[] {
  if (contact.accessTier === "blocked") return [];

  const expiry = parseDate(contact.trialExpiresAt);
  if (!expiry) return [];

  const plans: LifecycleMessagePlan[] = [];

  if (contact.smsConsent && contact.transactionalSmsAllowed) {
    plans.push({
      kind: "trial_welcome",
      consentBasis: "requested",
      dueAt: iso(now),
      dedupeKey: `contact:${contact.id}:trial_welcome`,
    });

    plans.push({
      kind: "trial_expiry_3d",
      consentBasis: "service",
      dueAt: iso(addDays(expiry, -3)),
      dedupeKey: `contact:${contact.id}:trial_expiry_3d:${expiry.toISOString().slice(0, 10)}`,
    });

    plans.push({
      kind: "trial_expired",
      consentBasis: "service",
      dueAt: iso(expiry),
      dedupeKey: `contact:${contact.id}:trial_expired:${expiry.toISOString().slice(0, 10)}`,
    });
  }

  if (contact.marketingSmsConsent && contact.transactionalSmsAllowed) {
    plans.push({
      kind: "membership_offer",
      consentBasis: "marketing",
      dueAt: iso(addDays(expiry, 1)),
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
