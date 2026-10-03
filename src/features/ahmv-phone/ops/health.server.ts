import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server.ts";

type Settings = Record<string, string | undefined>;

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

async function tableReady(table: string) {
  try {
    const result = await db().from(table).select("id").limit(1);
    return !result.error;
  } catch {
    return false;
  }
}

export async function getAhmvPhoneInternalHealth(
  settings: Settings = process.env,
) {
  const [
    contacts,
    teamPreferences,
    interactions,
    messageJobs,
    eventSnapshots,
    entitlementSyncEvents,
    campaignExecutions,
  ] = await Promise.all([
    tableReady("ahmv_phone_contacts"),
    tableReady("ahmv_phone_team_preferences"),
    tableReady("ahmv_phone_interactions"),
    tableReady("ahmv_phone_message_jobs"),
    tableReady("ahmv_phone_event_snapshots"),
    tableReady("ahmv_phone_entitlement_sync_events"),
    tableReady("ahmv_phone_campaign_executions"),
  ]);

  const databaseReady =
    contacts &&
    teamPreferences &&
    interactions &&
    messageJobs;

  return {
    generatedAt: new Date().toISOString(),
    phone: {
      enabled: settings["AHMV_PHONE_ENABLED"] === "true",
      public: settings["AHMV_PHONE_PUBLIC"] === "true",
      numberConfigured: settings["AHMV_PUBLIC_PHONE"] === "+15816666246",
      webhookOriginConfigured:
        settings["AHMV_WEBHOOK_ORIGIN"] === "https://ahmverdun.ca",
    },
    twilio: {
      accountConfigured: Boolean(settings["TWILIO_ACCOUNT_SID"]?.trim()),
      authConfigured: Boolean(settings["TWILIO_AUTH_TOKEN"]?.trim()),
    },
    database: {
      ready: databaseReady,
      contacts,
      teamPreferences,
      interactions,
      messageJobs,
      eventSnapshots,
      entitlementSyncEvents,
      campaignExecutions,
    },
    features: {
      reminders: {
        enabled: settings["AHMV_PHONE_REMINDERS_ENABLED"] === "true",
        eventSnapshotsReady: eventSnapshots,
        teamMapConfigured:
          Boolean(settings["AHMV_REMINDER_TEAM_MAP_JSON"]?.trim()) &&
          settings["AHMV_REMINDER_TEAM_MAP_JSON"] !== "{}",
      },
      calendar: {
        enabled: settings["AHMV_CALENDAR_LINKS_ENABLED"] === "true",
        signingSecretConfigured:
          (settings["AHMV_CALENDAR_LINK_SECRET"]?.trim().length ?? 0) >= 32,
      },
      campaigns: {
        enabled: settings["AHMV_PHONE_CAMPAIGNS_ENABLED"] === "true",
        projectionReady: campaignExecutions,
        serviceTokenConfigured: Boolean(
          settings["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim(),
        ),
        legalInfoConfigured: (() => {
          try {
            const value = settings["TAKATAK_SMS_CEM_INFO_URL"]?.trim();
            return Boolean(value && new URL(value).protocol === "https:");
          } catch {
            return false;
          }
        })(),
      },
      smartDeparture: {
        enabled: settings["AHMV_SMART_DEPARTURE_ENABLED"] === "true",
        signingSecretConfigured:
          (settings["AHMV_DEPARTURE_LINK_SECRET"]?.trim().length ?? 0) >= 32,
        routeProviderConfigured: Boolean(
          settings["TAKATAK_ROUTE_MATRIX_URL"]?.trim() &&
            settings["TAKATAK_ROUTE_SERVICE_TOKEN"]?.trim(),
        ),
      },
    },
    takatak: {
      membershipSyncEnabled:
        settings["AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED"] === "true",
      membershipProjectionReady: entitlementSyncEvents,
      serviceTokenConfigured: Boolean(
        settings["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim(),
      ),
      entitlementConfigured: Boolean(
        settings["TAKATAK_AHMV_ENTITLEMENT_URL"]?.trim() &&
          settings["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim(),
      ),
      eventsConfigured: Boolean(
        settings["TAKATAK_AHMV_EVENTS_URL"]?.trim() &&
          settings["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim(),
      ),
    },
    demo: {
      enabled: settings["AHMV_PHONE_DEMO_ENABLED"] === "true",
    },
  };
}
