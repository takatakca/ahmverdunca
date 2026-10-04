const FORBIDDEN_KEY =
  /(^|_)(authorization|cookie|password|passwd|secret|api_?key|private_?key|access_?token|refresh_?token|auth_?token|twilio_?auth|stripe_?secret)($|_)/i;

const MAX_DEPTH = 8;
const MAX_JSON_BYTES = 64 * 1024;
const MAX_ARRAY_ITEMS = 500;
const MAX_OBJECT_KEYS = 250;

export function assertSafeControlPayload(payload: unknown) {
  const json = JSON.stringify(payload);
  if (Buffer.byteLength(json, "utf8") > MAX_JSON_BYTES) {
    throw new Error("control_payload_too_large");
  }

  inspect(payload, 0);
}

function inspect(value: unknown, depth: number): void {
  if (depth > MAX_DEPTH) throw new Error("control_payload_too_deep");
  if (value === null || typeof value !== "object") return;

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_ITEMS) {
      throw new Error("control_payload_too_many_items");
    }
    for (const item of value) inspect(item, depth + 1);
    return;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > MAX_OBJECT_KEYS) {
    throw new Error("control_payload_too_many_keys");
  }

  for (const [key, child] of entries) {
    if (FORBIDDEN_KEY.test(key)) {
      throw new Error(`control_payload_forbidden_key:${key}`);
    }
    inspect(child, depth + 1);
  }
}
