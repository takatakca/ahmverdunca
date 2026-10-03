import assert from "node:assert/strict";

const origin = new URL(process.argv[2] ?? process.env["AHMV_PUBLIC_ORIGIN"] ?? "https://ahmverdun.ca");
assert.equal(origin.protocol, "https:", "AHMV bridge target must use HTTPS");
assert.ok(
  origin.hostname === "ahmverdun.ca" || origin.hostname.endsWith(".ahmverdun.ca"),
  "AHMV bridge target must stay on ahmverdun.ca",
);

const token = process.env["AHMV_VOICE_BRIDGE_TOKEN"]?.trim() ?? "";
assert.ok(token.length >= 24, "AHMV_VOICE_BRIDGE_TOKEN must be configured");

const response = await fetch(new URL("/api/ahmv/voice/readiness", origin), {
  redirect: "error",
  headers: {
    accept: "application/json",
    authorization: `Bearer ${token}`,
  },
  signal: AbortSignal.timeout(7000),
});

assert.ok(response.status === 200 || response.status === 503, `Unexpected bridge HTTP ${response.status}`);
assert.match(response.headers.get("content-type") ?? "", /application\/json/i);
const raw = await response.text();
assert.ok(raw.length <= 64 * 1024, "Bridge readiness response too large");
assert.ok(!raw.includes(token), "Bridge response reflected its bearer token");

const body = JSON.parse(raw);
assert.equal(typeof body.ready, "boolean", "Bridge readiness payload is missing ready");

if (response.status !== 200 || body.ready !== true) {
  console.error(JSON.stringify({
    ok: false,
    target: origin.origin,
    status: response.status,
    reason: body.reason ?? "not_ready",
    liveSchedule: body.liveSchedule?.status ?? null,
  }));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  target: origin.origin,
  reason: body.reason ?? null,
  liveSchedule: body.liveSchedule?.status ?? null,
  phoneStore: body.phoneStore ?? null,
}));
