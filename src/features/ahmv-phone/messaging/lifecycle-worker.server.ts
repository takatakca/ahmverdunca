import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server.ts";
import type { AhmvPhoneContact, AhmvPhoneLanguage } from "../contacts/store.server.ts";
import { memberActivationUrl } from "../entitlements/service.server.ts";
import {
  lifecycleConsentStillValid,
  lifecycleRetryDelayMinutes,
  planPhoneLifecycleMessages,
  type LifecycleConsentBasis,
  type LifecycleMessageKind,
} from "./lifecycle.ts";
import { lifecycleMessageText } from "./templates.ts";
import { sendQueuedSms } from "./send.server.ts";

type Settings = Record<string, string | undefined>;

type ContactRow = {
  id: string;
  phone_e164: string;
  language: string;
  access_tier: AhmvPhoneContact["accessTier"];
  trial_expires_at: string;
  sms_consent: boolean;
  transactional_sms_allowed: boolean;
  marketing_sms_consent: boolean;
  takatak_identity_id: string | null;
};

type JobRow = {
  id: string;
  contact_id: string;
  purpose: string;
  payload: unknown;
  status: string;
  not_before: string;
  attempts: number;
  dedupe_key: string | null;
  consent_basis: string | null;
};

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function contactFromRow(row: ContactRow): AhmvPhoneContact {
  return {
    id: row.id,
    phoneE164: row.phone_e164,
    language: row.language === "en" ? "en" : "fr",
    accessTier: row.access_tier,
    trialExpiresAt: row.trial_expires_at,
    smsConsent: Boolean(row.sms_consent),
    transactionalSmsAllowed: Boolean(row.transactional_sms_allowed),
    marketingSmsConsent: Boolean(row.marketing_sms_consent),
    takatakIdentityId: row.takatak_identity_id ?? undefined,
  };
}

function bodyFromPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const body = (payload as Record<string, unknown>)["body"];
  return typeof body === "string" && body.trim() ? body.slice(0, 1500) : null;
}

function isLifecycleKind(value: string): value is LifecycleMessageKind {
  return [
    "trial_welcome",
    "trial_expiry_3d",
    "trial_expired",
    "membership_offer",
  ].includes(value);
}

function isConsentBasis(value: string | null): value is LifecycleConsentBasis {
  return value === "requested" || value === "service" || value === "marketing";
}

export async function queuePhoneLifecycleMessages(
  settings: Settings = process.env,
  now = new Date(),
) {
  const client = db();
  const contactsResult = await client
    .from("ahmv_phone_contacts")
    .select(
      "id,phone_e164,language,access_tier,trial_expires_at,sms_consent,transactional_sms_allowed,marketing_sms_consent,takatak_identity_id",
    )
    .eq("access_tier", "trial")
    .eq("transactional_sms_allowed", true)
    .limit(2000);

  if (contactsResult.error) throw contactsResult.error;

  let planned = 0;
  let inserted = 0;
  let duplicates = 0;
  const memberUrl = memberActivationUrl(settings);

  for (const row of (contactsResult.data ?? []) as ContactRow[]) {
    const contact = contactFromRow(row);
    const plans = planPhoneLifecycleMessages(contact, now);

    for (const plan of plans) {
      planned += 1;
      const body = lifecycleMessageText(plan.kind, contact.language, memberUrl);
      const result = await client.from("ahmv_phone_message_jobs").insert({
        contact_id: contact.id,
        purpose: plan.kind,
        payload: { body },
        status: "pending",
        not_before: plan.dueAt,
        attempts: 0,
        dedupe_key: plan.dedupeKey,
        consent_basis: plan.consentBasis,
      });

      if (!result.error) {
        inserted += 1;
        continue;
      }

      if (result.error.code === "23505") {
        duplicates += 1;
        continue;
      }

      throw result.error;
    }
  }

  return {
    scannedContacts: contactsResult.data?.length ?? 0,
    planned,
    inserted,
    duplicates,
  };
}

async function claimJob(job: JobRow, now: Date) {
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .update({
      status: "sending",
      attempts: job.attempts + 1,
      updated_at: now.toISOString(),
    })
    .eq("id", job.id)
    .eq("status", "pending")
    .select(
      "id,contact_id,purpose,payload,status,not_before,attempts,dedupe_key,consent_basis",
    )
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data as JobRow | null;
}

async function loadContact(contactId: string) {
  const result = await db()
    .from("ahmv_phone_contacts")
    .select(
      "id,phone_e164,language,access_tier,trial_expires_at,sms_consent,transactional_sms_allowed,marketing_sms_consent,takatak_identity_id",
    )
    .eq("id", contactId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ? contactFromRow(result.data as ContactRow) : null;
}

async function updateJob(
  jobId: string,
  values: Record<string, unknown>,
) {
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
  if (result.error) throw result.error;
}

export async function dispatchDuePhoneLifecycleMessages(
  settings: Settings = process.env,
  now = new Date(),
) {
  const client = db();
  const dueResult = await client
    .from("ahmv_phone_message_jobs")
    .select(
      "id,contact_id,purpose,payload,status,not_before,attempts,dedupe_key,consent_basis",
    )
    .eq("status", "pending")
    .lte("not_before", now.toISOString())
    .in("purpose", [
      "trial_welcome",
      "trial_expiry_3d",
      "trial_expired",
      "membership_offer",
    ])
    .order("not_before", { ascending: true })
    .limit(50);

  if (dueResult.error) throw dueResult.error;

  const summary = {
    due: dueResult.data?.length ?? 0,
    claimed: 0,
    accepted: 0,
    cancelled: 0,
    retried: 0,
    failed: 0,
  };

  for (const row of (dueResult.data ?? []) as JobRow[]) {
    const claimed = await claimJob(row, now);
    if (!claimed) continue;
    summary.claimed += 1;

    const contact = await loadContact(claimed.contact_id);
    const body = bodyFromPayload(claimed.payload);
    const consentBasis = isConsentBasis(claimed.consent_basis)
      ? claimed.consent_basis
      : null;

    if (
      !contact ||
      !body ||
      !consentBasis ||
      !isLifecycleKind(claimed.purpose) ||
      !lifecycleConsentStillValid(contact, consentBasis)
    ) {
      await updateJob(claimed.id, {
        status: "cancelled",
        last_error: "Lifecycle eligibility or consent no longer valid",
      });
      summary.cancelled += 1;
      continue;
    }

    const result = await sendQueuedSms({
      jobId: claimed.id,
      to: contact.phoneE164,
      body,
      settings,
    });

    if (result.accepted) {
      summary.accepted += 1;
      continue;
    }

    const attempts = claimed.attempts;
    if (result.reason === "provider" && attempts < 3) {
      const delayMinutes = lifecycleRetryDelayMinutes(attempts);
      await updateJob(claimed.id, {
        status: "pending",
        not_before: new Date(now.getTime() + delayMinutes * 60_000).toISOString(),
        last_error: result.error ?? "Provider send failed",
      });
      summary.retried += 1;
    } else {
      await updateJob(claimed.id, {
        status: "failed",
        last_error: result.error ?? result.reason,
      });
      summary.failed += 1;
    }
  }

  return summary;
}

export async function runPhoneLifecycleWorker(
  settings: Settings = process.env,
  now = new Date(),
) {
  const queued = await queuePhoneLifecycleMessages(settings, now);
  const dispatched = await dispatchDuePhoneLifecycleMessages(settings, now);
  return {
    generatedAt: now.toISOString(),
    queued,
    dispatched,
  };
}
