import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function bool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return String(raw).trim().toLowerCase() === 'true';
}

function int(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

function numberValue(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be a number between ${min} and ${max}`);
  }
  return value;
}

function oneOf(name, values, fallback) {
  const value = (process.env[name] || fallback).trim();
  if (!values.includes(value)) throw new Error(`${name} must be one of: ${values.join(', ')}`);
  return value;
}

function absoluteUrl(name, value, allowedProtocols) {
  if (!value) return '';
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }
  if (!allowedProtocols.includes(parsed.protocol)) {
    throw new Error(`${name} must use ${allowedProtocols.join(' or ')}`);
  }
  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

const nodeEnv = process.env.NODE_ENV || 'development';
const accessMode = oneOf('ACCESS_MODE', ['free_beta', 'paid'], 'free_beta');
const paidAccessPolicy = oneOf('PAID_ACCESS_POLICY', ['premium_only', 'premium_or_trial'], 'premium_or_trial');
const ahmDataMode = oneOf('AHM_DATA_MODE', ['api', 'fixture'], 'api');
const publicBaseUrl = absoluteUrl('PUBLIC_BASE_URL', required('PUBLIC_BASE_URL'), ['https:']);
const publicWssUrl = absoluteUrl('PUBLIC_WSS_URL', required('PUBLIC_WSS_URL'), ['wss:']);
const ahmWebsiteUrl = absoluteUrl('AHM_WEBSITE_URL', process.env.AHM_WEBSITE_URL?.trim() || 'https://ahmverdun.ca', ['https:']);
const membershipUrl = absoluteUrl('MEMBERSHIP_URL', process.env.MEMBERSHIP_URL?.trim() || 'https://takatak.ca/login?next=%2Fdashboard%2Fhockey', ['https:']);
const smsFallbackUrl = absoluteUrl('SMS_FALLBACK_URL', process.env.SMS_FALLBACK_URL?.trim() || 'https://ahmverdun.ca/horaires', ['https:']);
const bridgeRaw = process.env.AHM_VOICE_BRIDGE_URL?.trim() || '';
const bridgeToken = process.env.AHM_VOICE_BRIDGE_TOKEN?.trim() || '';
const ahmBridgeApiUrl = absoluteUrl('AHM_VOICE_BRIDGE_URL', bridgeRaw, nodeEnv === 'production' ? ['https:'] : ['https:', 'http:']);

const validateTwilioSignatures = bool('TWILIO_VALIDATE_SIGNATURES', true);
const twilioSpeechModel = process.env.TWILIO_SPEECH_MODEL?.trim() || 'flux';
const twilioTtsVoice = process.env.TWILIO_TTS_VOICE?.trim() || '';
const requirePersistentStore = bool('REQUIRE_PERSISTENT_STORE', nodeEnv === 'production');
const supabaseRaw = process.env.SUPABASE_URL?.trim() || '';
const supabaseUrl = absoluteUrl('SUPABASE_URL', supabaseRaw, nodeEnv === 'production' ? ['https:'] : ['https:', 'http:']);
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER?.trim() || '+15816666246';
const voiceInstanceMode = oneOf('VOICE_INSTANCE_MODE', ['single'], 'single');
const openaiReasoningEffort = oneOf(
  'OPENAI_REASONING_EFFORT',
  ['none', 'low', 'medium', 'high', 'xhigh', 'max'],
  'none'
);

if (nodeEnv === 'production' && ahmDataMode === 'fixture') {
  throw new Error('AHM_DATA_MODE=fixture is forbidden in production');
}
if (nodeEnv === 'production' && !validateTwilioSignatures) {
  throw new Error('TWILIO_VALIDATE_SIGNATURES=false is forbidden in production');
}
if (nodeEnv === 'production' && twilioSpeechModel !== 'flux') {
  throw new Error('TWILIO_SPEECH_MODEL=flux is required in production for the multilingual ConversationRelay profile');
}
if (nodeEnv === 'production' && !twilioTtsVoice) {
  throw new Error('TWILIO_TTS_VOICE is required in production; choose and listening-test an explicit ElevenLabs voice ID');
}
if (nodeEnv === 'production' && ahmDataMode === 'api') {
  if (!ahmBridgeApiUrl) throw new Error('AHM_VOICE_BRIDGE_URL is required in production');
  if (bridgeToken.length < 24) throw new Error('AHM_VOICE_BRIDGE_TOKEN must be at least 24 characters in production');
}
if (nodeEnv === 'production' && requirePersistentStore && (!supabaseUrl || !supabaseServiceRoleKey)) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when REQUIRE_PERSISTENT_STORE=true');
}
if (!/^\+[1-9][0-9]{7,14}$/.test(twilioPhoneNumber)) {
  throw new Error('TWILIO_PHONE_NUMBER must be E.164');
}

export const config = {
  appVersion: '0.7.0-preproduction',
  nodeEnv,
  voiceInstanceMode,
  port: int('PORT', 3000, { min: 1, max: 65535 }),
  publicBaseUrl,
  publicWssUrl,
  twilioAccountSid: required('TWILIO_ACCOUNT_SID'),
  twilioAuthToken: required('TWILIO_AUTH_TOKEN'),
  twilioPhoneNumber,
  validateTwilioSignatures,
  twilioSpeechModel,
  twilioTtsVoice,
  twilioIntelligenceService: process.env.TWILIO_INTELLIGENCE_SERVICE?.trim() || '',
  relayReconnectAttempts: int('RELAY_RECONNECT_ATTEMPTS', 1, { min: 0, max: 3 }),
  activationAttempts: int('ACTIVATION_ATTEMPTS', 2, { min: 1, max: 5 }),
  activationTimeoutSeconds: int('ACTIVATION_TIMEOUT_SECONDS', 8, { min: 3, max: 30 }),
  speechTimeoutMs: int('TWILIO_SPEECH_TIMEOUT_MS', 900, { min: 600, max: 5000 }),
  deepgramSmartFormat: bool('TWILIO_DEEPGRAM_SMART_FORMAT', true),
  openaiApiKey: required('OPENAI_API_KEY'),
  openaiModel: process.env.OPENAI_MODEL?.trim() || 'gpt-5.6-terra',
  openaiReasoningEffort,
  openaiTimeoutMs: int('OPENAI_TIMEOUT_MS', 15000, { min: 3000, max: 60000 }),
  openaiMaxOutputTokens: int('OPENAI_MAX_OUTPUT_TOKENS', 320, { min: 64, max: 2000 }),
  openaiInputUsdPerMillion: numberValue('OPENAI_INPUT_USD_PER_MILLION', 2, { min: 0, max: 1000 }),
  openaiCachedInputUsdPerMillion: numberValue('OPENAI_CACHED_INPUT_USD_PER_MILLION', 0.2, { min: 0, max: 1000 }),
  openaiOutputUsdPerMillion: numberValue('OPENAI_OUTPUT_USD_PER_MILLION', 12, { min: 0, max: 1000 }),
  twilioInboundUsdPerMinute: numberValue('TWILIO_INBOUND_USD_PER_MINUTE', 0.0085, { min: 0, max: 100 }),
  twilioConversationRelayUsdPerMinute: numberValue('TWILIO_CONVERSATION_RELAY_USD_PER_MINUTE', 0.07, { min: 0, max: 100 }),
  costGuardSessionUsd: numberValue('COST_GUARD_SESSION_USD', 0, { min: 0, max: 1000 }),
  ahmDataMode,
  ahmBridgeApiUrl,
  ahmBridgeToken: bridgeToken,
  ahmDataTimeoutMs: int('AHM_DATA_TIMEOUT_MS', 4000, { min: 500, max: 15000 }),
  ahmReadinessProbeTtlMs: int('AHM_READINESS_PROBE_TTL_MS', 30000, { min: 5000, max: 300000 }),
  ahmWebsiteUrl,
  supabaseUrl,
  supabaseServiceRoleKey,
  requirePersistentStore,
  persistActiveContext: bool('PERSIST_ACTIVE_CONTEXT', false),
  accessMode,
  paidAccessPolicy,
  freeBetaCallsPer24h: int('FREE_BETA_CALLS_PER_24H', 0, { min: 0, max: 1000 }),
  membershipUrl,
  smsEnabled: bool('SMS_ENABLED', true),
  featureScheduleLookup: bool('FEATURE_SCHEDULE_LOOKUP_ENABLED', true),
  featureArenaLookup: bool('FEATURE_ARENA_LOOKUP_ENABLED', true),
  featureSmsRecap: bool('FEATURE_SMS_RECAP_ENABLED', true),
  featureHumanHandoff: bool('FEATURE_HUMAN_HANDOFF_ENABLED', false),
  featureTeamPersonalization: bool('FEATURE_TEAM_PERSONALIZATION_ENABLED', false),
  featurePremiumAnalytics: bool('FEATURE_PREMIUM_ANALYTICS_ENABLED', false),
  smsFallbackUrl,
  smsMaxChars: int('SMS_MAX_CHARS', 700, { min: 160, max: 1400 }),
  maxConcurrentCalls: int('MAX_CONCURRENT_CALLS', 20, { min: 1, max: 500 }),
  maxConcurrentCallsPerCaller: int('MAX_CONCURRENT_CALLS_PER_CALLER', 1, { min: 1, max: 10 }),
  maxTurnsPerCall: int('MAX_TURNS_PER_CALL', 30, { min: 5, max: 100 }),
  maxCallDurationSeconds: int('MAX_CALL_DURATION_SECONDS', 900, { min: 60, max: 3600 }),
  sessionTtlMinutes: int('SESSION_TTL_MINUTES', 120, { min: 15, max: 1440 }),
  shutdownGraceMs: int('SHUTDOWN_GRACE_MS', 12000, { min: 1000, max: 18000 })
};
