import { z } from "zod";
import {
  TAKATAK_AHMV_ACTIONS,
  TAKATAK_AHMV_SERVICES,
  TAKATAK_AHMV_TENANT,
  type TakatakAhmvAction,
  type TakatakAhmvService,
} from "./contracts";
import { commandFingerprint, normalizeIdempotencyKey } from "./idempotency";
import { assertSafeControlPayload } from "./payload-security";
import { parseWebsiteControlPayload } from "./website-content";
import { parseSeoControlPayload } from "./seo-content";

const safeId = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/);

const schema = z.object({
  tenant: z.literal(TAKATAK_AHMV_TENANT),
  organizationId: safeId,
  actorId: safeId,
  requestId: safeId,
  idempotencyKey: z.string().trim(),
  service: z.enum(TAKATAK_AHMV_SERVICES),
  action: z.enum(TAKATAK_AHMV_ACTIONS),
  resourceType: safeId,
  resourceId: safeId,
  expectedRevision: z.number().int().positive().optional(),
  payload: z.unknown().default({}),
});

export type TakatakAhmvCommand = {
  tenant: typeof TAKATAK_AHMV_TENANT;
  organizationId: string;
  actorId: string;
  requestId: string;
  idempotencyKey: string;
  service: TakatakAhmvService;
  action: TakatakAhmvAction;
  resourceType: string;
  resourceId: string;
  expectedRevision?: number | undefined;
  payload: unknown;
  fingerprint: string;
};

export function parseTakatakAhmvCommand(input: unknown): TakatakAhmvCommand {
  const parsed = schema.parse(input);
  const idempotencyKey = normalizeIdempotencyKey(parsed.idempotencyKey);
  if (!idempotencyKey) throw new Error("invalid_idempotency_key");
  assertSafeControlPayload(parsed.payload);

  const normalizedPayload =
    parsed.action === "save_draft" && parsed.service === "website"
      ? parseWebsiteControlPayload(parsed.resourceType, parsed.payload)
      : parsed.action === "save_draft" && parsed.service === "seo"
        ? parseSeoControlPayload(parsed.resourceType, parsed.payload)
        : (parsed.payload ?? {});

  const fingerprint = commandFingerprint({
    tenant: parsed.tenant,
    organizationId: parsed.organizationId,
    actorId: parsed.actorId,
    service: parsed.service,
    action: parsed.action,
    resourceType: parsed.resourceType,
    resourceId: parsed.resourceId,
    expectedRevision: parsed.expectedRevision ?? null,
    payload: normalizedPayload,
  });

  return {
    ...parsed,
    payload: normalizedPayload,
    idempotencyKey,
    fingerprint,
  };
}
