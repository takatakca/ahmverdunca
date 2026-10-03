import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server.ts";
import {
  queueMessageJob,
  type MessageJobRow,
  claimMessageJob,
  loadDueMessageJobs,
  messageBodyFromPayload,
  updateMessageJob,
} from "../messaging/jobs.server.ts";
import { lifecycleRetryDelayMinutes } from "../messaging/lifecycle.ts";
import { sendQueuedSms } from "../messaging/send.server.ts";
import {
  marketingLegalInfoUrl,
  marketingMessageBody,
  type MarketingAudience,
  type MarketingCampaignInput,
} from "./campaign.ts";

type Settings = Record<string, string | undefined>;

type CampaignRow = {
  id: string;
  takatak_campaign_id: string;
  campaign_name: string;
  body_fr: string;
  body_en: string;
  audience: MarketingAudience;
  legal_info_url: string;
  scheduled_at: string;
  status: "queued" | "dispatching" | "completed" | "cancelled" | "failed";
  target_count: number;
  queued_count: number;
  created_at: string;
  updated_at: string;
};

type MarketingContactRow = {
  id: string;
  phone_e164: string;
  language: string;
  access_tier: string;
  transactional_sms_allowed: boolean;
  marketing_sms_consent: boolean;
  marketing_sms_consented_at: string | null;
  marketing_sms_consent_source: string | null;
};

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function stableAudience(audience: MarketingAudience) {
  return audience.kind === "all_opted_in"
    ? JSON.stringify({ kind: "all_opted_in" })
    : JSON.stringify({
        kind: "teams",
        teamIds: [...audience.teamIds].sort(),
      });
}

function campaignMatchesInput(
  row: CampaignRow,
  input: MarketingCampaignInput,
  legalInfoUrl: string,
) {
  return (
    row.campaign_name === input.campaignName &&
    row.body_fr === input.bodyFr &&
    row.body_en === input.bodyEn &&
    new Date(row.scheduled_at).toISOString() === input.scheduledAt &&
    stableAudience(row.audience) === stableAudience(input.audience) &&
    row.legal_info_url === legalInfoUrl
  );
}

async function findCampaign(campaignId: string) {
  const result = await db()
    .from("ahmv_phone_campaign_executions")
    .select(
      "id,takatak_campaign_id,campaign_name,body_fr,body_en,audience,legal_info_url,scheduled_at,status,target_count,queued_count,created_at,updated_at",
    )
    .eq("takatak_campaign_id", campaignId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data as CampaignRow | null;
}

async function eligibleContactIdsForTeams(teamIds: readonly string[]) {
  const result = await db()
    .from("ahmv_phone_team_preferences")
    .select("contact_id")
    .in("public_team_id", [...teamIds])
    .limit(5000);

  if (result.error) throw result.error;
  return [...new Set((result.data ?? []).map((row) => String(row.contact_id)))];
}

async function eligibleMarketingContacts(audience: MarketingAudience) {
  let allowedIds: string[] | null = null;

  if (audience.kind === "teams") {
    allowedIds = await eligibleContactIdsForTeams(audience.teamIds);
    if (!allowedIds.length) return [] as MarketingContactRow[];
  }

  let query = db()
    .from("ahmv_phone_contacts")
    .select(
      "id,phone_e164,language,access_tier,transactional_sms_allowed,marketing_sms_consent,marketing_sms_consented_at,marketing_sms_consent_source",
    )
    .eq("transactional_sms_allowed", true)
    .eq("marketing_sms_consent", true)
    .neq("access_tier", "blocked")
    .not("marketing_sms_consented_at", "is", null)
    .in("marketing_sms_consent_source", ["sms_keyword", "takatak_verified"])
    .limit(5000);

  if (allowedIds) query = query.in("id", allowedIds);

  const result = await query;
  if (result.error) throw result.error;
  return (result.data ?? []) as MarketingContactRow[];
}

async function ensureCampaignExecution(
  input: MarketingCampaignInput,
  legalInfoUrl: string,
) {
  const existing = await findCampaign(input.campaignId);
  if (existing) {
    if (!campaignMatchesInput(existing, input, legalInfoUrl)) {
      throw new Error("Campaign ID already exists with different immutable content");
    }
    if (existing.status === "cancelled") {
      throw new Error("Cancelled campaign cannot be re-queued");
    }
    return existing;
  }

  const inserted = await db()
    .from("ahmv_phone_campaign_executions")
    .insert({
      takatak_campaign_id: input.campaignId,
      campaign_name: input.campaignName,
      body_fr: input.bodyFr,
      body_en: input.bodyEn,
      audience: input.audience,
      legal_info_url: legalInfoUrl,
      scheduled_at: input.scheduledAt,
      status: "queued",
    })
    .select(
      "id,takatak_campaign_id,campaign_name,body_fr,body_en,audience,legal_info_url,scheduled_at,status,target_count,queued_count,created_at,updated_at",
    )
    .single();

  if (!inserted.error) return inserted.data as CampaignRow;

  if (inserted.error.code === "23505") {
    const raced = await findCampaign(input.campaignId);
    if (!raced || !campaignMatchesInput(raced, input, legalInfoUrl)) {
      throw new Error("Campaign ID conflict");
    }
    return raced;
  }

  throw inserted.error;
}

export async function queueMarketingCampaign(
  input: MarketingCampaignInput,
  settings: Settings = process.env,
) {
  const legalInfoUrl = marketingLegalInfoUrl(settings);
  if (!legalInfoUrl) {
    throw new Error("TAKATAK SMS commercial-message information URL is not configured");
  }

  const campaign = await ensureCampaignExecution(input, legalInfoUrl);
  const contacts = await eligibleMarketingContacts(input.audience);

  let inserted = 0;
  let duplicate = 0;

  for (const contact of contacts) {
    const body = contact.language === "en"
      ? marketingMessageBody(input.bodyEn, legalInfoUrl)
      : marketingMessageBody(input.bodyFr, legalInfoUrl);

    const result = await queueMessageJob({
      contactId: contact.id,
      purpose: "marketing_campaign",
      body,
      notBefore: input.scheduledAt,
      dedupeKey: `campaign:${input.campaignId}:contact:${contact.id}`,
      consentBasis: "marketing",
      payload: {
        campaignId: input.campaignId,
      },
    });

    if (result === "inserted") inserted += 1;
    else duplicate += 1;
  }

  const updated = await db()
    .from("ahmv_phone_campaign_executions")
    .update({
      target_count: contacts.length,
      queued_count: contacts.length,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaign.id);

  if (updated.error) throw updated.error;

  return {
    campaignId: input.campaignId,
    targetCount: contacts.length,
    inserted,
    duplicate,
    status: campaign.status,
  };
}

function campaignIdFromPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const value = (payload as Record<string, unknown>)["campaignId"];
  return typeof value === "string" && value ? value : null;
}

async function marketingContact(contactId: string) {
  const result = await db()
    .from("ahmv_phone_contacts")
    .select(
      "id,phone_e164,language,access_tier,transactional_sms_allowed,marketing_sms_consent,marketing_sms_consented_at,marketing_sms_consent_source",
    )
    .eq("id", contactId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data as MarketingContactRow | null;
}

function contactStillMarketingEligible(contact: MarketingContactRow | null) {
  return Boolean(
    contact &&
      contact.access_tier !== "blocked" &&
      contact.transactional_sms_allowed &&
      contact.marketing_sms_consent &&
      contact.marketing_sms_consented_at &&
      (contact.marketing_sms_consent_source === "sms_keyword" ||
        contact.marketing_sms_consent_source === "takatak_verified"),
  );
}

async function campaignCanDispatch(campaignId: string) {
  const campaign = await findCampaign(campaignId);
  return Boolean(
    campaign &&
      campaign.status !== "cancelled" &&
      campaign.status !== "failed",
  );
}

async function markCampaignDispatching(campaignId: string) {
  const result = await db()
    .from("ahmv_phone_campaign_executions")
    .update({
      status: "dispatching",
      updated_at: new Date().toISOString(),
    })
    .eq("takatak_campaign_id", campaignId)
    .eq("status", "queued");

  if (result.error) throw result.error;
}

async function finalizeCampaignIfDone(campaignId: string) {
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .select("status")
    .eq("purpose", "marketing_campaign")
    .contains("payload", { campaignId })
    .limit(5000);

  if (result.error) throw result.error;

  const statuses = (result.data ?? []).map((row) => String(row.status));
  const hasOutstanding = statuses.some(
    (status) => status === "pending" || status === "sending",
  );

  if (hasOutstanding) return;

  const update = await db()
    .from("ahmv_phone_campaign_executions")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("takatak_campaign_id", campaignId)
    .neq("status", "cancelled");

  if (update.error) throw update.error;
}

export async function dispatchDueMarketingCampaignMessages(
  settings: Settings = process.env,
  now = new Date(),
) {
  const providerReady =
    settings["AHMV_PHONE_ENABLED"] === "true" &&
    settings["AHMV_PHONE_CAMPAIGNS_ENABLED"] === "true" &&
    Boolean(settings["TWILIO_ACCOUNT_SID"]?.trim()) &&
    Boolean(settings["TWILIO_AUTH_TOKEN"]?.trim()) &&
    settings["AHMV_WEBHOOK_ORIGIN"] === "https://ahmverdun.ca";

  if (!providerReady) {
    return {
      due: 0,
      claimed: 0,
      accepted: 0,
      cancelled: 0,
      retried: 0,
      failed: 0,
      skippedConfiguration: true,
    };
  }

  const dueJobs = await loadDueMessageJobs(
    ["marketing_campaign"],
    now,
    50,
  );

  const summary = {
    due: dueJobs.length,
    claimed: 0,
    accepted: 0,
    cancelled: 0,
    retried: 0,
    failed: 0,
    skippedConfiguration: false,
  };
  const touchedCampaigns = new Set<string>();

  for (const row of dueJobs) {
    const claimed = await claimMessageJob(row, now);
    if (!claimed) continue;
    summary.claimed += 1;

    const campaignId = campaignIdFromPayload(claimed.payload);
    const body = messageBodyFromPayload(claimed.payload);
    const contact = await marketingContact(claimed.contact_id);

    if (campaignId) touchedCampaigns.add(campaignId);

    if (
      !campaignId ||
      !body ||
      claimed.consent_basis !== "marketing" ||
      !contactStillMarketingEligible(contact) ||
      !(await campaignCanDispatch(campaignId))
    ) {
      await updateMessageJob(
        claimed.id,
        {
          status: "cancelled",
          last_error: "Marketing consent or campaign eligibility no longer valid",
        },
        now,
      );
      summary.cancelled += 1;
      continue;
    }

    await markCampaignDispatching(campaignId);

    const result = await sendQueuedSms({
      jobId: claimed.id,
      to: contact!.phone_e164,
      body,
      settings,
    });

    if (result.accepted) {
      summary.accepted += 1;
      continue;
    }

    if (result.reason === "provider" && claimed.attempts < 3) {
      const delayMinutes = lifecycleRetryDelayMinutes(claimed.attempts);
      await updateMessageJob(
        claimed.id,
        {
          status: "pending",
          not_before: new Date(
            now.getTime() + delayMinutes * 60_000,
          ).toISOString(),
          last_error: result.error ?? "Provider send failed",
        },
        now,
      );
      summary.retried += 1;
    } else {
      await updateMessageJob(
        claimed.id,
        {
          status: "failed",
          last_error: result.error,
        },
        now,
      );
      summary.failed += 1;
    }
  }

  for (const campaignId of touchedCampaigns) {
    await finalizeCampaignIfDone(campaignId);
  }

  return summary;
}

export async function cancelMarketingCampaign(campaignId: string) {
  const campaign = await findCampaign(campaignId);
  if (!campaign) return { found: false, cancelledJobs: 0 };

  const jobs = await db()
    .from("ahmv_phone_message_jobs")
    .update({
      status: "cancelled",
      last_error: "Campaign cancelled by TAKATAK",
      updated_at: new Date().toISOString(),
    })
    .eq("purpose", "marketing_campaign")
    .eq("status", "pending")
    .contains("payload", { campaignId })
    .select("id");

  if (jobs.error) throw jobs.error;

  const update = await db()
    .from("ahmv_phone_campaign_executions")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("takatak_campaign_id", campaignId);

  if (update.error) throw update.error;

  return {
    found: true,
    cancelledJobs: jobs.data?.length ?? 0,
  };
}

export async function marketingCampaignStatus(campaignId: string) {
  const campaign = await findCampaign(campaignId);
  if (!campaign) return null;

  const jobs = await db()
    .from("ahmv_phone_message_jobs")
    .select("status")
    .eq("purpose", "marketing_campaign")
    .contains("payload", { campaignId })
    .limit(5000);

  if (jobs.error) throw jobs.error;

  const counts = {
    pending: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    cancelled: 0,
  };

  for (const row of jobs.data ?? []) {
    const status = String(row.status) as keyof typeof counts;
    if (status in counts) counts[status] += 1;
  }

  return {
    campaignId: campaign.takatak_campaign_id,
    campaignName: campaign.campaign_name,
    scheduledAt: campaign.scheduled_at,
    status: campaign.status,
    targetCount: campaign.target_count,
    queuedCount: campaign.queued_count,
    delivery: counts,
  };
}
