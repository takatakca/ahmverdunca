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
) {
  if (!contactId) return undefined;
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .insert({
      contact_id: contactId,
      purpose,
      payload: { body },
      status: "sending",
      attempts: 1,
    })
    .select("id")
    .single();
  if (result.error) throw result.error;
  return String(result.data.id);
}

async function updateJob(
  jobId: string | undefined,
  values: Record<string, unknown>,
) {
  if (!jobId) return;
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
  if (result.error) throw result.error;
}

function providerConfig(settings: Settings) {
  const from = normalizePhoneE164(
    settings["AHMV_PUBLIC_PHONE"] ?? "+15816666246",
  );
  const accountSid = settings["TWILIO_ACCOUNT_SID"];
  const authToken = settings["TWILIO_AUTH_TOKEN"];
  const origin = settings["AHMV_WEBHOOK_ORIGIN"];

  if (!from || !accountSid || !authToken || !origin) return null;
  return { from, accountSid, authToken, origin };
}

async function createProviderMessage(input: {
  to: string;
  body: string;
  settings: Settings;
}) {
  const to = normalizePhoneE164(input.to);
  const config = providerConfig(input.settings);
  if (!to || !config) {
    return {
      accepted: false as const,
      reason: "configuration" as const,
      error: "SMS provider configuration incomplete",
    };
  }

  try {
    const client = twilio(config.accountSid, config.authToken);
    const message = await client.messages.create({
      to,
      from: config.from,
      body: input.body.slice(0, 1500),
      statusCallback: `${config.origin}/api/ahmv/twilio/status`,
    });

    return {
      accepted: true as const,
      sid: message.sid,
    };
  } catch (error) {
    console.error("[AHMV SMS send]", error);
    return {
      accepted: false as const,
      reason: "provider" as const,
      error:
        error instanceof Error
          ? error.message.slice(0, 500)
          : "Twilio send failed",
    };
  }
}

export async function sendQueuedSms(input: {
  jobId: string;
  to: string;
  body: string;
  settings?: Settings | undefined;
}) {
  const settings = input.settings ?? process.env;
  const result = await createProviderMessage({
    to: input.to,
    body: input.body,
    settings,
  });

  if (result.accepted) {
    try {
      await updateJob(input.jobId, {
        status: "sending",
        provider_sid: result.sid,
        last_error: null,
      });
    } catch (error) {
      console.error("[AHMV SMS queue update]", error);
    }
    return result;
  }

  return result;
}

export async function sendTransactionalSms(input: {
  to: string;
  body: string;
  purpose: string;
  contactId?: string | undefined;
  settings?: Settings | undefined;
}) {
  const settings = input.settings ?? process.env;

  let jobId: string | undefined;
  try {
    jobId = await createJob(input.contactId, input.purpose, input.body);
  } catch (error) {
    console.error("[AHMV SMS queue]", error);
  }

  const result = await createProviderMessage({
    to: input.to,
    body: input.body,
    settings,
  });

  if (result.accepted) {
    try {
      await updateJob(jobId, {
        status: "sending",
        provider_sid: result.sid,
        last_error: null,
      });
    } catch (error) {
      console.error("[AHMV SMS queue update]", error);
    }
    return { sent: true as const, sid: result.sid };
  }

  try {
    await updateJob(jobId, {
      status: "failed",
      last_error: result.error,
    });
  } catch (updateError) {
    console.error("[AHMV SMS queue failure update]", updateError);
  }

  return {
    sent: false as const,
    reason: result.reason,
  };
}

export async function updateSmsDeliveryStatus(
  messageSid: string,
  messageStatus: string,
) {
  if (!messageSid) return;

  const normalized =
    /^(failed|undelivered)$/i.test(messageStatus)
      ? "failed"
      : /^(sent|delivered|read)$/i.test(messageStatus)
        ? "sent"
        : "sending";

  const result = await db()
    .from("ahmv_phone_message_jobs")
    .update({
      status: normalized,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_sid", messageSid);

  if (result.error) throw result.error;
}
