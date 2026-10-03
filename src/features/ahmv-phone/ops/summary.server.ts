import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

async function countRows(
  table: string,
  apply?: (query: any) => any,
): Promise<number> {
  let query = db().from(table).select("*", { count: "exact", head: true });
  if (apply) query = apply(query);
  const result = await query;
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
  const nowIso = now.toISOString();
  const since24h = new Date(now.getTime() - 86_400_000).toISOString();
  const since7d = new Date(now.getTime() - 7 * 86_400_000).toISOString();

  const [
    total,
    activeTrials,
    premium,
    marketingOptIn,
    interactions24h,
    voice24h,
    sms24h,
    interactions7d,
    sent7d,
    failed7d,
    pending,
  ] = await Promise.all([
    countRows("ahmv_phone_contacts"),
    countRows("ahmv_phone_contacts", (q) =>
      q.eq("access_tier", "trial").gt("trial_expires_at", nowIso),
    ),
    countRows("ahmv_phone_contacts", (q) => q.eq("access_tier", "premium")),
    countRows("ahmv_phone_contacts", (q) => q.eq("marketing_sms_consent", true)),
    countRows("ahmv_phone_interactions", (q) => q.gte("created_at", since24h)),
    countRows("ahmv_phone_interactions", (q) =>
      q.eq("channel", "voice").gte("created_at", since24h),
    ),
    countRows("ahmv_phone_interactions", (q) =>
      q.eq("channel", "sms").gte("created_at", since24h),
    ),
    countRows("ahmv_phone_interactions", (q) => q.gte("created_at", since7d)),
    countRows("ahmv_phone_message_jobs", (q) =>
      q.eq("status", "sent").gte("created_at", since7d),
    ),
    countRows("ahmv_phone_message_jobs", (q) =>
      q.eq("status", "failed").gte("created_at", since7d),
    ),
    countRows("ahmv_phone_message_jobs", (q) => q.eq("status", "pending")),
  ]);

  return {
    generatedAt: nowIso,
    contacts: {
      total,
      activeTrials,
      premium,
      marketingOptIn,
    },
    interactions: {
      last24h: interactions24h,
      voiceLast24h: voice24h,
      smsLast24h: sms24h,
      last7d: interactions7d,
    },
    messages: {
      sentLast7d: sent7d,
      failedLast7d: failed7d,
      pending,
    },
  };
}
