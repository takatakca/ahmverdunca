import { config } from './config.js';
import { validateHttpWebhook } from './twilio-security.js';
import { claimCallAudit, completeCallAudit, releaseCallAuditClaim, persistCallEnd, saveSession } from './store.js';
import { sendPostCallSms } from './sms.js';
import { ACCESS_DENIED_BETA_QUOTA, ACCESS_DENIED_BLOCKED, ACCESS_DENIED_BUSY, ACCESS_DENIED_MEMBERSHIP, ACCESS_DENIED_TECHNICAL } from './copy.js';
import { createDrainController } from './drain.js';
import { createConcurrencyController } from './concurrency.js';
import { safeRequestPath } from './log-safe.js';
import { recordBridgeInteraction } from './ahm-bridge.js';
import { finalizeUsageCost } from './usage.js';

export const drain = createDrainController({ graceMs: config.shutdownGraceMs });
export const concurrency = createConcurrencyController({
  maxCalls: config.maxConcurrentCalls,
  maxCallsPerCaller: config.maxConcurrentCallsPerCaller,
  leaseMs: (config.maxCallDurationSeconds + 120) * 1000
});

export function requireTwilio(request, reply) {
  if (validateHttpWebhook(request)) return true;
  request.log.warn({ path: safeRequestPath(request.url) }, 'Rejected invalid Twilio signature');
  reply.code(403).send('Forbidden');
  return false;
}

export function xml(reply, body) {
  return reply.type('text/xml; charset=utf-8').send(body);
}

export function operationalReply(reply) {
  return reply.headers({
    'cache-control': 'no-store, max-age=0',
    'pragma': 'no-cache',
    'x-robots-tag': 'noindex, nofollow'
  });
}

export function attemptFrom(request) {
  const value = Number(request.query?.attempt || 1);
  return Number.isInteger(value) && value > 0 ? value : 1;
}

export function sendRelayText(socket, token, lang = 'multi', last = true) {
  if (socket.readyState !== 1) return;
  socket.send(JSON.stringify({
    type: 'text',
    token,
    lang,
    last,
    interruptible: true,
    preemptible: true
  }));
}

export function sendRelayEnd(socket, reasonCode) {
  if (socket.readyState !== 1) return;
  socket.send(JSON.stringify({
    type: 'end',
    handoffData: JSON.stringify({ reasonCode })
  }));
}

export function accessDeniedCopy(access) {
  if (access?.reason === 'blocked') return ACCESS_DENIED_BLOCKED;
  if (access?.mode === 'paid') return ACCESS_DENIED_MEMBERSHIP;
  if (access?.reason === 'beta_quota_reached') return ACCESS_DENIED_BETA_QUOTA;
  if (['global_concurrency_limit', 'caller_concurrency_limit'].includes(access?.reason)) return ACCESS_DENIED_BUSY;
  return ACCESS_DENIED_TECHNICAL;
}

export function addMembershipSmsItem(session) {
  const membershipUrl = session.membershipUrl || config.membershipUrl;
  if (session.smsItems.some((item) => item.type === 'link' && item.url === membershipUrl)) return;
  session.smsItems.push({ type: 'link', label: 'AHM Verdun — accès membre', url: membershipUrl });
  session.smsItems = session.smsItems.slice(-12);
}

export function retryableRelayError(code) {
  return new Set(['64102', '64103', '64105', '64108', '64109']).has(String(code || ''));
}

export async function finalizeSession(session, request, reason) {
  if (!session) return;
  concurrency.release(session.callSid);
  session.endedAt ||= new Date().toISOString();
  session.endReason ||= reason || null;
  if (!Number.isFinite(session.sessionDurationSeconds)) {
    const startedAt = Date.parse(session.createdAt || '');
    const endedAt = Date.parse(session.endedAt || '');
    if (Number.isFinite(startedAt) && Number.isFinite(endedAt) && endedAt >= startedAt) {
      session.sessionDurationSeconds = Math.round((endedAt - startedAt) / 1000);
    }
  }
  finalizeUsageCost(session);
  saveSession(session);

  if (!session.auditRecorded) {
    let claimed = false;
    try {
      claimed = await claimCallAudit(session.callSid);
      if (claimed) {
        const audit = await recordBridgeInteraction({ session, outcome: session.endReason }).catch((error) => {
          request.log.error(error, 'AHMV phone audit bridge failed');
          return { ok: false };
        });
        if (audit?.ok) {
          session.auditRecorded = true;
          await completeCallAudit(session.callSid);
        } else {
          await releaseCallAuditClaim(session.callSid);
        }
      }
    } catch (error) {
      request.log.error(error, 'AHMV phone audit idempotency failed');
      if (claimed) await releaseCallAuditClaim(session.callSid).catch(() => {});
    }
  }

  await persistCallEnd(session).catch((error) => request.log.error(error, 'persistCallEnd failed'));
  await sendPostCallSms(session).catch((error) => request.log.error(error, 'post-call SMS failed'));
  await persistCallEnd(session).catch((error) => request.log.error(error, 'persistCallEnd after SMS failed'));
}
