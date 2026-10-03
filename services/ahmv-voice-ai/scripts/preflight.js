import { config } from '../runtime/src/config.js';

const placeholder = /^(change-me|changeme|replace|replace-me|todo|example|test|xxx)/i;

for (const [name, value] of [
  ['TWILIO_ACCOUNT_SID', config.twilioAccountSid],
  ['TWILIO_AUTH_TOKEN', config.twilioAuthToken],
  ['OPENAI_API_KEY', config.openaiApiKey],
]) {
  if (placeholder.test(String(value || '').trim())) {
    throw new Error(`${name} still looks like a placeholder`);
  }
}

if (config.nodeEnv === 'production') {
  if (!config.publicBaseUrl.startsWith('https://')) {
    throw new Error('PUBLIC_BASE_URL must use HTTPS');
  }
  if (!config.publicWssUrl.startsWith('wss://')) {
    throw new Error('PUBLIC_WSS_URL must use WSS');
  }
  if (!config.ahmBridgeApiUrl?.startsWith('https://')) {
    throw new Error('AHM_VOICE_BRIDGE_URL must use HTTPS');
  }
  if (config.ahmBridgeToken.length < 24) {
    throw new Error('AHM_VOICE_BRIDGE_TOKEN is too short');
  }
  if (!config.supabaseUrl?.startsWith('https://')) {
    throw new Error('SUPABASE_URL must use HTTPS');
  }

  const expectedRef = process.env.AHMV_SUPABASE_PROJECT_REF?.trim();
  if (expectedRef !== 'bqflllsjxmhqsvemhhwv') {
    throw new Error('AHMV_SUPABASE_PROJECT_REF must be bqflllsjxmhqsvemhhwv');
  }
  const supabaseUrl = new URL(config.supabaseUrl);
  if (supabaseUrl.hostname !== expectedRef + '.supabase.co') {
    throw new Error('SUPABASE_URL does not match the approved AHMV Supabase project');
  }
}

console.log(JSON.stringify({
  ok: true,
  service: 'ahmv-voice-ai',
  version: config.appVersion,
  nodeEnv: config.nodeEnv,
  model: config.openaiModel,
  accessMode: config.accessMode,
  dataMode: config.ahmDataMode,
  publicOrigin: new URL(config.publicBaseUrl).origin,
  websocketOrigin: new URL(config.publicWssUrl).origin,
  persistentStoreRequired: config.requirePersistentStore,
  signatureValidation: config.validateTwilioSignatures,
  secretsPresent: true,
}));
