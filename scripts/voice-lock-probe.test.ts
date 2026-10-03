import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const VOICE_PACKAGE = "{\n  \"name\": \"ahmv-voice-ai\",\n  \"version\": \"0.3.0-preproduction\",\n  \"private\": true,\n  \"type\": \"module\",\n  \"description\": \"AHM Verdun trilingual Twilio ConversationRelay + OpenAI voice assistant\",\n  \"engines\": {\n    \"node\": \">=22\"\n  },\n  \"dependencies\": {\n    \"@fastify/formbody\": \"8.0.2\",\n    \"@fastify/websocket\": \"11.2.0\",\n    \"@supabase/supabase-js\": \"2.75.0\",\n    \"fastify\": \"5.6.1\",\n    \"openai\": \"6.9.0\",\n    \"twilio\": \"5.10.4\"\n  }\n}\n";

test("temporary Voice AI npm lock probe", { timeout: 120_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "ahmv-voice-lock-"));
  writeFileSync(join(dir, "package.json"), VOICE_PACKAGE);
  const npmVersion = execFileSync("npm", ["--version"], { encoding: "utf8" }).trim();
  console.log("VOICE_NPM_VERSION", npmVersion);

  execFileSync(
    "npm",
    ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"],
    { cwd: dir, stdio: "inherit", timeout: 120000 },
  );

  const lockPath = join(dir, "package-lock.json");
  const lock = readFileSync(lockPath);
  const parsed = JSON.parse(lock.toString("utf8"));
  assert.equal(parsed.lockfileVersion, 3);
  assert.equal(parsed.packages[""].dependencies.openai, "6.9.0");
  assert.equal(parsed.packages[""].dependencies.twilio, "5.10.4");

  const sha = createHash("sha256").update(lock).digest("hex");
  const base64 = gzipSync(lock, { level: 9 }).toString("base64");
  console.log("VOICE_LOCK_SHA256", sha);
  console.log("VOICE_LOCK_GZIP_BASE64_BEGIN");
  for (let i = 0; i < base64.length; i += 120) console.log(base64.slice(i, i + 120));
  console.log("VOICE_LOCK_GZIP_BASE64_END");

  execFileSync(
    "npm",
    ["ci", "--ignore-scripts", "--no-audit", "--no-fund"],
    { cwd: dir, stdio: "inherit", timeout: 180000 },
  );

  writeFileSync(
    join(dir, "probe.mjs"),
    [
      'await import("fastify");',
      'await import("@fastify/formbody");',
      'await import("@fastify/websocket");',
      'await import("@supabase/supabase-js");',
      'await import("openai");',
      'await import("twilio");',
      'console.log("VOICE_IMPORT_SMOKE_OK");',
    ].join("\n"),
  );
  execFileSync("node", ["probe.mjs"], { cwd: dir, stdio: "inherit", timeout: 30000 });


});
