import { assertPublicSupabaseKey } from "../src/integrations/supabase/key-safety";

const failures: string[] = [];

function legacyJwt(role: string) {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ role })}.signature`;
}

function expectAllowed(label: string, key: string) {
  try {
    assertPublicSupabaseKey(key);
  } catch (error) {
    failures.push(`${label}: expected allowed, got ${error instanceof Error ? error.message : String(error)}`);
  }
}

function expectRejected(label: string, key: string) {
  try {
    assertPublicSupabaseKey(key);
    failures.push(`${label}: expected rejection`);
  } catch {
    // Expected.
  }
}

expectAllowed("new publishable key", "sb_publishable_example");
expectAllowed("legacy anon JWT", legacyJwt("anon"));
expectRejected("new secret key", "sb_secret_example");
expectRejected("legacy service role JWT", legacyJwt("service_role"));
expectRejected("unknown key format", "not-a-supabase-public-key");

if (failures.length) {
  console.error("Supabase public-key safety validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Supabase public-key safety validation passed.");
