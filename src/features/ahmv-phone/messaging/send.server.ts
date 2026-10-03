import twilio from "twilio";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server";
import { normalizePhoneE164 } from "../contacts/store.server";

type Settings = Record<string, string | undefined>;
function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

async function createJob(
  contactId: string | undefined,
  purpose: string,
  body: string,
  idempotencyKey?: string | undefined,
) {
  if (!contactId) return { send: true as const, jobId: undefined };

  const result = await db()
    .from("ahmv_phone_message_jobs")
    .insert({
      contact_id: contactId,
      purpose,
      payload: { body },
      status: "sending",
      attempts: 1,
      idempotency_key: idempotencyKey ?? null,
    })
    .select("id")
    .single();

  if (!result.error) {
    return { send: true as const, jobId: String(result.data.id) };
  }

  if (result.error.code !== "23505" || !idempotencyKey) throw result.error;

  const existing = await db()
    .from("ahmv_phone_message_jobs")
    .select("id,status,provider_sid,attempts")
    .eq("idempotency_key", idempotencyKey)
    .single();
  if (existing.error) throw existing.error;

  if (existing.data.status === "sent") {
    return {
      send: false as const,
      alreadySent: true as const,
      jobId: String(existing.data.id),
      sid: existing.data.provider_sid ? String(existing.data.provider_sid) : undefined,
    };
  }

  if (existing.data.status === "sending") {
    return {
      send: false as const,
      alreadySent: false as const,
      jobId: String(existing.data.id),
      reason: "already_in_flight" as const,
    };
  }

  const retry = await db()
    .from("ahmv_phone_message_jobs")
    .update({
      status: "sending",
      payload: { body },
      attempts: Number(existing.data.attempts ?? 0) + 1,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.data.id)
    .select("id")
    .single();
  if (retry.error) throw retry.error;
  return { send: true as const, jobId: String(retry.data.id) };
}

async function updateJob(jobId: string | undefined, values: Record<string, unknown>) {
  if (!jobId) return;
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", jobId);
  if (result.error) throw result.error;
}

export async function sendTransactionalSms(input: {
  to: string;
  body: string;
  purpose: string;
  contactId?: string | undefined;
  idempotencyKey?: string | undefined;
  settings?: Settings | undefined;
}) {
  const settings = input.settings ?? process.env;
  const to = normalizePhoneE164(input.to);
  const from = normalizePhoneE164(settings["AHMV_PUBLIC_PHONE"] ?? "+15816666246");
  const accountSid = settings["TWILIO_ACCOUNT_SID"];
  const authToken = settings["TWILIO_AUTH_TOKEN"];
  const origin = settings["AHMV_WEBHOOK_ORIGIN"];
  if (!to || !from || !accountSid || !authToken || !origin) {
    return { sent: false as const, reason: "configuration" as const };
  }

  let jobId: string | undefined;
  try {
    const job = await createJob(
      input.contactId,
      input.purpose,
      input.body,
      input.idempotencyKey,
    );
    jobId = job.jobId;
    if (!job.send) {
      if (job.alreadySent) {
        return { sent: true as const, sid: job.sid, duplicate: true as const };
      }
      return { sent: false as const, reason: job.reason };
    }
  } catch (error) {
    console.error("[AHMV SMS queue]", error);
    if (input.idempotencyKey) {
      return { sent: false as const, reason: "idempotency_store" as const };
    }
  }

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      to,
      from,
      body: input.body.slice(0, 1500),
      statusCallback: `${origin}/api/ahmv/twilio/status`,
    });
    try {
      await updateJob(jobId, { status: "sent", provider_sid: message.sid });
    } catch (error) {
      console.error("[AHMV SMS queue update]", error);
    }
    return { sent: true as const, sid: message.sid };
  } catch (error) {
    try {
      await updateJob(jobId, {
        status: "failed",
        last_error: error instanceof Error ? error.message.slice(0, 500) : "Twilio send failed",
      });
    } catch (updateError) {
      console.error("[AHMV SMS queue failure update]", updateError);
    }
    console.error("[AHMV SMS send]", error);
    return { sent: false as const, reason: "provider" as const };
  }
}

export async function updateSmsDeliveryStatus(messageSid: string, messageStatus: string) {
  if (!messageSid) return;
  const normalized =
    /^(failed|undelivered)$/i.test(messageStatus)
      ? "failed"
      : /^(sent|delivered|read)$/i.test(messageStatus)
        ? "sent"
        : "sending";
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .update({ status: normalized, updated_at: new Date().toISOString() })
    .eq("provider_sid", messageSid);
  if (result.error) throw result.error;
}
