import type {
  TakatakAhmvAction,
  TakatakAhmvService,
} from "./contracts";

export const CONTROL_JOB_STATUSES = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type ControlJobStatus = (typeof CONTROL_JOB_STATUSES)[number];

export type TakatakAhmvControlJob = {
  id: string;
  tenant: "ahmverdun";
  organizationId: string;
  actorId: string;
  requestId: string;
  idempotencyKey: string;
  service: TakatakAhmvService;
  action: Extract<TakatakAhmvAction, "publish" | "execute" | "delete">;
  resourceType: string;
  resourceId: string;
  expectedRevision: number | null;
  payloadFingerprint: string;
  status: ControlJobStatus;
  attempts: number;
  maxAttempts: number;
  availableAt: string;
  startedAt: string | null;
  completedAt: string | null;
  lastErrorCode: string | null;
};

export function canRetryControlJob(job: TakatakAhmvControlJob) {
  return job.status === "failed" && job.attempts < job.maxAttempts;
}
