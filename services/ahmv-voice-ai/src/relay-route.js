import { config } from './config.js';
import { validateWebSocketHandshake } from './twilio-security.js';
import { answerCaller } from './agent.js';
import { applyConversationDraft, cloneConversationSession, createTurnController, isAbortLike, removeInterruptedAssistantTurn } from './turn-controller.js';
import { getSession, loadSession, persistSessionSnapshot, saveSession } from './store.js';
import { AI_FALLBACK } from './copy.js';
import { languageKey, normalizeLanguage } from './caller.js';
import { opaqueRef, safeRelayError } from './log-safe.js';
import { updateBridgeLanguage } from './ahm-bridge.js';
import { drain, sendRelayText, sendRelayEnd, finalizeSession } from './runtime.js';

export function registerRelayRoute(app) {
  app.get('/twilio/conversation', { websocket: true }, (socket, request) => {
    if (!validateWebSocketHandshake(request)) {
      request.log.warn('Rejected invalid ConversationRelay WebSocket signature');
      socket.close(1008, 'Invalid Twilio signature');
      return;
    }
    if (drain.draining) {
      socket.close(1012, 'Service restart');
      return;
    }

    let session = null;
    let setupPromise = Promise.resolve();
    let languageSync = Promise.resolve();
    let durationTimer = null;
    const turns = createTurnController();
    const unregisterDrain = drain.register({
      cancel: (reason) => turns.cancel(reason),
      sendEnd: (reason) => sendRelayEnd(socket, reason),
      close: (code, reason) => socket.close(code, reason)
    });

    function armDurationLimit() {
      if (!session) return;
      if (durationTimer) clearTimeout(durationTimer);
      const startedAt = Date.parse(session.createdAt || '');
      const elapsedMs = Number.isFinite(startedAt) ? Math.max(0, Date.now() - startedAt) : 0;
      const remainingMs = Math.max(0, config.maxCallDurationSeconds * 1000 - elapsedMs);
      const expire = () => {
        if (!session) return;
        turns.cancel('Maximum call duration reached');
        session.endReason ||= 'call_duration_limit';
        saveSession(session);
        void persistSessionSnapshot(session).catch(() => {});
        sendRelayEnd(socket, 'call_duration_limit');
      };
      if (remainingMs === 0) {
        expire();
        return;
      }
      durationTimer = setTimeout(expire, remainingMs);
      durationTimer.unref?.();
    }

    function queueLanguageSync() {
      languageSync = languageSync.then(async () => {
        if (!session?.contactId) return;
        const desired = languageKey(session.language);
        if (session.bridgeLanguage === desired) return;
        const synced = await updateBridgeLanguage(session, desired).catch((error) => {
          request.log.error(error, 'AHMV contact language sync failed');
          return { ok: false };
        });
        if (synced?.ok && session) {
          session.bridgeLanguage = desired;
          saveSession(session);
          await persistSessionSnapshot(session).catch(() => {});
        }
      }).catch((error) => request.log.error(error, 'AHMV language sync queue failed'));
    }

    async function handleSetup(message) {
      const callSid = message.customParameters?.callSid || message.callSid || message.sessionId;
      session = getSession(callSid) || await loadSession(callSid);
      if (!session) {
        request.log.error({ callRef: opaqueRef(callSid, 'call') }, 'ConversationRelay setup without activated session');
        sendRelayEnd(socket, 'missing-activated-session');
        return;
      }
      session.reconnectCount = Number(message.customParameters?.reconnectCount || session.reconnectCount || 0);
      if (!session.started || !session.access?.allowed) {
        request.log.warn({ callRef: opaqueRef(callSid, 'call'), started: session.started, access: session.access }, 'Blocked session reached ConversationRelay');
        sendRelayEnd(socket, 'access-denied');
        return;
      }
      saveSession(session);
      await persistSessionSnapshot(session).catch(() => {});
      armDurationLimit();
      request.log.info({ callRef: opaqueRef(callSid, 'call'), reconnectCount: session.reconnectCount }, 'ConversationRelay session established');
    }

    async function handlePrompt(message) {
      if (!session || !message.last) return;
      const text = String(message.voicePrompt || '').trim();
      if (!text) return;

      const turn = turns.begin();
      const activeSession = session;
      activeSession.language = message.lang || activeSession.language || 'fr';
      activeSession.turnCount += 1;
      saveSession(activeSession);
      void persistSessionSnapshot(activeSession).catch(() => {});
      queueLanguageSync();

      if (activeSession.turnCount > config.maxTurnsPerCall) {
        turns.cancel('Conversation turn limit reached');
        activeSession.endReason = 'turn_limit';
        saveSession(activeSession);
        await persistSessionSnapshot(activeSession).catch(() => {});
        sendRelayEnd(socket, 'turn_limit');
        return;
      }

      const draft = cloneConversationSession(activeSession);
      try {
        const answer = await answerCaller({
          session: draft,
          text,
          lang: activeSession.language,
          signal: turn.signal,
          persist: false
        });
        if (!turn.isCurrent() || session !== activeSession) return;
        applyConversationDraft(activeSession, draft);
        saveSession(activeSession);
        await persistSessionSnapshot(activeSession).catch(() => {});
        if (!turn.isCurrent()) return;
        sendRelayText(socket, answer, normalizeLanguage(activeSession.language), true);
      } catch (error) {
        if (isAbortLike(error) || !turn.isCurrent()) {
          request.log.debug({ callRef: opaqueRef(activeSession.callSid, 'call') }, 'Discarded superseded AI turn');
          return;
        }
        request.log.error(error, 'AI response failed');
        const key = languageKey(activeSession.language);
        sendRelayText(socket, AI_FALLBACK[key], normalizeLanguage(activeSession.language), true);
      }
    }

    async function handleMessage(message) {
      if (!session) return;
      if (message.type === 'prompt') {
        await handlePrompt(message);
        return;
      }
      if (message.type === 'dtmf' && message.digit === '0') {
        turns.cancel('DTMF 0 superseded the active AI turn');
        const key = languageKey(session.language);
        const text = {
          fr: 'Pour joindre l’association, consultez la page Contact sur ahmverdun.ca.',
          en: 'To contact the association, please use the Contact page on ahmverdun.ca.',
          es: 'Para contactar a la asociación, visite la página de Contacto en ahmverdun.ca.'
        }[key];
        sendRelayText(socket, text, normalizeLanguage(session.language), true);
        return;
      }
      if (message.type === 'interrupt') {
        turns.cancel('Caller interrupted assistant speech');
        if (removeInterruptedAssistantTurn(session)) {
          saveSession(session);
          await persistSessionSnapshot(session).catch(() => {});
        }
        request.log.debug({ callRef: opaqueRef(session.callSid, 'call') }, 'Caller interrupted assistant speech');
        return;
      }
      if (message.type === 'error') {
        turns.cancel('ConversationRelay reported an error');
        request.log.error({ callRef: opaqueRef(session.callSid, 'call'), relayError: safeRelayError(message) }, 'ConversationRelay error');
      }
    }

    socket.on('message', (buffer) => {
      let message;
      try {
        message = JSON.parse(buffer.toString('utf8'));
      } catch {
        request.log.warn('Ignoring malformed ConversationRelay JSON');
        return;
      }

      if (message.type === 'setup') {
        turns.cancel('ConversationRelay setup/reconnect');
        setupPromise = handleSetup(message).catch((error) => {
          request.log.error(error, 'ConversationRelay setup failed');
          sendRelayEnd(socket, 'setup-failed');
        });
        return;
      }

      void setupPromise
        .then(() => handleMessage(message))
        .catch((error) => request.log.error(error, 'ConversationRelay message handler failed'));
    });

    socket.on('close', (code, reason) => {
      turns.cancel('ConversationRelay socket closed');
      if (durationTimer) clearTimeout(durationTimer);
      if (session) {
        request.log.info(
          { callRef: opaqueRef(session.callSid, 'call'), code, reason: reason?.toString()?.slice(0, 120) },
          'ConversationRelay socket closed'
        );
      }
      if (drain.draining && session) {
        void finalizeSession(session, request, 'service_restart')
          .catch((error) => request.log.error(error, 'shutdown finalization failed'))
          .finally(unregisterDrain);
        return;
      }
      unregisterDrain();
    });
  });
}
