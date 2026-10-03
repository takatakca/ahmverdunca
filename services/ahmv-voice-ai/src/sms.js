import { config } from './config.js';
import { isSmsCapableCaller } from './caller.js';
import { sendBridgeSms } from './ahm-bridge.js';
import { buildSmsBody } from './sms-body.js';
import { claimPostCallSms, completePostCallSms, releasePostCallSmsClaim } from './store.js';

export { buildSmsBody } from './sms-body.js';

export async function sendPostCallSms(session) {
  if (
    !config.smsEnabled ||
    !config.featureSmsRecap ||
    !session?.smsEnabled ||
    session.transactionalSmsAllowed === false ||
    !isSmsCapableCaller(session.from)
  ) {
    return { sent: false, reason: 'disabled_or_no_destination' };
  }

  const claimed = await claimPostCallSms(session.callSid);
  if (!claimed) return { sent: false, reason: 'already_claimed_or_sent' };

  const body = buildSmsBody(session, {
    fallbackUrl: config.smsFallbackUrl,
    websiteUrl: config.ahmWebsiteUrl,
    maxChars: config.smsMaxChars
  });

  try {
    const result = await sendBridgeSms({ session, body, purpose: 'voice-ai-recap' });
    if (!result.ok || !result.sent) {
      const reason = result.code || result.reason || 'bridge_sms_not_sent';
      await releasePostCallSmsClaim(session.callSid, reason).catch(() => {});
      return { sent: false, reason };
    }
    await completePostCallSms(session.callSid, result.sid);
    return { sent: true, sid: result.sid };
  } catch (error) {
    await releasePostCallSmsClaim(session.callSid, error?.message).catch(() => {});
    throw error;
  }
}
