import type { TakatakAhmvCommand } from "./command";
import { createAuditEvent } from "./audit";
import { appendControlAudit } from "./audit-store.server";
import { enqueueControlJob } from "./job-store.server";
import {
  archiveControlRecord,
  getControlRecord,
  restoreControlRecord,
  saveControlDraft,
} from "./record-store.server";
import {
  assertPrincipalCanPerform,
  type TakatakAhmvPrincipal,
} from "./rbac";
import { assertExpectedRevision } from "./revision";

function assertCommandMatchesPrincipal(
  command: TakatakAhmvCommand,
  principal: TakatakAhmvPrincipal,
) {
  if (
    command.organizationId !== principal.organizationId ||
    command.actorId !== principal.actorId
  ) {
    throw new Error("control_principal_scope_mismatch");
  }
  assertPrincipalCanPerform(principal, command.service, command.action);
}

export async function executeTakatakAhmvControlCommand(
  command: TakatakAhmvCommand,
  principal: TakatakAhmvPrincipal,
) {
  assertCommandMatchesPrincipal(command, principal);

  const existing = await getControlRecord(command);

  if (command.action === "read") {
    return { mode: "read" as const, record: existing };
  }

  if (command.action === "save_draft") {
    const record = await saveControlDraft({
      organizationId: command.organizationId,
      actorId: command.actorId,
      service: command.service,
      resourceType: command.resourceType,
      resourceId: command.resourceId,
      payload: command.payload,
      expectedRevision: command.expectedRevision,
    });
    await appendControlAudit(
      createAuditEvent(command, {
        outcome: "completed",
        previousRevision: existing?.revision ?? null,
        nextRevision: record.revision,
        previousStatus: existing?.status ?? null,
        nextStatus: record.status,
      }),
    );
    return { mode: "completed" as const, record };
  }

  if (command.action === "archive" || command.action === "restore") {
    if (!existing) throw new Error("control_record_not_found");
    assertExpectedRevision(existing.revision, command.expectedRevision);

    const input = {
      organizationId: command.organizationId,
      actorId: command.actorId,
      service: command.service,
      resourceType: command.resourceType,
      resourceId: command.resourceId,
      expectedRevision: command.expectedRevision!,
    };

    const record =
      command.action === "archive"
        ? await archiveControlRecord(input)
        : await restoreControlRecord(input);

    await appendControlAudit(
      createAuditEvent(command, {
        outcome: "completed",
        previousRevision: existing.revision,
        nextRevision: record.revision,
        previousStatus: existing.status,
        nextStatus: record.status,
      }),
    );
    return { mode: "completed" as const, record };
  }

  if (command.action === "publish" || command.action === "delete") {
    if (!existing) throw new Error("control_record_not_found");
    if (command.action === "publish" && existing.status === "archived") {
      throw new Error("cannot_publish_archived_control_record");
    }
    assertExpectedRevision(existing.revision, command.expectedRevision);
  }

  const queuedCommand =
    command.action === "publish" && existing
      ? { ...command, payload: existing.payload }
      : command;
  const queued = await enqueueControlJob(queuedCommand);
  await appendControlAudit(
    createAuditEvent(command, {
      outcome: "accepted",
      previousRevision: existing?.revision ?? null,
      nextRevision: existing?.revision ?? null,
      previousStatus: existing?.status ?? null,
      nextStatus: existing?.status ?? null,
    }),
  );

  return {
    mode: "queued" as const,
    duplicate: queued.duplicate,
    job: queued.job,
  };
}
