import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFile(path.join(root, p), "utf8");

const [
  pkgRaw, lockRaw, config, agent, store, bridge, security, twiml, nginx, service, env
] = await Promise.all([
  read("package.json"),
  read("package-lock.json"),
  read("src/config.js"),
  read("src/agent.js"),
  read("src/store.js"),
  read("src/ahm-bridge.js"),
  read("src/twilio-security.js"),
  read("src/twiml.js"),
  read("deploy/nginx-voice.ahmverdun.ca.conf"),
  read("deploy/ahmv-voice.service"),
  read(".env.example"),
]);

const pkg = JSON.parse(pkgRaw);
const lock = JSON.parse(lockRaw);
assert.equal(pkg.version, lock.packages[""].version, "package.json/package-lock version mismatch");
assert.equal(pkg.engines.node, ">=22");
for (const [name, version] of Object.entries(pkg.dependencies)) {
  assert.equal(lock.packages[""].dependencies[name], version, `Lockfile root dependency mismatch: ${name}`);
}

assert.match(config, /TWILIO_VALIDATE_SIGNATURES=false is forbidden in production/);
assert.match(config, /AHM_DATA_MODE=fixture is forbidden in production/);
assert.match(config, /VOICE_INSTANCE_MODE/);
assert.match(config, /\['single'\]/);
assert.match(config, /TWILIO_TTS_VOICE is required in production/);
assert.doesNotMatch(config, /AHM_DATA_API_URL|AHM_DATA_API_TOKEN/);

assert.match(agent, /store:\s*false/);
assert.match(agent, /parallel_tool_calls:\s*false/);
assert.match(agent, /loops\s*<\s*5/);
assert.match(agent, /find_schedule/);
assert.match(agent, /find_arena/);

assert.doesNotMatch(store, /transcript_summary/);
assert.match(store, /includeMessages:\s*false/);
assert.match(store, /claim_ahmv_voice_sms/);
assert.match(store, /claim_ahmv_voice_audit/);

assert.match(bridge, /AHM_VOICE_BRIDGE/);
assert.doesNotMatch(bridge, /AHM_DATA_API/);
assert.match(security, /validateRequest/);
assert.match(twiml, /ConversationRelay/);
assert.match(twiml, /ttsProvider="ElevenLabs"/);
assert.match(twiml, /transcriptionProvider="Deepgram"/);

assert.match(nginx, /server_name voice\.ahmverdun\.ca/);
assert.match(nginx, /proxy_set_header Upgrade \$http_upgrade/);
assert.match(nginx, /X-Forwarded-Proto https/);
assert.match(service, /\/opt\/ahmv-voice-ai\/current/);
assert.match(service, /TimeoutStopSec=20/);
assert.match(service, /NoNewPrivileges=true/);

for (const name of [
  "PUBLIC_BASE_URL",
  "PUBLIC_WSS_URL",
  "TWILIO_VALIDATE_SIGNATURES",
  "AHM_VOICE_BRIDGE_URL",
  "AHM_VOICE_BRIDGE_TOKEN",
  "REQUIRE_PERSISTENT_STORE",
  "VOICE_INSTANCE_MODE",
]) {
  assert.match(env, new RegExp(`^${name}=`, "m"), `Missing env contract: ${name}`);
}

const forbiddenNames = ["transcript_summary", "AHM_DATA_API_URL", "AHM_DATA_API_TOKEN"];
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir)) {
    if (["node_modules", ".git"].includes(entry)) continue;
    const full = path.join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}
const files = await walk(root);
for (const full of files) {
  if (full.endsWith("package-lock.json")) continue;
  const source = await readFile(full, "utf8").catch(() => "");
  for (const forbidden of forbiddenNames) {
    assert.ok(!source.includes(forbidden), `Forbidden legacy/privacy surface in ${path.relative(root, full)}: ${forbidden}`);
  }
  if (!full.endsWith(".env.example")) {
    assert.doesNotMatch(source, /sk-proj-[A-Za-z0-9_-]{20,}/, `Possible OpenAI production secret in ${full}`);
    assert.doesNotMatch(source, /AC[0-9a-fA-F]{32}/, `Possible Twilio Account SID in ${full}`);
  }
}

console.log(JSON.stringify({
  ok: true,
  guardian: "AHMV Voice Guardian",
  version: pkg.version,
  node: pkg.engines.node,
  filesScanned: files.length,
  dependencies: Object.keys(pkg.dependencies).length,
  invariants: {
    noRawTranscriptSurface: true,
    openAiStoreFalse: true,
    serializedToolCalls: true,
    twilioSignatureValidationProductionRequired: true,
    fixtureModeProductionForbidden: true,
    singleInstanceGuard: true,
    immutableReleaseSystemd: true,
    websocketProxy: true,
  }
}, null, 2));
