import assert from "node:assert/strict";

const base = new URL(process.argv[2] ?? process.env["VOICE_BASE_URL"] ?? "https://voice.ahmverdun.ca");
assert.equal(base.protocol, "https:", "Voice smoke target must use HTTPS");
assert.ok(
  base.hostname === "voice.ahmverdun.ca" || base.hostname.endsWith(".ahmverdun.ca"),
  "Voice smoke target must stay on ahmverdun.ca",
);

const timeoutMs = Number(process.env["VOICE_SMOKE_TIMEOUT_MS"] ?? "7000");
assert.ok(Number.isFinite(timeoutMs) && timeoutMs >= 1000 && timeoutMs <= 30000, "Invalid smoke timeout");

const forbiddenKey = /(?:phone|call[_-]?sid|authorization|auth[_-]?token|secret|transcript|speech|sms[_-]?body)/i;

function scan(value: unknown, path = "$") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => scan(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    assert.ok(!forbiddenKey.test(key), `Sensitive key exposed at ${path}.${key}`);
    scan(child, `${path}.${key}`);
  }
}

async function getJson(pathname: string, expected: number) {
  const response = await fetch(new URL(pathname, base), {
    redirect: "error",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  assert.equal(response.status, expected, `${pathname} returned HTTP ${response.status}`);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/i);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/i);
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/i);
  const raw = await response.text();
  assert.ok(raw.length <= 64 * 1024, `${pathname} response too large`);
  const body = JSON.parse(raw);
  scan(body);
  return body;
}

const health = await getJson("/healthz", 200);
assert.equal(health.ok, true, "Voice /healthz is not healthy");

const ready = await getJson("/readyz", 200);
assert.equal(ready.ready, true, `Voice /readyz is not ready: ${JSON.stringify(ready.problems ?? [])}`);

console.log(JSON.stringify({
  ok: true,
  target: base.origin,
  version: health.version ?? null,
  activeCalls: health.concurrency?.activeCalls ?? null,
  maxCalls: health.concurrency?.maxCalls ?? null,
  dependencies: ready.dependencies ?? null,
}));
