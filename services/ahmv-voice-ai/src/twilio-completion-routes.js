import { config } from './config.js';
import { getSession, loadSession, persistSessionSnapshot, saveSession } from './store.js';
import { opaqueRef } from './log-safe.js';
import { buildCallDurationLimitTwiML, buildConversationRelayTwiML, buildRelayFailureTwiML, buildTurnLimitTwiML, hangupTwiML } from './twiml.js';
import { requireTwilio, xml, drain, retryableRelayError, finalizeSession } from './runtime.js';

export function registerTwilioCompletionRoutes(app) {
  app.post('/twilio/voice/connect-ended', async (request, reply) => {
    if (!requireTwilio(request, reply)) return;

    const callSid = String(request.body?.CallSid || '');
    const sessionStatus = String(request.body?.SessionStatus || '').toLowerCase();
    const callStatus = String(request.body?.CallStatus || '').toLowerCase();
    const errorCode = String(request.body?.ErrorCode || '');
    let handoff = null;
    if (request.body?.HandoffData) {
      try {
        handoff = JSON.parse(String(request.body.HandoffData));
      } catch {
        request.log.warn({ callRef: opaqueRef(callSid, 'call') }, 'Ignoring malformed ConversationRelay HandoffData');
      }
    }
    const handoffReason = typeof handoff?.reasonCode === 'string' ? handoff.reasonCode : '';
    const session = getSession(callSid) || await loadSession(callSid);

    if (session) {
      session.relaySessionStatus = sessionStatus || null;
      session.relayErrorCode = errorCode || null;
      session.relayErrorMessage = request.body?.ErrorMessage || null;
      const parsedDuration = Number.parseInt(request.body?.SessionDuration || '', 10);
      session.sessionDurationSeconds = Number.isFinite(parsedDuration) ? parsedDuration : null;
      saveSession(session);
    }

    if (
      session &&
      sessionStatus === 'failed' &&
      callStatus !== 'completed' &&
      retryableRelayError(errorCode) &&
      !drain.draining &&
      session.reconnectCount < config.relayReconnectAttempts
    ) {
      session.reconnectCount += 1;
      saveSession(session);
      await persistSessionSnapshot(session).catch(() => {});
      request.log.warn({ callRef: opaqueRef(callSid, 'call'), errorCode, reconnectCount: session.reconnectCount }, 'Reconnecting failed ConversationRelay session');
      return xml(reply, buildConversationRelayTwiML({
        callSid: session.callSid,
        from: session.from,
        to: session.to,
        reconnectCount: session.reconnectCount,
        reconnect: true,
        language: session.language
      }));
    }

    if (session) {
      await finalizeSession(
        session,
        request,
        handoffReason || sessionStatus || callStatus || (errorCode ? `relay_error_${errorCode}` : 'connect_ended')
      );
    }

    if (handoffReason === 'turn_limit') {
      return xml(reply, buildTurnLimitTwiML(session?.language || 'fr'));
    }
    if (handoffReason === 'call_duration_limit') {
      return xml(reply, buildCallDurationLimitTwiML(session?.language || 'fr'));
    }
    if (sessionStatus === 'failed' && callStatus !== 'completed') return xml(reply, buildRelayFailureTwiML());
    return xml(reply, hangupTwiML());
  });

  app.post('/twilio/voice/status', async (request, reply) => {
    if (!requireTwilio(request, reply)) return;
    const callSid = String(request.body?.CallSid || '');
    const status = String(request.body?.CallStatus || '').toLowerCase();
    if (status === 'completed') {
      const session = getSession(callSid) || await loadSession(callSid);
      if (session) await finalizeSession(session, request, status);
    }
    reply.code(200).send('OK');
  });
}
