import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { constants, createDecipheriv, generateKeyPairSync, privateDecrypt } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { collectProjectedInventory, encryptInventory, frameProjectionSource, parseFramedProjection, publicKeyFingerprint, recipientKey, RECIPIENT_SPKI_SHA256, REMOTE_COMMAND, PROJECTION_BEGIN, PROJECTION_END, runSshAttempt, SHELL_SOURCE_DELIMITER, SSH_TOTAL_BUDGET_MS, validateProjection, validateSshSettings } from "./hosting-app-inventory.mjs";

const fixtureKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const fixtureProjection = { version: 1, passenger: { status: "no_matching_apps", applications: [] }, domainConfiguration: { status: "not_available", domain: null }, domainPassengerDirectives: { status: "not_available", domain: "takatak.ca" } };
const fixtureSource = 'import json\nprint(json.dumps({"version":1,"passenger":{"status":"no_matching_apps","applications":[]}}))\n';
const fixtureSettings = { RUNNER_TEMP: "fixture-runner" };

function framedFixture(prefix = "", suffix = "") {
  return `${prefix}\n${PROJECTION_BEGIN}\n${JSON.stringify(fixtureProjection)}\n${PROJECTION_END}\n${suffix}`;
}

function fixtureChild() {
  const child = new EventEmitter();
  child.stdin = new PassThrough();
  child.stdout = new PassThrough();
  child.killed = false;
  child.kill = (signal) => { child.killed = signal; return true; };
  return child;
}

function decryptFixture(envelope) {
  const key = privateDecrypt({ key: fixtureKeys.privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, Buffer.from(envelope.wrappedKey, "base64"));
  const metadata = { version: envelope.version, purpose: envelope.purpose, algorithm: envelope.algorithm, recipientSpkiSha256: envelope.recipientSpkiSha256 };
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(envelope.iv, "base64"));
  decipher.setAAD(Buffer.from(JSON.stringify(metadata)));
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, "base64")), decipher.final()]).toString("utf8"));
}

describe("Encrypted read-only hosting inventory", () => {
  it("uses the committed owner public key pin and refuses a replacement recipient", async () => {
    const pem = await readFile(new URL("./assets/hosting-inventory-recipient.pem", import.meta.url), "utf8");
    assert.equal(publicKeyFingerprint(recipientKey(pem)), RECIPIENT_SPKI_SHA256);
    const otherPublicPem = fixtureKeys.publicKey.export({ type: "spki", format: "pem" });
    assert.throws(() => recipientKey(otherPublicPem), /pin/);
    assert.throws(() => recipientKey(fixtureKeys.privateKey.export({ type: "pkcs8", format: "pem" })), /format/);
  });

  it("AES-GCM and RSA-OAEP-SHA256 round-trip metadata without cleartext fields", () => {
    const payload = { version: 1, passenger: { status: "ready", applications: [{ domain: "takatak.ca", appRoot: "/home/fixture/takatak", environmentVariableNames: ["DATABASE_URL"] }] } };
    const envelope = encryptInventory(payload, fixtureKeys.publicKey);
    assert.deepEqual(decryptFixture(envelope), payload);
    const serialized = JSON.stringify(envelope);
    assert.ok(!serialized.includes("/home/fixture/takatak"));
    assert.ok(!serialized.includes("DATABASE_URL"));
    assert.equal(Buffer.from(envelope.iv, "base64").length, 12);
    assert.equal(Buffer.from(envelope.tag, "base64").length, 16);
    assert.notEqual(envelope.ciphertext, encryptInventory(payload, fixtureKeys.publicKey).ciphertext);
  });

  it("tampering with authenticated metadata or ciphertext cannot be decrypted", () => {
    const envelope = encryptInventory({ status: "ready" }, fixtureKeys.publicKey);
    assert.throws(() => decryptFixture({ ...envelope, purpose: "different-purpose" }));
    const ciphertext = Buffer.from(envelope.ciphertext, "base64");
    ciphertext[0] ^= 1;
    assert.throws(() => decryptFixture({ ...envelope, ciphertext: ciphertext.toString("base64") }));
  });

  it("the runner allowlist drops other domains, values and raw error text again", () => {
    const input = { version: 1, passenger: { status: "ready", errors: ["fixture-secret"], applications: [
      { domain: "takatak.ca", appName: "TK", appRoot: "/home/fixture/takatak", startupFile: "server.js", environmentVariableNames: ["TOKEN", "TOKEN", "TOKEN=fixture-secret"], environmentValues: { TOKEN: "fixture-secret" }, status: "enabled" },
      { domain: "unrelated.example", appRoot: "/home/other/private", status: "enabled" },
    ] }, domainConfiguration: { status: "ready", domain: { domain: "takatak.ca", documentRoot: "/home/fixture/public_html", privateCertificate: "fixture-secret" } } };
    const result = validateProjection(input);
    assert.equal(result.passenger.applications.length, 1);
    assert.deepEqual(result.passenger.applications[0].environmentVariableNames, ["TOKEN"]);
    assert.ok(!JSON.stringify(result).includes("fixture-secret"));
    assert.ok(!JSON.stringify(result).includes("/home/other"));
    assert.deepEqual(validateProjection({ errors: ["fixture-secret"] }).passenger.applications, []);
  });

  it("transport fields cannot inject SSH configuration or change the current UID", () => {
    const settings = { AHMV_HOST: "fixture.example", AHMV_PORT: "22", AHMV_USER: "owner", AHMV_SSH_PRIVATE_KEY: "fixture-only-key", AHMV_KNOWN_HOSTS: "fixture-only-pin" };
    assert.doesNotThrow(() => validateSshSettings(settings));
    for (const patch of [{ AHMV_HOST: "host\nProxyCommand unsafe" }, { AHMV_USER: "root" }, { AHMV_USER: "owner;unsafe" }, { AHMV_PORT: "65536" }, { AHMV_KNOWN_HOSTS: "" }]) assert.throws(() => validateSshSettings({ ...settings, ...patch }));
    assert.equal(REMOTE_COMMAND, "python3 -B -");
  });

  it("preserves a configured application-root symlink separately from its current child", () => {
    const projection = validateProjection({ version: 1, passenger: { status: "no_matching_apps", applications: [] }, domainConfiguration: { status: "ready", domain: null }, domainPassengerDirectives: { status: "ready", domain: "takatak.ca", PassengerAppRoot: "/home/owner/current", appRootIsSymlink: true, currentIsSymlink: false, startupFileExists: true } });
    assert.equal(projection.domainPassengerDirectives.appRootIsSymlink, true);
    assert.equal(projection.domainPassengerDirectives.currentIsSymlink, false);
    assert.equal(projection.domainPassengerDirectives.PassengerAppRoot, "/home/owner/current");
  });

  it("accepts exactly one framed projection and discards banners, raw JSON and echoed source", () => {
    const source = frameProjectionSource(fixtureSource);
    const projection = parseFramedProjection(framedFixture(`fixture banner with fixture-secret\n${source}`, "fixture footer with fixture-secret"));
    assert.equal(projection.passenger.status, "no_matching_apps");
    assert.ok(!JSON.stringify(projection).includes("fixture-secret"));
    assert.throws(() => parseFramedProjection(JSON.stringify(fixtureProjection)), /frame/);
    assert.throws(() => parseFramedProjection(framedFixture() + framedFixture()), /frame/);
    assert.throws(() => parseFramedProjection(`${PROJECTION_END}\n{}\n${PROJECTION_BEGIN}`), /frame/);
    assert.throws(() => parseFramedProjection(`\n${PROJECTION_BEGIN}\n{"errors":["fixture-secret"]}\n${PROJECTION_END}\n`), /schema/);
    assert.throws(() => frameProjectionSource(`${fixtureSource}\n${SHELL_SOURCE_DELIMITER}\n`), /source/);
  });

  it("retries only SSH exit 255 through the same pinned non-PTY shell channel", async () => {
    const calls = [];
    let time = 1000;
    const result = await collectProjectedInventory({ settings: fixtureSettings, script: fixtureSource, now: () => time, attempt: async (request) => {
      calls.push(request);
      if (calls.length === 1) { time += 30_000; return { exitCode: 255, reason: "ssh_exit_255", stderr: "fixture-secret" }; }
      return { exitCode: 0, reason: "projection_received", projection: parseFramedProjection(framedFixture("fixture-secret banner")) };
    } });
    assert.equal(result.transport.selected, "shell");
    assert.deepEqual(result.transport.attempts, [{ type: "exec", exitCode: 255, reason: "ssh_exit_255" }, { type: "shell", exitCode: 0, reason: "projection_received" }]);
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0].args.slice(0, -1), calls[1].args);
    assert.equal(calls[0].args.at(-1), REMOTE_COMMAND);
    assert.deepEqual(calls[1].args.slice(-2), ["-T", "ahmv-hosting-inventory"]);
    assert.equal(calls[0].timeoutMs, SSH_TOTAL_BUDGET_MS);
    assert.equal(calls[1].timeoutMs, SSH_TOTAL_BUDGET_MS - 30_000);
    assert.equal(calls[1].input, `${REMOTE_COMMAND} <<'${SHELL_SOURCE_DELIMITER}'\n${calls[0].input}${SHELL_SOURCE_DELIMITER}\nexit\n`);
    const shell = process.platform === "win32" ? "C:\\Program Files\\Git\\bin\\bash.exe" : "bash";
    assert.equal(spawnSync(shell, ["--noprofile", "--norc", "-n"], { input: calls[1].input, encoding: "utf8" }).status, 0);
    assert.ok(!JSON.stringify(result).includes("fixture-secret"));
  });

  it("returns successful exec directly and never retries remote command, schema or launch failure", async () => {
    for (const outcome of [
      { exitCode: 0, reason: "projection_received", projection: fixtureProjection },
      { exitCode: 127, reason: "command_unavailable" },
      { exitCode: 1, reason: "remote_command_failed" },
      { exitCode: 0, reason: "invalid_projection" },
      { exitCode: null, reason: "ssh_launch_failed" },
    ]) {
      let calls = 0;
      const result = await collectProjectedInventory({ settings: fixtureSettings, script: fixtureSource, attempt: async () => { calls++; return outcome; } });
      assert.equal(calls, 1);
      assert.equal(result.transport.attempts[0].reason, outcome.reason);
      assert.equal(result.transport.selected, outcome.reason === "projection_received" ? "exec" : null);
      assert.equal(result.passenger.status, outcome.reason === "projection_received" ? "no_matching_apps" : outcome.reason === "invalid_projection" ? "schema_unavailable" : "transport_unavailable");
    }
  });

  it("does not start a fallback after timeout or exhaustion of the shared budget", async () => {
    for (const outcome of [{ exitCode: null, reason: "timeout" }, { exitCode: 255, reason: "ssh_exit_255" }]) {
      let time = 0;
      let calls = 0;
      const result = await collectProjectedInventory({ settings: fixtureSettings, script: fixtureSource, now: () => time, attempt: async () => { calls++; time = SSH_TOTAL_BUDGET_MS; return outcome; } });
      assert.equal(calls, 1);
      assert.equal(result.transport.budgetExceeded, true);
      assert.equal(result.transport.selected, null);
    }
    await assert.rejects(() => collectProjectedInventory({ settings: fixtureSettings, script: fixtureSource, totalBudgetMs: SSH_TOTAL_BUDGET_MS + 1 }), /budget/);
  });

  it("the SSH process discards stderr, bounds stdout, classifies exit127 and kills a timeout", async () => {
    for (const code of [127, 255, 1, 0]) {
      const child = fixtureChild();
      const promise = runSshAttempt({ args: ["-T", "fixture-alias"], input: "fixture-input", timeoutMs: 500 }, (command, args, options) => {
        assert.equal(command, "ssh");
        assert.deepEqual(options.stdio, ["pipe", "pipe", "ignore"]);
        queueMicrotask(() => { child.stdout.write(framedFixture("fixture-secret banner")); child.emit("close", code); });
        return child;
      });
      const result = await promise;
      assert.equal(result.exitCode, code);
      assert.equal(result.reason, code === 127 ? "command_unavailable" : code === 255 ? "ssh_exit_255" : code === 0 ? "projection_received" : "remote_command_failed");
      assert.ok(!JSON.stringify(result).includes("fixture-secret"));
    }
    const hanging = fixtureChild();
    const timeout = await runSshAttempt({ args: [], input: "fixture-input", timeoutMs: 5 }, () => hanging);
    assert.deepEqual(timeout, { exitCode: null, reason: "timeout" });
    assert.equal(hanging.killed, "SIGKILL");
    const oversized = fixtureChild();
    const limited = runSshAttempt({ args: [], input: "fixture-input", timeoutMs: 500 }, () => {
      queueMicrotask(() => oversized.stdout.write(Buffer.alloc(262_145, 65)));
      return oversized;
    });
    assert.deepEqual(await limited, { exitCode: null, reason: "output_limit" });
    assert.equal(oversized.killed, "SIGKILL");
    assert.deepEqual(await runSshAttempt({ args: [], input: "fixture-input", timeoutMs: 500 }, () => { throw new Error("fixture-secret"); }), { exitCode: null, reason: "ssh_launch_failed" });
  });

  it("the workflow is manual, main-only, disabled by default and stores only ciphertext", async () => {
    const workflow = await readFile(new URL("../.github/workflows/hosting-app-inventory.yml", import.meta.url), "utf8");
    assert.match(workflow, /workflow_dispatch:/);
    assert.match(workflow, /type: boolean\s+default: false/);
    assert.match(workflow, /if: github\.ref == 'refs\/heads\/main' && inputs\.collect_inventory/);
    assert.match(workflow, /timeout-minutes: 5/);
    assert.match(workflow, /retention-days: 3/);
    assert.match(workflow, /path:.*hosting-app-inventory\.enc\.json/);
    assert.match(workflow, /permissions:\s+contents: read/);
    assert.doesNotMatch(workflow, /actions: write|contents: write|workflow_run:|pull_request:|schedule:/);
    for (const action of workflow.matchAll(/uses: ([^\s]+)/g)) assert.match(action[1], /@[a-f0-9]{40}$/);
    const source = await readFile(new URL("./hosting-app-projection.py", import.meta.url), "utf8");
    assert.match(source, /"\/usr\/local\/cpanel\/bin\/uapi"/);
    assert.match(source, /"PassengerApps", "list_applications"/);
    assert.match(source, /"DomainInfo", "single_domain_data", "domain=takatak\.ca"/);
    assert.doesNotMatch(source, /sudo|--user=|Fileman|set_env|restart|register_application/);
    assert.match(source, /os\.open\(str\(candidate\), os\.O_RDONLY \| getattr\(os, "O_NOFOLLOW", 0\)\)/);
    assert.match(source, /scoped_file_exists\(scoped_root \/ "\.env", home\)/);
    const runner = await readFile(new URL("./hosting-app-inventory.mjs", import.meta.url), "utf8");
    assert.match(runner, /StrictHostKeyChecking yes/);
    assert.match(runner, /stdio: \["pipe", "pipe", "ignore"\]/);
    assert.match(runner, /120_000/);
    assert.doesNotMatch(runner, /console\.(?:log|error)\((?:input|projection|envelope|chunks|settings|error)[),]/);
    const shell = process.platform === "win32" ? "C:\\Program Files\\Git\\bin\\bash.exe" : "bash";
    const blocks = [...workflow.matchAll(/run: \|\r?\n((?: {10}[^\r\n]*\r?\n|[ \t]*\r?\n)+)/g)];
    assert.equal(blocks.length, 3);
    for (const block of blocks) {
      const script = block[1].split(/\r?\n/).map((line) => line.replace(/^ {10}/, "")).join("\n");
      const parsed = spawnSync(shell, ["--noprofile", "--norc", "-n"], { input: script, encoding: "utf8" });
      assert.equal(parsed.status, 0, "Inventory Bash block must parse without execution");
    }
  });
});
