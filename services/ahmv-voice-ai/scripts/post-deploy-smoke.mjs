#!/usr/bin/env node
const base = new URL(process.argv[2] || process.env.VOICE_BASE_URL || 'https://voice.ahmverdun.ca');
const timeoutMs = Number.parseInt(process.env.SMOKE_TIMEOUT_MS || '7000', 10);
const sensitiveKeys = /(?:phone|call[_-]?sid|authorization|auth[_-]?token|secret|transcript|speech|sms[_-]?body)/i;
function assert(condition, message) { if (!condition) throw new Error(message); }
function scanKeys(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach((item, index) => scanKeys(item, `${path}[${index}]`));
  for (const [key, child] of Object.entries(value)) {
    assert(!sensitiveKeys.test(key), `Sensitive operational key exposed at ${path}.${key}`);
    scanKeys(child, `${path}.${key}`);
  }
}
async function fetchJson(pathname, expectedStatus) {
  const response = await fetch(new URL(pathname, base), { headers: { accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(timeoutMs) });
  assert(response.status === expectedStatus, `${pathname} returned HTTP ${response.status}, expected ${expectedStatus}`);
  assert((response.headers.get('content-type') || '').toLowerCase().includes('application/json'), `${pathname} did not return JSON`);
  assert(/no-store/i.test(response.headers.get('cache-control') || ''), `${pathname} is missing Cache-Control: no-store`);
  assert(/noindex/i.test(response.headers.get('x-robots-tag') || ''), `${pathname} is missing X-Robots-Tag: noindex`);
  const raw = await response.text(); assert(raw.length <= 64 * 1024, `${pathname} response is unexpectedly large`);
  const body = JSON.parse(raw); scanKeys(body); return body;
}
try {
  const health = await fetchJson('/healthz', 200); assert(health?.ok === true, '/healthz payload is not healthy');
  const ready = await fetchJson('/readyz', 200); assert(ready?.ready === true, `/readyz reports not ready: ${JSON.stringify(ready?.problems || [])}`);
  console.log(JSON.stringify({ ok:true, base:base.origin, version:health.version, activeCalls:health.concurrency?.activeCalls ?? null, maxCalls:health.concurrency?.maxCalls ?? null, readiness:ready.dependencies ?? null }, null, 2));
} catch (error) { console.error(`Post-deploy smoke failed: ${error instanceof Error ? error.message : String(error)}`); process.exit(1); }
