import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';
import { isSmsCapableCaller } from './caller.js';
import { emptyUsage } from './usage.js';

const memory = new Map();
const memorySmsClaims = new Set();
const memoryAuditClaims = new Set();

const supabase = config.supabaseUrl && config.supabaseServiceRoleKey
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

function compactMessages(messages = []) {
  return messages
    .filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
    .slice(-24)
    .map((item) => ({ role: item.role, content: item.content.slice(0, 2000) }));
}

export function sessionState(session, { includeMessages = config.persistActiveContext } = {}) {
  return {
    started: Boolean(session.started),
    language: session.language || 'fr',
    smsEnabled: Boolean(session.smsEnabled),
    smsConsentAt: session.smsConsentAt || null,
    smsItems: Array.isArray(session.smsItems) ? session.smsItems.slice(-12) : [],
    access: session.access || { allowed: false, mode: config.accessMode },
    contactId: session.contactId || null,
    transactionalSmsAllowed: session.transactionalSmsAllowed !== false,
    membershipUrl: session.membershipUrl || null,
    bridgeLanguage: session.bridgeLanguage || null,
    turnCount: Number(session.turnCount || 0),
    reconnectCount: Number(session.reconnectCount || 0),
    auditRecorded: Boolean(session.auditRecorded),
    usage: session.usage || emptyUsage(),
    costGuardExceeded: Boolean(session.costGuardExceeded),
    handoffRequested: Boolean(session.handoffRequested),
    handoffReason: session.handoffReason || null,
    handoffPreferredWindow: session.handoffPreferredWindow || null,
    messages: includeMessages ? compactMessages(session.messages) : []
  };
}

export function hasPersistentStore() {
  return Boolean(supabase);
}

export function newSession({ callSid, from, to }) {
  const session = {
    callSid,
    from: String(from || ''),
    to: String(to || config.twilioPhoneNumber),
    started: false,
    smsEnabled: false,
    smsConsentAt: null,
    language: 'fr',
    messages: [],
    smsItems: [],
    access: null,
    contactId: null,
    transactionalSmsAllowed: true,
    membershipUrl: null,
    bridgeLanguage: null,
    turnCount: 0,
    reconnectCount: 0,
    auditRecorded: false,
    usage: emptyUsage(),
    costGuardExceeded: false,
    handoffRequested: false,
    handoffReason: null,
    handoffPreferredWindow: null,
    createdAt: new Date().toISOString(),
    endedAt: null,
    endReason: null
  };
  memory.set(callSid, session);
  return session;
}

export function activateSession(session) {
  session.started = true;
  session.smsEnabled = config.smsEnabled && config.featureSmsRecap && isSmsCapableCaller(session.from);
  session.smsConsentAt = session.smsEnabled ? new Date().toISOString() : null;
  return saveSession(session);
}

export function getSession(callSid) {
  return memory.get(callSid) || null;
}

export function saveSession(session) {
  memory.set(session.callSid, session);
  return session;
}

export function deleteSession(callSid) {
  memory.delete(callSid);
}

export function cleanupExpiredSessions() {
  const cutoff = Date.now() - config.sessionTtlMinutes * 60_000;
  for (const [callSid, session] of memory.entries()) {
    const base = Date.parse(session.endedAt || session.createdAt || 0);
    if (Number.isFinite(base) && base < cutoff) memory.delete(callSid);
  }
}

export async function countRecentCallsByCaller(phoneE164, { hours = 24, excludeCallSid = null } = {}) {
  if (!isSmsCapableCaller(phoneE164)) return 0;
  const cutoff = new Date(Date.now() - Math.max(1, hours) * 60 * 60 * 1000).toISOString();
  if (!supabase) {
    let count = 0;
    for (const session of memory.values()) {
      if (session.callSid === excludeCallSid) continue;
      if (session.from !== phoneE164) continue;
      if ((session.createdAt || '') >= cutoff) count += 1;
    }
    return count;
  }

  let query = supabase
    .from('ahmv_voice_sessions')
    .select('call_sid', { count: 'exact', head: true })
    .eq('caller_phone', phoneE164)
    .gte('started_at', cutoff);
  if (excludeCallSid) query = query.neq('call_sid', excludeCallSid);
  const { count, error } = await query;
  if (error) throw error;
  return Number(count || 0);
}

export async function loadSession(callSid) {
  if (!callSid) return null;
  const cached = getSession(callSid);
  if (cached) return cached;
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('ahmv_voice_sessions')
    .select('call_sid,caller_phone,called_phone,access_mode,access_allowed,detected_language,sms_opt_in,sms_items,session_state,turn_count,started_at,ended_at,end_reason,audit_recorded_at')
    .eq('call_sid', callSid)
    .maybeSingle();
  if (error || !data) return null;

  const state = data.session_state && typeof data.session_state === 'object' ? data.session_state : {};
  const session = {
    callSid: data.call_sid,
    from: data.caller_phone || '',
    to: data.called_phone || config.twilioPhoneNumber,
    started: Boolean(state.started),
    smsEnabled: state.smsEnabled ?? Boolean(data.sms_opt_in),
    smsConsentAt: state.smsConsentAt || null,
    language: state.language || data.detected_language || 'fr',
    messages: Array.isArray(state.messages) ? state.messages : [],
    smsItems: Array.isArray(state.smsItems) ? state.smsItems : (Array.isArray(data.sms_items) ? data.sms_items : []),
    access: state.access || {
      allowed: data.access_allowed === true,
      mode: data.access_mode || config.accessMode,
      reason: 'recovered'
    },
    contactId: state.contactId || null,
    transactionalSmsAllowed: state.transactionalSmsAllowed !== false,
    membershipUrl: state.membershipUrl || null,
    bridgeLanguage: state.bridgeLanguage || null,
    turnCount: Number(state.turnCount ?? data.turn_count ?? 0),
    reconnectCount: Number(state.reconnectCount || 0),
    auditRecorded: Boolean(state.auditRecorded || data.audit_recorded_at),
    usage: state.usage && typeof state.usage === 'object' ? state.usage : emptyUsage(),
    costGuardExceeded: Boolean(state.costGuardExceeded),
    handoffRequested: Boolean(state.handoffRequested),
    handoffReason: state.handoffReason || null,
    handoffPreferredWindow: state.handoffPreferredWindow || null,
    createdAt: data.started_at || new Date().toISOString(),
    endedAt: data.ended_at || null,
    endReason: data.end_reason || null
  };
  saveSession(session);
  return session;
}

export async function persistCallStart(session) {
  if (!supabase) return;
  const { error } = await supabase.from('ahmv_voice_sessions').upsert({
    call_sid: session.callSid,
    caller_phone: isSmsCapableCaller(session.from) ? session.from : null,
    called_phone: session.to || null,
    ahmv_phone_contact_id: session.contactId || null,
    access_mode: session.access?.mode || config.accessMode,
    access_allowed: session.access?.allowed ?? false,
    detected_language: session.language,
    sms_opt_in: session.smsEnabled,
    sms_items: session.smsItems,
    session_state: sessionState(session),
    started_at: session.createdAt
  }, { onConflict: 'call_sid' });
  if (error) throw error;
}

export async function persistSessionSnapshot(session) {
  if (!supabase) return;
  const update = {
    ahmv_phone_contact_id: session.contactId || null,
    detected_language: session.language,
    sms_opt_in: session.smsEnabled,
    sms_items: session.smsItems,
    turn_count: session.turnCount,
    access_mode: session.access?.mode || config.accessMode,
    access_allowed: session.access?.allowed ?? false,
    session_state: sessionState(session)
  };
  const { error } = await supabase.from('ahmv_voice_sessions').update(update).eq('call_sid', session.callSid);
  if (error) throw error;
}

export async function persistCallEnd(session) {
  if (!supabase) return;
  const update = {
    ended_at: session.endedAt || new Date().toISOString(),
    end_reason: session.endReason,
    ahmv_phone_contact_id: session.contactId || null,
    detected_language: session.language,
    sms_opt_in: session.smsEnabled,
    sms_items: session.smsItems,
    turn_count: session.turnCount,
    access_mode: session.access?.mode || config.accessMode,
    access_allowed: session.access?.allowed ?? false,
    relay_session_status: session.relaySessionStatus || null,
    relay_error_code: session.relayErrorCode || null,
    relay_error_message: session.relayErrorMessage ? String(session.relayErrorMessage).slice(0, 500) : null,
    session_duration_seconds: Number.isFinite(session.sessionDurationSeconds) ? session.sessionDurationSeconds : null,
    audit_recorded_at: session.auditRecorded ? new Date().toISOString() : null,
    session_state: sessionState(session, { includeMessages: false })
  };
  const { error } = await supabase.from('ahmv_voice_sessions').update(update).eq('call_sid', session.callSid);
  if (error) throw error;
}

export async function claimCallAudit(callSid) {
  if (!callSid) return false;
  if (!supabase) {
    if (memoryAuditClaims.has(callSid)) return false;
    memoryAuditClaims.add(callSid);
    return true;
  }
  const { data, error } = await supabase.rpc('claim_ahmv_voice_audit', { p_call_sid: callSid });
  if (error) throw error;
  return data === true;
}

export async function completeCallAudit(callSid) {
  if (!callSid) return;
  if (!supabase) return;
  const { error } = await supabase.from('ahmv_voice_sessions').update({
    audit_recorded_at: new Date().toISOString(),
    audit_claimed_at: null
  }).eq('call_sid', callSid);
  if (error) throw error;
}

export async function releaseCallAuditClaim(callSid) {
  if (!callSid) return;
  if (!supabase) {
    memoryAuditClaims.delete(callSid);
    return;
  }
  const { error } = await supabase.rpc('release_ahmv_voice_audit_claim', { p_call_sid: callSid });
  if (error) throw error;
}

export async function claimPostCallSms(callSid) {
  if (!callSid) return false;
  if (!supabase) {
    if (memorySmsClaims.has(callSid)) return false;
    memorySmsClaims.add(callSid);
    return true;
  }
  const { data, error } = await supabase.rpc('claim_ahmv_voice_sms', { p_call_sid: callSid });
  if (error) throw error;
  return data === true;
}

export async function completePostCallSms(callSid, messageSid) {
  if (!supabase) return;
  const { error } = await supabase.from('ahmv_voice_sessions').update({
    sms_sent_at: new Date().toISOString(),
    sms_message_sid: messageSid || null,
    sms_send_error: null,
    sms_claimed_at: null
  }).eq('call_sid', callSid);
  if (error) throw error;
}

export async function releasePostCallSmsClaim(callSid, errorMessage = null) {
  if (!supabase) {
    memorySmsClaims.delete(callSid);
    return;
  }
  const { error } = await supabase.rpc('release_ahmv_voice_sms_claim', {
    p_call_sid: callSid,
    p_error: errorMessage ? String(errorMessage).slice(0, 500) : null
  });
  if (error) throw error;
}
