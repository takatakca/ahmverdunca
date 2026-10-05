import type { TakatakAhmvCommand } from "./command";
import { commandFingerprint } from "./idempotency";
import { enqueueControlJob } from "./job-store.server";
import { safeWorkerErrorCode } from "./job-policy";
import { getControlRecord } from "./record-store.server";
import { assertRevisionApprovedForPublish } from "./review-store.server";
import {
  claimDuePublicationSchedule,
  finishPublicationSchedule,
} from "./schedule-store.server";
import type { TakatakAhmvService } from "./contracts";

export async function runNextScheduledPublication(now = new Date()) {
  const claimed = await claimDuePublicationSchedule(now);
  if (!claimed) return { claimed: false as const };

  const scheduleId = String(claimed["id"]);
  const service = String(claimed["service"]) as TakatakAhmvService;
  const revision = Number(claimed["revision"]);

  try {
    const record = await getControlRecord({
      organizationId: String(claimed["organization_id"]),
      service,
      resourceType: String(claimed["resource_type"]),
      resourceId: String(claimed["resource_id"]),
    });

    if (
      !record ||
      record.id !== String(claimed["control_record_id"]) ||
      record.status === "archived" ||
      record.revision !== revision
    ) {
      await finishPublicationSchedule({
        scheduleId,
        status: "stale",
        errorCode: "scheduled_revision_is_no_longer_current",
        now,
      });
      return {
        claimed: true as const,
        enqueued: false as const,
        stale: true as const,
      };
    }

    await assertRevisionApprovedForPublish({
      controlRecordId: record.id,
      revision,
    });

    const idempotencyKey = `schedule:${scheduleId}`;
    const fingerprint = commandFingerprint({
      tenant: "ahmverdun",
      organizationId: record.organizationId,
      actorId: String(claimed["requested_by"]),
      service,
      action: "publish",
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      expectedRevision: revision,
      provenance: record.provenance,
      payload: record.payload,
    });

    const command: TakatakAhmvCommand = {
      tenant: "ahmverdun",
      organizationId: record.organizationId,
      actorId: String(claimed["requested_by"]),
      requestId: `schedule:${scheduleId}`,
      idempotencyKey,
      service,
      action: "publish",
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      expectedRevision: revision,
      provenance: record.provenance,
      payload: record.payload,
      fingerprint,
    };

    const queued = await enqueueControlJob(command);
    await finishPublicationSchedule({
      scheduleId,
      status: "enqueued",
      now,
    });

    return {
      claimed: true as const,
      enqueued: true as const,
      duplicate: queued.duplicate,
      job: queued.job,
    };
  } catch (error) {
    const code =
      error instanceof Error && error.message === "control_revision_not_approved"
        ? "scheduled_revision_not_approved"
        : safeWorkerErrorCode(error);

    await finishPublicationSchedule({
      scheduleId,
      status:
        code === "scheduled_revision_not_approved" ? "stale" : "failed",
      errorCode: code,
      now,
    });

    return {
      claimed: true as const,
      enqueued: false as const,
      stale: code === "scheduled_revision_not_approved",
      code,
    };
  }
}
