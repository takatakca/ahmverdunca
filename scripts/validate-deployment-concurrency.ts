import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const auto = readFileSync(".github/workflows/deploy-production-auto.yml", "utf8");
const manual = readFileSync(".github/workflows/deploy-production.yml", "utf8");
const pre = readFileSync(".github/workflows/deploy-preproduction.yml", "utf8");
const sftp = readFileSync("scripts/deploy-production-sftp.sh", "utf8");
const server = readFileSync("src/server.ts", "utf8");

assert.match(auto, /concurrency:\s*\n\s*group: ahmverdun-production-auto\s*\n\s*cancel-in-progress: true/);
assert.match(manual, /concurrency:\s*\n\s*group: ahmverdun-production-auto\s*\n\s*cancel-in-progress: true/);
assert.match(pre, /concurrency:\s*\n\s*group: ahmverdun-preproduction\s*\n\s*cancel-in-progress: true/);

assert.match(auto, /AHMV_SSH_MAX_ATTEMPTS=6 ahmv-ssh/);
assert.match(auto, /AHMV_SFTP_MAX_ATTEMPTS=4 scripts\/deploy-production-sftp\.sh test/);
assert.doesNotMatch(auto, /AHMV_SSH_MAX_ATTEMPTS=8 ahmv-ssh/);
assert.equal((auto.match(/group: ahmverdun-production-auto/g) ?? []).length, 1);

assert.match(auto, /VITE_AHMV_BUILD_SHA:\s*\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
assert.match(auto, /RESTART_COMMAND:\s*\$\{\{ secrets\.AHMV_PRODUCTION_RESTART_COMMAND \}\}/);
assert.match(auto, /AHMV_PRODUCTION_URL\s*\\\n\s*RESTART_COMMAND/);
assert.match(auto, /ahmv-ssh "\$RESTART_COMMAND"/);
assert.doesNotMatch(auto, /AHMV_APP_ROOT\/current\/tmp\/restart\.txt/);
assert.doesNotMatch(auto, /AHMV_APP_ROOT\/tmp\/restart\.txt/);
assert.match(auto, /SFTP access is available, but production activation requires/);
assert.match(auto, /Refusing to upload or activate a release that cannot be restarted and runtime-certified/);
assert.match(auto, /Passenger is not serving the compiled release SHA/);
assert.match(sftp, /current\/tmp\/restart\.txt/);
assert.doesNotMatch(sftp, /"%s\/tmp\/restart\.txt"/);
assert.match(server, /release:\s*BUILD_RELEASE_SHA/);
assert.match(server, /VITE_AHMV_BUILD_SHA/);

console.log("AHM Verdun deployment concurrency contract passed.");
