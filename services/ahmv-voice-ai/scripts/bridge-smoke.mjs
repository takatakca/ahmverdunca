#!/usr/bin/env node
const base = new URL(process.argv[2] || process.env.AHM_PUBLIC_ORIGIN || 'https://ahmverdun.ca');
const token = String(process.env.AHM_VOICE_BRIDGE_TOKEN || '').trim();
const timeoutMs = Number.parseInt(process.env.SMOKE_TIMEOUT_MS || '7000', 10);
function assert(condition, message) { if (!condition) throw new Error(message); }
assert(base.protocol === 'https:', 'AHMV bridge smoke target must use HTTPS');
assert(base.hostname === 'ahmverdun.ca' || base.hostname.endsWith('.ahmverdun.ca'), 'AHMV bridge smoke target must stay on ahmverdun.ca');
assert(token.length >= 24, 'AHM_VOICE_BRIDGE_TOKEN must be configured with at least 24 characters');
assert(Number.isInteger(timeoutMs) && timeoutMs >= 1000 && timeoutMs <= 30000, 'SMOKE_TIMEOUT_MS must be 1000..30000');
try {
  const response = await fetch(new URL('/api/ahmv/voice/readiness', base), { redirect:'error', headers:{accept:'application/json', authorization:`Bearer ${token}`}, signal:AbortSignal.timeout(timeoutMs) });
  assert(response.status === 200 || response.status === 503, `Unexpected bridge HTTP ${response.status}`);
  assert(/application\/json/i.test(response.headers.get('content-type') || ''), 'Bridge readiness did not return JSON');
  const raw=await response.text(); assert(raw.length <= 64*1024,'Bridge readiness response is unexpectedly large'); assert(!raw.includes(token),'Bridge response reflected the bearer token');
  const body=JSON.parse(raw); assert(typeof body.ready === 'boolean','Bridge readiness payload is missing ready');
  const output={ok:response.status===200&&body.ready===true,base:base.origin,status:response.status,reason:body.reason??null,liveSchedule:body.liveSchedule?.status??null,phoneStore:body.phoneStore??null};
  process.stdout.write(`${JSON.stringify(output,null,2)}\n`); if(!output.ok) process.exit(1);
} catch(error){console.error(`AHMV bridge smoke failed: ${error instanceof Error ? error.message : String(error)}`);process.exit(1);}
