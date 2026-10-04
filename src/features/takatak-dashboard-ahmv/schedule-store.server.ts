import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import type { ControlRecord } from "./action-state";
import type { TakatakAhmvService } from "./contracts";
import type { TakatakAhmvPrincipal } from "./rbac";
import { assertRevisionApprovedForPublish } from "./review-store.server";
import {
  normalizePublicationSchedule,
  type PublicationScheduleWindow,
} from "./schedule-policy";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

export type PublicationScheduleStatus =
  | "scheduled"
  | "claimed"
  | "enqueued"
  | "cancelled"
  | "stale"
  | "failed";

export type ControlPublicationSchedule = {
  id: string;
  organizationId: string;
  service: TakatakAhmvService;
  controlRecordId: string;
  revision: number;
  publishAt: string;
  expiresAt: string | null;
  status: PublicationScheduleStatus;
  requestedBy: string;
  requestedAt: string;
  claimedAt: string | null;
  completedAt: string | null;
  lastErrorCode: string | null;
};

function mapSchedule(row: Record<string, unknown>): ControlPublicationSchedule {
  return {
    id: String(row["id"]),
    organizationId: String(row["organization_id"]),
    service: String(row["service"]) as TakatakAhmvService,
    controlRecordId: String(row["control_record_id"]),
    revision: Number(row["revision"]),
    publishAt: String(row["publish_at"]),
    expiresAt: row["expires_at"] ? String(row["expires_at"]) : null,
    status: row["status"] as PublicationScheduleStatus,
    requestedBy: String(row["requested_by"]),
    requestedAt: String(row["requested_at"]),
    claimedAt: row["claimed_at"] ? String(row["claimed_at"]) : null,
    completedAt: row["completed_at"] ? String(row["completed_at"]) : null,
    lastErrorCode: row["last_error_code"]
      ? String(row["last_error_code"])
      : null,
  };
}

export async function scheduleControlPublication(input: {
  record: ControlRecord<unknown>;
  principal: TakatakAhmvPrincipal;
  publishAt: string;
  expiresAt?: string | null | undefined;
  now?: Date | undefined;
}) {
  if (
    input.principal.organizationId !== input.record.organizationId ||
    !input.principal.enabledServices.includes(
      input.record.service as TakatakAhmvService,
    ) ||
    !["owner", "admin", "manager"].includes(input.principal.role)
  ) {
    throw new Error("publication_schedule_forbidden");
  }
  if (!["website", "seo"].includes(input.record.service)) {
    throw new Error("publication_schedule_service_not_supported");
  }
  if (input.record.status === "archived") {
    throw new Error("publication_schedule_archived_record");
  }

  await assertRevisionApprovedForPublish({
    controlRecordId: input.record.id,
    revision: input.record.revision,
  });

  const window = normalizePublicationSchedule({
    publishAt: input.publishAt,
    expiresAt: input.expiresAt,
    now: input.now,
  });

  const result = await db()
    .from("ahmv_takatak_control_publication_schedules")
    .insert({
      tenant: "ahmverdun",
      organization_id: input.record.organizationId,
      service: input.record.service,
      control_record_id: input.record.id,
      revision: input.record.revision,
      publish_at: window.publishAt,
      expires_at: window.expiresAt,
      status: "scheduled",
      requested_by: input.principal.actorId,
      requested_at: (input.now ?? new Date()).toISOString(),
    })
    .select("*")
    .single();

  if (result.error) {
    if (result.error.code === "23505") {
      throw new Error("publication_schedule_already_exists_for_revision");
    }
    throw result.error;
  }
  return mapSchedule(result.data);
}

export async function getPublicationScheduleForRevision(input: {
  controlRecordId: string;
  revision: number;
}) {
  const result = await db()
    .from("ahmv_takatak_control_publication_schedules")
    .select("*")
    .eq("control_record_id", input.controlRecordId)
    .eq("revision", input.revision)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ? mapSchedule(result.data) : null;
}

export async function cancelControlPublicationSchedule(input: {
  scheduleId: string;
  principal: TakatakAhmvPrincipal;
  now?: Date | undefined;
}) {
  const found = await db()
    .from("ahmv_takatak_control_publication_schedules")
    .select("*")
    .eq("id", input.scheduleId)
    .maybeSingle();

  if (found.error) throw found.error;
  if (!found.data) throw new Error("publication_schedule_not_found");

  const schedule = mapSchedule(found.data);
  const canCancel =
    schedule.organizationId === input.principal.organizationId &&
    input.principal.enabledServices.includes(schedule.service) &&
    (schedule.requestedBy === input.principal.actorId ||
      input.principal.role === "owner" ||
      input.principal.role === "admin");

  if (!canCancel) throw new Error("publication_schedule_cancel_forbidden");
  if (schedule.status !== "scheduled") {
    throw new Error("publication_schedule_cannot_be_cancelled");
  }

  const updated = await db()
    .from("ahmv_takatak_control_publication_schedules")
    .update({
      status: "cancelled",
      completed_at: (input.now ?? new Date()).toISOString(),
      updated_at: (input.now ?? new Date()).toISOString(),
    })
    .eq("id", schedule.id)
    .eq("status", "scheduled")
    .select("*")
    .maybeSingle();

  if (updated.error) throw updated.error;
  if (!updated.data) throw new Error("publication_schedule_cancel_conflict");
  return mapSchedule(updated.data);
}

export async function claimDuePublicationSchedule(now = new Date()) {
  const result = await db().rpc("ahmv_claim_takatak_publication_schedule", {
    p_now: now.toISOString(),
  });
  if (result.error) throw result.error;
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  return (row as Record<string, unknown> | null) ?? null;
}

export async function finishPublicationSchedule(input: {
  scheduleId: string;
  status: Extract<PublicationScheduleStatus, "enqueued" | "stale" | "failed">;
  errorCode?: string | undefined;
  now?: Date | undefined;
}) {
  const result = await db().rpc("ahmv_finish_takatak_publication_schedule", {
    p_schedule_id: input.scheduleId,
    p_status: input.status,
    p_error_code: input.errorCode ?? null,
    p_now: (input.now ?? new Date()).toISOString(),
  });
  if (result.error) throw result.error;
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!row) throw new Error("publication_schedule_finish_returned_no_result");
  return row;
}

export function scheduleWindowFromRecord(
  schedule: ControlPublicationSchedule,
): PublicationScheduleWindow {
  return {
    publishAt: schedule.publishAt,
    expiresAt: schedule.expiresAt,
  };
}
