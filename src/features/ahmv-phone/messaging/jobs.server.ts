import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server.ts";

export type MessageConsentBasis = "requested" | "service" | "marketing";

export interface MessageJobRow {
  id: string;
  contact_id: string;
  purpose: string;
  payload: unknown;
  status: "pending" | "sending" | "sent" | "failed" | "cancelled";
  not_before: string;
  attempts: number;
  dedupe_key: string | null;
  consent_basis: string | null;
  provider_sid?: string | null;
}

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

export async function queueMessageJob(input: {
  contactId: string;
  purpose: string;
  body: string;
  notBefore: string;
  dedupeKey: string;
  consentBasis: MessageConsentBasis;
  payload?: Record<string, unknown> | undefined;
}) {
  const result = await db().from("ahmv_phone_message_jobs").insert({
    contact_id: input.contactId,
    purpose: input.purpose,
    payload: {
      ...(input.payload ?? {}),
      body: input.body.slice(0, 1500),
    },
    status: "pending",
    not_before: input.notBefore,
    attempts: 0,
    dedupe_key: input.dedupeKey,
    consent_basis: input.consentBasis,
  });

  if (!result.error) return "inserted" as const;
  if (result.error.code === "23505") return "duplicate" as const;
  throw result.error;
}

export async function loadDueMessageJobs(
  purposes: readonly string[],
  now = new Date(),
  limit = 50,
) {
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .select(
      "id,contact_id,purpose,payload,status,not_before,attempts,dedupe_key,consent_basis,provider_sid",
    )
    .eq("status", "pending")
    .lte("not_before", now.toISOString())
    .in("purpose", [...purposes])
    .order("not_before", { ascending: true })
    .limit(limit);

  if (result.error) throw result.error;
  return (result.data ?? []) as MessageJobRow[];
}

export async function claimMessageJob(
  job: MessageJobRow,
  now = new Date(),
) {
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
      "id,contact_id,purpose,payload,status,not_before,attempts,dedupe_key,consent_basis,provider_sid",
    )
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data as MessageJobRow | null;
}

export async function updateMessageJob(
  jobId: string,
  values: Record<string, unknown>,
  now = new Date(),
) {
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .update({
      ...values,
      updated_at: now.toISOString(),
    })
    .eq("id", jobId);

  if (result.error) throw result.error;
}

export function messageBodyFromPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const body = (payload as Record<string, unknown>)["body"];
  return typeof body === "string" && body.trim()
    ? body.slice(0, 1500)
    : null;
}
