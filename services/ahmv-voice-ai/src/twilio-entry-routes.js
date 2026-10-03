import { config } from './config.js';
import { activateSession, countRecentCallsByCaller, getSession, loadSession, newSession, persistCallStart, persistSessionSnapshot, saveSession } from './store.js';
import { bootstrapVoiceCaller } from './ahm-bridge.js';
import { opaqueRef } from './log-safe.js';
import { buildAccessDeniedTwiML, buildActivationFailedTwiML, buildConversationRelayTwiML, buildEntryTwiML, buildRelayFailureTwiML, buildRetryActivationTwiML, hangupTwiML } from './twiml.js';
import { requireTwilio, xml, drain, concurrency, attemptFrom, accessDeniedCopy, addMembershipSmsItem, finalizeSession } from './runtime.js';

export function registerTwilioEntryRoutes(app) {
  app.post('/twilio/voice', async (request, reply) => {
    if (!requireTwilio(request, reply)) return;
    if (drain.draining) return xml(reply, buildRelayFailureTwiML());
    return xml(reply, buildEntryTwiML({ attempt: attemptFrom(request) }));
  });

  app.post('/twilio/start', async (request, reply) => {
    if (!requireTwilio(request, reply)) return;
    if (drain.draining) return xml(reply, buildRelayFailureTwiML());
    const attempt = attemptFrom(request);
    if (String(request.body?.Digits || '') !== '1') {
      if (attempt < config.activationAttempts) {
        return xml(reply, buildRetryActivationTwiML({ nextAttempt: attempt + 1 }));
      }
      return xml(reply, buildActivationFailedTwiML());
    }

    const callSid = String(request.body?.CallSid || '');
    const from = String(request.body?.From || '');
    const to = String(request.body?.To || config.twilioPhoneNumber);
    if (!callSid) return reply.code(400).send('Missing CallSid');

    const session = getSession(callSid) || await loadSession(callSid) || newSession({ callSid, from, to });
    session.from = from || session.from;
    session.to = to || session.to;
    activateSession(session);
    const bootstrap = await bootstrapVoiceCaller(session).catch((error) => {
      request.log.error(error, 'AHMV voice bootstrap failed');
      return { ok: false, code: 'BOOTSTRAP_FAILED' };
    });

    if (bootstrap.ok) {
      session.contactId = bootstrap.contactId || null;
      session.transactionalSmsAllowed = bootstrap.transactionalSmsAllowed !== false;
      session.membershipUrl = bootstrap.membershipUrl || session.membershipUrl || null;
      session.access = bootstrap.access;
      if (!session.transactionalSmsAllowed) session.smsEnabled = false;
    } else {
      session.access = { allowed: false, mode: config.accessMode, reason: 'access_bridge_unavailable' };
      session.smsEnabled = false;
    }

    if (
      session.access?.allowed &&
      session.access?.mode === 'free_beta' &&
      config.freeBetaCallsPer24h > 0 &&
      session.from
    ) {
      try {
        const recentCalls = await countRecentCallsByCaller(session.from, { hours: 24, excludeCallSid: session.callSid });
        if (recentCalls >= config.freeBetaCallsPer24h) {
          session.access = {
            ...session.access,
            allowed: false,
            reason: 'beta_quota_reached',
            recentCalls,
            quota: config.freeBetaCallsPer24h
          };
          session.smsEnabled = false;
        }
      } catch (error) {
        request.log.error(error, 'Free-beta abuse guard lookup failed');
        session.access = { allowed: false, mode: 'free_beta', reason: 'beta_guard_unavailable' };
        session.smsEnabled = false;
      }
    }

    if (session.access?.allowed) {
      const admission = concurrency.admit(session.callSid, session.from);
      if (!admission.allowed) {
        request.log.warn({ callRef: opaqueRef(session.callSid, 'call'), admission }, 'Rejected call at Voice AI concurrency guard');
        session.access = { ...session.access, allowed: false, reason: admission.reason };
        session.smsEnabled = false;
      }
    }

    saveSession(session);
    if (!session.access.allowed && session.access.mode === 'paid') addMembershipSmsItem(session);

    await persistCallStart(session).catch((error) => request.log.error(error, 'persistCallStart failed'));
    await persistSessionSnapshot(session).catch((error) => request.log.error(error, 'persistSessionSnapshot failed'));

    if (!session.access.allowed) {
      return xml(reply, buildAccessDeniedTwiML(accessDeniedCopy(session.access), { callSid: session.callSid }));
    }

    return xml(reply, buildConversationRelayTwiML({
      callSid: session.callSid,
      from: session.from,
      to: session.to,
      reconnectCount: session.reconnectCount
    }));
  });

  app.post('/twilio/access-ended', async (request, reply) => {
    if (!requireTwilio(request, reply)) return;
    const callSid = String(request.query?.callSid || request.body?.CallSid || '');
    const session = getSession(callSid) || await loadSession(callSid);
    if (session) await finalizeSession(session, request, 'access_denied');
    return xml(reply, hangupTwiML());
  });
}
