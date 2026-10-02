function decodeJwtRole(value: string): string | null {
  const parts = value.split(".");
  if (parts.length !== 3 || typeof globalThis.atob !== "function") return null;

  const payloadPart = parts[1];
  if (!payloadPart) return null;

  try {
    const payload = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const parsed = JSON.parse(globalThis.atob(padded)) as { role?: unknown };
    return typeof parsed.role === "string" ? parsed.role : null;
  } catch {
    return null;
  }
}

export function isOpaquePublishableSupabaseKey(value: string): boolean {
  return value.startsWith("sb_publishable_");
}

export function assertPublicSupabaseKey(value: string): void {
  const key = value.trim();

  if (key.startsWith("sb_secret_")) {
    throw new Error(
      "Refusing Supabase sb_secret_ key in public client configuration. Use an sb_publishable_ key instead.",
    );
  }

  if (isOpaquePublishableSupabaseKey(key)) return;

  const legacyRole = decodeJwtRole(key);
  if (legacyRole === "anon") return;

  if (legacyRole === "service_role") {
    throw new Error(
      "Refusing legacy Supabase service_role key in public client configuration. Use the legacy anon key or an sb_publishable_ key instead.",
    );
  }

  throw new Error(
    "Unsupported Supabase public key format. Expected sb_publishable_ or a legacy anon JWT.",
  );
}
