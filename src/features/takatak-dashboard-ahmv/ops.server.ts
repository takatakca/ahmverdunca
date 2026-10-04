import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import { TAKATAK_AHMV_ADAPTER_DESCRIPTORS } from "./adapters";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

async function count(
  table: string,
  filters: readonly [string, string | number | boolean][],
) {
  let query = db().from(table).select("id", { count: "exact", head: true });
  for (const [column, value] of filters) {
    query = query.eq(column, value);
  }
  const result = await query;
  if (result.error) throw result.error;
  return result.count ?? 0;
}

export async function getTakatakAhmvControlPlaneOpsSummary() {
  const [
    records,
    drafts,
    active,
    archived,
    jobsQueued,
    jobsRunning,
    jobsFailed,
    jobsSucceeded,
    jobsCancelled,
  ] = await Promise.all([
    count("ahmv_takatak_control_records", []),
    count("ahmv_takatak_control_records", [["status", "draft"]]),
    count("ahmv_takatak_control_records", [["status", "active"]]),
    count("ahmv_takatak_control_records", [["status", "archived"]]),
    count("ahmv_takatak_control_jobs", [["status", "queued"]]),
    count("ahmv_takatak_control_jobs", [["status", "running"]]),
    count("ahmv_takatak_control_jobs", [["status", "failed"]]),
    count("ahmv_takatak_control_jobs", [["status", "succeeded"]]),
    count("ahmv_takatak_control_jobs", [["status", "cancelled"]]),
  ]);

  const readiness = Object.fromEntries(
    ["contract_only", "configured", "active", "degraded"].map((state) => [
      state,
      TAKATAK_AHMV_ADAPTER_DESCRIPTORS.filter(
        (adapter) => adapter.readiness === state,
      ).length,
    ]),
  );

  return {
    generatedAt: new Date().toISOString(),
    records: { total: records, draft: drafts, active, archived },
    jobs: {
      queued: jobsQueued,
      running: jobsRunning,
      failed: jobsFailed,
      succeeded: jobsSucceeded,
      cancelled: jobsCancelled,
    },
    adapters: readiness,
    privacy: {
      containsProviderSecrets: false,
      containsPayloads: false,
      containsPlayerRosterData: false,
    },
    activation: {
      autoMountedInDashboard: false,
      billingAuthority: "takatak" as const,
    },
  };
}
