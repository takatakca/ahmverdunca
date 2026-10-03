function finiteInt(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function emptyVoiceMetrics() {
  return {
    scheduleLookups: 0,
    scheduleAuthoritative: 0,
    scheduleMatched: 0,
    arenaLookups: 0,
    arenaAuthoritative: 0,
    arenaMatched: 0,
    humanHandoffRequests: 0,
  };
}

function ensure(session) {
  session.metrics ||= emptyVoiceMetrics();
  return session.metrics;
}

function hasMatches(result) {
  return Array.isArray(result?.matches) && result.matches.length > 0;
}

function scheduleAuthoritative(result) {
  if (!result?.ok) return false;
  return ['verified', 'verified_live', 'no_match'].includes(String(result.status || ''));
}

function arenaAuthoritative(result) {
  if (!result?.ok) return false;
  return ['verified', 'no_match'].includes(String(result.status || ''));
}

export function recordScheduleLookup(session, result) {
  const metrics = ensure(session);
  metrics.scheduleLookups = finiteInt(metrics.scheduleLookups) + 1;
  if (scheduleAuthoritative(result)) {
    metrics.scheduleAuthoritative = finiteInt(metrics.scheduleAuthoritative) + 1;
  }
  if (hasMatches(result)) {
    metrics.scheduleMatched = finiteInt(metrics.scheduleMatched) + 1;
  }
  return metrics;
}

export function recordArenaLookup(session, result) {
  const metrics = ensure(session);
  metrics.arenaLookups = finiteInt(metrics.arenaLookups) + 1;
  if (arenaAuthoritative(result)) {
    metrics.arenaAuthoritative = finiteInt(metrics.arenaAuthoritative) + 1;
  }
  if (hasMatches(result)) {
    metrics.arenaMatched = finiteInt(metrics.arenaMatched) + 1;
  }
  return metrics;
}

export function recordHumanHandoff(session, result) {
  const metrics = ensure(session);
  if (result?.ok && result.requested && !result.duplicate) {
    metrics.humanHandoffRequests = finiteInt(metrics.humanHandoffRequests) + 1;
  }
  return metrics;
}

export function normalizedVoiceMetrics(metrics = {}) {
  return {
    scheduleLookups: finiteInt(metrics.scheduleLookups),
    scheduleAuthoritative: finiteInt(metrics.scheduleAuthoritative),
    scheduleMatched: finiteInt(metrics.scheduleMatched),
    arenaLookups: finiteInt(metrics.arenaLookups),
    arenaAuthoritative: finiteInt(metrics.arenaAuthoritative),
    arenaMatched: finiteInt(metrics.arenaMatched),
    humanHandoffRequests: finiteInt(metrics.humanHandoffRequests),
  };
}
