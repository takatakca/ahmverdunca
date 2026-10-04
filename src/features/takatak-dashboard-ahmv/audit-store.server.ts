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
