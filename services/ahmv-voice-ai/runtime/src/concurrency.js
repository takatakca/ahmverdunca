export function createConcurrencyController({ maxCalls, maxCallsPerCaller, leaseMs, now = () => Date.now() }) {
  const active = new Map();
  const callerCounts = new Map();

  function callerKey(value) {
    return typeof value === 'string' && /^\+[1-9][0-9]{7,14}$/.test(value) ? value : '';
  }

  function release(callSid) {
    if (!active.has(callSid)) return false;
    const entry = active.get(callSid);
    active.delete(callSid);
    const caller = entry?.caller || '';
    if (caller) {
      const next = Math.max(0, (callerCounts.get(caller) || 1) - 1);
      if (next === 0) callerCounts.delete(caller);
      else callerCounts.set(caller, next);
    }
    return true;
  }

  function sweep() {
    const current = now();
    let released = 0;
    for (const [callSid, entry] of active) {
      if (entry.expiresAt <= current) {
        if (release(callSid)) released += 1;
      }
    }
    return released;
  }

  function admit(callSid, callerPhone = '') {
    sweep();
    if (!callSid) return { allowed: false, reason: 'missing_call_sid' };
    if (active.has(callSid)) {
      const entry = active.get(callSid);
      entry.expiresAt = now() + leaseMs;
      return { allowed: true, duplicate: true, activeCalls: active.size };
    }
    if (active.size >= maxCalls) {
      return { allowed: false, reason: 'global_concurrency_limit', activeCalls: active.size };
    }
    const caller = callerKey(callerPhone);
    const callerActive = caller ? (callerCounts.get(caller) || 0) : 0;
    if (caller && callerActive >= maxCallsPerCaller) {
      return { allowed: false, reason: 'caller_concurrency_limit', activeCalls: active.size, callerActive };
    }
    active.set(callSid, { caller, expiresAt: now() + leaseMs });
    if (caller) callerCounts.set(caller, callerActive + 1);
    return {
      allowed: true,
      duplicate: false,
      activeCalls: active.size,
      callerActive: caller ? callerActive + 1 : 0
    };
  }

  function snapshot() {
    sweep();
    return {
      activeCalls: active.size,
      callersWithActiveCalls: callerCounts.size,
      maxCalls,
      maxCallsPerCaller,
      leaseMs
    };
  }

  return { admit, release, sweep, snapshot };
}
