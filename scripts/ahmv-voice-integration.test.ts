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


test("Voice integration smoke assets are fail-closed and split from the realtime service", async () => {
  const [publicSmoke, bridgeSmoke, runbook] = await Promise.all([
    source("scripts/ahmv-voice-smoke.ts"),
    source("scripts/ahmv-voice-bridge-smoke.ts"),
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

  assert.match(runbook, /Production code authority: `main`/);
  assert.match(runbook, /Website Voice integration: merged into `main`/);
  assert.match(runbook, /Standalone realtime Voice service: merged into `main`/);
  assert.match(runbook, /docs\/CURSOR_TWILIO_HANDOFF\.md/);
  assert.match(runbook, /services\/ahmv-voice-ai\/deploy\/nginx-voice\.ahmverdun\.ca\.conf/);
  assert.match(runbook, /services\/ahmv-voice-ai\/deploy\/ahmv-voice\.service/);
  assert.match(runbook, /Do not guess the Supabase project/);
  assert.match(runbook, /Twilio sandbox acceptance/);
  assert.match(runbook, /Rollback/);
});


test("Voice DB doctor is locked to the AHMV Supabase project and performs no remote mutation", async () => {
  const doctor = await source("scripts/ahmv-voice-db-doctor.ts");
  assert.match(doctor, /bqflllsjxmhqsvemhhwv/);
  assert.match(doctor, /SUPABASE_PROJECT_REF/);
  assert.match(doctor, /Refusing Voice database operation against a non-AHMV Supabase project/);
  assert.match(doctor, /20261003090500_ahmv_phone_message_dedupe\.sql/);
  assert.match(doctor, /20261003110000_ahmv_phone_spanish\.sql/);
  assert.match(doctor, /20261003091000_ahmv_voice_sessions\.sql/);
  assert.match(doctor, /remoteMutationPerformed: false/);
  assert.doesNotMatch(doctor, /db push|apply_migration|execute_sql/);
});


test("Supabase Voice dry-run workflow is pinned, project-locked and non-mutating", async () => {
  const workflow = await source(".github/workflows/voice-db-dry-run.yml");
  assert.match(workflow, /SUPABASE_PROJECT_REF: bqflllsjxmhqsvemhhwv/);
  assert.match(workflow, /supabase@2\.119\.0/);
  assert.match(workflow, /migration list --linked/);
  assert.match(workflow, /db push --linked --dry-run/);
  assert.match(workflow, /AHMV-VOICE-DB-DRY-RUN/);
  assert.match(workflow, /environment: production/);
  assert.doesNotMatch(workflow, /db push --linked(?! --dry-run)/);
  assert.doesNotMatch(workflow, /db reset|migration repair|--include-seed/);
});


test("Voice integration preproduction deploy is main-merged, smoke-gated and rollback-safe", async () => {
  const workflow = await source(".github/workflows/deploy-voice-integration-preproduction.yml");
  assert.match(workflow, /git merge-base --is-ancestor/);
  assert.match(workflow, /origin\/main/);
  assert.match(workflow, /No successful AHM Verdun CI exists/);
  assert.doesNotMatch(workflow, /voice-ai-preprod-v6|voice-ai-service-v1/);
  assert.match(workflow, /bun run doctor:voice-db/);
  assert.match(workflow, /AHMV_VOICE_BRIDGE_TOKEN/);
  assert.match(workflow, /\/api\/ahmv\/voice\/readiness/);
  assert.match(workflow, /"ready"\[\[:space:\]\]\*:\[\[:space:\]\]\*true/);
  assert.match(workflow, /Roll back failed Voice preproduction activation/);
  assert.match(workflow, /x-robots-tag: noindex, nofollow/);
  assert.doesNotMatch(workflow, /AHMV_PRODUCTION_HOST|AHMV_PRODUCTION_URL/);
});



test("Voice human callback requests are structured, authenticated and privacy-safe", async () => {
  const [bridge, funnel, voiceAgent] = await Promise.all([
    source("src/lib/ahmv-voice-bridge.server.ts"),
    source("src/features/ahmv-phone/ops/funnel.server.ts"),
    source("services/ahmv-voice-ai/src/agent.js"),
  ]);

  assert.match(bridge, /\/handoff/);
  assert.match(bridge, /human_handoff/);
  assert.match(bridge, /preferredWindow/);
  assert.match(bridge, /provider_reference_hash/);
  assert.match(bridge, /CONTACT_NOT_FOUND/);
  assert.match(bridge, /allowedReasons/);
  assert.match(bridge, /allowedWindows/);
  assert.doesNotMatch(bridge, /callbackNotes|handoffNotes|freeFormReason/i);

  assert.match(voiceAgent, /request_human_handoff/);
  assert.match(voiceAgent, /FEATURE_DISABLED/);
  assert.match(voiceAgent, /handoffRequested/);

  assert.match(funnel, /handoffRequests7d/);
  assert.match(funnel, /intent === "human_handoff"/);
  assert.match(funnel, /outcome === "requested"/);
});


test("Voice shared knowledge route is private, source-linked and uses the common validated knowledge engine", async () => {
  const [bridge, knowledge, voiceData, voiceAgent, prompt] = await Promise.all([
    source("src/lib/ahmv-voice-bridge.server.ts"),
    source("src/lib/ahmv-knowledge.ts"),
    source("services/ahmv-voice-ai/src/ahm-data.js"),
    source("services/ahmv-voice-ai/src/agent.js"),
    source("services/ahmv-voice-ai/src/prompt.js"),
  ]);

  assert.match(bridge, /\$\{ROOT\}\/knowledge/);
  assert.match(bridge, /searchAhmvKnowledge/);
  assert.match(bridge, /new URL\(hit\.sourcePath, "https:\/\/ahmverdun\.ca"\)/);
  assert.match(knowledge, /filter\(\(item\) => item\.validated\)/);
  assert.match(knowledge, /ARENAS\.map/);
  assert.match(voiceData, /findKnowledge/);
  assert.match(voiceAgent, /name: 'find_knowledge'/);
  assert.match(prompt, /call find_knowledge/);
  assert.doesNotMatch(knowledge, /service_role|SUPABASE_SERVICE_ROLE_KEY|AHMV_VOICE_BRIDGE_TOKEN/);
});
