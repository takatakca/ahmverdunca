import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  deriveVoiceAccess,
  scheduleCapability
} from '../src/access-policy.js';

test('expired trial keeps next-event access but not weekly schedule', () => {
  const access = deriveVoiceAccess(
    {
      contact: { accessTier: 'trial' },
      entitlement: {
        trialActive: false,
        premium: false,
        nextEvent: true,
        weeklySchedule: false
      }
    },
    { accessMode: 'paid', paidAccessPolicy: 'premium_or_trial' }
  );

  assert.equal(access.allowed, true);
  assert.equal(access.reason, 'base_next_event');
  assert.equal(access.nextEvent, true);
  assert.equal(access.weeklySchedule, false);
  assert.deepEqual(scheduleCapability(access), {
    nextEvent: true,
    weeklySchedule: false
  });
});

test('active trial and premium retain extended schedule capability', () => {
  const trial = deriveVoiceAccess(
    {
      contact: { accessTier: 'trial' },
      entitlement: {
        trialActive: true,
        premium: false,
        nextEvent: true,
        weeklySchedule: true
      }
    },
    { accessMode: 'paid', paidAccessPolicy: 'premium_or_trial' }
  );
  assert.equal(trial.reason, 'trial');
  assert.equal(trial.weeklySchedule, true);

  const premium = deriveVoiceAccess(
    {
      contact: { accessTier: 'premium' },
      entitlement: {
        trialActive: false,
        premium: true,
        nextEvent: true,
        weeklySchedule: true
      }
    },
    { accessMode: 'paid', paidAccessPolicy: 'premium_or_trial' }
  );
  assert.equal(premium.reason, 'premium');
  assert.equal(premium.weeklySchedule, true);
});

test('blocked contacts remain denied even during free beta', () => {
  const blocked = deriveVoiceAccess(
    {
      contact: { accessTier: 'blocked' },
      entitlement: {
        trialActive: false,
        premium: false,
        nextEvent: false,
        weeklySchedule: false
      }
    },
    { accessMode: 'free_beta', paidAccessPolicy: 'premium_or_trial' }
  );

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.reason, 'blocked');
});

test('premium-only policy does not promote active trial to weekly access', () => {
  const trial = deriveVoiceAccess(
    {
      contact: { accessTier: 'trial' },
      entitlement: {
        trialActive: true,
        premium: false,
        nextEvent: true,
        weeklySchedule: true
      }
    },
    { accessMode: 'paid', paidAccessPolicy: 'premium_only' }
  );

  assert.equal(trial.allowed, true);
  assert.equal(trial.reason, 'base_next_event');
  assert.equal(trial.weeklySchedule, false);
});

test('schedule tool enforces scope and server-side next-event limit', async () => {
  const source = await readFile(new URL('../src/agent.js', import.meta.url), 'utf8');
  assert.match(source, /enum:\s*\['next', 'day', 'week'\]/);
  assert.match(source, /scheduleCapability\(session\.access\)/);
  assert.match(source, /matches\.slice\(0, 1\)/);
  assert.match(source, /accessLimited/);
  assert.match(source, /allowedCapability:\s*'next_event'/);
});
