import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server.ts";

type Settings = Record<string, string | undefined>;

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function boundedDays(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(value ?? "");
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
    ? parsed
    : fallback;
}

export function phoneRetentionPolicy(settings: Settings = process.env) {
  return {
    messageBodyDays: boundedDays(
      settings["AHMV_PHONE_MESSAGE_BODY_RETENTION_DAYS"],
      30,
      1,
      365,
    ),
    interactionDays: boundedDays(
      settings["AHMV_PHONE_INTERACTION_RETENTION_DAYS"],
      90,
      7,
      730,
    ),
    messageJobDays: boundedDays(
      settings["AHMV_PHONE_JOB_RETENTION_DAYS"],
      180,
      30,
      1095,
    ),
    voiceSessionDays: boundedDays(
      settings["AHMV_VOICE_SESSION_RETENTION_DAYS"],
      90,
      7,
      365,
    ),
  };
}

function cutoff(now: Date, days: number) {
  return new Date(now.getTime() - days * 86_400_000).toISOString();
}

export async function runPhoneRetention(
  settings: Settings = process.env,
  now = new Date(),
) {
  const client = db();
  const policy = phoneRetentionPolicy(settings);

  const scrubResult = await client
    .from("ahmv_phone_message_jobs")
    .update({
      payload: {},
      last_error: null,
      updated_at: now.toISOString(),
    })
    .in("status", ["sent", "failed", "cancelled"])
    .lt("updated_at", cutoff(now, policy.messageBodyDays))
    .select("id");
  if (scrubResult.error) throw scrubResult.error;

  const interactionDelete = await client
    .from("ahmv_phone_interactions")
    .delete()
    .lt("created_at", cutoff(now, policy.interactionDays))
    .select("id");
  if (interactionDelete.error) throw interactionDelete.error;

  const jobDelete = await client
    .from("ahmv_phone_message_jobs")
    .delete()
    .in("status", ["sent", "failed", "cancelled"])
    .lt("created_at", cutoff(now, policy.messageJobDays))
    .select("id");
  if (jobDelete.error) throw jobDelete.error;

  return {
    generatedAt: now.toISOString(),
    policy,
    scrubbedMessageBodies: scrubResult.data?.length ?? 0,
    deletedInteractions: interactionDelete.data?.length ?? 0,
    deletedMessageJobs: jobDelete.data?.length ?? 0,
    deletedVoiceSessions: voiceDelete.data?.length ?? 0,
  };
}
