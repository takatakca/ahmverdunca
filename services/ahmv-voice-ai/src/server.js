import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import websocket from '@fastify/websocket';
import { config } from './config.js';
import { validateHttpWebhook, validateWebSocketHandshake } from './twilio-security.js';
import { answerCaller } from './agent.js';
import {
  applyConversationDraft,
  cloneConversationSession,
  createTurnController,
  isAbortLike,
  removeInterruptedAssistantTurn
} from './turn-controller.js';
import {
  activateSession,
  cleanupExpiredSessions,
  countRecentCallsByCaller,
  getSession,
  hasPersistentStore,
  loadSession,
  claimCallAudit,
  completeCallAudit,
  releaseCallAuditClaim,
  newSession,
  persistCallEnd,
  persistCallStart,
  persistSessionSnapshot,
  saveSession
} from './store.js';
import { sendPostCallSms } from './sms.js';
import {
  ACCESS_DENIED_BETA_QUOTA,
  ACCESS_DENIED_BUSY,
  ACCESS_DENIED_MEMBERSHIP,
  ACCESS_DENIED_TECHNICAL,
  AI_FALLBACK
} from './copy.js';
import { languageKey, normalizeLanguage } from './caller.js';
import { createDrainController } from './drain.js';
import { createConcurrencyController } from './concurrency.js';
import { probeAhmDataReadiness } from './ahm-data.js';
import { opaqueRef, safeRelayError, safeRequestPath } from './log-safe.js';
import { bootstrapVoiceCaller, probeBridgeReadiness, recordBridgeInteraction, updateBridgeLanguage } from './ahm-bridge.js';
import {
  buildAccessDeniedTwiML,
  buildActivationFailedTwiML,
  buildConversationRelayTwiML,
  buildCallDurationLimitTwiML,
  buildEntryTwiML,
  buildRelayFailureTwiML,
  buildRetryActivationTwiML,
  buildTurnLimitTwiML,
  hangupTwiML
} from './twiml.js';

const app = Fastify({
  logger: {
    redact: [
      'req.headers.authorization',
      'req.headers.x-twilio-signature',
      'headers.authorization',
      'headers.x-twilio-signature'
    ]
  },
  trustProxy: true,
  bodyLimit: 256 * 1024
});
await app.register(formbody);
await app.register(websocket, { options: { maxPayload: 128 * 1024 } });

const drain = createDrainController({ graceMs: config.shutdownGraceMs });
const concurrency = createConcurrencyController({
  maxCalls: config.maxConcurrentCalls,
  maxCallsPerCaller: config.maxConcurrentCallsPerCaller,
  // If provider callbacks disappear entirely, stale capacity is recovered
  // shortly after the hard call-duration ceiling instead of leaking forever.
  leaseMs: (config.maxCallDurationSeconds + 120) * 1000
});

function requireTwilio(request, reply) {
  if (validateHttpWebhook(request)) return true;
  request.log.warn({ path: safeRequestPath(request.url) }, 'Rejected invalid Twilio signature');
  reply.code(403).send('Forbidden');
  return false;
}

function xml(reply, body) {
  return reply.type('text/xml; charset=utf-8').send(body);
}

function operationalReply(reply) {
  return reply.headers({
    'cache-control': 'no-store, max-age=0',
    'pragma': 'no-cache',
    'x-robots-tag': 'noindex, nofollow'
  });
}

function attemptFrom(request) {
  const value = Number(request.query?.attempt || 1);
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function sendRelayText(socket, token, lang = 'multi', last = true) {
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

function sendRelayEnd(socket, reasonCode) {
  if (socket.readyState !== 1) return;
  socket.send(JSON.stringify({
    type: 'end',
    handoffData: JSON.stringify({ reasonCode })
  }));
}

function accessDeniedCopy(access) {
  if (access?.mode === 'paid') return ACCESS_DENIED_MEMBERSHIP;
  if (access?.reason === 'beta_quota_reached') return ACCESS_DENIED_BETA_QUOTA;
  if (['global_concurrency_limit', 'caller_concurrency_limit'].includes(access?.reason)) return ACCESS_DENIED_BUSY;
  return ACCESS_DENIED_TECHNICAL;
}

function addMembershipSmsItem(session) {
  const membershipUrl = session.membershipUrl || config.membershipUrl;
  if (session.smsItems.some((item) => item.type === 'link' && item.url === membershipUrl)) return;
  session.smsItems.push({ type: 'link', label: 'AHM Verdun — accès membre', url: membershipUrl });
  session.smsItems = session.smsItems.slice(-12);
}

function retryableRelayError(code) {
  return new Set(['64102', '64103', '64105', '64108', '64109']).has(String(code || ''));
}

async function finalizeSession(session, request, reason) {
  if (!session) return;
  concurrency.release(session.callSid);
  session.endedAt ||= new Date().toISOString();
  session.endReason ||= reason || null;
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

app.get('/healthz', async (_request, reply) => operationalReply(reply).send({
  ok: true,
  service: 'ahmv-voice-ai',
  version: config.appVersion,
  accessMode: config.accessMode,
  smsEnabled: config.smsEnabled,
  dataMode: config.ahmDataMode,
  persistentStore: hasPersistentStore(),
  draining: drain.draining,
  activeRelayConnections: drain.activeConnections,
  concurrency: concurrency.snapshot()
}));

app.get('/readyz', async (_request, reply) => {
  const problems = [];
  const capacity = concurrency.snapshot();
  if (drain.draining) problems.push('service_draining');
  if (config.nodeEnv === 'production' && !config.validateTwilioSignatures) problems.push('twilio_signature_validation_disabled');
  if (config.requirePersistentStore && !hasPersistentStore()) problems.push('persistent_store_required');
  if (config.ahmDataMode === 'api' && !config.ahmBridgeApiUrl) problems.push('ahm_voice_bridge_not_configured');
  if (config.ahmDataMode === 'api' && !config.ahmBridgeToken) problems.push('ahm_voice_bridge_token_not_configured');
  if (capacity.activeCalls >= capacity.maxCalls) problems.push('voice_capacity_exhausted');

  let bridge = { ready: config.ahmDataMode === 'fixture', reason: config.ahmDataMode === 'fixture' ? 'fixture_mode' : 'not_checked' };
  let data = bridge;
  if (!drain.draining && config.ahmDataMode === 'api' && config.ahmBridgeApiUrl && config.ahmBridgeToken) {
    [bridge, data] = await Promise.all([probeBridgeReadiness(), probeAhmDataReadiness()]);
    if (!bridge.ready) problems.push(bridge.reason || 'ahm_bridge_not_ready');
    if (!data.ready) problems.push(data.reason || 'ahm_data_not_ready');
  }

  operationalReply(reply).code(problems.length ? 503 : 200).send({
    ready: problems.length === 0,
    version: config.appVersion,
    problems,
    dependencies: {
      ahmBridge: bridge,
      ahmData: data
    },
    concurrency: capacity
  });
});

app.all('/twilio/voice', {
  handler: async (request, reply) => {
    if (!requireTwilio(request, reply)) return;
    if (drain.draining) return xml(reply, buildRelayFailureTwiML());
    const attempt = attemptFrom(request);
    return xml(reply, attempt > config.activationAttempts ? buildActivationFailedTwiML() : buildEntryTwiML({ attempt }));
  }
});

app.post('/twilio/start', async (request, reply) => {
  if (!requireTwilio(request, reply)) return;
  if (drain.draining) return xml(reply, buildRelayFailureTwiML());

  const callSid = String(request.body?.CallSid || '');
  const from = String(request.body?.From || '');
  const to = String(request.body?.To || config.twilioPhoneNumber);
  const digits = String(request.body?.Digits || '');
  const attempt = attemptFrom(request);

  if (dM�