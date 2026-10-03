import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import websocket from '@fastify/websocket';

import { answerCaller } from '../runtime/src/agent.js';
import { bootstrapVoiceCaller, probeBridgeReadiness, recordBridgeInteraction, updateBridgeLanguage } from '../runtime/src/ahm-bridge.js';
import { isSmsCapableCaller, normalizeLanguage } from '../runtime/src/caller.js';
import { createConcurrencyController } from '../runtime/src/concurrency.js';
import { config } from '../runtime/src/config.js';
import {
  ACCESS_DENIED_BETA_QUOTA,
  ACCESS_DENIED_BLOCKED,
  ACCESS_DENIED_BUSY,
  ACCESS_DENIED_MEMBERSHIP,
  ACCESS_DENIED_TECHNICAL,
} from '../runtime/src/copy.js';
import { createDrainController } from '../runtime/src/drain.js';
import { opaqueRef, safeRelayError, safeRequestPath } from '../runtime/src/log-safe.js';
import { sendPostCallSms } from '../runtime/src/sms.js';
import {
  activateSession,
  claimCallAudit,
  cleanupExpiredSessions,
  completeCallAudit,
  countRecentCallsByCaller,
  deleteSession,
  hasPersistentStore,
  loadSession,
  newSession,
  persistCallEnd,
  persistCallStart,
  persistSessionSnapshot,
  releaseCallAuditClaim,
  saveSession,
} from '../runtime/src/store.js';
import {
  applyConversationDraft,
  cloneConversationSession,
  createTurnController,
  isAbortLike,
  removeInterruptedAssistantTurn,
} from '../runtime/src/turn-controller.js';
import { validateHttpWebhook, validateWebSocketHandshake } from '../runtime/src/twilio-security.js';
import {
  buildAccessDeniedTwiML,
  buildActivationFailedTwiML,
  buildCallDurationLimitTwiML,
  buildConversationRelayTwiML,
  buildEntryTwiML,
  buildRelayFailureTwiML,
  buildRetryActivationTwiML,
  buildTurnLimitTwiML,
  hangupTwiML,
} from '../runtime/src/twiml.js';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.x-twilio-signature',
        'req.body.From',
        'req.body.To',
        'req.body.Caller',
        'req.body.Called',
      ],
      censor: '[REDACTED]',
    },
  },
  trustProxy: true,
  bodyLimit: 64 * 1024,
});

await app.register(formbody);
await app.register(websocket, {
  options: {
    maxPayload: 64 * 1024,
  },
});

const concurrency = createConcurrencyController({
  maxCalls: config.maxConcurrentCalls,
  maxCallsPerCaller: config.maxConcurrentCallsPerCaller,
  leaseMs: (config.maxCallDurationSeconds + 60) * 1000,
});

const drain = createDrainController({ graceMs: config.shutdownGraceMs });

const JSON_HEADERS = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
  'x-robots-tag': 'noindex, nofollow',
};

function twiml(reply, xml, status = 200) {
  return reply
    .code(status)
    .headers({
      'cache-control': 'no-store',
      'content-type': 'application/xml; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    })
    .send(xml);
}

function json(reply, value, status = 200) {
  return reply.code(status).headers(JSON_HEADERS).send(value);
}

function field(body, name, max = 200) {
  const value = body && typeof body === 'object' ? body[name] : undefined;
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function validCallSid(value) {
  return typeof value === 'string' && /^CA[0-9a-f]{32}$/i.test(value);
}

function expectedTwilioRequest(request) {
  if (!validateHttpWebhook(request)) return false;
  const accountSid = field(request.body, 'AccountSid', 100);
  const to = field(request.body, 'To', 40);
  return accountSid === config.twilioAccountSid && to === config.twilioPhoneNumber;
}

function attemptFromRequest(request) {
  try {
    const raw = new URL(request.url, 'http://internal').searchParams.get('attempt');
    const value = Number(raw || '1');
    return Number.isInteger(value) && value >= 1 && value <= config.activationAttempts
      ? value
      : 1;
  } catch {
    return 1;
  }
}

function addMembershipSmsItem(session) {
  if (!session?.smsEnabled || !session.membershipUrl) return;
  const item = {
    type: 'link',
    labels: {
      fr: 'Accès membre GROUPE TAKATAK',
      en: 'GROUPE TAKATAK member access',
      es: 'Acceso de miembro GROUPE TAKATAK',
    },
    url: session.membershipUrl,
  };
  const signature = JSON.stringify(item);
  if (!session.smsItems.some((entry) => JSON.stringify(entry) === signature)) {
    session.smsItems.push(item);
  }
}

async function persistStartOrFail(session) {
  try {
    await persistCallStart(session);
    return true;
  } catch (error) {
    app.log.error({ err: error, call: opaqueRef(session.callSid, 'call') }, 'voice session start persistence failed');
    return !config.requirePersistentStore;
  }
}

async function auditSession(session, outcome) {
  if (!session || session.auditRecorded) return;
  let claimed = false;
  try {
    claimed = await claimCallAudit(session.callSid);
    if (!claimed) return;
    const result = await recordBridgeInteraction({ session, outcome });
    if (!result?.ok) throw new Error(result?.code || 'bridge_audit_failed');
    await completeCallAudit(session.callSid);
    session.auditRecorded = true;
  } catch (error) {
    if (claimed) await releaseCallAuditClaim(session.callSid).catch(() => {});
    app.log.warn({ err: error, call: opaqueRef(session.callSid, 'call') }, 'voice audit not recorded');
  }
}

async function finalizeSession(session, {
  reason = 'completed',
  relayStatus = null,
  relayErrorCode = null,
  relayErrorMessage = null,
  sessionDurationSeconds = null,
} = {}) {
  if (!session) return;
  if (!session.endedAt) session.endedAt = new Date().toISOString();
  session.endReason = reason;
  session.relaySessionStatus = relayStatus;
  session.relayErrorCode = relayErrorCode;
  session.relayErrorMessage = relayErrorMessage;
  session.sessionDurationSeconds = Number.isFinite(sessionDurationSeconds)
    ? Math.max(0, Math.floor(sessionDurationSeconds))
    : Math.max(0, Math.floor((Date.now() - Date.parse(session.createdAt || new Date())) / 1000));

  await auditSession(session, reason);
  await persistCallEnd(session).catch((error) => {
    app.log.error({ err: error, call: opaqueRef(session.callSid, 'call') }, 'voice session end persistence failed');
  });

  try {
    await sendPostCallSms(session);
  } catch (error) {
    app.log.warn({ err: error, call: opaqueRef(session.callSid, 'call') }, 'post-call SMS failed');
  }

  concurrency.release(session.callSid);
  saveSession(session);
}

async function denyActivatedCall(session, copy, reason, reply) {
  session.access = { allowed: false, mode: config.accessMode, reason };
  if (reason === 'membership_required') addMembershipSmsItem(session);
  if (!(await persistStartOrFail(session))) {
    concurrency.release(session.callSid);
    return twiml(reply, buildAccessDeniedTwiML(ACCESS_DENIED_TECHNICAL, { callSid: session.callSid }));
  }
  return twiml(reply, buildAccessDeniedTwiML(copy, { callSid: session.callSid }));
}

app.addHook('onRequest', async (request, reply) => {
  reply.header('cache-control', 'no-store');
  reply.header('x-robots-tag', 'noindex, nofollow');
  request.log.debug({ path: safeRequestPath(request.raw.url) }, 'voice request');
});

app.get('/healthz', async (_request, reply) => {
  cleanupExpiredSessions();
  return json(reply, {
    ok: true,
    service: 'ahmv-voice-ai',
    version: config.appVersion,
    draining: drain.draining,
    concurrency: concurrency.snapshot(),
  });
});

app.get('/readyz', async (_request, reply) => {
  const problems = [];
  if (drain.draining) problems.push('service_draining');
  if (config.requirePersistentStore && !hasPersistentStore()) {
    problems.push('persistent_store_unavailable');
  }

  let bridge = { ready: false, reason: 'not_checked' };
  try {
    bridge = await probeBridgeReadiness();
  } catch {
    bridge = { ready: false, reason: 'bridge_probe_failed' };
  }
  if (!bridge.ready) problems.push(bridge.reason || 'bridge_not_ready');

  return json(
    reply,
    {
      ready: problems.length === 0,
      service: 'ahmv-voice-ai',
      version: config.appVersion,
      problems,
      dependencies: {
        ahmvBridge: bridge.ready ? 'ready' : 'unavailable',
        persistentStore:
          hasPersistentStore() ? 'ready' : config.requirePersistentStore ? 'required' : 'memory',
      },
    },
    problems.length ? 503 : 200,
  );
});

app.post('/twilio/voice', async (request, reply) => {
  if (!expectedTwilioRequest(request)) {
    return twiml(reply, hangupTwiML(), 403);
  }
  if (drain.draining) {
    return twiml(reply, buildAccessDeniedTwiML(ACCESS_DENIED_TECHNICAL));
  }
  return twiml(reply, buildEntryTwiML({ attempt: attemptFromRequest(request) }));
});

app.post('/twilio/start', async (request, reply) => {
  if (!expectedTwilioRequest(request)) {
    return twiml(reply, hangupTwiML(), 403);
  }

  const attempt = attemptFromRequest(request);
  const digits = field(request.body, 'Digits', 8);
  if (digits !== '1') {
    if (attempt < config.activationAttempts) {
      return twiml(reply, buildRetryActivationTwiML({ nextAttempt: attempt + 1 }));
    }
    return twiml(reply, buildActivationFailedTwiML());
  }

  const callSid = field(request.body, 'CallSid', 100);
  const from = field(request.body, 'From', 40);
  const to = field(request.body, 'To', 40);
  if (!validCallSid(callSid)) return twiml(reply, hangupTwiML(), 400);

  let session = await loadSession(callSid).catch(() => null);
  if (session?.started && session.access?.allowed) {
    return twiml(reply, buildConversationRelayTwiML({
      callSid,
      from,
      to,
      reconnectCount: session.reconnectCount || 0,
      reconnect: false,
      language: session.language,
    }));
  }

  const admission = concurrency.admit(callSid, from);
  if (!admission.allowed) {
    return twiml(reply, buildAccessDeniedTwiML(ACCESS_DENIED_BUSY, { callSid }));
  }

  session ||= newSession({ callSid, from, to });
  activateSession(session);

  let bootstrap;
  try {
    bootstrap = await bootstrapVoiceCaller(session);
  } catch (error) {
    app.log.warn({ err: error, call: opaqueRef(callSid, 'call') }, 'caller bootstrap failed');
    bootstrap = { ok: false, code: 'BOOTSTRAP_FAILED' };
  }

  if (!bootstrap?.ok) {
    return denyActivatedCall(session, ACCESS_DENIED_TECHNICAL, 'bootstrap_failed', reply);
  }

  session.contactId = bootstrap.contactId || null;
  session.transactionalSmsAllowed = bootstrap.transactionalSmsAllowed !== false;
  session.access = bootstrap.access || { allowed: false, mode: config.accessMode, reason: 'unknown' };
  session.membershipUrl = bootstrap.membershipUrl || config.membershipUrl;

  if (
    config.accessMode === 'free_beta' &&
    config.freeBetaCallsPer24h > 0 &&
    isSmsCapableCaller(from)
  ) {
    try {
      const recent = await countRecentCallsByCaller(from, {
        hours: 24,
        excludeCallSid: callSid,
      });
      if (recent >= config.freeBetaCallsPer24h) {
        return denyActivatedCall(session, ACCESS_DENIED_BETA_QUOTA, 'beta_quota', reply);
      }
    } catch (error) {
      app.log.warn({ err: error, call: opaqueRef(callSid, 'call') }, 'beta quota lookup failed');
      if (config.requirePersistentStore) {
        return denyActivatedCall(session, ACCESS_DENIED_TECHNICAL, 'quota_check_failed', reply);
      }
    }
  }

  if (!session.access?.allowed) {
    const accessReason = session.access?.reason || 'membership_required';
    const copy = accessReason === 'blocked'
      ? ACCESS_DENIED_BLOCKED
      : ACCESS_DENIED_MEMBERSHIP;
    return denyActivatedCall(session, copy, accessReason, reply);
  }

  if (!(await persistStartOrFail(session))) {
    concurrency.release(callSid);
    return twiml(reply, buildAccessDeniedTwiML(ACCESS_DENIED_TECHNICAL, { callSid }));
  }

  return twiml(reply, buildConversationRelayTwiML({
    callSid,
    from,
    to,
    reconnectCount: session.reconnectCount || 0,
    reconnect: false,
    language: session.language,
  }));
});

app.get('/twilio/conversation', { websocket: true }, (socket, request) => {
  if (!validateWebSocketHandshake(request)) {
    socket.close(1008, 'Invalid Twilio signature');
    return;
  }

  let session = null;
  let callSid = '';
  let closed = false;
  const turns = createTurnController();

  const unregister = drain.register({
    cancel: (reason) => turns.cancel(reason),
    sendEnd: (reason) => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify({
          type: 'end',
          handoffData: JSON.stringify({ reasonCode: reason }),
        }));
      }
    },
    close: (code, reason) => socket.close(code, reason),
  });

  const send = (payload) => {
    if (!closed && socket.readyState === 1) {
      socket.send(JSON.stringify(payload));
      return true;
    }
    return false;
  };

  const endRelay = (reasonCode) => {
    send({
      type: 'end',
      handoffData: JSON.stringify({ reasonCode }),
    });
  };

  let durationTimer = null;

  socket.on('message', async (raw) => {
    let message;
    try {
      const text = raw.toString();
      if (Buffer.byteLength(text, 'utf8') > 64 * 1024) {
        socket.close(1009, 'Message too large');
        return;
      }
      message = JSON.parse(text);
    } catch {
      socket.close(1007, 'Invalid JSON');
      return;
    }

    if (!message || typeof message !== 'object') return;

    if (message.type === 'setup') {
      const custom = message.customParameters && typeof message.customParameters === 'object'
        ? message.customParameters
        : {};
      const setupCallSid = String(message.callSid || custom.callSid || '').slice(0, 100);
      if (!validCallSid(setupCallSid)) {
        socket.close(1008, 'Missing call');
        return;
      }
      callSid = setupCallSid;
      session = await loadSession(callSid).catch(() => null);
      if (!session?.started || !session.access?.allowed) {
        socket.close(1008, 'Session unavailable');
        return;
      }
      const setupFrom = String(message.from || custom.from || '');
      const setupTo = String(message.to || custom.to || '');
      if (
        (session.from && setupFrom && session.from !== setupFrom) ||
        (session.to && setupTo && session.to !== setupTo)
      ) {
        socket.close(1008, 'Call mismatch');
        return;
      }

      const elapsed = Math.max(0, Date.now() - Date.parse(session.createdAt));
      const remaining = Math.max(1000, config.maxCallDurationSeconds * 1000 - elapsed);
      durationTimer = setTimeout(() => {
        turns.cancel('Maximum call duration reached');
        endRelay('call_duration_limit');
      }, remaining);
      durationTimer.unref?.();
      return;
    }

    if (!session) {
      socket.close(1008, 'Setup required');
      return;
    }

    if (message.type === 'interrupt') {
      turns.cancel('Caller interrupted assistant');
      removeInterruptedAssistantTurn(session);
      saveSession(session);
      persistSessionSnapshot(session).catch(() => {});
      return;
    }

    if (message.type === 'error') {
      const safe = safeRelayError(message);
      session.relayErrorCode = safe.code;
      session.relayErrorMessage = safe.description;
      saveSession(session);
      app.log.warn({ relay: safe, call: opaqueRef(callSid, 'call') }, 'ConversationRelay error');
      return;
    }

    if (message.type !== 'prompt' || message.last === false) return;

    const prompt = typeof message.voicePrompt === 'string'
      ? message.voicePrompt.trim().slice(0, 4000)
      : '';
    if (!prompt) return;

    if (session.turnCount >= config.maxTurnsPerCall) {
      endRelay('turn_limit');
      return;
    }

    const detectedLanguage = normalizeLanguage(message.lang || session.language);
    if (detectedLanguage !== session.language) {
      session.language = detectedLanguage;
      updateBridgeLanguage(session, detectedLanguage).catch((error) => {
        app.log.warn({ err: error, call: opaqueRef(callSid, 'call') }, 'voice language bridge update failed');
      });
    }

    const turn = turns.begin();
    const draft = cloneConversationSession(session);
    draft.language = detectedLanguage;
    draft.turnCount = Number(draft.turnCount || 0) + 1;

    try {
      const answer = await answerCaller({
        session: draft,
        text: prompt,
        lang: detectedLanguage,
        signal: turn.signal,
        persist: false,
      });
      if (!turn.isCurrent()) return;

      applyConversationDraft(session, draft);
      session.language = draft.language;
      session.turnCount = draft.turnCount;
      saveSession(session);
      await persistSessionSnapshot(session).catch((error) => {
        app.log.warn({ err: error, call: opaqueRef(callSid, 'call') }, 'voice snapshot persistence failed');
      });

      send({
        type: 'text',
        token: answer,
        last: true,
        lang: 'multi',
        interruptible: true,
        preemptible: true,
      });
    } catch (error) {
      if (isAbortLike(error)) return;
      app.log.error({ err: error, call: opaqueRef(callSid, 'call') }, 'voice AI turn failed');
      endRelay('ai_failure');
    }
  });

  socket.on('close', () => {
    closed = true;
    if (durationTimer) clearTimeout(durationTimer);
    turns.cancel('WebSocket closed');
    unregister();
  });

  socket.on('error', (error) => {
    app.log.warn({ err: error, call: opaqueRef(callSid, 'call') }, 'voice websocket error');
  });
});

app.post('/twilio/voice/connect-ended', async (request, reply) => {
  if (!expectedTwilioRequest(request)) return twiml(reply, hangupTwiML(), 403);

  const callSid = field(request.body, 'CallSid', 100);
  const session = validCallSid(callSid)
    ? await loadSession(callSid).catch(() => null)
    : null;
  if (!session) return twiml(reply, hangupTwiML());

  const status = field(request.body, 'SessionStatus', 40).toLowerCase();
  const errorCode = field(request.body, 'ErrorCode', 50) || null;
  const errorMessage = field(request.body, 'ErrorMessage', 500) || null;
  const durationRaw = Number(field(request.body, 'SessionDuration', 20));
  const duration = Number.isFinite(durationRaw) ? durationRaw : null;

  let reasonCode = '';
  const handoffRaw = field(request.body, 'HandoffData', 1000);
  if (handoffRaw) {
    try {
      const handoff = JSON.parse(handoffRaw);
      reasonCode = typeof handoff?.reasonCode === 'string'
        ? handoff.reasonCode.slice(0, 80)
        : '';
    } catch {}
  }

  if (reasonCode === 'turn_limit') {
    await finalizeSession(session, {
      reason: 'turn_limit',
      relayStatus: status || 'ended',
      sessionDurationSeconds: duration,
    });
    return twiml(reply, buildTurnLimitTwiML(session.language));
  }

  if (reasonCode === 'call_duration_limit') {
    await finalizeSession(session, {
      reason: 'call_duration_limit',
      relayStatus: status || 'ended',
      sessionDurationSeconds: duration,
    });
    return twiml(reply, buildCallDurationLimitTwiML(session.language));
  }

  const failed = status === 'failed' || Boolean(errorCode);
  if (
    failed &&
    !drain.draining &&
    Number(session.reconnectCount || 0) < config.relayReconnectAttempts
  ) {
    session.reconnectCount = Number(session.reconnectCount || 0) + 1;
    session.relayErrorCode = errorCode;
    session.relayErrorMessage = errorMessage;
    saveSession(session);
    await persistSessionSnapshot(session).catch(() => {});
    return twiml(reply, buildConversationRelayTwiML({
      callSid: session.callSid,
      from: session.from,
      to: session.to,
      reconnectCount: session.reconnectCount,
      reconnect: true,
      language: session.language,
    }));
  }

  await finalizeSession(session, {
    reason: failed ? 'relay_failed' : reasonCode || status || 'completed',
    relayStatus: status || null,
    relayErrorCode: errorCode,
    relayErrorMessage: errorMessage,
    sessionDurationSeconds: duration,
  });

  return twiml(reply, failed ? buildRelayFailureTwiML() : hangupTwiML());
});

app.post('/twilio/access-ended', async (request, reply) => {
  if (!expectedTwilioRequest(request)) return twiml(reply, hangupTwiML(), 403);
  const callSid = field(request.body, 'CallSid', 100);
  const session = validCallSid(callSid)
    ? await loadSession(callSid).catch(() => null)
    : null;
  if (session) {
    await finalizeSession(session, {
      reason: session.access?.reason || 'access_denied',
      relayStatus: 'not_started',
    });
  }
  return twiml(reply, hangupTwiML());
});

app.setNotFoundHandler((_request, reply) => {
  return json(reply, { error: 'not_found' }, 404);
});

app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error }, 'voice request failed');
  if (reply.sent) return;
  return json(reply, { error: 'service_unavailable' }, 503);
});

const cleanupTimer = setInterval(() => {
  cleanupExpiredSessions();
  concurrency.sweep();
}, Math.min(config.sessionTtlMinutes * 60_000, 60_000));
cleanupTimer.unref?.();

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ signal }, 'Voice AI draining');
  try {
    await drain.begin(signal);
  } catch (error) {
    app.log.warn({ err: error }, 'Voice drain failed');
  }
  clearInterval(cleanupTimer);
  await app.close().catch(() => {});
  process.exitCode = 0;
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));

await app.listen({ host: '127.0.0.1', port: config.port });
app.log.info({
  version: config.appVersion,
  port: config.port,
  model: config.openaiModel,
  accessMode: config.accessMode,
  dataMode: config.ahmDataMode,
}, 'AHMV Voice AI started');
