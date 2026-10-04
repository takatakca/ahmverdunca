import type { TakatakAhmvService } from "./contracts";

export type TakatakUsageEvent = {
  eventId: string;
  tenant: "ahmverdun";
  organizationId: string;
  service: TakatakAhmvService;
  unit: string;
  quantity: number;
  occurredAt: string;
  resourceRef?: string | undefined;
  providerReference?: string | undefined;
  billingAuthority: "takatak";
};

const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{2,159}$/;

export function createTakatakUsageEvent(input: {
  eventId: string;
  organizationId: string;
  service: TakatakAhmvService;
  unit: string;
  quantity: number;
  occurredAt?: Date | undefined;
  resourceRef?: string | undefined;
  providerReference?: string | undefined;
}): TakatakUsageEvent {
  if (
    !SAFE_ID.test(input.eventId) ||
    !SAFE_ID.test(input.organizationId) ||
    !SAFE_ID.test(input.unit)
  ) {
    throw new Error("invalid_usage_event_identity");
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("invalid_usage_quantity");
  }

  return {
    eventId: input.eventId,
    tenant: "ahmverdun",
    organizationId: input.organizationId,
    service: input.service,
    unit: input.unit,
    quantity: input.quantity,
    occurredAt: (input.occurredAt ?? new Date()).toISOString(),
    resourceRef: input.resourceRef,
    providerReference: input.providerReference,
    billingAuthority: "takatak",
  };
}
