export const CONTROL_SOURCE_KINDS = [
  "official",
  "association",
  "social",
  "provider",
  "manual",
  "unknown",
] as const;

export const CONTROL_VERIFICATION_STATUSES = [
  "unverified",
  "verified",
  "disputed",
  "stale",
] as const;

export type ControlSourceKind = (typeof CONTROL_SOURCE_KINDS)[number];
export type ControlVerificationStatus =
  (typeof CONTROL_VERIFICATION_STATUSES)[number];

export type ControlProvenance = {
  sourceKind: ControlSourceKind;
  verificationStatus: ControlVerificationStatus;
  sourceRef: string | null;
  verifiedAt: string | null;
};

export function normalizeControlProvenance(
  value: Partial<ControlProvenance> | null | undefined,
): ControlProvenance {
  const sourceKind = CONTROL_SOURCE_KINDS.includes(
    value?.sourceKind as ControlSourceKind,
  )
    ? (value!.sourceKind as ControlSourceKind)
    : "unknown";

  const verificationStatus = CONTROL_VERIFICATION_STATUSES.includes(
    value?.verificationStatus as ControlVerificationStatus,
  )
    ? (value!.verificationStatus as ControlVerificationStatus)
    : "unverified";

  const sourceRef = value?.sourceRef?.trim() || null;
  if (sourceRef && sourceRef.length > 2_048) {
    throw new Error("control_provenance_source_ref_too_long");
  }

  const verifiedAt = value?.verifiedAt?.trim() || null;
  if (verifiedAt && !Number.isFinite(new Date(verifiedAt).getTime())) {
    throw new Error("control_provenance_invalid_verified_at");
  }

  if (
    verificationStatus === "verified" &&
    (!sourceRef || !verifiedAt)
  ) {
    throw new Error("verified_control_provenance_requires_source_and_timestamp");
  }

  return {
    sourceKind,
    verificationStatus,
    sourceRef,
    verifiedAt,
  };
}
