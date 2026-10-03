import assert from "node:assert/strict";

const env = process.env;
const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AHMV_VOICE_BRIDGE_TOKEN",
  "TAKATAK_AHMV_SCHEDULE_URL",
  "TAKATAK_AHMV_SERVICE_TOKEN",
] as const;

const missing = required.filter((name) => !env[name]?.trim());
if (missing.length > 0) {
  console.error(`Voice preflight failed: missing ${missing.join(", ")}`);
  process.exit(1);
}

const placeholder = /^(change-me|changeme|replace|replace-me|todo|example|test|xxx)/i;
for (const name of required) {
  assert.ok(!placeholder.test(env[name]!.trim()), `${name} still looks like a placeholder`);
}

const supabaseUrl = new URL(env["SUPABASE_URL"]!);
assert.equal(supabaseUrl.protocol, "https:", "SUPABASE_URL must use HTTPS");

const publicOrigin = new URL(env["AHMV_WEBHOOK_ORIGIN"] ?? "https://ahmverdun.ca");
assert.equal(publicOrigin.protocol, "https:", "AHMV public origin must use HTTPS");
assert.ok(
  publicOrigin.hostname === "ahmverdun.ca" || publicOrigin.hostname.endsWith(".ahmverdun.ca"),
  "AHMV public origin must stay on ahmverdun.ca",
);

const bridgeToken = env["AHMV_VOICE_BRIDGE_TOKEN"]!.trim();
assert.ok(bridgeToken.length >= 24, "AHMV_VOICE_BRIDGE_TOKEN must be at least 24 characters");

const scheduleUrl = new URL(env["TAKATAK_AHMV_SCHEDULE_URL"]!);
assert.equal(scheduleUrl.protocol, "https:", "TAKATAK_AHMV_SCHEDULE_URL must use HTTPS");
assert.ok(!scheduleUrl.username && !scheduleUrl.password, "Schedule URL must not contain credentials");

const retention = Number(env["AHMV_VOICE_SESSION_RETENTION_DAYS"] ?? "90");
assert.ok(Number.isInteger(retention) && retention >= 7 && retention <= 365, "Voice retention must be 7..365 days");

console.log(JSON.stringify({
  ok: true,
  service: "ahmv-voice-bridge",
  publicOrigin: publicOrigin.origin,
  supabaseOrigin: supabaseUrl.origin,
  scheduleOrigin: scheduleUrl.origin,
  voiceRetentionDays: retention,
  secretsPresent: true,
}));
