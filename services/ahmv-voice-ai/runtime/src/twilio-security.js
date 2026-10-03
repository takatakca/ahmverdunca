import twilio from 'twilio';
import { config } from './config.js';
import { canonicalTwilioRequestUrl, websocketTrailingSlashSignatureUrl } from './twilio-signature-url.js';

export function validateHttpWebhook(request) {
  if (!config.validateTwilioSignatures) return true;
  const signature = request.headers['x-twilio-signature'];
  if (!signature) return false;
  const url = canonicalTwilioRequestUrl(config.publicBaseUrl, request.url);
  if (!url) return false;
  const params = request.body && typeof request.body === 'object' ? request.body : {};
  return twilio.validateRequest(config.twilioAuthToken, signature, url, params);
}

export function validateWebSocketHandshake(request) {
  if (!config.validateTwilioSignatures) return true;
  const signature = request.headers['x-twilio-signature'];
  if (!signature) return false;
  const url = canonicalTwilioRequestUrl(config.publicWssUrl, request.url);
  if (!url) return false;
  if (twilio.validateRequest(config.twilioAuthToken, signature, url, {})) return true;
  const slashUrl = websocketTrailingSlashSignatureUrl(url);
  return Boolean(slashUrl) && twilio.validateRequest(config.twilioAuthToken, signature, slashUrl, {});
}
