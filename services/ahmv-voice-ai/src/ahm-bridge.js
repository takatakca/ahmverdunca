import { config } from './config.js';
import { isSmsCapableCaller, languageKey } from './caller.js';
import { deriveVoiceAccess } from './access-policy.js';

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

export async function bootstrapVoiceCaller(session) {
  if (config.ahmDataMode === 'fixture') {
    return {
      ok: true,
      contactId: isSmsCapableCaller(session.from) ? 'fixture-contact' : null,
      transactionalSmsAllowed: isSmsCapableCaller(session.from),
      access: deriveVoiceAccess(
        {
          contact: { accessTier: 'trial' },
          entitlement: {
            trialActive: true,
            premium: false,
            nextEvent: true,
            weeklySchedule: true
          }
        },
        {
          accessMode: config.accessMode,
          paidAccessPolicy: config.paidAccessPolicy
        }
      )
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
    access: deriveVoiceAccess(data, {
      accessMode: config.accessMode,
      paidAccessPolicy: config.paidAccessPolicy
    }),
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

export async function requestHumanHandoff({ session, reason, preferredWindow }) {
  if (!config.featureHumanHandoff) {
    return { ok: false, code: 'FEATURE_DISABLED', feature: 'human_handoff' };
  }
  if (!isSmsCapableCaller(session?.from) || !session?.contactId) {
    return { ok: false, code: 'NO_CALLBACK_DESTINATION' };
  }
  if (config.ahmDataMode === 'fixture') {
    return { ok: true, requested: true, duplicate: false };
  }

  const result = await bridgeFetch('handoff', {
    method: 'POST',
    body: {
      contactId: session.contactId,
      phoneE164: session.from,
      callSid: session.callSid,
      language: languageKey(session.language),
      reason,
      preferredWindow
    }
  });
  if (!result.ok) {
    return { ok: false, code: result.code || 'HANDOFF_BRIDGE_FAILED' };
  }
  return {
    ok: true,
    requested: result.data?.requested === true,
    duplicate: result.data?.duplicate === true
  };
}

export async function probeBridgeReadiness() {
  if (config.ahmDataMode === 'fixture') return { ready: true, reason: 'fixture_mode' };
  const result = await bridgeFetch('readiness');
  if (!result.ok) return { ready: false, reason: result.code || 'bridge_unavailable' };
  if (result.data?.ready !== true) return { ready: false, reason: clean(result.data?.reason, 100) || 'bridge_not_ready' };
  return { ready: true, reason: clean(result.data?.reason, 100) || 'ready' };
}

export const _test = {};
