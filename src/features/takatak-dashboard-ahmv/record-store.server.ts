import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import type { ControlRecord, ControlRecordStatus } from "./action-state";
import type { TakatakAhmvService } from "./contracts";
import { assertExpectedRevision } from "./revision";
import { assertSafeControlPayload } from "./payload-security";
import { normalizeControlProvenance, type ControlProvenance } from "./provenance";

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
    publishedRevision: row["published_revision"] === null || row["published_revision"] === undefined ? null : Number(row["published_revision"]),
    lastPublishedAt: row["last_published_at"] ? String(row["last_published_at"]) : null,
    payload: row["payload"],
    provenance: normalizeControlProvenance({
      sourceKind: row["source_kind"] as ControlProvenance["sourceKind"] | undefined,
      verificationStatus: row["verification_status"] as ControlProvenance["verificationStatus"] | undefined,
      sourceRef: row["source_ref"] ? String(row["source_ref"]) : null,
      verifiedAt: row["source_verified_at"] ? String(row["source_verified_at"]) : null,
    }),
    createdAt: String(row["created_at"]),
    updatedAt: String(row["updated_at"]),
    archivedAt: row["archived_at"] ? String(row["archived_at"]) : null,
  };
}

export async function getControlRecord(input: {
  organizationId: string;
  service: TakatakAhmvService;
  resourceType: string;
  resourceId: string;
}) {
  const result = await db()
    .from("ahmv_takatak_control_records")
    .select("*")
    .eq("tenant", "ahmverdun")
    .eq("organization_id", input.organizationId)
    .eq("service", input.service)
    .eq("resource_type", input.resourceType)
    .eq("resource_id", input.resourceId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ? mapRecord(result.data) : null;
}

export async function saveControlDraft(input: {
  organizationId: string;
  actorId: string;
  service: TakatakAhmvService;
  resourceType: string;
  resourceId: string;
  payload: unknown;
  provenance?: ControlProvenance | undefined;
  expectedRevision?: number | undefined;
  now?: Date | undefined;
}) {
  assertSafeControlPayload(input.payload);
  const now = (input.now ?? new Date()).toISOString();
  const existing = await getControlRecord(input);
  const provenance = input.provenance ?? existing?.provenance ?? normalizeControlProvenance(undefined);

  if (!existing) {
    if (input.expectedRevision !== undefined) {
      throw new Error("control_record_missing_for_expected_revision");
    }

    const inserted = await db()
      .from("ahmv_takatak_control_records")
      .insert({
        tenant: "ahmverdun",
        organization_id: input.organizationId,
        service: input.service,
        resource_type: input.resourceType,
        resource_id: input.resourceId,
        status: "draft",
        revision: 1,
        payload: input.payload,
        source_kind: provenance.sourceKind,
        verification_status: provenance.verificationStatus,
        source_ref: provenance.sourceRef,
        source_verified_at: provenance.verifiedAt,
        created_by: input.actorId,
        updated_by: input.actorId,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (inserted.error) {
      if (inserted.error.code === "23505") {
        throw new Error("control_record_create_conflict");
      }
      throw inserted.error;
    }
    return mapRecord(inserted.data);
  }

  const nextRevision = assertExpectedRevision(
    existing.revision,
    input.expectedRevision,
  );

  const updated = await db()
    .from("ahmv_takatak_control_records")
    .update({
      status: "draft",
      revision: nextRevision,
      payload: input.payload,
      source_kind: provenance.sourceKind,
      verification_status: provenance.verificationStatus,
      source_ref: provenance.sourceRef,
      source_verified_at: provenance.verifiedAt,
      updated_by: input.actorId,
      archived_at: null,
      updated_at: now,
    })
    .eq("id", existing.id)
    .eq("revision", existing.revision)
    .select("*")
    .maybeSingle();

  if (updated.error) throw updated.error;
  if (!updated.data) throw new Error("control_record_revision_conflict");
  return mapRecord(updated.data);
}

async function transitionRecord(input: {
  organizationId: string;
  actorId: string;
  service: TakatakAhmvService;
  resourceType: string;
  resourceId: string;
  expectedRevision: number;
  targetStatus: Extract<ControlRecordStatus, "draft" | "archived">;
  now?: Date | undefined;
}) {
  const existing = await getControlRecord(input);
  if (!existing) throw new Error("control_record_not_found");

  const nextRevision = assertExpectedRevision(
    existing.revision,
    input.expectedRevision,
  );
  const now = (input.now ?? new Date()).toISOString();

  if (input.targetStatus === "archived" && existing.status === "archived") {
    throw new Error("control_record_already_archived");
  }
  if (input.targetStatus === "draft" && existing.status !== "archived") {
    throw new Error("control_record_not_archived");
  }

  const updated = await db()
    .from("ahmv_takatak_control_records")
    .update({
      status: input.targetStatus,
      revision: nextRevision,
      updated_by: input.actorId,
      archived_at: input.targetStatus === "archived" ? now : null,
      updated_at: now,
    })
    .eq("id", existing.id)
    .eq("revision", existing.revision)
    .select("*")
    .maybeSingle();

  if (updated.error) throw updated.error;
  if (!updated.data) throw new Error("control_record_revision_conflict");
  return mapRecord(updated.data);
}

export function archiveControlRecord(
  input: Omit<Parameters<typeof transitionRecord>[0], "targetStatus">,
) {
  return transitionRecord({ ...input, targetStatus: "archived" });
}

export function restoreControlRecord(
  input: Omit<Parameters<typeof transitionRecord>[0], "targetStatus">,
) {
  return transitionRecord({ ...input, targetStatus: "draft" });
}


export async function markControlRevisionPublished(input: {
  organizationId: string;
  actorId: string;
  service: TakatakAhmvService;
  resourceType: string;
  resourceId: string;
  publishedRevision: number;
  now?: Date | undefined;
}) {
  const existing = await getControlRecord(input);
  if (!existing) throw new Error("control_record_not_found");
  if (
    !Number.isInteger(input.publishedRevision) ||
    input.publishedRevision < 1 ||
    input.publishedRevision > existing.revision
  ) {
    throw new Error("invalid_published_revision");
  }

  const now = (input.now ?? new Date()).toISOString();
  const nextStatus =
    existing.revision === input.publishedRevision ? "active" : existing.status;

  const updated = await db()
    .from("ahmv_takatak_control_records")
    .update({
      published_revision: input.publishedRevision,
      last_published_at: now,
      status: nextStatus,
      updated_by: input.actorId,
      updated_at: now,
    })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (updated.error) throw updated.error;
  return mapRecord(updated.data);
}


export async function listControlRecords(input: {
  organizationId: string;
  service?: TakatakAhmvService | undefined;
  status?: ControlRecordStatus | undefined;
  resourceType?: string | undefined;
  sourceKind?: ControlProvenance["sourceKind"] | undefined;
  verificationStatus?: ControlProvenance["verificationStatus"] | undefined;
  search?: string | undefined;
  limit?: number | undefined;
}) {
  let query = db()
    .from("ahmv_takatak_control_records")
    .select("*")
    .eq("tenant", "ahmverdun")
    .eq("organization_id", input.organizationId);

  if (input.service) query = query.eq("service", input.service);
  if (input.status) query = query.eq("status", input.status);
  if (input.resourceType) query = query.eq("resource_type", input.resourceType);
  if (input.sourceKind) query = query.eq("source_kind", input.sourceKind);
  if (input.verificationStatus) query = query.eq("verification_status", input.verificationStatus);

  const search = input.search?.trim();
  if (search) {
    if (!/^[A-Za-z0-9._:@/-]{1,80}$/.test(search)) {
      throw new Error("invalid_control_record_search");
    }
    query = query.ilike("resource_id", `%${search}%`);
  }

  const limit = Math.max(1, Math.min(100, input.limit ?? 25));
  const result = await query
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (result.error) throw result.error;
  return (result.data ?? []).map(mapRecord);
}
