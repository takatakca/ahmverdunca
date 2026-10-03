import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server.ts";
import { normalizePhoneE164 } from "../contacts/store.server.ts";

export const TAKATAK_AHMV_PRODUCT_CODE = "hockey_member_weekly_10";

export type TakatakMembershipStatus = "active" | "inactive" | "blocked";

export interface TakatakMembershipSyncInput {
  eventId: string;
  tenant: "ahmverdun";
  phoneE164: string;
  identityId: string;
  productCode: string;
  status: TakatakMembershipStatus;
  expiresAt?: string | undefined;
  occurredAt: string;
}

export interface TakatakMembershipSyncResult {
  duplicate: boolean;
  applied: boolean;
  contactId?: string | undefined;
  accessTier?: "guest" | "trial" | "premium" | "blocked" | undefined;
}

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function validIso(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

export function validateMembershipSyncInput(
  value: unknown,
  now = new Date(),
): TakatakMembershipSyncInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;

  const eventId =
    typeof row["eventId"] === "string" ? row["eventId"].trim() : "";
  const tenant = row["tenant"];
  const phone =
    typeof row["phoneE164"] === "string"
      ? normalizePhoneE164(row["phoneE164"])
      : null;
  const identityId =
    typeof row["identityId"] === "string" ? row["identityId"].trim() : "";
  const productCode =
    typeof row["productCode"] === "string" ? row["productCode"].trim() : "";
  const status = row["status"];
  const occurredAt =
    typeof row["occurredAt"] === "string"
      ? validIso(row["occurredAt"])
      : null;
  const expiresAt =
    typeof row["expiresAt"] === "string"
      ? validIso(row["expiresAt"])
      : undefined;

  if (
    !eventId ||
    eventId.length > 128 ||
    tenant !== "ahmverdun" ||
    !phone ||
    !identityId ||
    identityId.length > 256 ||
    productCode !== TAKATAK_AHMV_PRODUCT_CODE ||
    (status !== "active" &&
      status !== "inactive" &&
      status !== "blocked") ||
    !occurredAt
  ) {
    return null;
  }

  if (Date.parse(occurredAt) > now.getTime() + 5 * 60_000) return null;

  if (
    status === "active" &&
    (!expiresAt || Date.parse(expiresAt) <= now.getTime())
  ) {
    return null;
  }

  return {
    eventId,
    tenant: "ahmverdun",
    phoneE164: phone,
    identityId,
    productCode,
    status,
    expiresAt,
    occurredAt,
  };
}

async function existingEvent(eventId: string) {
  const result = await db()
    .from("ahmv_phone_entitlement_sync_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (result.error) throw result.error;
  return Boolean(result.data);
}

function resolvedTier(input: {
  status: TakatakMembershipStatus;
  trialExpiresAt?: string | null | undefined;
  now: Date;
}) {
  if (input.status === "blocked") return "blocked" as const;
  if (input.status === "active") return "premium" as const;

  const trialExpires = Date.parse(input.trialExpiresAt ?? "");
  return Number.isFinite(trialExpires) && trialExpires > input.now.getTime()
    ? ("trial" as const)
    : ("guest" as const);
}

export async function applyTakatakMembershipSync(
  input: TakatakMembershipSyncInput,
  now = new Date(),
): Promise<TakatakMembershipSyncResult> {
  if (await existingEvent(input.eventId)) {
    return { duplicate: true, applied: false };
  }

  const client = db();
  const existing = await client
    .from("ahmv_phone_contacts")
    .select("id,trial_expires_at")
    .eq("phone_e164", input.phoneE164)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (!existing.data && input.status !== "active") {
    const audit = await client
      .from("ahmv_phone_entitlement_sync_events")
      .insert({
        event_id: input.eventId,
        contact_id: null,
        takatak_identity_id: input.identityId,
        product_code: input.productCode,
        membership_status: input.status,
        entitlement_expires_at: input.expiresAt ?? null,
        occurred_at: input.occurredAt,
      });
    if (audit.error) {
      if (audit.error.code === "23505") {
        return { duplicate: true, applied: false };
      }
      throw audit.error;
    }
    return { duplicate: false, applied: false };
  }

  let contactId: string;
  let tier: "guest" | "trial" | "premium" | "blocked";

  if (existing.data) {
    contactId = String(existing.data.id);
    tier = resolvedTier({
      status: input.status,
      trialExpiresAt: existing.data.trial_expires_at,
      now,
    });

    const updated = await client
      .from("ahmv_phone_contacts")
      .update({
        takatak_identity_id: input.identityId,
        access_tier: tier,
        premium_expires_at:
          input.status === "active" ? input.expiresAt : null,
        updated_at: now.toISOString(),
      })
      .eq("id", contactId);
    if (updated.error) throw updated.error;
  } else {
    tier = "premium";
    const inserted = await client
      .from("ahmv_phone_contacts")
      .insert({
        phone_e164: input.phoneE164,
        language: "fr",
        access_tier: tier,
        trial_started_at: now.toISOString(),
        trial_expires_at: now.toISOString(),
        premium_expires_at: input.expiresAt,
        takatak_identity_id: input.identityId,
        sms_consent: false,
        transactional_sms_allowed: true,
        marketing_sms_consent: false,
        last_seen_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select("id")
      .single();

    if (inserted.error) throw inserted.error;
    contactId = String(inserted.data.id);
  }

  const audit = await client
    .from("ahmv_phone_entitlement_sync_events")
    .insert({
      event_id: input.eventId,
      contact_id: contactId,
      takatak_identity_id: input.identityId,
      product_code: input.productCode,
      membership_status: input.status,
      entitlement_expires_at: input.expiresAt ?? null,
      occurred_at: input.occurredAt,
    });

  if (audit.error) {
    if (audit.error.code === "23505") {
      return {
        duplicate: true,
        applied: false,
        contactId,
        accessTier: tier,
      };
    }
    throw audit.error;
  }

  return {
    duplicate: false,
    applied: true,
    contactId,
    accessTier: tier,
  };
}
