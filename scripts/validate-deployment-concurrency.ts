import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const auto = readFileSync(".github/workflows/deploy-production-auto.yml", "utf8");
const manual = readFileSync(".github/workflows/deploy-production.yml", "utf8");
const pre = readFileSync(".github/workflows/deploy-preproduction.yml", "utf8");

assert.match(auto, /concurrency:\s*\n\s*group: ahmverdun-production\s*\n\s*cancel-in-progress: true/);
assert.match(manual, /concurrency:\s*\n\s*group: ahmverdun-production\s*\n\s*cancel-in-progress: true/);
assert.match(pre, /concurrency:\s*\n\s*group: ahmverdun-preproduction\s*\n\s*cancel-in-progress: true/);

assert.match(auto, /AHMV_SSH_MAX_ATTEMPTS=3 ahmv-ssh/);
assert.match(auto, /AHMV_SFTP_MAX_ATTEMPTS=2 scripts\/deploy-production-sftp\.sh test/);
assert.doesNotMatch(auto, /AHMV_SSH_MAX_ATTEMPTS=8 ahmv-ssh/);
assert.doesNotMatch(auto, /group: ahmverdun-production-auto/);

console.log("AHM Verdun deployment concurrency contract passed.");
