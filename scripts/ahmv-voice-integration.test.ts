import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (path: string) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Voice AI bridge is private, wired, trilingual and preserves AHMV/TAKATAK authority", async () => {
  const [server, bridge, contacts, messaging, env, voiceMigration, extensionMigration, preflight] =
    await Promise.all([
      source("src/server.ts"),
      source("src/lib/ahmv-voice-bridge.server.ts"),
      source("src/features/ahmv-phone/contacts/store.server.ts"),
      source("src/features/ahmv-phone/messaging/send.server.ts"),
      source(".env.example"),
      source("supabase/migrations/20261003091000_ahmv_voice_sessions.sql"),
      source("supabase/migrations/20261003110000_ahmv_phone_spanish.sql"),
      source("scripts/ahmv-voice-preflight.ts"),
    ]);

  assert.match(server, /handleAhmvVoiceBridge/);
  assert.match(bridge, /AHMV_VOICE_BRIDGE_TOKEN/);
  assert.doesNotMatch(bridge, /AHMV_VOICE_DATA_TOKEN/);
  assert.match(bridge, /source_expired/);
  assert.match(bridge, /memberActivationUrl/);
  assert.match(bridge, /dedupeKey/);
  assert.match(bridge, /expected\.length < 24/);
  assert.match(bridge, /transactional_sms_allowed !== true \|\| lookup\.data\.sms_consent !== true/);
  assert.match(bridge, /CONTACT_MISMATCH/);

  assert.match(contacts, /"fr" \| "en" \| "es"/);
  assert.match(messaging, /dedupe_key/);
  assert.match(env, /AHMV_VOICE_BRIDGE_TOKEN=/);
  assert.doesNotMatch(env, /AHMV_VOICE_DATA_TOKEN=/);

  assert.match(voiceMigration, /public\.ahmv_voice_sessions/);
  assert.match(voiceMigration, /revoke all on public\.ahmv_voice_sessions from anon, authenticated/);
  assert.doesNotMatch(voiceMigration, /voice_memberships/);
  assert.doesNotMatch(voiceMigration, /transcript_summary/);
  assert.match(voiceMigration, /Raw call transcripts are intentionally not stored here/);
  assert.match(voiceMigration, /detected_language/);
  assert.match(voiceMigration, /'fr','en','es'/);
  assert.match(voiceMigration, /turn_count between 0 and 100/);
  assert.match(extensionMigration, /language in \('fr','en','es'\)/);
  assert.match(preflight, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(preflight, /AHMV_VOICE_BRIDGE_TOKEN/);
  assert.match(preflight, /TAKATAK_AHMV_SCHEDULE_URL/);
  assert.match(preflight, /scheduleUrl\.protocol/);
  assert.doesNotMatch(preflight, /console\.log\(env/);
});

test("Voice AI sessions are covered by the AHMV privacy retention policy", async () => {
  const retention = await source("src/features/ahmv-phone/privacy/retention.server.ts");
  assert.match(retention, /AHMV_VOICE_SESSION_RETENTION_DAYS/);
  assert.match(retention, /\.from\("ahmv_voice_sessions"\)/);
});


test("Voice AI deployment assets are fail-closed and preserve canonical public URLs", async () => {
  const [publicSmoke, bridgeSmoke, service, nginx, runbook] = await Promise.all([
    source("scripts/ahmv-voice-smoke.ts"),
    source("scripts/ahmv-voice-bridge-smoke.ts"),
    source("deploy/voice/ahmv-voice.service"),
    source("deploy/voice/nginx-voice.ahmverdun.ca.conf"),
    source("docs/VOICE_PRODUCTION_RUNBOOK.md"),
  ]);

  assert.match(publicSmoke, /https:\/\/voice\.ahmverdun\.ca/);
  assert.match(publicSmoke, /\/healthz/);
  assert.match(publicSmoke, /\/readyz/);
  assert.match(publicSmoke, /no-store/);
  assert.match(publicSmoke, /noindex/);
  assert.match(publicSmoke, /Sensitive key exposed/);

  assert.match(bridgeSmoke, /https:\/\/ahmverdun\.ca/);
  assert.match(bridgeSmoke, /\/api\/ahmv\/voice\/readiness/);
  assert.match(bridgeSmoke, /AHMV_VOICE_BRIDGE_TOKEN/);
  assert.doesNotMatch(bridgeSmoke, /console\.log\(.*token/s);

  assert.match(service, /User=ahmvvoice/);
  assert.match(service, /EnvironmentFile=\/etc\/ahmv-voice-ai\.env/);
  assert.match(service, /TimeoutStopSec=20/);
  assert.match(service, /NoNewPrivileges=true/);

  assert.match(nginx, /server_name voice\.ahmverdun\.ca/);
  assert.match(nginx, /proxy_http_version 1\.1/);
  assert.match(nginx, /proxy_set_header Upgrade \$http_upgrade/);
  assert.match(nginx, /X-Forwarded-Proto https/);

  assert.match(runbook, /draft PR \*\*#179\*\*/);
  assert.match(runbook, /Do not guess the Supabase project/);
  assert.match(runbook, /Twilio sandbox acceptance/);
  assert.match(runbook, /Rollback/);
});
