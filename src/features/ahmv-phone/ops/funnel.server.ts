import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server.ts";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

type InteractionRow = {
  channel: "voice" | "sms" | "system";
  intent: string | null;
  outcome: string;
  created_at: string;
};

type MessageRow = {
  status: "pending" | "sending" | "sent" | "failed" | "cancelled";
  created_at: string;
};

export interface AhmvPhoneOpsFunnel {
  generatedAt: string;
  windowDays: 7;
  contacts: {
    total: number;
    activeTrials: number;
    expiredTrials: number;
    premium: number;
    blocked: number;
    trialsEndingWithin72h: number;
  };
  demand: {
    interactions7d: number;
    voice7d: number;
    sms7d: number;
    membershipRequired7d: number;
    topIntents: Array<{ intent: string; count: number }>;
  };
  delivery: {
    attempted7d: number;
    sent7d: number;
    failed7d: number;
    pendingOrSending: number;
    successRatePct: number | null;
  };
  daily: Array<{
    date: string;
    interactions: number;
    voice: number;
    sms: number;
    membershipRequired: number;
  }>;
  privacy: {
    containsPhoneNumbers: false;
    containsMessageBodies: false;
    containsProviderSids: false;
  };
  limits: {
    interactionRowsCapped: boolean;
    messageRowsCapped: boolean;
  };
}

function countResult(result: { count: number | null; error: unknown }) {
  if (result.error) throw result.error;
  return result.count ?? 0;
}

function percent(numerator: number, denominator: number) {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 10_000) / 100;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function getAhmvPhoneOpsFunnel(
  now = new Date(),
): Promise<AhmvPhoneOpsFunnel> {
  const client = db();
  const nowIso = now.toISOString();
  const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const rowLimit = 5000;

  const [
    total,
    activeTrials,
    expiredTrials,
    premium,
    blocked,
    endingSoon,
    interactionsResult,
    messagesResult,
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
      .eq("access_tier", "trial")
      .lte("trial_expires_at", nowIso),
    client
      .from("ahmv_phone_contacts")
      .select("*", { count: "exact", head: true })
      .eq("access_tier", "premium")
      .gt("premium_expires_at", nowIso),
    client
      .from("ahmv_phone_contacts")
      .select("*", { count: "exact", head: true })
      .eq("access_tier", "blocked"),
    client
      .from("ahmv_phone_contacts")
      .select("*", { count: "exact", head: true })
      .eq("access_tier", "trial")
      .gt("trial_expires_at", nowIso)
      .lte("trial_expires_at", in72h),
    client
      .from("ahmv_phone_interactions")
      .select("channel,intent,outcome,created_at")
      .gte("created_at", since7d)
      .order("created_at", { ascending: false })
      .limit(rowLimit),
    client
      .from("ahmv_phone_message_jobs")
      .select("status,created_at")
      .gte("created_at", since7d)
      .order("created_at", { ascending: false })
      .limit(rowLimit),
  ]);

  if (interactionsResult.error) throw interactionsResult.error;
  if (messagesResult.error) throw messagesResult.error;

  const interactions = (interactionsResult.data ?? []) as InteractionRow[];
  const messages = (messagesResult.data ?? []) as MessageRow[];

  const voice7d = interactions.filter((row) => row.channel === "voice").length;
  const sms7d = interactions.filter((row) => row.channel === "sms").length;
  const membershipRequired7d = interactions.filter(
    (row) => row.outcome === "membership-required",
  ).length;

  const intentCounts = new Map<string, number>();
  for (const row of interactions) {
    const intent = row.intent?.trim() || "unknown";
    intentCounts.set(intent, (intentCounts.get(intent) ?? 0) + 1);
  }

  const topIntents = [...intentCounts.entries()]
    .map(([intent, count]) => ({ intent, count }))
    .sort((a, b) => b.count - a.count || a.intent.localeCompare(b.intent))
    .slice(0, 8);

  const sent7d = messages.filter((row) => row.status === "sent").length;
  const failed7d = messages.filter((row) => row.status === "failed").length;
  const pendingOrSending = messages.filter(
    (row) => row.status === "pending" || row.status === "sending",
  ).length;
  const attempted7d = sent7d + failed7d;

  const days = new Map<
    string,
    { date: string; interactions: number; voice: number; sms: number; membershipRequired: number }
  >();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now.getTime() - offset * 86_400_000);
    const key = dateKey(date);
    days.set(key, {
      date: key,
      interactions: 0,
      voice: 0,
      sms: 0,
      membershipRequired: 0,
    });
  }

  for (const row of interactions) {
    const day = days.get(row.created_at.slice(0, 10));
    if (!day) continue;
    day.interactions += 1;
    if (row.channel === "voice") day.voice += 1;
    if (row.channel === "sms") day.sms += 1;
    if (row.outcome === "membership-required") day.membershipRequired += 1;
  }

  return {
    generatedAt: nowIso,
    windowDays: 7,
    contacts: {
      total: countResult(total),
      activeTrials: countResult(activeTrials),
      expiredTrials: countResult(expiredTrials),
      premium: countResult(premium),
      blocked: countResult(blocked),
      trialsEndingWithin72h: countResult(endingSoon),
    },
    demand: {
      interactions7d: interactions.length,
      voice7d,
      sms7d,
      membershipRequired7d,
      topIntents,
    },
    delivery: {
      attempted7d,
      sent7d,
      failed7d,
      pendingOrSending,
      successRatePct: percent(sent7d, attempted7d),
    },
    daily: [...days.values()],
    privacy: {
      containsPhoneNumbers: false,
      containsMessageBodies: false,
      containsProviderSids: false,
    },
    limits: {
      interactionRowsCapped: interactions.length >= rowLimit,
      messageRowsCapped: messages.length >= rowLimit,
    },
  };
}
