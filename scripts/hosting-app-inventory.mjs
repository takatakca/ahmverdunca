import { createCipheriv, createHash, createPublicKey, constants, publicEncrypt, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RECIPIENT_SPKI_SHA256 = "ebcb695f859f2760aa6748e27094c12fff11cc0b114e294d1650dc89e795f785";
export const REMOTE_COMMAND = "python3 -B -";
export const SSH_TOTAL_BUDGET_MS = 120_000;
export const PROJECTION_BEGIN = "AHMV_INVENTORY_PROJECTED_JSON_BEGIN_V1";
export const PROJECTION_END = "AHMV_INVENTORY_PROJECTED_JSON_END_V1";
export const SHELL_SOURCE_DELIMITER = "AHMV_INVENTORY_REVIEWED_PYTHON_SOURCE_EOF";
const MAX_TRANSPORT_BYTES = 262_144;
const RECIPIENT_FILE = new URL("./assets/hosting-inventory-recipient.pem", import.meta.url);
const PROJECTION_FILE = new URL("./hosting-app-projection.py", import.meta.url);
const STATUSES = new Set(["ready", "no_matching_apps", "api_unavailable", "schema_unavailable", "transport_unavailable", "scope_unavailable", "not_available"]);
const DOMAINS = new Set(["takatak.ca", "ahmverdun.ca"]);
const PURPOSE = "ahmv-hosting-app-inventory";

export function publicKeyFingerprint(key) {
  return createHash("sha256").update(key.export({ type: "spki", format: "der" })).digest("hex");
}

export function recipientKey(pem, expectedFingerprint = RECIPIENT_SPKI_SHA256) {
  if (typeof pem !== "string" || !pem.includes("-----BEGIN PUBLIC KEY-----") || pem.includes("PRIVATE KEY") || pem.length > 4096) throw new Error("Recipient key format is invalid");
  const key = createPublicKey(pem);
  if (key.asymmetricKeyType !== "rsa" || key.asymmetricKeyDetails?.modulusLength < 2048 || publicKeyFingerprint(key) !== expectedFingerprint) throw new Error("Recipient key pin is invalid");
  return key;
}

export function encryptInventory(payload, key) {
  const fingerprint = publicKeyFingerprint(key);
  const metadata = { version: 1, purpose: PURPOSE, algorithm: "RSA-OAEP-256+A256GCM", recipientSpkiSha256: fingerprint };
  const aad = Buffer.from(JSON.stringify(metadata));
  const aesKey = randomBytes(32);
  const iv = randomBytes(12);
  try {
    const cipher = createCipheriv("aes-256-gcm", aesKey, iv);
    cipher.setAAD(aad);
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
    const wrappedKey = publicEncrypt({ key, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, aesKey);
    return { ...metadata, wrappedKey: wrappedKey.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") };
  } finally {
    aesKey.fill(0);
  }
}

function safeName(value) { return typeof value === "string" && /^[A-Za-z0-9_. -]{1,128}$/.test(value) ? value : null; }
function safePath(value) { return typeof value === "string" && value.length <= 512 && /^\/[A-Za-z0-9_. /-]+$/.test(value) && !value.split("/").some((part) => part === "." || part === "..") ? value : null; }
function safeStatus(value) { return STATUSES.has(value) ? value : "schema_unavailable"; }
function safeStartup(value) { return typeof value === "string" && value !== "." && value !== ".." && /^[A-Za-z0-9_.-]{1,128}$/.test(value) ? value : null; }

/** Second allowlist on the runner; it never accepts cPanel raw responses or values. */
export function validateProjection(input) {
  if (!input || input.version !== 1 || !input.passenger || !Array.isArray(input.passenger.applications) || input.passenger.applications.length > 128) return unavailableProjection("schema_unavailable");
  const applications = input.passenger.applications.filter((record) => record && DOMAINS.has(record.domain)).map((record) => ({
    domain: record.domain,
    appName: safeName(record.appName),
    appRoot: safePath(record.appRoot),
    startupFile: safeStartup(record.startupFile),
    environmentVariableNames: Array.isArray(record.environmentVariableNames) ? [...new Set(record.environmentVariableNames.filter((name) => typeof name === "string" && /^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(name)))].sort().slice(0, 256) : [],
    status: ["enabled", "disabled", "unknown"].includes(record.status) ? record.status : "unknown",
  }));
  const config = input.domainConfiguration;
  const directives = input.domainPassengerDirectives?.domain === "takatak.ca" ? input.domainPassengerDirectives : null;
  const optionalBoolean = (value) => typeof value === "boolean" ? value : null;
  return {
    version: 1,
    passenger: {
      status: input.passenger.status === "ready" && applications.length === 0 ? "no_matching_apps" : safeStatus(input.passenger.status),
      applications: ["ready", "no_matching_apps"].includes(input.passenger.status) ? applications : [],
    },
    domainConfiguration: {
      status: safeStatus(config?.status),
      domain: config?.domain?.domain === "takatak.ca" ? { domain: "takatak.ca", documentRoot: safePath(config.domain.documentRoot) } : null,
    },
    domainPassengerDirectives: {
      status: safeStatus(directives?.status),
      domain: "takatak.ca",
      PassengerAppRoot: directives?.domain === "takatak.ca" ? safePath(directives.PassengerAppRoot) : null,
      PassengerStartupFile: safeStartup(directives?.PassengerStartupFile),
      PassengerNodejs: directives?.domain === "takatak.ca" ? safePath(directives.PassengerNodejs) : null,
      PassengerAppType: ["node", "python", "ruby"].includes(directives?.PassengerAppType) ? directives.PassengerAppType : null,
      PassengerEnabled: ["on", "off"].includes(directives?.PassengerEnabled) ? directives.PassengerEnabled : null,
      appRootIsSymlink: optionalBoolean(directives?.appRootIsSymlink),
      currentIsSymlink: optionalBoolean(directives?.currentIsSymlink),
      envFileExists: optionalBoolean(directives?.envFileExists),
      startupFileExists: optionalBoolean(directives?.startupFileExists),
    },
  };
}

function unavailableProjection(status) {
  return { version: 1, passenger: { status, applications: [] }, domainConfiguration: { status, domain: null }, domainPassengerDirectives: { status, domain: "takatak.ca", PassengerAppRoot: null, PassengerStartupFile: null, PassengerNodejs: null, PassengerAppType: null, PassengerEnabled: null, appRootIsSymlink: null, currentIsSymlink: null, envFileExists: null, startupFileExists: null } };
}

export function validateSshSettings(settings) {
  for (const key of ["AHMV_HOST", "AHMV_PORT", "AHMV_USER", "AHMV_SSH_PRIVATE_KEY", "AHMV_KNOWN_HOSTS"]) {
    if (typeof settings[key] !== "string" || !settings[key].trim()) throw new Error("Inventory transport is not configured");
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9.-]{0,253}$/.test(settings.AHMV_HOST)
    || !/^\d+$/.test(settings.AHMV_PORT) || Number(settings.AHMV_PORT) < 1 || Number(settings.AHMV_PORT) > 65535
    || !/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,63}$/.test(settings.AHMV_USER) || settings.AHMV_USER === "root") throw new Error("Inventory transport format is invalid");
}

function inventoryDirectory(settings) {
  if (!settings.RUNNER_TEMP || /[\r\n\0]/.test(settings.RUNNER_TEMP)) throw new Error("Runner directory is unavailable");
  return path.join(path.resolve(settings.RUNNER_TEMP), "ahmv-hosting-inventory");
}

async function prepareSsh(settings) {
  validateSshSettings(settings);
  recipientKey(await readFile(RECIPIENT_FILE, "utf8"));
  const root = inventoryDirectory(settings);
  await mkdir(root, { recursive: true, mode: 0o700 });
  await writeFile(path.join(root, "key"), settings.AHMV_SSH_PRIVATE_KEY.trim() + "\n", { mode: 0o600 });
  await writeFile(path.join(root, "known_hosts"), settings.AHMV_KNOWN_HOSTS.trim() + "\n", { mode: 0o600 });
  const config = [
    "Host ahmv-hosting-inventory", `  HostName ${settings.AHMV_HOST}`, `  User ${settings.AHMV_USER}`, `  Port ${settings.AHMV_PORT}`,
    `  IdentityFile ${path.join(root, "key")}`, `  UserKnownHostsFile ${path.join(root, "known_hosts")}`,
    "  IdentitiesOnly yes", "  BatchMode yes", "  StrictHostKeyChecking yes", "  ConnectTimeout 20", "  ServerAliveInterval 10", "  ServerAliveCountMax 3", "  LogLevel ERROR", "",
  ].join("\n");
  await writeFile(path.join(root, "config"), config, { mode: 0o600 });
}

/** Framing identifies exactly one reviewed projection; shell banners are discarded. */
export function frameProjectionSource(script) {
  if (typeof script !== "string" || Buffer.byteLength(script) > MAX_TRANSPORT_BYTES || script.includes(PROJECTION_BEGIN) || script.includes(PROJECTION_END)
    || script.split(/\r?\n/).includes(SHELL_SOURCE_DELIMITER)) throw new Error("Projection source is invalid");
  return `import sys\nsys.stdout.write("\\n${PROJECTION_BEGIN}\\n")\nsys.stdout.flush()\n${script}\nsys.stdout.write("\\n${PROJECTION_END}\\n")\nsys.stdout.flush()\n`;
}

export function parseFramedProjection(stdout) {
  if (typeof stdout !== "string" || Buffer.byteLength(stdout) > MAX_TRANSPORT_BYTES) throw new Error("Projection frame is invalid");
  const lines = stdout.split(/\r?\n/);
  if (lines.filter((line) => line === PROJECTION_BEGIN).length !== 1 || lines.filter((line) => line === PROJECTION_END).length !== 1) throw new Error("Projection frame is invalid");
  const begin = lines.indexOf(PROJECTION_BEGIN);
  const end = lines.indexOf(PROJECTION_END);
  if (end <= begin) throw new Error("Projection frame is invalid");
  const input = JSON.parse(lines.slice(begin + 1, end).join("\n"));
  if (!input || input.version !== 1 || !input.passenger || !STATUSES.has(input.passenger.status) || !Array.isArray(input.passenger.applications)
    || input.passenger.applications.length > 128) throw new Error("Projection schema is invalid");
  return validateProjection(input);
}

/** One bounded SSH process. stderr and unframed stdout never reach logs/artifacts. */
export function runSshAttempt({ args, input, timeoutMs }, spawnProcess = spawn) {
  return new Promise((resolve) => {
    let bytes = 0;
    let complete = false;
    let chunks = [];
    let child;
    let timer;
    const finish = (value) => {
      if (complete) return;
      complete = true;
      clearTimeout(timer);
      chunks.forEach((chunk) => chunk.fill(0));
      chunks = [];
      resolve(value);
    };
    try { child = spawnProcess("ssh", args, { stdio: ["pipe", "pipe", "ignore"] }); }
    catch { finish({ exitCode: null, reason: "ssh_launch_failed" }); return; }
    timer = setTimeout(() => { child.kill("SIGKILL"); finish({ exitCode: null, reason: "timeout" }); }, timeoutMs);
    child.stdin.on("error", () => {});
    child.on("error", () => finish({ exitCode: null, reason: "ssh_launch_failed" }));
    child.stdout.on("data", (chunk) => {
      if (complete) return;
      bytes += chunk.length;
      if (bytes > MAX_TRANSPORT_BYTES) { child.kill("SIGKILL"); finish({ exitCode: null, reason: "output_limit" }); }
      else chunks.push(chunk);
    });
    child.on("close", (code) => {
      if (complete) return;
      const exitCode = Number.isInteger(code) && code >= 0 && code <= 255 ? code : null;
      if (exitCode !== 0) {
        finish({ exitCode, reason: exitCode === 255 ? "ssh_exit_255" : exitCode === 127 ? "command_unavailable" : "remote_command_failed" });
        return;
      }
      const stdout = Buffer.concat(chunks);
      try { finish({ exitCode: 0, reason: "projection_received", projection: parseFramedProjection(stdout.toString("utf8")) }); }
      catch { finish({ exitCode: 0, reason: "invalid_projection" }); }
      finally { stdout.fill(0); }
    });
    child.stdin.end(input);
  });
}

/** Policy is injected in tests; both channel attempts share one wall-clock budget. */
export async function collectProjectedInventory({ settings, script, attempt = runSshAttempt, now = Date.now, totalBudgetMs = SSH_TOTAL_BUDGET_MS }) {
  if (!Number.isFinite(totalBudgetMs) || totalBudgetMs <= 0 || totalBudgetMs > SSH_TOTAL_BUDGET_MS) throw new Error("Transport budget is invalid");
  const source = frameProjectionSource(script);
  const baseArgs = ["-F", path.join(inventoryDirectory(settings), "config"), "-T", "ahmv-hosting-inventory"];
  const deadline = now() + totalBudgetMs;
  const attempts = [];
  for (const type of ["exec", "shell"]) {
    const remaining = deadline - now();
    if (remaining <= 0) break;
    const result = await attempt({
      args: type === "exec" ? [...baseArgs, REMOTE_COMMAND] : [...baseArgs],
      input: type === "exec" ? source : `${REMOTE_COMMAND} <<'${SHELL_SOURCE_DELIMITER}'\n${source}${SHELL_SOURCE_DELIMITER}\nexit\n`,
      timeoutMs: remaining,
    });
    // Select only process metadata, never arbitrary injected error/output fields.
    const reason = ["projection_received", "ssh_exit_255", "command_unavailable", "remote_command_failed", "timeout", "output_limit", "ssh_launch_failed", "invalid_projection"].includes(result.reason) ? result.reason : "remote_command_failed";
    const exitCode = Number.isInteger(result.exitCode) && result.exitCode >= 0 && result.exitCode <= 255 ? result.exitCode : null;
    attempts.push({ type, exitCode, reason });
    if (reason === "projection_received" && exitCode === 0 && result.projection) {
      return { ...validateProjection(result.projection), transport: { selected: type, attempts, budgetExceeded: false } };
    }
    if (type !== "exec" || exitCode !== 255 || reason !== "ssh_exit_255") break;
  }
  const last = attempts.at(-1);
  return {
    ...unavailableProjection(last?.reason === "invalid_projection" ? "schema_unavailable" : "transport_unavailable"),
    transport: { selected: null, attempts, budgetExceeded: now() >= deadline || last?.reason === "timeout" },
  };
}

async function remoteProjection(settings) {
  return collectProjectedInventory({ settings, script: await readFile(PROJECTION_FILE, "utf8") });
}

async function main() {
  if (process.argv[2] === "--prepare-ssh") {
    await prepareSsh(process.env);
    console.log("Hosting inventory setup status=ready");
    return;
  }
  if (process.argv[2] !== "--collect") throw new Error("Collection mode is unavailable");
  const key = recipientKey(await readFile(RECIPIENT_FILE, "utf8"));
  const projection = await remoteProjection(process.env);
  const envelope = encryptInventory({ ...projection, observedAt: new Date().toISOString() }, key);
  await writeFile(path.join(inventoryDirectory(process.env), "hosting-app-inventory.enc.json"), JSON.stringify(envelope) + "\n", { mode: 0o600 });
  console.log(`Hosting inventory status=${projection.passenger.status} applications=${projection.passenger.applications.length} directivesStatus=${projection.domainPassengerDirectives.status}`);
  for (const attempt of projection.transport.attempts) console.log(`Hosting inventory transport=${attempt.type} exit=${attempt.exitCode ?? "none"} result=${attempt.reason}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error("Hosting inventory status=unavailable"); process.exitCode = 1; });
}
