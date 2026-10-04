import { createHash } from "node:crypto";

export type IdempotencyReceipt = {
  key: string;
  fingerprint: string;
  status: "pending" | "completed" | "failed";
};

export function normalizeIdempotencyKey(value: string | null | undefined) {
  const key = value?.trim() ?? "";
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(key)) return null;
  return key;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
}

export function commandFingerprint(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

export function assertIdempotencyCompatible(
  existing: IdempotencyReceipt,
  fingerprint: string,
) {
  if (existing.fingerprint !== fingerprint) {
    throw new Error("idempotency_key_reused_with_different_command");
  }
}
