function abortError(reason = 'Turn cancelled') {
  return new DOMException(reason, 'AbortError');
}

export function throwIfAborted(signal) {
  if (signal?.aborted) throw signal.reason instanceof Error ? signal.reason : abortError();
}

export function isAbortLike(error) {
  return error?.name === 'AbortError' || error?.code === 'ABORT_ERR';
}

export function createTurnController() {
  let generation = 0;
  let controller = null;

  function cancel(reason = 'Turn superseded') {
    generation += 1;
    if (controller && !controller.signal.aborted) controller.abort(abortError(reason));
    controller = null;
  }

  function begin() {
    cancel('Turn superseded by a newer caller turn');
    const id = generation;
    controller = new AbortController();
    const current = controller;
    return {
      id,
      signal: current.signal,
      isCurrent: () => id === generation && controller === current && !current.signal.aborted
    };
  }

  return {
    begin,
    cancel,
    get generation() {
      return generation;
    }
  };
}

export function cloneConversationSession(session) {
  return {
    ...session,
    messages: structuredClone(Array.isArray(session.messages) ? session.messages : []),
    smsItems: structuredClone(Array.isArray(session.smsItems) ? session.smsItems : []),
    usage: structuredClone(session.usage || {}),
    metrics: structuredClone(session.metrics || {})
  };
}

export function applyConversationDraft(session, draft) {
  session.messages = draft.messages;
  session.smsItems = draft.smsItems;
  session.smsEnabled = draft.smsEnabled;
  session.smsConsentAt = draft.smsConsentAt;
  session.usage = draft.usage;
  session.metrics = draft.metrics;
  session.costGuardExceeded = Boolean(draft.costGuardExceeded);
  session.handoffRequested = Boolean(draft.handoffRequested);
  session.handoffReason = draft.handoffReason || null;
  session.handoffPreferredWindow = draft.handoffPreferredWindow || null;
  return session;
}

export function removeInterruptedAssistantTurn(session) {
  if (!Array.isArray(session?.messages) || !session.messages.length) return false;
  const last = session.messages.at(-1);
  if (last?.role !== 'assistant') return false;
  session.messages = session.messages.slice(0, -1);
  return true;
}
