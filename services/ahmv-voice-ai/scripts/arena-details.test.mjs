import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

process.env.PUBLIC_BASE_URL ||= 'https://voice.test.ahmverdun.ca';
process.env.PUBLIC_WSS_URL ||= 'wss://voice.test.ahmverdun.ca';
process.env.TWILIO_ACCOUNT_SID ||= 'AC_TEST_ONLY';
process.env.TWILIO_AUTH_TOKEN ||= 'test-only-token';
process.env.OPENAI_API_KEY ||= 'test-only-openai-key';
process.env.AHM_DATA_MODE ||= 'fixture';
process.env.SMS_ENABLED ||= 'false';

const { _test } = await import('../src/ahm-data.js');

const arena = _test.normalizeArena({
  name: 'Auditorium de Verdun',
  address: '4110, boulevard LaSalle, Montréal (Québec) H4G 2A5',
  addressVerified: true,
  phone: '514-765-7130',
  description: { fr: 'Description vérifiée', en: 'Verified description' },
  parking: {
    type: 'paid',
    accessible: true,
    details: { fr: 'Stationnement payant', en: 'Paid parking' }
  },
  accessibility: [{ fr: 'Accessible en fauteuil roulant', en: 'Wheelchair accessible' }],
  amenities: [{ fr: 'Wi-Fi gratuit', en: 'Free Wi-Fi' }],
  activities: [{ fr: 'Hockey', en: 'Hockey' }],
  publicStatus: {
    code: 'open',
    label: { fr: 'Ouvert', en: 'Open' }
  },
  sourceVerifiedAt: '2026-10-04',
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=test',
  sourceUrl: 'https://ahmverdun.ca/arenas/auditorium-de-verdun',
  internalNotes: 'must-not-leak',
  parkingCountInternal: 999
});

assert.equal(arena.phone, '514-765-7130');
assert.equal(arena.parking?.type, 'paid');
assert.equal(arena.parking?.accessible, true);
assert.equal(arena.accessibility[0]?.fr, 'Accessible en fauteuil roulant');
assert.equal(arena.amenities[0]?.en, 'Free Wi-Fi');
assert.equal(arena.sourceVerifiedAt, '2026-10-04');
assert.equal('internalNotes' in arena, false);
assert.equal('parkingCountInternal' in arena, false);

const bridge = readFileSync(new URL('../../../src/lib/ahmv-voice-bridge.server.ts', import.meta.url), 'utf8');
const sms = readFileSync(new URL('../src/sms-body.js', import.meta.url), 'utf8');
assert.match(bridge, /phone: item\.phone \?\? null/);
assert.match(bridge, /parking: item\.parking \?\? null/);
assert.match(bridge, /accessibility: item\.accessibility \?\? \[\]/);
assert.match(sms, /item\.phone/);

console.log('AHMV Voice arena detail safeguards passed.');
