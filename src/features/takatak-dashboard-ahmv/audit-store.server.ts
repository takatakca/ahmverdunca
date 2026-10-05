import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import type { TakatakAhmvAuditEvent } from "./audit";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

export async function appendControlAudit(event: TakatakAhmvAuditEvent) {
  const result = await db()
    .from("ahmv_takatak_control_audit")
    .insert({
      tenant: event.tenant,
      organization_id: event.organizationId,
      actor_id: event.actorId,
      request_id: event.requestId,
      idempotency_key: event.idempotencyKey,
      service: event.service,
      action: event.action,
      resource_type: event.resourceType,
      resource_id: event.resourceId,
      outcome: event.outcome,
      payload_fingerprint: event.payloadFingerprint,
      previous_revision: event.previousRevision,
      next_revision: event.nextRevision,
      previous_status: event.previousStatus,
      next_status: event.nextStatus,
      occurred_at: event.occurredAt,
    });

  if (result.error) throw result.error;
}


export async function listControlAudit(input: {
  organizationId: string;
  service?: string | undefined;
  action?: string | undefined;
  resourceType?: string | undefined;
  resourceId?: string | undefined;
  limit?: number | undefined;
}) {
  let query = db()
    .from("ahmv_takatak_control_audit")
    .select(
      "id,organization_id,actor_id,request_id,idempotency_key,service,action,resource_type,resource_id,outcome,payload_fingerprint,previous_revision,next_revision,previous_status,next_status,occurred_at",
    )
    .eq("tenant", "ahmverdun")
    .eq("organization_id", input.organizationId);

  if (input.service) query = query.eq("service", input.service);
  if (input.action) query = query.eq("action", input.action);
  if (input.resourceType) query = query.eq("resource_type", input.resourceType);
  if (input.resourceId) query = query.eq("resource_id", input.resourceId);

  const limit = Math.max(1, Math.min(200, input.limit ?? 50));
  const result = await query
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (result.error) throw result.error;
  return result.data ?? [];
}
