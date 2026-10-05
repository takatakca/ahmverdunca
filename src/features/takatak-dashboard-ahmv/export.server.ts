import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import type { ControlRecord, ControlRecordStatus } from "./action-state";
import type { ControlRecordVersion } from "./version-store.server";
import { normalizeControlProvenance, type ControlProvenance } from "./provenance";
import { buildPortableControlBundle } from "./portability";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function mapRecord(row: Record<string, unknown>): ControlRecord<unknown> {
  return {
    id: String(row["id"]),
    tenant: "ahmverdun",
    organizationId: String(row["organization_id"]),
    service: String(row["service"]),
    resourceType: String(row["resource_type"]),
    resourceId: String(row["resource_id"]),
    status: row["status"] as ControlRecordStatus,
    revision: Number(row["revision"]),
    publishedRevision:
      row["published_revision"] === null || row["published_revision"] === undefined
        ? null
        : Number(row["published_revision"]),
    lastPublishedAt: row["last_published_at"]
      ? String(row["last_published_at"])
      : null,
    payload: row["payload"],
    provenance: normalizeControlProvenance({
      sourceKind: row["source_kind"] as ControlProvenance["sourceKind"] | undefined,
      verificationStatus: row["verification_status"] as
        | ControlProvenance["verificationStatus"]
        | undefined,
      sourceRef: row["source_ref"] ? String(row["source_ref"]) : null,
      verifiedAt: row["source_verified_at"]
        ? String(row["source_verified_at"])
        : null,
    }),
    createdAt: String(row["created_at"]),
    updatedAt: String(row["updated_at"]),
    archivedAt: row["archived_at"] ? String(row["archived_at"]) : null,
  };
}

function mapVersion(row: Record<string, unknown>): ControlRecordVersion {
  return {
    id: String(row["id"]),
    controlRecordId: String(row["control_record_id"]),
    revision: Number(row["revision"]),
    status: row["status"] as ControlRecordVersion["status"],
    payload: row["payload"],
    provenance: normalizeControlProvenance({
      sourceKind: row["source_kind"] as ControlProvenance["sourceKind"] | undefined,
      verificationStatus: row["verification_status"] as
        | ControlProvenance["verificationStatus"]
        | undefined,
      sourceRef: row["source_ref"] ? String(row["source_ref"]) : null,
      verifiedAt: row["source_verified_at"]
        ? String(row["source_verified_at"])
        : null,
    }),
    actorId: String(row["actor_id"]),
    createdAt: String(row["created_at"]),
  };
}

async function fetchOrganizationRecords(organizationId: string) {
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; from < 10_000; from += 1_000) {
    const result = await db()
      .from("ahmv_takatak_control_records")
      .select("*")
      .eq("tenant", "ahmverdun")
      .eq("organization_id", organizationId)
      .order("id", { ascending: true })
      .range(from, from + 999);
    if (result.error) throw result.error;
    const page = (result.data ?? []) as Record<string, unknown>[];
    rows.push(...page);
    if (page.length < 1_000) break;
    if (from === 9_000) throw new Error("portable_record_export_limit_exceeded");
  }
  return rows.map(mapRecord);
}

async function fetchVersions(recordIds: readonly string[]) {
  const rows: Record<string, unknown>[] = [];
  for (let offset = 0; offset < recordIds.length; offset += 100) {
    const ids = recordIds.slice(offset, offset + 100);
    if (!ids.length) continue;
    const result = await db()
      .from("ahmv_takatak_control_record_versions")
      .select("*")
      .in("control_record_id", ids)
      .order("control_record_id", { ascending: true })
      .order("revision", { ascending: true });
    if (result.error) throw result.error;
    rows.push(...((result.data ?? []) as Record<string, unknown>[]));
  }
  return rows.map(mapVersion);
}

export async function exportTakatakAhmvControlPlane(
  organizationId: string,
  generatedAt = new Date(),
) {
  const records = await fetchOrganizationRecords(organizationId);
  const versions = await fetchVersions(records.map((record) => record.id));
  return buildPortableControlBundle({
    organizationId,
    records,
    versions,
    generatedAt,
  });
}
