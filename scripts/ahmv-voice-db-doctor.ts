import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const EXPECTED_PROJECT_REF = "bqflllsjxmhqsvemhhwv";

const config = await readFile(new URL("../supabase/config.toml", import.meta.url), "utf8");
const match = config.match(/^project_id\s*=\s*"([^"]+)"\s*$/m);
assert.ok(match, "supabase/config.toml is missing project_id");
assert.equal(match[1], EXPECTED_PROJECT_REF, "Repository Supabase project ref does not match AHMV");

const requested = process.env["SUPABASE_PROJECT_REF"]?.trim();
if (requested) {
  assert.equal(
    requested,
    EXPECTED_PROJECT_REF,
    "Refusing Voice database operation against a non-AHMV Supabase project",
  );
}

const requiredMigrations = [
  "supabase/migrations/20261003090500_ahmv_phone_message_dedupe.sql",
  "supabase/migrations/20261003110000_ahmv_phone_spanish.sql",
  "supabase/migrations/20261003091000_ahmv_voice_sessions.sql",
];

for (const path of requiredMigrations) {
  const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  assert.ok(source.trim().length > 0, `Required migration is empty: ${path}`);
}

const voiceMigration = await readFile(
  new URL("../supabase/migrations/20261003091000_ahmv_voice_sessions.sql", import.meta.url),
  "utf8",
);
assert.match(voiceMigration, /enable row level security/i);
assert.match(voiceMigration, /revoke all on public\.ahmv_voice_sessions from anon, authenticated/i);
assert.doesNotMatch(voiceMigration, /transcript_summary/i);
assert.doesNotMatch(voiceMigration, /voice_memberships/i);

console.log(JSON.stringify({
  ok: true,
  service: "ahmv-voice-db-doctor",
  projectRef: EXPECTED_PROJECT_REF,
  requiredMigrations: requiredMigrations.length,
  remoteMutationPerformed: false,
}));
