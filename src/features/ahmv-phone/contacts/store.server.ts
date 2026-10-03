import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server";

export type AhmvPhoneLanguage = "fr" | "en";
export type AhmvPhoneChannel = "voice" | "sms" | "system";

export interface AhmvPhoneContact {
  id: string;
  phoneE164: string;
  language: AhmvPhoneLanguage;
  accessTier: "guest" | "trial" | "premium" | "blocked";
  trialExpiresAt: string;
  smsConsent: boolean;
  transactionalSmsAllowed: boolean;
  marketingSmsConsent: boolean;
  takatakIdentityId?: string | undefined;
}

function db(): SupabaseClient {
  // New communication tables are created by this branch's migration. Keeping the
  // cast local avoids hand-editing generated Supabase types before regeneration.
  return supabaseAdmin as unknown as SupabaseClient;
}

export function normalizePhoneE164(value: string | undefined): string | null {
  const phone = (value ?? "").trim();
  return /^\+[1-9][0-9]{7,14}$/.test(phone) ? phone : null;
}

function trialDays(settings: Record<string, string | undefined>) {
  const parsed = Number(settings["AHMV_PHONE_TRIAL_DAYS"] ?? "30");
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 365 ? parsed : 30;
}

function mapContact(row: Record<string, unknown>): AhmvPhoneContact {
  return {
    id: String(row["id"]),
    phoneE164: String(row["phone_e164"]),
    language: row["language"] === "en" ? "en" : "fr",
    accessTier: row["access_tier"] as AhmvPhoneContact["accessTier"],
    trialExpiresAt: String(row["trial_expires_at"]),
    smsConsent: Boolean(row["sms_consent"]),
    transactionalSmsAllowed: Boolean(row["transactional_sms_allowed"]),
    marketingSmsConsent: Boolean(row["marketing_sms_consent"]),
    takatakIdentityId: row["takatak_identity_id"] ? String(row["takatak_identity_id"]) : undefined,
  };
}

export async function touchPhoneContact(input: {
  phoneE164: string;
  language: AhmvPhoneLanguage;
  smsRequested?: boolean;
  settings?: Record<string, string | undefined>;
}): Promise<AhmvPhoneContact | null> {
  const phone = normalizePhoneE164(input.phoneE164);
  if (!phone) return null;
  const settings = input.settings ?? process.env;
  const client = db();

  const existingResult = await client
    .from("ahmv_phone_contacts")
    .select("id,phone_e164,language,access_tier,trial_expires_at,sms_consent,transactional_sms_allowed,marketing_sms_consent,takatak_identity_id")
    .eq("phone_e164", phone)
    .maybeSingle();

  if (existingResult.error) throw existingResult.error;

  if (existingResult.data) {
    const current = existingResult.data;
    const updateResult = await client
      .from("ahmv_phone_contacts")
      .update({
        language: input.language,
        sms_consent: Boolean(current.sms_consent) || Boolean(input.smsRequested),
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .select("id,phone_e164,language,access_tier,trial_expires_at,sms_consent,transactional_sms_allowed,marketing_sms_consent,takatak_identity_id")
      .single();
    if (updateResult.error) throw updateResult.error;
    return mapContact(updateResult.data);
  }

  const now = new Date();
  const expires = new Date(now.getTime() + trialDays(settings) * 86_400_000);
  const insertResult = await client
    .from("ahmv_phone_contacts")
    .insert({
      phone_e164: phone,
      language: input.language,
      access_tier: "trial",
      trial_started_at: now.toISOString(),
      trial_expires_at: expires.toISOString(),
      sms_consent: Boolean(input.smsRequested),
      transactional_sms_allowed: true,
      marketing_sms_consent: false,
      last_seen_at: now.toISOString(),
    })
    .select("id,phone_e164,language,access_tier,trial_expires_at,sms_consent,transactional_sms_allowed,marketing_sms_consent,takatak_identity_id")
    .single();

  if (insertResult.error) {
    // A simultaneous webhook from the same caller can win the unique insert.
    if (insertResult.error.code === "23505") {
      return touchPhoneContact(input);
    }
    throw insertResult.error;
  }
  return mapContact(insertResult.data);
}

export async function savePrimaryTeamPreference(contactId: string, publicTeamId: string) {
  const client = db();
  const clear = await client
    .from("ahmv_phone_team_preferences")
    .update({ is_primary: false })
    .eq("contact_id", contactId);
  if (clear.error) throw clear.error;

  const saved = await client
    .from("ahmv_phone_team_preferences")
    .upsert(
      {
        contact_id: contactId,
        public_team_id: publicTeamId,
        is_primary: true,
      },
      { onConflict: "contact_id,public_team_id" },
    );
  if (saved.error) throw saved.error;
}

export async function getPrimaryTeamPreference(contactId: string): Promise<string | null> {
  const result = await db()
    .from("ahmv_phone_team_preferences")
    .select("public_team_id")
    .eq("contact_id", contactId)
    .eq("is_primary", true)
    .maybeSingle();
  if (result.error) throw result.error;
  const value = result.data?.["public_team_id"];
  return typeof value === "string" ? value : null;
}

export async function safeSavePrimaryTeamPreference(contactId: string, publicTeamId: string) {
  try {
    await savePrimaryTeamPreference(contactId, publicTeamId);
    return true;
  } catch (error) {
    console.error("[AHMV phone team preference]", error);
    return false;
  }
}

export async function setTeamReminderPreference(
  contactId: string,
  publicTeamId: string,
  enabled: boolean,
) {
  const result = await db()
    .from("ahmv_phone_team_preferences")
    .upsert(
      {
        contact_id: contactId,
        public_team_id: publicTeamId,
        reminders_enabled: enabled,
      },
      { onConflict: "contact_id,public_team_id" },
    );
  if (result.error) throw result.error;
}

export async function safeSetTeamReminderPreference(
  contactId: string,
  publicTeamId: string,
  enabled: boolean,
) {
  try {
    await setTeamReminderPreference(contactId, publicTeamId, enabled);
    return true;
  } catch (error) {
    console.error("[AHMV phone reminder preference]", error);
    return false;
  }
}

export async function safeTouchPhoneContact(
  input: Parameters<typeof touchPhoneContact>[0],
): Promise<AhmvPhoneContact | null> {
  try {
    return await touchPhoneContact(input);
  } catch (error) {
    console.error("[AHMV phone contact]", error);
    return null;
  }
}

