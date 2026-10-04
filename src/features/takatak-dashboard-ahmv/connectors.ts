import type { TakatakAhmvService } from "./contracts";

export type TakatakConnectorReference = {
  connectorId: string;
  provider: string;
  accountRef: string;
  service: TakatakAhmvService;
  secretLocation: "takatak_vault";
};

const SAFE_REF = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{2,159}$/;

export function assertSafeConnectorReference(
  reference: TakatakConnectorReference,
) {
  if (
    !SAFE_REF.test(reference.connectorId) ||
    !SAFE_REF.test(reference.provider) ||
    !SAFE_REF.test(reference.accountRef) ||
    reference.secretLocation !== "takatak_vault"
  ) {
    throw new Error("invalid_takatak_connector_reference");
  }
  return reference;
}

export type ConnectorExecutionRequest = {
  connector: TakatakConnectorReference;
  operation: string;
  resourceRef: string;
  idempotencyKey: string;
  payloadFingerprint: string;
};

export function buildConnectorExecutionRequest(input: ConnectorExecutionRequest) {
  assertSafeConnectorReference(input.connector);
  if (!SAFE_REF.test(input.operation) || !SAFE_REF.test(input.resourceRef)) {
    throw new Error("invalid_connector_execution_request");
  }
  return {
    ...input,
    secretMaterialIncluded: false as const,
  };
}
