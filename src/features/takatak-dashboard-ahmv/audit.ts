import type { TakatakAhmvCommand } from "./command";
import type { ControlRecordStatus } from "./action-state";

export type TakatakAhmvAuditOutcome =
  | "accepted"
  | "completed"
  | "rejected"
  | "failed";

export type TakatakAhmvAuditEvent = {
  tenant: "ahmverdun";
  organizationId: string;
  actorId: string;
  requestId: string;
  idempotencyKey: string;
  service: TakatakAhmvCommand["service"];
  action: TakatakAhmvCommand["action"];
  resourceType: string;
  resourceId: string;
  outcome: TakatakAhmvAuditOutcome;
  payloadFingerprint: string;
  previousRevision: number | null;
  nextRevision: number | null;
  previousStatus: ControlRecordStatus | null;
  nextStatus: ControlRecordStatus | null;
  occurredAt: string;
};

export function createAuditEvent(
  command: TakatakAhmvCommand,
  input: {
    outcome: TakatakAhmvAuditOutcome;
    previousRevision?: number | null;
    nextRevision?: number | null;
    previousStatus?: ControlRecordStatus | null;
    nextStatus?: ControlRecordStatus | null;
    occurredAt?: Date;
  },
): TakatakAhmvAuditEvent {
  return {
    tenant: command.tenant,
    organizationId: command.organizationId,
    actorId: command.actorId,
    requestId: command.requestId,
    idempotencyKey: command.idempotencyKey,
    service: command.service,
    action: command.action,
    resourceType: command.resourceType,
    resourceId: command.resourceId,
    outcome: input.outcome,
    payloadFingerprint: command.fingerprint,
    previousRevision: input.previousRevision ?? null,
    nextRevision: input.nextRevision ?? null,
    previousStatus: input.previousStatus ?? null,
    nextStatus: input.nextStatus ?? null,
    occurredAt: (input.occurredAt ?? new Date()).toISOString(),
  };
}
