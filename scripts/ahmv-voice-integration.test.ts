import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (path: string) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Voice AI bridge stays private, trilingual, deduplicated and subordinate to AHMV/TAKATAK", async () => {
  const [server, bridge, messaging, env, voiceMigration] = await Promise.all([
    source("src/server.ts"),
    source("src/lib/ahmv-voice-bridge.server.ts"),
    source("src/features/ahmv-phone/messaging/send.server.ts"),
    source(".env.example"),
    source("supabase/migrations/20261003120000_ahmv_voice_sessions.sql"),
  ]);

  assert.match(server, /handleAhmvVoiceBridge/);
  assert.match(server, /handleTakatakMembershipSync/);
  assert.match(bridge, /AHMV_VOICE_BRIDGE_TOKEN/);
  assert.match(bridge, /source_expired/);
  assert.match(bridge, /memberActivationUrl/);
  assert.match(bridge, /dedupeKey/);
  assert.match(bridge, /language === "es"/);
  assert.match(bridge, /contactLanguage/);
  assert.match(messaging, /dedupe_key/);
  assert.match(env, /AHMV_VOICE_BRIDGE_TOKEN=/);
  assert.match(voiceMigration, /public\.ahmv_voice_sessions/);
  assert.match(
    voiceMigration,
    /detected_language is null or detected_language in \('fr','en','es'\)/,
  );
  assert.match(
    voiceMigration,
    /revoke all on public\.ahmv_voice_sessions from anon, authenticated/,
  );
  assert.doesNotMatch(voiceMigration, /voice_memberships/);
});

test("Voice AI sessions are covered by the AHMV privacy retention policy", async () => {
  const retention = await source("src/features/ahmv-phone/privacy/retention.server.ts");
  assert.match(retention, /AHMV_VOICE_SESSION_RETENTION_DAYS/);
  assert.match(retention, /\.from\("ahmv_voice_sessions"\)/);
});
