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
  ] = await Promise.all([
    tableReady("ahmv_phone_contacts"),
    tableReady("ahmv_phone_team_preferences"),
    tableReady("ahmv_phone_interactions"),
    tableReady("ahmv_phone_message_jobs"),
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
    },
    takatak: {
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
