import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (path: string) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Voice AI bridge is private, wired, trilingual and preserves AHMV/TAKATAK authority", async () => {
  const [server, bridge, contacts, messaging, env, voiceMigration, extensionMigration] =
    await Promise.all([
      source("src/server.ts"),
      source("src/lib/ahmv-voice-bridge.server.ts"),
      source("src/features/ahmv-phone/contacts/store.server.ts"),
      source("src/features/ahmv-phone/messaging/send.server.ts"),
      source(".env.example"),
      source("supabase/migrations/20261003091000_ahmv_voice_sessions.sql"),
      source("supabase/migrations/20261003110000_ahmv_phone_spanish.sql"),
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
});

test("Voice AI sessions are covered by the AHMV privacy retention policy", async () => {
  const retention = await source("src/features/ahmv-phone/privacy/retention.server.ts");
  assert.match(retention, /AHMV_VOICE_SESSION_RETENTION_DAYS/);
  assert.match(retention, /\.from\("ahmv_voice_sessions"\)/);
});
