export type AhmvAccessTier = "guest" | "trial" | "premium" | "blocked";
export type AhmvPhoneCapability =
  | "next_event"
  | "requested_directions_sms"
  | "weekly_schedule"
  | "saved_teams"
  | "game_reminders"
  | "calendar_sync"
  | "smart_departure";

export interface AhmvEntitlement {
  tier: AhmvAccessTier;
  trialExpiresAt?: string;
  capabilities: ReadonlySet<AhmvPhoneCapability>;
}

const BASE = ["next_event", "requested_directions_sms"] as const;
const PREMIUM = [
  ...BASE,
  "weekly_schedule",
  "saved_teams",
  "game_reminders",
  "calendar_sync",
  "smart_departure",
] as const;

export function localEntitlement(tier: AhmvAccessTier, trialExpiresAt?: string): AhmvEntitlement {
  const activeTrial =
    tier === "trial" && !!trialExpiresAt && Number.isFinite(Date.parse(trialExpiresAt))
      && Date.parse(trialExpiresAt) > Date.now();
  const capabilities = tier === "premium" || activeTrial ? PREMIUM : tier === "blocked" ? [] : BASE;
  return { tier, trialExpiresAt, capabilities: new Set(capabilities) };
}

export function canUse(entitlement: AhmvEntitlement, capability: AhmvPhoneCapability) {
  return entitlement.capabilities.has(capability);
}
