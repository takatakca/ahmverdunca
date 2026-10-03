import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => readFile(path.join(root, name), "utf8");

const [agent, bridge, store, prompt, config] = await Promise.all([
  read("src/agent.js"),
  read("src/ahm-bridge.js"),
  read("src/store.js"),
  read("src/prompt.js"),
  read("src/config.js"),
]);

assert.match(config, /FEATURE_HUMAN_HANDOFF_ENABLED/);
assert.match(agent, /name: 'request_human_handoff'/);
assert.match(agent, /featureHumanHandoff/);
assert.match(agent, /session\.handoffRequested/);
assert.match(agent, /preferredWindow/);
assert.match(agent, /billing_access/);
assert.match(bridge, /bridgeFetch\('handoff'/);
assert.match(bridge, /NO_CALLBACK_DESTINATION/);
assert.match(store, /handoffRequested/);
assert.match(store, /handoffReason/);
assert.match(store, /handoffPreferredWindow/);
assert.match(prompt, /HUMAN FOLLOW-UP/);
assert.match(prompt, /Never promise a specific callback time/);

assert.doesNotMatch(agent, /callbackNotes|handoffNotes|freeFormReason/i);
assert.doesNotMatch(store, /callbackNotes|handoffNotes|freeFormReason/i);

console.log(JSON.stringify({
  ok: true,
  feature: "human_handoff",
  mode: "privacy_safe_callback_request",
  storesFreeFormCallerExplanation: false,
}, null, 2));
