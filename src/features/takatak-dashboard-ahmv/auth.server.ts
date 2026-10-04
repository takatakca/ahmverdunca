import { timingSafeEqual } from "node:crypto";
import {
  TAKATAK_AHMV_PRODUCT,
  TAKATAK_AHMV_TENANT,
  type TakatakAhmvControlContext,
} from "./contracts";

type Settings = Record<string, string | undefined>;

function secureMatch(expected: string, supplied: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

function safeId(value: string | null, max = 160) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed.length > max) return null;
  return /^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(trimmed) ? trimmed : null;
}

export function authorizeTakatakAhmvControlRequest(
  request: Request,
  settings: Settings = process.env,
): TakatakAhmvControlContext | null {
  if (settings["TAKATAK_AHMV_CONTROL_PLANE_ENABLED"] !== "true") return null;

  const expected = settings["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim() ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!expected || !supplied || !secureMatch(expected, supplied)) return null;

  const tenant = request.headers.get("x-takatak-tenant");
  const product = request.headers.get("x-takatak-product");
  const organizationId = safeId(request.headers.get("x-takatak-organization-id"));
  const actorId = safeId(request.headers.get("x-takatak-actor-id"));
  const requestId = safeId(request.headers.get("x-request-id"));

  if (
    tenant !== TAKATAK_AHMV_TENANT ||
    product !== TAKATAK_AHMV_PRODUCT ||
    !organizationId ||
    !actorId ||
    !requestId
  ) {
    return null;
  }

  return {
    tenant: TAKATAK_AHMV_TENANT,
    product: TAKATAK_AHMV_PRODUCT,
    organizationId,
    actorId,
    requestId,
    services: [],
  };
}
