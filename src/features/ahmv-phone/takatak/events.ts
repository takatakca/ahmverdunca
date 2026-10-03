import type {
  AhmvPhoneChannel,
  AhmvPhoneContact,
  AhmvPhoneLanguage,
} from "../contacts/store.server";

export interface TakatakAhmvPhoneContactSync {
  kind: "contact_sync";
  tenant: "ahmverdun";
  source: "phone";
  contactRef: string;
  phoneE164: string;
  language: AhmvPhoneLanguage;
  accessTier: AhmvPhoneContact["accessTier"];
  trialExpiresAt: string;
  smsConsent: boolean;
  marketingSmsConsent: boolean;
  takatakIdentityId?: string | undefined;
  occurredAt: string;
}

export interface TakatakAhmvPhoneInteractionEvent {
  kind: "interaction";
  tenant: "ahmverdun";
  source: "phone";
  contactRef?: string | undefined;
  takatakIdentityId?: string | undefined;
  channel: AhmvPhoneChannel;
  intent?: string | undefined;
  outcome: string;
  teamCode?: string | undefined;
  arenaSlug?: string | undefined;
  occurredAt: string;
}

export type TakatakAhmvCommunicationEvent =
  | TakatakAhmvPhoneContactSync
  | TakatakAhmvPhoneInteractionEvent;

export function takatakContactSyncEvent(
  contact: AhmvPhoneContact,
  now = new Date(),
): TakatakAhmvPhoneContactSync {
  return {
    kind: "contact_sync",
    tenant: "ahmverdun",
    source: "phone",
    contactRef: contact.id,
    phoneE164: contact.phoneE164,
    language: contact.language,
    accessTier: contact.accessTier,
    trialExpiresAt: contact.trialExpiresAt,
    smsConsent: contact.smsConsent,
    marketingSmsConsent: contact.marketingSmsConsent,
    takatakIdentityId: contact.takatakIdentityId,
    occurredAt: now.toISOString(),
  };
}

export function takatakInteractionEvent(input: {
  contact?: AhmvPhoneContact | null | undefined;
  channel: AhmvPhoneChannel;
  intent?: string | undefined;
  outcome: string;
  teamCode?: string | undefined;
  arenaSlug?: string | undefined;
  now?: Date | undefined;
}): TakatakAhmvPhoneInteractionEvent {
  return {
    kind: "interaction",
    tenant: "ahmverdun",
    source: "phone",
    contactRef: input.contact?.id,
    takatakIdentityId: input.contact?.takatakIdentityId,
    channel: input.channel,
    intent: input.intent,
    outcome: input.outcome,
    teamCode: input.teamCode,
    arenaSlug: input.arenaSlug,
    occurredAt: (input.now ?? new Date()).toISOString(),
  };
}
