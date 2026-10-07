import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { constants, createDecipheriv, generateKeyPairSync, privateDecrypt } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { encryptInventory, publicKeyFingerprint, recipientKey, RECIPIENT_SPKI_SHA256, REMOTE_COMMAND, validateProjection, validateSshSettings } from "./hosting-app-inventory.mjs";

const fixtureKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });

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
    assert.match(runner, /90_000/);
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
