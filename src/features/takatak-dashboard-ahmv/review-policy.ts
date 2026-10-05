import type { TakatakAhmvService } from "./contracts";
import type {
  TakatakAhmvPrincipal,
  TakatakAhmvRole,
} from "./rbac";

export const CONTROL_REVIEW_DECISIONS = ["approved", "rejected"] as const;
export type ControlReviewDecision = (typeof CONTROL_REVIEW_DECISIONS)[number];

export function requiresControlReview(service: TakatakAhmvService) {
  return service === "website" || service === "seo";
}

export function canRequestControlReview(role: TakatakAhmvRole) {
  return ["owner", "admin", "manager", "operator"].includes(role);
}

export function canResolveControlReview(role: TakatakAhmvRole) {
  return role === "owner" || role === "admin";
}

export function assertCanRequestControlReview(
  principal: TakatakAhmvPrincipal,
  service: TakatakAhmvService,
) {
  if (
    !principal.enabledServices.includes(service) ||
    !canRequestControlReview(principal.role)
  ) {
    throw new Error("control_review_request_forbidden");
  }
}

export function assertCanResolveControlReview(input: {
  principal: TakatakAhmvPrincipal;
  service: TakatakAhmvService;
  requestedBy: string;
  ownerOverrideReason?: string | undefined;
}) {
  if (
    !input.principal.enabledServices.includes(input.service) ||
    !canResolveControlReview(input.principal.role)
  ) {
    throw new Error("control_review_resolution_forbidden");
  }

  if (input.principal.actorId !== input.requestedBy) return;

  const reason = input.ownerOverrideReason?.trim() ?? "";
  if (input.principal.role !== "owner" || reason.length < 8 || reason.length > 500) {
    throw new Error("control_review_self_approval_forbidden");
  }
}
