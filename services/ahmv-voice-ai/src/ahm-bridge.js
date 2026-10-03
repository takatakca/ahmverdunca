import { config } from './config.js';
import { isSmsCapableCaller, languageKey } from './caller.js';

function clean(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function endpoint(pathname) {
  if (!config.ahmBridgeApiUrl) throw new Error('AHM voice bridge URL is not configured');
  return new URL(pathname.replace(/^\//, ''), `${config.ahmBridgeApiUrl}/`);
}

async function bridgeFetch(pathname, { method = 'GET', query = {}, body } = {}) {
  const url = endpoint(pathname);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  const headers = {
    accept: 'application/json',
    'user-agent': `AHMV-Voice-AI/${config.appVersion}`
  };
  if (config.ahmBridgeToken) headers.authorization = `Bearer ${config.ahmBridgeToken}`;
  if (body !== undefined) headers['content-type'] = 'application/json';

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(config.ahmDataTimeoutMs)
    });
    const type = response.headers.get('content-type') || '';
    const text = await response.text();
    if (text.length > 512 * 1024) return { ok: false, code: 'UPSTREAM_RESPONSE_TOO_LARGE', status: response.status };
    if (!type.toLowerCase().includes('application/json')) {
      return { ok: false, code: 'UPSTREAM_INVALID_CONTENT_TYPE', status: response.status };
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false, code: 'UPSTREAM_INVALID_JSON', status: response.status };
    }
    if (!response.ok) {
      return { ok: false, code: clean(data?.code || data?.error, 80) || 'UPSTREAM_ERROR', status: response.status, data };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return {
      ok: false,
      code: timeout ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNAVAILABLE',
      message: clean(error?.message, 300)
    };
  }
}

function httpsUrl(value) {
  const raw = clean(value, 500);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function accessFromBootstrap(data) {
  const tier = clean(data?.contact?.accessTier, 30) || 'guest';
  const trialActive = Boolean(data?.entitlement?.trialActive);
  const premium = tier === 'premium' || Boolean(data?.entitlement?.premium);
  const nextEvent = Boolean(data?.entitlement?.nextEvent);
  const weeklySchedule = Boolean(data?.entitlement?.weeklySchedule);

  if (tier === 'blocked') {
    return {
      allowed: false,
      mode: config.accessMode,
      reason: 'blocked',
      tier,
      premium: false,
      trialActive: false,
      nextEvent: false,
      weeklySchedule: false
    };
  }

  if (config.accessMode === 'free_beta') {
    return {
      allowed: true,
      mode: 'free_beta',
      reason: 'beta_open_access',
      tier,
      premium,
      trialActive,
      nextEvent: true,
      weeklySchedule: true
    };
  }

  const fullAccess =
    premium ||
    (config.paidAccessPolicy !== 'premium_only' && trialActive);
  const allowed = fullAccess || nextEvent;

  return {
    allowed,
    mode: 'paid',
    reason: premium
      ? 'premium'
      : trialActive && fullAccess
        ? 'trial'
        : nextEvent
          ? 'base_next_event'
          : 'membership_required',
    tier,
    premium,
    trialActive,
    nextEvent: fullAccess ? true : nextEvent,
    weeklySchedule: fullAccess && weeklySchedule
  };
}

export async function bootstrapVoiceCaller(session) {
  if (config.ahmDataMode === 'fixture') {
    return {
      ok: true,
      contactId: isSmsCapableCaller(session.from) ? 'fixture-contact' : null,
      transactionalSmsAllowed: isSmsCapableCaller(session.from),
      access: {
        allowed: true,
        mode: config.accessMode,
        reason: 'fixture',
        tier: 'trial',
        premium: false,
        trialActive: true,
        nextEvent: true,
        weeklySchedule: true
      }
    };
  }

  const result = await bridgeFetch('bootstrap', {
    method: 'POST',
    body: {
      phoneE164: isSmsCapableCaller(session.from) ? session.from : null,
      language: languageKey(session.language),
      smsRequested: Boolean(session.smsEnabled),
      callSid: session.callSid
    }
  });
  if (!result.ok) return { ok: false, code: result.code || 'BOOTSTRAP_FAILED' };

  const data = result.data || {};
  return {
    ok: true,
    contactId: clean(data?.contact?.id, 100) || null,
    transactionalSmsAllowed: data?.contact?.transactionalSmsAllowed !== false,
    access: accessFromBootstrap(data),
    membershipUrl: httpsUrl(data?.entitlement?.membershipUrl),
    source: clean(data?.source, 100) || 'ahmv-phone-v2'
  };
}

export async function updateBridgeLanguage(session, language) {
  const normalized = languageKey(language);
  if (config.ahmDataMode === 'fixture') return { ok: true, language: normalized };
  if (!session?.contactId || !isSmsCapableCaller(session.from)) return { ok: true, skipped: true };
  const result = await bridgeFetch('language', {
    method: 'POST',
    body: {
      contactId: session.contactId,
      phoneE164: session.from,
      language: normalized
    }
  });
  if (!result.ok) return { ok: false, code: result.code || 'LANGUAGE_BRIDGE_FAILED' };
  return { ok: true, language: normalized };
}

export async function sendBridgeSms({ session, body, purpose = 'voice-ai-recap' }) {
  if (config.ahmDataMode === 'fixture') return { ok: true, sent: true, sid: 'SM_FIXTURE' };
  if (!isSmsCapableCaller(session.from)) return { ok: true, sent: false, reason: 'no_sms_destination' };
  const result = await bridgeFetch('sms', {
    method: 'POST',
    body: {
      contactId: session.contactId || null,
      phoneE164: session.from,
      body: String(body || '').slice(0, 1500),
      purpose,
      callSid: session.callSid
    }
  });
  if (!result.ok) return { ok: false, code: result.code || 'SMS_BRIDGE_FAILED' };
  return {
    ok: true,
    sent: Boolean(result.data?.sent),
    sid: clean(result.data?.sid, 100) || null,
    reason: clean(result.data?.reason, 100) || null
  };
}

export async function recordBridgeInteraction({ session, outcome }) {
  if (config.ahmDataMode === 'fixture') return { ok: true };
  const result = await bridgeFetch('interaction', {
    method: 'POST',
    body: {
      contactId: session.contactId || null,
      callSid: session.callSid,
      outcome: clean(outcome, 100) || 'completed',
      language: languageKey(session.language),
      turnCount: Number(session.turnCount || 0),
      relayErrorCode: clean(session.relayErrorCode, 50) || null,
      smsRequested: Boolean(session.smsEnabled),
      smsItemCount: Array.isArray(session.smsItems) ? session.smsItems.length : 0
    }
  });
  return result.ok ? { ok: true } : { ok: false, code: result.code };
}

export async function probeBridgeReadiness() {
  if (config.ahmDataMode === 'fixture') return { ready: true, reason: 'fixture_mode' };
  const result = await bridgeFetch('readiness');
  if (!result.ok) return { ready: false, reason: result.code || 'bridge_unavailable' };
  if (result.data?.ready !== true) return { ready: false, reason: clean(result.data?.reason, 100) || 'bridge_not_ready' };
  return { ready: true, reason: clean(result.data?.reason, 100) || 'ready' };
}

export const _test = { accessFromBootstrap };
