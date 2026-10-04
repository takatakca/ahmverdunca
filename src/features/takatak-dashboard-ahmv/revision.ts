export function assertExpectedRevision(
  currentRevision: number,
  expectedRevision: number | undefined,
) {
  if (!Number.isInteger(currentRevision) || currentRevision < 1) {
    throw new Error("invalid_current_revision");
  }
  if (
    expectedRevision === undefined ||
    !Number.isInteger(expectedRevision) ||
    expectedRevision < 1
  ) {
    throw new Error("expected_revision_required");
  }
  if (currentRevision !== expectedRevision) {
    throw new Error("control_record_revision_conflict");
  }
  return currentRevision + 1;
}
