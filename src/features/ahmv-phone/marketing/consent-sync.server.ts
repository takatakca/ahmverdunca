import {
  applyMarketingSmsConsentEvent,
  findPhoneContactByNumber,
  normalizePhoneE164,
} from "../contacts/store.server.ts";

export interface TakatakMarketingConsentInput {
  eventId: string;
  phoneE164: string;
  identityId: string;
  consent: boolean;
  occurredAt: string;
}

export function validateTakatakMarketingConsentInput(
  value: unknown,
  now = new Date(),
): TakatakMarketingConsentInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const eventId =
    typeof row["eventId"] === "string" ? row["eventId"].trim() : "";
  const phone =
    typeof row["phoneE164"] === "string"
      ? normalizePhoneE164(row["phoneE164"])
      : null;
  const identityId =
    typeof row["identityId"] === "string" ? row["identityId"].trim() : "";
  const consent = row["consent"];
  const occurredRaw =
    typeof row["occurredAt"] === "string" ? row["occurredAt"] : "";
  const occurredMs = Date.parse(occurredRaw);

  if (
    !eventId ||
    eventId.length > 128 ||
    !/^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(eventId) ||
    !phone ||
    !identityId ||
    identityId.length > 256 ||
    typeof consent !== "boolean" ||
    !Number.isFinite(occurredMs) ||
    occurredMs > now.getTime() + 5 * 60_000
  ) {
    return null;
  }

  return {
    eventId,
    phoneE164: phone,
    identityId,
    consent,
    occurredAt: new Date(occurredMs).toISOString(),
  };
}

export async function applyTakatakMarketingConsent(
  input: TakatakMarketingConsentInput,
  now = new Date(),
) {
  const contact = await findPhoneContactByNumber(input.phoneE164);
  if (!contact) {
    return {
      applied: false,
      duplicate: false,
      reason: "contact_not_found" as const,
    };
  }

  if (
    !contact.takatakIdentityId ||
    contact.takatakIdentityId !== input.identityId
  ) {
    return {
      applied: false,
      duplicate: false,
      reason: "identity_mismatch" as const,
    };
  }

  const result = await applyMarketingSmsConsentEvent({
    eventId: `takatak:${input.eventId}`,
    contactId: contact.id,
    enabled: input.consent,
    source: "takatak_verified",
    occurredAt: new Date(input.occurredAt),
    now,
  });

  return {
    ...result,
    reason: null,
  };
}
