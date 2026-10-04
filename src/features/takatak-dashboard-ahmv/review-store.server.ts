import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import type { ControlRecord } from "./action-state";
import type { TakatakAhmvService } from "./contracts";
import type { TakatakAhmvPrincipal } from "./rbac";
import {
  assertCanRequestControlReview,
  assertCanResolveControlReview,
  type ControlReviewDecision,
} from "./review-policy";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

export type ControlReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type ControlReview = {
  id: string;
  organizationId: string;
  service: TakatakAhmvService;
  controlRecordId: string;
  revision: number;
  status: ControlReviewStatus;
  requestedBy: string;
  requestedAt: string;
  resolvedBy: string | null;
  resolvedAt: string | null;
  decisionNote: string | null;
  selfApprovalOverride: boolean;
};

function mapReview(row: Record<string, unknown>): ControlReview {
  return {
    id: String(row["id"]),
    organizationId: String(row["organization_id"]),
    service: String(row["service"]) as TakatakAhmvService,
    controlRecordId: String(row["control_record_id"]),
    revision: Number(row["revision"]),
    status: row["status"] as ControlReviewStatus,
    requestedBy: String(row["requested_by"]),
    requestedAt: String(row["requested_at"]),
    resolvedBy: row["resolved_by"] ? String(row["resolved_by"]) : null,
    resolvedAt: row["resolved_at"] ? String(row["resolved_at"]) : null,
    decisionNote: row["decision_note"] ? String(row["decision_note"]) : null,
    selfApprovalOverride: row["self_approval_override"] === true,
  };
}

function cleanDecisionNote(value: string | undefined) {
  const note = value?.trim() ?? "";
  if (note.length > 2_000) throw new Error("control_review_note_too_long");
  return note || null;
}

export async function requestControlReview(input: {
  record: ControlRecord<unknown>;
  principal: TakatakAhmvPrincipal;
  now?: Date | undefined;
}) {
  assertCanRequestControlReview(input.principal, input.record.service as TakatakAhmvService);
  if (input.principal.organizationId !== input.record.organizationId) {
    throw new Error("control_review_organization_mismatch");
  }
  if (input.record.status === "archived") {
    throw new Error("control_review_archived_record");
  }

  const result = await db()
    .from("ahmv_takatak_control_reviews")
    .insert({
      tenant: "ahmverdun",
      organization_id: input.record.organizationId,
      service: input.record.service,
      control_record_id: input.record.id,
      revision: input.record.revision,
      status: "pending",
      requested_by: input.principal.actorId,
      requested_at: (input.now ?? new Date()).toISOString(),
    })
    .select("*")
    .single();

  if (result.error) {
    if (result.error.code === "23505") {
      throw new Error("control_review_already_exists_for_revision");
    }
    throw result.error;
  }

  return mapReview(result.data);
}

export async function getControlReviewForRevision(input: {
  controlRecordId: string;
  revision: number;
}) {
  const result = await db()
    .from("ahmv_takatak_control_reviews")
    .select("*")
    .eq("control_record_id", input.controlRecordId)
    .eq("revision", input.revision)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ? mapReview(result.data) : null;
}

export async function resolveControlReview(input: {
  reviewId: string;
  principal: TakatakAhmvPrincipal;
  decision: ControlReviewDecision;
  decisionNote?: string | undefined;
  ownerOverrideReason?: string | undefined;
  now?: Date | undefined;
}) {
  const found = await db()
    .from("ahmv_takatak_control_reviews")
    .select("*")
    .eq("id", input.reviewId)
    .maybeSingle();

  if (found.error) throw found.error;
  if (!found.data) throw new Error("control_review_not_found");

  const review = mapReview(found.data);
  if (review.status !== "pending") throw new Error("control_review_already_resolved");
  if (review.organizationId !== input.principal.organizationId) {
    throw new Error("control_review_organization_mismatch");
  }

  assertCanResolveControlReview({
    principal: input.principal,
    service: review.service,
    requestedBy: review.requestedBy,
    ownerOverrideReason: input.ownerOverrideReason,
  });

  const selfApprovalOverride =
    input.principal.actorId === review.requestedBy &&
    input.principal.role === "owner";

  const updated = await db()
    .from("ahmv_takatak_control_reviews")
    .update({
      status: input.decision,
      resolved_by: input.principal.actorId,
      resolved_at: (input.now ?? new Date()).toISOString(),
      decision_note: cleanDecisionNote(
        input.decisionNote ?? input.ownerOverrideReason,
      ),
      self_approval_override: selfApprovalOverride,
    })
    .eq("id", review.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (updated.error) throw updated.error;
  if (!updated.data) throw new Error("control_review_resolution_conflict");
  return mapReview(updated.data);
}

export async function assertRevisionApprovedForPublish(input: {
  controlRecordId: string;
  revision: number;
}) {
  const review = await getControlReviewForRevision(input);
  if (!review || review.status !== "approved") {
    throw new Error("control_revision_not_approved");
  }
  return review;
}

export async function cancelPendingControlReview(input: {
  controlRecordId: string;
  revision: number;
  actorId: string;
  now?: Date | undefined;
}) {
  const review = await getControlReviewForRevision(input);
  if (!review) return null;
  if (review.status !== "pending") return review;
  if (review.requestedBy !== input.actorId) {
    throw new Error("control_review_cancel_forbidden");
  }

  const result = await db()
    .from("ahmv_takatak_control_reviews")
    .update({
      status: "cancelled",
      resolved_by: input.actorId,
      resolved_at: (input.now ?? new Date()).toISOString(),
    })
    .eq("id", review.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (result.error) throw result.error;
  if (!result.data) throw new Error("control_review_cancel_conflict");
  return mapReview(result.data);
}


export async function listControlReviews(input: {
  organizationId: string;
  status?: ControlReviewStatus | undefined;
  service?: TakatakAhmvService | undefined;
  limit?: number | undefined;
}) {
  let query = db()
    .from("ahmv_takatak_control_reviews")
    .select(
      "id,organization_id,service,control_record_id,revision,status,requested_by,requested_at,resolved_by,resolved_at,decision_note,self_approval_override",
    )
    .eq("tenant", "ahmverdun")
    .eq("organization_id", input.organizationId);

  if (input.status) query = query.eq("status", input.status);
  if (input.service) query = query.eq("service", input.service);

  const limit = Math.max(1, Math.min(100, input.limit ?? 25));
  const result = await query
    .order("requested_at", { ascending: false })
    .limit(limit);

  if (result.error) throw result.error;
  return (result.data ?? []).map(mapReview);
}
