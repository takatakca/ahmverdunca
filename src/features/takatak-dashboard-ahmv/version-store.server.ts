import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import type { TakatakAhmvService } from "./contracts";
import { getControlRecord, saveControlDraft } from "./record-store.server";
import { normalizeControlProvenance, type ControlProvenance } from "./provenance";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

export type ControlRecordVersion = {
  id: string;
  controlRecordId: string;
  revision: number;
  status: "draft" | "queued" | "active" | "archived";
  payload: unknown;
  provenance: ControlProvenance;
  actorId: string;
  createdAt: string;
};

function mapVersion(row: Record<string, unknown>): ControlRecordVersion {
  return {
    id: String(row["id"]),
    controlRecordId: String(row["control_record_id"]),
    revision: Number(row["revision"]),
    status: row["status"] as ControlRecordVersion["status"],
    payload: row["payload"],
    provenance: normalizeControlProvenance({
      sourceKind: row["source_kind"] as ControlProvenance["sourceKind"] | undefined,
      verificationStatus: row["verification_status"] as ControlProvenance["verificationStatus"] | undefined,
      sourceRef: row["source_ref"] ? String(row["source_ref"]) : null,
      verifiedAt: row["source_verified_at"] ? String(row["source_verified_at"]) : null,
    }),
    actorId: String(row["actor_id"]),
    createdAt: String(row["created_at"]),
  };
}

export async function listControlRecordVersions(input: {
  organizationId: string;
  service: TakatakAhmvService;
  resourceType: string;
  resourceId: string;
  limit?: number | undefined;
}) {
  const current = await getControlRecord(input);
  if (!current) return [];

  const limit = Math.max(1, Math.min(100, input.limit ?? 25));
  const result = await db()
    .from("ahmv_takatak_control_record_versions")
    .select("*")
    .eq("control_record_id", current.id)
    .order("revision", { ascending: false })
    .limit(limit);

  if (result.error) throw result.error;
  return (result.data ?? []).map(mapVersion);
}

export async function getControlRecordVersion(input: {
  organizationId: string;
  service: TakatakAhmvService;
  resourceType: string;
  resourceId: string;
  revision: number;
}) {
  const current = await getControlRecord(input);
  if (!current) return null;

  const result = await db()
    .from("ahmv_takatak_control_record_versions")
    .select("*")
    .eq("control_record_id", current.id)
    .eq("revision", input.revision)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ? mapVersion(result.data) : null;
}

export async function restoreControlRecordVersion(input: {
  organizationId: string;
  actorId: string;
  service: TakatakAhmvService;
  resourceType: string;
  resourceId: string;
  revisionToRestore: number;
  expectedCurrentRevision: number;
}) {
  const historical = await getControlRecordVersion({
    organizationId: input.organizationId,
    service: input.service,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    revision: input.revisionToRestore,
  });

  if (!historical) throw new Error("control_record_version_not_found");

  return saveControlDraft({
    organizationId: input.organizationId,
    actorId: input.actorId,
    service: input.service,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    expectedRevision: input.expectedCurrentRevision,
    payload: historical.payload,
    provenance: historical.provenance,
  });
}
