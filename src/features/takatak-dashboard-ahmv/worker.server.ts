import type {
  TakatakAhmvServiceAdapter,
  AdapterExecutionResult,
} from "./adapters";
import type { TakatakAhmvCommand } from "./command";
import type { TakatakAhmvService } from "./contracts";
import {
  claimNextControlJob,
  finishControlJob,
} from "./job-store.server";
import {
  retryDelaySeconds,
  safeWorkerErrorCode,
} from "./job-policy";
import { markControlRevisionPublished } from "./record-store.server";

type ClaimedJob = Record<string, unknown>;

function commandFromClaimedJob(job: ClaimedJob): TakatakAhmvCommand {
  const action = String(job["action"]);
  if (!["publish", "execute", "delete"].includes(action)) {
    throw new Error("worker_invalid_action");
  }

  return {
    tenant: "ahmverdun",
    organizationId: String(job["organization_id"]),
    actorId: String(job["actor_id"]),
    requestId: String(job["request_id"]),
    idempotencyKey: String(job["idempotency_key"]),
    service: String(job["service"]) as TakatakAhmvService,
    action: action as TakatakAhmvCommand["action"],
    resourceType: String(job["resource_type"]),
    resourceId: String(job["resource_id"]),
    expectedRevision:
      job["expected_revision"] === null || job["expected_revision"] === undefined
        ? undefined
        : Number(job["expected_revision"]),
    payload: job["payload"] ?? {},
    fingerprint: String(job["request_fingerprint"]),
  };
}

function adapterFor(
  adapters: readonly TakatakAhmvServiceAdapter[],
  service: TakatakAhmvService,
) {
  return adapters.find((adapter) => adapter.service === service) ?? null;
}

async function finishFailure(
  job: ClaimedJob,
  result: AdapterExecutionResult,
  now: Date,
) {
  const attempts = Number(job["attempts"] ?? 1);
  return finishControlJob({
    jobId: String(job["id"]),
    success: false,
    errorCode: result.code,
    externalReference: result.externalReference,
    retryable: result.retryable,
    retryDelaySeconds: retryDelaySeconds(attempts),
    now,
  });
}

export async function runNextTakatakAhmvControlJob(
  adapters: readonly TakatakAhmvServiceAdapter[],
  now = new Date(),
) {
  const claimed = (await claimNextControlJob(now)) as ClaimedJob | null;
  if (!claimed) return { claimed: false as const };

  const command = commandFromClaimedJob(claimed);
  const adapter = adapterFor(adapters, command.service);

  if (
    !adapter ||
    adapter.readiness === "contract_only" ||
    !adapter.supportedActions.includes(command.action)
  ) {
    await finishFailure(
      claimed,
      {
        ok: false,
        retryable: false,
        code: "adapter_not_available_for_action",
      },
      now,
    );
    return {
      claimed: true as const,
      completed: false as const,
      retryable: false,
      code: "adapter_not_available_for_action",
    };
  }

  try {
    const result = await adapter.execute(command);
    if (!result.ok) {
      await finishFailure(claimed, result, now);
      return {
        claimed: true as const,
        completed: false as const,
        retryable: result.retryable,
        code: result.code,
      };
    }

    if (command.action === "publish") {
      if (command.expectedRevision === undefined) {
        await finishFailure(
          claimed,
          {
            ok: false,
            retryable: false,
            code: "publish_revision_missing",
          },
          now,
        );
        return {
          claimed: true as const,
          completed: false as const,
          retryable: false,
          code: "publish_revision_missing",
        };
      }

      await markControlRevisionPublished({
        organizationId: command.organizationId,
        actorId: command.actorId,
        service: command.service,
        resourceType: command.resourceType,
        resourceId: command.resourceId,
        publishedRevision: command.expectedRevision,
        now,
      });
    }

    await finishControlJob({
      jobId: String(claimed["id"]),
      success: true,
      externalReference: result.externalReference,
      retryable: false,
      now,
    });

    return {
      claimed: true as const,
      completed: true as const,
      code: result.code,
    };
  } catch (error) {
    const code = safeWorkerErrorCode(error);
    await finishControlJob({
      jobId: String(claimed["id"]),
      success: false,
      errorCode: code,
      retryable: true,
      retryDelaySeconds: retryDelaySeconds(Number(claimed["attempts"] ?? 1)),
      now,
    });
    return {
      claimed: true as const,
      completed: false as const,
      retryable: true,
      code,
    };
  }
}
