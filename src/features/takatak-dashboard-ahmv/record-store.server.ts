import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import type { ControlRecord, ControlRecordStatus } from "./action-state";
import type { TakatakAhmvService } from "./contracts";
import { assertExpectedRevision } from "./revision";
import { assertSafeControlPayload } from "./payload-security";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function mapRecord(row: Record<string, unknown>): ControlRecord<unknown> {
  return {
    id: String(row["id"]),
    tenant: "ahmverdun",
    organizationId: String(row["organization_id"]),
    status: row["status"] as ControlRecordStatus,
    revision: Number(row["revision"]),
    payload: row["payload"],
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
  expectedRevision?: number | undefined;
  now?: Date | undefined;
}) {
  assertSafeControlPayload(input.payload);
  const now = (input.now ?? new Date()).toISOString();
  const existing = await getControlRecord(input);

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
