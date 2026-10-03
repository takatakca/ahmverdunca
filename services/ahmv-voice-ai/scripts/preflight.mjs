import { config } from '../src/config.js';
function configured(value) { return Boolean(String(value || '').trim()); }
const result = {
  ok: true, service: 'ahmv-voice-ai', version: config.appVersion, nodeEnv: config.nodeEnv,
  voiceInstanceMode: config.voiceInstanceMode, publicOrigin: new URL(config.publicBaseUrl).origin,
  publicWssOrigin: new URL(config.publicWssUrl).origin, accessMode: config.accessMode,
  dataMode: config.ahmDataMode, signatureValidation: config.validateTwilioSignatures,
  persistentStoreRequired: config.requirePersistentStore,
  persistentStoreConfigured: configured(config.supabaseUrl) && configured(config.supabaseServiceRoleKey),
  bridgeConfigured: configured(config.ahmBridgeApiUrl) && configured(config.ahmBridgeToken),
  smsEnabled: config.smsEnabled, explicitTtsVoiceConfigured: configured(config.twilioTtsVoice),
  speechModel: config.twilioSpeechModel, reasoningEffort: config.openaiReasoningEffort,
  maxConcurrentCalls: config.maxConcurrentCalls, maxConcurrentCallsPerCaller: config.maxConcurrentCallsPerCaller,
  maxCallDurationSeconds: config.maxCallDurationSeconds, maxTurnsPerCall: config.maxTurnsPerCall,
  shutdownGraceMs: config.shutdownGraceMs
};
const serialized = JSON.stringify(result, null, 2);
const forbidden = [config.twilioAuthToken, config.openaiApiKey, config.supabaseServiceRoleKey, config.ahmBridgeToken, config.twilioAccountSid].filter(Boolean);
for (const secret of forbidden) if (serialized.includes(secret)) throw new Error('Preflight attempted to expose a secret');
process.stdout.write(`${serialized}\n`);
