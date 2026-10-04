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

type ControlProvenanceInput = {
  sourceKind?: ControlSourceKind | undefined;
  verificationStatus?: ControlVerificationStatus | undefined;
  sourceRef?: string | null | undefined;
  verifiedAt?: string | null | undefined;
};

export function normalizeControlProvenance(
  value: ControlProvenanceInput | null | undefined,
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


export function parseControlProvenance(value: unknown): ControlProvenance {
  if (value === undefined || value === null) {
    return normalizeControlProvenance(undefined);
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("invalid_control_provenance");
  }

  const record = value as Record<string, unknown>;
  const allowed = new Set([
    "sourceKind",
    "verificationStatus",
    "sourceRef",
    "verifiedAt",
  ]);
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) throw new Error("invalid_control_provenance_field");
  }

  if (
    record["sourceKind"] !== undefined &&
    (typeof record["sourceKind"] !== "string" ||
      !CONTROL_SOURCE_KINDS.includes(record["sourceKind"] as ControlSourceKind))
  ) {
    throw new Error("invalid_control_source_kind");
  }
  if (
    record["verificationStatus"] !== undefined &&
    (typeof record["verificationStatus"] !== "string" ||
      !CONTROL_VERIFICATION_STATUSES.includes(
        record["verificationStatus"] as ControlVerificationStatus,
      ))
  ) {
    throw new Error("invalid_control_verification_status");
  }
  if (
    record["sourceRef"] !== undefined &&
    record["sourceRef"] !== null &&
    typeof record["sourceRef"] !== "string"
  ) {
    throw new Error("invalid_control_source_ref");
  }
  if (
    record["verifiedAt"] !== undefined &&
    record["verifiedAt"] !== null &&
    typeof record["verifiedAt"] !== "string"
  ) {
    throw new Error("invalid_control_verified_at");
  }

  return normalizeControlProvenance({
    sourceKind: record["sourceKind"] as ControlSourceKind | undefined,
    verificationStatus: record["verificationStatus"] as
      | ControlVerificationStatus
      | undefined,
    sourceRef: record["sourceRef"] as string | null | undefined,
    verifiedAt: record["verifiedAt"] as string | null | undefined,
  });
}
