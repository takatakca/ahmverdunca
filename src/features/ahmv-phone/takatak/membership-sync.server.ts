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
      ? (validIso(row["expiresAt"]) ?? undefined)
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

export async function applyTakatakMembershipSync(
  input: TakatakMembershipSyncInput,
  now = new Date(),
): Promise<TakatakMembershipSyncResult> {
  const result = await db().rpc("ahmv_apply_takatak_membership_sync", {
    p_event_id: input.eventId,
    p_phone_e164: input.phoneE164,
    p_takatak_identity_id: input.identityId,
    p_product_code: input.productCode,
    p_membership_status: input.status,
    p_entitlement_expires_at: input.expiresAt ?? null,
    p_occurred_at: input.occurredAt,
    p_now: now.toISOString(),
  });

  if (result.error) throw result.error;

  const row = Array.isArray(result.data)
    ? result.data[0]
    : result.data;

  if (!row || typeof row !== "object") {
    throw new Error("TAKATAK membership projection returned no result");
  }

  const value = row as Record<string, unknown>;
  const tier = value["access_tier"];

  return {
    duplicate: value["duplicate"] === true,
    applied: value["applied"] === true,
    contactId:
      typeof value["contact_id"] === "string"
        ? value["contact_id"]
        : undefined,
    accessTier:
      tier === "guest" ||
      tier === "trial" ||
      tier === "premium" ||
      tier === "blocked"
        ? tier
        : undefined,
  };
}
