import test from 'node:test';
import assert from 'node:assert/strict';

import { isSmsCapableCaller, languageKey, normalizeLanguage } from '../runtime/src/caller.js';
import { createConcurrencyController } from '../runtime/src/concurrency.js';
import { buildSmsBody } from '../runtime/src/sms-body.js';
import { accessFromBootstrap, scheduleCapability } from '../runtime/src/access-policy.js';
import {
  applyConversationDraft,
  cloneConversationSession,
  createTurnController,
  removeInterruptedAssistantTurn,
} from '../runtime/src/turn-controller.js';
import {
  canonicalTwilioRequestUrl,
  websocketTrailingSlashSignatureUrl,
} from '../runtime/src/twilio-signature-url.js';

test('access policy preserves base next-event access after trial while gating weekly schedule', () => {
  const expired = accessFromBootstrap({
    contact: { accessTier: 'trial' },
    entitlement: {
      trialActive: false,
      premium: false,
      nextEvent: true,
      weeklySchedule: false,
    },
  }, {
    accessMode: 'paid',
    paidAccessPolicy: 'premium_or_trial',
  });
  assert.equal(expired.allowed, true);
  assert.equal(expired.reason, 'base_next_event');
  assert.equal(expired.nextEvent, true);
  assert.equal(expired.weeklySchedule, false);
  assert.deepEqual(scheduleCapability(expired), {
    nextEvent: true,
    weeklySchedule: false,
  });

  const activeTrial = accessFromBootstrap({
    contact: { accessTier: 'trial' },
    entitlement: {
      trialActive: true,
      premium: false,
      nextEvent: true,
      weeklySchedule: true,
    },
  }, {
    accessMode: 'paid',
    paidAccessPolicy: 'premium_or_trial',
  });
  assert.equal(activeTrial.allowed, true);
  assert.equal(activeTrial.reason, 'trial');
  assert.equal(activeTrial.weeklySchedule, true);

  const blocked = accessFromBootstrap({
    contact: { accessTier: 'blocked' },
    entitlement: {
      trialActive: false,
      premium: false,
      nextEvent: false,
      weeklySchedule: false,
    },
  }, {
    accessMode: 'paid',
    paidAccessPolicy: 'premium_or_trial',
  });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.reason, 'membership_required');
});

test('caller and language normalization cover FR EN ES and private callers', () => {
  assert.equal(isSmsCapableCaller('+15816666246'), true);
  assert.equal(isSmsCapableCaller('anonymous'), false);
  assert.equal(normalizeLanguage('fr-CA'), 'fr-CA');
  assert.equal(normalizeLanguage('en-US'), 'en-US');
  assert.equal(normalizeLanguage('es-MX'), 'es-US');
  assert.equal(languageKey('es-US'), 'es');
});

test('concurrency controller rejects caller and global saturation deterministically', () => {
  let clock = 1000;
  const controller = createConcurrencyController({
    maxCalls: 2,
    maxCallsPerCaller: 1,
    leaseMs: 1000,
    now: () => clock,
  });
  assert.equal(controller.admit('CA1', '+15145550001').allowed, true);
  assert.equal(controller.admit('CA2', '+15145550001').reason, 'caller_concurrency_limit');
  assert.equal(controller.admit('CA3', '+15145550002').allowed, true);
  assert.equal(controller.admit('CA4', '+15145550003').reason, 'global_concurrency_limit');
  clock = 2501;
  assert.equal(controller.admit('CA4', '+15145550003').allowed, true);
});

test('turn controller cancels superseded work and preserves only committed draft', () => {
  const controller = createTurnController();
  const first = controller.begin();
  const second = controller.begin();
  assert.equal(first.signal.aborted, true);
  assert.equal(second.isCurrent(), true);

  const session = {
    messages: [{ role: 'user', content: 'hola' }],
    smsItems: [],
    smsEnabled: true,
    smsConsentAt: '2099-01-01T00:00:00Z',
  };
  const draft = cloneConversationSession(session);
  draft.messages.push({ role: 'assistant', content: 'hola' });
  applyConversationDraft(session, draft);
  assert.equal(session.messages.at(-1).role, 'assistant');
  assert.equal(removeInterruptedAssistantTurn(session), true);
  assert.equal(session.messages.at(-1).role, 'user');
});

test('post-call SMS summary is trilingual and bounded', () => {
  const session = {
    language: 'es-US',
    smsItems: [{
      type: 'event',
      label: 'M13 A',
      date: '2099-10-03',
      time: '17:00',
      status: 'cancelled',
      arena: 'Auditorium de Verdun',
      mapsUrl: 'https://maps.google.com/example',
    }],
  };
  const body = buildSmsBody(session, {
    fallbackUrl: 'https://ahmverdun.ca/horaires',
    websiteUrl: 'https://ahmverdun.ca',
    maxChars: 700,
  });
  assert.match(body, /resumen de su llamada/i);
  assert.match(body, /CANCELADO/);
  assert.match(body, /Sitio oficial/);
  assert.ok(body.length <= 700);
});

test('Twilio canonical signature URLs preserve only approved public origins', () => {
  assert.equal(
    canonicalTwilioRequestUrl('https://voice.ahmverdun.ca', '/twilio/voice?attempt=2'),
    'https://voice.ahmverdun.ca/twilio/voice?attempt=2',
  );
  assert.equal(
    canonicalTwilioRequestUrl('wss://voice.ahmverdun.ca', '/twilio/conversation'),
    'wss://voice.ahmverdun.ca/twilio/conversation',
  );
  assert.equal(
    websocketTrailingSlashSignatureUrl('wss://voice.ahmverdun.ca/twilio/conversation'),
    'wss://voice.ahmverdun.ca/twilio/conversation/',
  );
});
