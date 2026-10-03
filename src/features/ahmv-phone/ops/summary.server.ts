import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function readCount(result: { count: number | null; error: unknown }) {
  if (result.error) throw result.error;
  return result.count ?? 0;
}

export interface AhmvPhoneOpsSummary {
  generatedAt: string;
  contacts: {
    total: number;
    activeTrials: number;
    premium: number;
    marketingOptIn: number;
  };
  interactions: {
    last24h: number;
    voiceLast24h: number;
    smsLast24h: number;
    last7d: number;
  };
  messages: {
    sentLast7d: number;
    failedLast7d: number;
    pending: number;
  };
}

export async function getAhmvPhoneOpsSummary(
  now = new Date(),
): Promise<AhmvPhoneOpsSummary> {
  const client = db();
  const nowIso = now.toISOString();
  const since24h = new Date(now.getTime() - 86_400_000).toISOString();
  const since7d = new Date(now.getTime() - 7 * 86_400_000).toISOString();

  const [
    totalResult,
    activeTrialsResult,
    premiumResult,
    marketingOptInResult,
    interactions24hResult,
    voice24hResult,
    sms24hResult,
    interactions7dResult,
    sent7dResult,
    failed7dResult,
    pendingResult,
  ] = await Promise.all([
    client.from("ahmv_phone_contacts").select("*", { count: "exact", head: true }),
    client
      .from("ahmv_phone_contacts")
      .select("*", { count: "exact", head: true })
      .eq("access_tier", "trial")
      .gt("trial_expires_at", nowIso),
    client
      .from("ahmv_phone_contacts")
      .select("*", { count: "exact", head: true })
      .eq("access_tier", "premium"),
    client
      .from("ahmv_phone_contacts")
      .select("*", { count: "exact", head: true })
      .eq("marketing_sms_consent", true),
    client
      .from("ahmv_phone_interactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since24h),
    client
      .from("ahmv_phone_interactions")
      .select("*", { count: "exact", head: true })
      .eq("channel", "voice")
      .gte("created_at", since24h),
    client
      .from("ahmv_phone_interactions")
      .select("*", { count: "exact", head: true })
      .eq("channel", "sms")
      .gte("created_at", since24h),
    client
      .from("ahmv_phone_interactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since7d),
    client
      .from("ahmv_phone_message_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent")
      .gte("created_at", since7d),
    client
      .from("ahmv_phone_message_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", since7d),
    client
      .from("ahmv_phone_message_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    generatedAt: nowIso,
    contacts: {
      total: readCount(totalResult),
      activeTrials: readCount(activeTrialsResult),
      premium: readCount(premiumResult),
      marketingOptIn: readCount(marketingOptInResult),
    },
    interactions: {
      last24h: readCount(interactions24hResult),
      voiceLast24h: readCount(voice24hResult),
      smsLast24h: readCount(sms24hResult),
      last7d: readCount(interactions7dResult),
    },
    messages: {
      sentLast7d: readCount(sent7dResult),
      failedLast7d: readCount(failed7dResult),
      pending: readCount(pendingResult),
    },
  };
}
