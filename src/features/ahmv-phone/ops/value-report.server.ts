import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server";
import {
  aggregateAhmvVoiceValueReport,
  type AhmvVoiceValueReport,
  type VoiceValueInteractionRow,
  type VoiceValueMessageRow,
  type VoiceValueSessionRow,
} from "./value-report.aggregate.ts";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

export async function getAhmvVoiceValueReport(
  now = new Date(),
): Promise<AhmvVoiceValueReport> {
  const client = db();
  const nowIso = now.toISOString();
  const since30d = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const rowLimit = 10_000;

  const [voiceResult, interactionResult, messageResult] = await Promise.all([
    client
      .from("ahmv_voice_sessions")
      .select("detected_language,session_duration_seconds,turn_count,session_state,sms_sent_at,started_at")
      .gte("started_at", since30d)
      .order("started_at", { ascending: false })
      .limit(rowLimit),
    client
      .from("ahmv_phone_interactions")
      .select("intent,outcome,created_at")
      .gte("created_at", since30d)
      .order("created_at", { ascending: false })
      .limit(rowLimit),
    client
      .from("ahmv_phone_message_jobs")
      .select("status,created_at")
      .gte("created_at", since30d)
      .order("created_at", { ascending: false })
      .limit(rowLimit),
  ]);

  if (voiceResult.error) throw voiceResult.error;
  if (interactionResult.error) throw interactionResult.error;
  if (messageResult.error) throw messageResult.error;

  return aggregateAhmvVoiceValueReport({
    generatedAt: nowIso,
    sessions: (voiceResult.data ?? []) as VoiceValueSessionRow[],
    interactions: (interactionResult.data ?? []) as VoiceValueInteractionRow[],
    messages: (messageResult.data ?? []) as VoiceValueMessageRow[],
    rowLimit,
  });
}
