import { config } from './config.js';
import {
  ACTIVATED_GREETING,
  ACTIVATION_FAILED_COPY,
  ENTRY_COPY,
  RELAY_RECONNECT_COPY,
  TURN_LIMIT,
  CALL_DURATION_LIMIT
} from './copy.js';

export function xmlEscape(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function say(language, text) {
  return `<Say language="${xmlEscape(language)}">${xmlEscape(text)}</Say>`;
}

export function buildEntryTwiML({ attempt = 1 } = {}) {
  const action = `${config.publicBaseUrl}/twilio/start?attempt=${attempt}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="dtmf" numDigits="1" timeout="${config.activationTimeoutSeconds}" action="${xmlEscape(action)}" method="POST" actionOnEmptyResult="true">
    ${say('fr-CA', ENTRY_COPY.fr)}
    ${say('en-US', ENTRY_COPY.en)}
    ${say('es-US', ENTRY_COPY.es)}
  </Gather>
</Response>`;
}

export function buildRetryActivationTwiML({ nextAttempt }) {
  const redirect = `${config.publicBaseUrl}/twilio/voice?attempt=${nextAttempt}`;
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Redirect method="POST">${xmlEscape(redirect)}</Redirect></Response>`;
}

export function buildActivationFailedTwiML() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${say('fr-CA', ACTIVATION_FAILED_COPY.fr)}
  ${say('en-US', ACTIVATION_FAILED_COPY.en)}
  ${say('es-US', ACTIVATION_FAILED_COPY.es)}
  <Hangup/>
</Response>`;
}

export function buildAccessDeniedTwiML(copy, { callSid } = {}) {
  const finalizeUrl = `${config.publicBaseUrl}/twilio/access-ended${callSid ? `?callSid=${encodeURIComponent(callSid)}` : ''}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${say('fr-CA', copy.fr)}
  ${say('en-US', copy.en)}
  ${say('es-US', copy.es)}
  <Redirect method="POST">${xmlEscape(finalizeUrl)}</Redirect>
</Response>`;
}

function reconnectGreeting(language) {
  const value = String(language || '').toLowerCase();
  if (value.startsWith('en')) return RELAY_RECONNECT_COPY.en;
  if (value.startsWith('es')) return RELAY_RECONNECT_COPY.es;
  return RELAY_RECONNECT_COPY.fr;
}

export function buildConversationRelayTwiML({ callSid, from, to, reconnectCount = 0, reconnect = false, language = 'fr' }) {
  const wsUrl = `${config.publicWssUrl}/twilio/conversation`;
  const actionUrl = `${config.publicBaseUrl}/twilio/voice/connect-ended`;
  const greeting = reconnect ? reconnectGreeting(language) : ACTIVATED_GREETING;
  const optionalVoice = config.twilioTtsVoice ? ` voice="${xmlEscape(config.twilioTtsVoice)}"` : '';
  const optionalInsights = config.twilioIntelligenceService
    ? ` intelligenceService="${xmlEscape(config.twilioIntelligenceService)}"`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect action="${xmlEscape(actionUrl)}" method="POST">
    <ConversationRelay
      url="${xmlEscape(wsUrl)}"
      welcomeGreeting="${xmlEscape(greeting)}"
      welcomeGreetingInterruptible="any"
      ttsProvider="ElevenLabs"
      ttsLanguage="multi"
      transcriptionProvider="Deepgram"
      transcriptionLanguage="multi"
      speechModel="${xmlEscape(config.twilioSpeechModel)}"
      dtmfDetection="true"
      reportInputDuringAgentSpeech="any"
      interruptible="any"
      preemptible="true"
      interruptSensitivity="medium"
      ignoreBackchannel="true"
      speechTimeout="${config.speechTimeoutMs}"
      deepgramSmartFormat="${config.deepgramSmartFormat ? 'true' : 'false'}"
      hints="AHM Verdun, Association du hockey mineur de Verdun, Verdun, horaire, aréna, Auditorium de Verdun, Denis Savard, M5, M7, M9, M11, M12, M13, M15, M18, Junior, Leafs, Bulldogs, Coyotes, Dynamos, Louves"${optionalVoice}${optionalInsights}>
      <Parameter name="callSid" value="${xmlEscape(callSid)}" />
      <Parameter name="from" value="${xmlEscape(from)}" />
      <Parameter name="to" value="${xmlEscape(to)}" />
      <Parameter name="reconnectCount" value="${xmlEscape(reconnectCount)}" />
      <Parameter name="activated" value="1" />
    </ConversationRelay>
  </Connect>
</Response>`;
}

function localeForLanguage(language) {
  const value = String(language || '').toLowerCase();
  if (value.startsWith('en')) return ['en-US', 'en'];
  if (value.startsWith('es')) return ['es-US', 'es'];
  return ['fr-CA', 'fr'];
}

export function buildTurnLimitTwiML(language = 'fr') {
  const [locale, key] = localeForLanguage(language);
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${say(locale, TURN_LIMIT[key])}<Hangup/></Response>`;
}

export function buildCallDurationLimitTwiML(language = 'fr') {
  const [locale, key] = localeForLanguage(language);
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${say(locale, CALL_DURATION_LIMIT[key])}<Hangup/></Response>`;
}

export function buildRelayFailureTwiML() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA">Désolé, le service téléphonique intelligent est temporairement indisponible. Consultez ahmverdun.ca.</Say>
  <Say language="en-US">The intelligent phone service is temporarily unavailable. Please visit ahmverdun.ca.</Say>
  <Say language="es-US">El servicio telefónico inteligente no está disponible temporalmente. Visite ahmverdun.ca.</Say>
  <Hangup/>
</Response>`;
}

export function hangupTwiML() {
  return '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>';
}
