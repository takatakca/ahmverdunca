import {
  TAKATAK_AHMV_SERVICES,
  type TakatakAhmvAction,
  type TakatakAhmvService,
} from "./contracts";
import type { TakatakAhmvCommand } from "./command";

export type AdapterReadiness =
  | "contract_only"
  | "configured"
  | "active"
  | "degraded";

export type AdapterExecutionResult = {
  ok: boolean;
  externalReference?: string | undefined;
  retryable: boolean;
  code: string;
};

export interface TakatakAhmvServiceAdapter {
  readonly service: TakatakAhmvService;
  readonly readiness: AdapterReadiness;
  readonly supportedActions: readonly TakatakAhmvAction[];
  execute(command: TakatakAhmvCommand): Promise<AdapterExecutionResult>;
}

export type AdapterDescriptor = {
  service: TakatakAhmvService;
  readiness: AdapterReadiness;
  supportedActions: readonly TakatakAhmvAction[];
};

export const TAKATAK_AHMV_ADAPTER_DESCRIPTORS: readonly AdapterDescriptor[] =
  TAKATAK_AHMV_SERVICES.map((service) => ({
    service,
    readiness: "contract_only" as const,
    supportedActions: ["read", "save_draft", "archive", "restore"],
  }));

export function assertCompleteAdapterCatalog(
  descriptors: readonly AdapterDescriptor[] = TAKATAK_AHMV_ADAPTER_DESCRIPTORS,
) {
  const unique = new Set(descriptors.map((descriptor) => descriptor.service));
  if (unique.size !== TAKATAK_AHMV_SERVICES.length) {
    throw new Error("incomplete_or_duplicate_adapter_catalog");
  }
  for (const service of TAKATAK_AHMV_SERVICES) {
    if (!unique.has(service)) {
      throw new Error(`missing_adapter_descriptor:${service}`);
    }
  }
  return true;
}
