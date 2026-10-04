import type { TakatakAhmvService } from "./contracts";
import {
  isKnownTakatakAhmvRole,
  type TakatakAhmvPrincipal,
  type TakatakAhmvRole,
} from "./rbac";

export const ASSOCIATION_SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "grace",
  "suspended",
  "cancelled",
] as const;

export type AssociationSubscriptionStatus =
  (typeof ASSOCIATION_SUBSCRIPTION_STATUSES)[number];

export type AssociationControlGrant = {
  organizationId: string;
  actorId: string;
  role: TakatakAhmvRole;
  subscriptionId: string;
  productCode: string;
  status: AssociationSubscriptionStatus;
  enabledServices: readonly TakatakAhmvService[];
  validUntil: string;
};

export function grantAllowsControlPlane(
  grant: AssociationControlGrant,
  now = new Date(),
) {
  if (!["trialing", "active", "grace"].includes(grant.status)) return false;
  const validUntil = new Date(grant.validUntil);
  return (
    Number.isFinite(validUntil.getTime()) &&
    validUntil.getTime() > now.getTime() &&
    isKnownTakatakAhmvRole(grant.role) &&
    grant.enabledServices.length > 0
  );
}

export function principalFromAssociationGrant(
  grant: AssociationControlGrant,
  now = new Date(),
): TakatakAhmvPrincipal {
  if (!grantAllowsControlPlane(grant, now)) {
    throw new Error("association_control_grant_inactive");
  }

  return {
    organizationId: grant.organizationId,
    actorId: grant.actorId,
    role: grant.role,
    enabledServices: [...new Set(grant.enabledServices)],
  };
}
