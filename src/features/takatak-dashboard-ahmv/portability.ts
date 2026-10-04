import type { ControlRecord } from "./action-state";
import type { ControlRecordVersion } from "./version-store.server";
import { assertSafeControlPayload } from "./payload-security";

export const AHMV_CONTROL_EXPORT_SCHEMA_VERSION = 1 as const;

export type PortableControlRecord = {
  recordKey: string;
  service: string;
  resourceType: string;
  resourceId: string;
  status: ControlRecord<unknown>["status"];
  revision: number;
  publishedRevision: number | null;
  lastPublishedAt: string | null;
  payload: unknown;
  provenance: ControlRecord<unknown>["provenance"];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

export type PortableControlVersion = {
  recordKey: string;
  revision: number;
  status: ControlRecordVersion["status"];
  payload: unknown;
  provenance: ControlRecordVersion["provenance"];
  createdAt: string;
};

function recordKey(record: {
  service: string;
  resourceType: string;
  resourceId: string;
}) {
  return [record.service, record.resourceType, record.resourceId].join(":");
}

export function buildPortableControlBundle(input: {
  organizationId: string;
  records: readonly ControlRecord<unknown>[];
  versions: readonly ControlRecordVersion[];
  generatedAt?: Date | undefined;
}) {
  const idToKey = new Map<string, string>();

  const records: PortableControlRecord[] = input.records.map((record) => {
    assertSafeControlPayload(record.payload);
    const key = recordKey(record);
    idToKey.set(record.id, key);
    return {
      recordKey: key,
      service: record.service,
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      status: record.status,
      revision: record.revision,
      publishedRevision: record.publishedRevision,
      lastPublishedAt: record.lastPublishedAt,
      payload: record.payload,
      provenance: record.provenance,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      archivedAt: record.archivedAt,
    };
  });

  const versions: PortableControlVersion[] = input.versions.map((version) => {
    assertSafeControlPayload(version.payload);
    const key = idToKey.get(version.controlRecordId);
    if (!key) throw new Error("portable_version_record_missing");
    return {
      recordKey: key,
      revision: version.revision,
      status: version.status,
      payload: version.payload,
      provenance: version.provenance,
      createdAt: version.createdAt,
    };
  });

  return {
    schemaVersion: AHMV_CONTROL_EXPORT_SCHEMA_VERSION,
    tenant: "ahmverdun" as const,
    organizationId: input.organizationId,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    records,
    versions,
    excluded: {
      billing: true,
      subscriptions: true,
      connectorCredentials: true,
      providerSecrets: true,
      jobs: true,
      idempotencyKeys: true,
      auditActorIds: true,
    },
  };
}
