import type { ControlRecord } from "./action-state";

export function publishedRevisionForRecord(
  record: ControlRecord<unknown> | null,
) {
  if (!record || record.status === "archived") return null;
  if (
    record.publishedRevision === null ||
    !Number.isInteger(record.publishedRevision) ||
    record.publishedRevision < 1 ||
    record.publishedRevision > record.revision
  ) {
    return null;
  }
  return record.publishedRevision;
}

export function hasUnpublishedChanges(record: ControlRecord<unknown>) {
  return (
    record.publishedRevision !== null &&
    record.revision > record.publishedRevision
  );
}
