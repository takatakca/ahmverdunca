import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import type { TakatakAhmvCommand } from "./command";
import { assertIdempotencyCompatible } from "./idempotency";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

export async function enqueueControlJob(command: TakatakAhmvCommand) {
  if (!["publish", "execute", "delete"].includes(command.action)) {
    throw new Error("control_action_is_not_async");
  }

  const inserted = await db()
    .from("ahmv_takatak_control_jobs")
    .insert({
      tenant: command.tenant,
      organization_id: command.organizationId,
      actor_id: command.actorId,
      request_id: command.requestId,
      idempotency_key: command.idempotencyKey,
      request_fingerprint: command.fingerprint,
      service: command.service,
      action: command.action,
      resource_type: command.resourceType,
      resource_id: command.resourceId,
      expected_revision: command.expectedRevision ?? null,
      payload: command.payload,
      status: "queued",
    })
    .select("id,idempotency_key,request_fingerprint,status,attempts,max_attempts")
    .single();

  if (!inserted.error) {
    return { duplicate: false, job: inserted.data };
  }

  if (inserted.error.code !== "23505") throw inserted.error;

  const existing = await db()
    .from("ahmv_takatak_control_jobs")
    .select("id,idempotency_key,request_fingerprint,status,attempts,max_attempts")
    .eq("idempotency_key", command.idempotencyKey)
    .single();

  if (existing.error) throw existing.error;
  assertIdempotencyCompatible(
    {
      key: String(existing.data.idempotency_key),
      fingerprint: String(existing.data.request_fingerprint),
      status:
        existing.data.status === "succeeded"
          ? "completed"
          : existing.data.status === "failed"
            ? "failed"
            : "pending",
    },
    command.fingerprint,
  );

  return { duplicate: true, job: existing.data };
}

export async function claimNextControlJob(now = new Date()) {
  const result = await db().rpc("ahmv_claim_takatak_control_job", {
    p_now: now.toISOString(),
  });

  if (result.error) throw result.error;
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  return row ?? null;
}

export async function finishControlJob(input: {
  jobId: string;
  success: boolean;
  errorCode?: string | undefined;
  externalReference?: string | undefined;
  retryDelaySeconds?: number | undefined;
  retryable?: boolean | undefined;
  now?: Date | undefined;
}) {
  const result = await db().rpc("ahmv_finish_takatak_control_job", {
    p_job_id: input.jobId,
    p_success: input.success,
    p_error_code: input.errorCode ?? null,
    p_external_reference: input.externalReference ?? null,
    p_retry_delay_seconds: Math.max(
      0,
      Math.min(86_400, input.retryDelaySeconds ?? 60),
    ),
    p_retryable: input.retryable ?? true,
    p_now: (input.now ?? new Date()).toISOString(),
  });

  if (result.error) throw result.error;
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!row) throw new Error("control_job_finish_returned_no_result");
  return row;
}


export async function cancelControlJob(jobId: string, now = new Date()) {
  const result = await db().rpc("ahmv_cancel_takatak_control_job", {
    p_job_id: jobId,
    p_now: now.toISOString(),
  });

  if (result.error) throw result.error;
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!row) throw new Error("control_job_cancel_returned_no_result");
  return row;
}


export async function listControlJobs(input: {
  organizationId: string;
  service?: string | undefined;
  status?: string | undefined;
  resourceType?: string | undefined;
  limit?: number | undefined;
}) {
  let query = db()
    .from("ahmv_takatak_control_jobs")
    .select(
      "id,organization_id,actor_id,request_id,idempotency_key,service,action,resource_type,resource_id,expected_revision,status,attempts,max_attempts,available_at,started_at,completed_at,last_error_code,external_reference,created_at,updated_at",
    )
    .eq("tenant", "ahmverdun")
    .eq("organization_id", input.organizationId);

  if (input.service) query = query.eq("service", input.service);
  if (input.status) query = query.eq("status", input.status);
  if (input.resourceType) query = query.eq("resource_type", input.resourceType);

  const limit = Math.max(1, Math.min(100, input.limit ?? 25));
  const result = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (result.error) throw result.error;
  return result.data ?? [];
}
