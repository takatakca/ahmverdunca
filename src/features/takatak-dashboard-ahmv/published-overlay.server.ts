import type { TakatakAhmvService } from "./contracts";
import { getControlRecord } from "./record-store.server";
import { getControlRecordVersion } from "./version-store.server";
import { publishedRevisionForRecord } from "./published";

export async function getPublishedControlSnapshot(input: {
  organizationId: string;
  service: TakatakAhmvService;
  resourceType: string;
  resourceId: string;
}) {
  const record = await getControlRecord(input);
  const publishedRevision = publishedRevisionForRecord(record);
  if (!record || publishedRevision === null) return null;

  const version = await getControlRecordVersion({
    ...input,
    revision: publishedRevision,
  });
  if (!version) {
    throw new Error("published_control_revision_missing");
  }

  return {
    recordId: record.id,
    organizationId: record.organizationId,
    service: record.service,
    resourceType: record.resourceType,
    resourceId: record.resourceId,
    revision: version.revision,
    payload: version.payload,
    provenance: version.provenance,
    publishedAt: record.lastPublishedAt,
    currentRevision: record.revision,
    hasUnpublishedChanges: record.revision > version.revision,
  };
}
