import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ahm-data.js imports the production config module. Supply only inert development
// placeholders required to load that module; no network calls are made by this test.
process.env.PUBLIC_BASE_URL ||= 'https://voice.test.ahmverdun.ca';
process.env.PUBLIC_WSS_URL ||= 'wss://voice.test.ahmverdun.ca';
process.env.TWILIO_ACCOUNT_SID ||= 'AC_TEST_ONLY';
process.env.TWILIO_AUTH_TOKEN ||= 'test-only-token';
process.env.OPENAI_API_KEY ||= 'test-only-openai-key';
process.env.AHM_DATA_MODE ||= 'fixture';
process.env.SMS_ENABLED ||= 'false';

const { _test } = await import('../src/ahm-data.js');

const normalized = _test.normalizeKnowledge({
  id: 'faq:f1',
  kind: 'faq',
  title: 'Comment inscrire mon enfant?',
  answer: 'Use the validated registration flow.',
  sourceUrl: 'https://ahmverdun.ca/inscriptions',
  score: 12,
  secret: 'must-not-leak'
});
assert.equal(normalized.id, 'faq:f1');
assert.equal(normalized.kind, 'faq');
assert.equal(normalized.sourceUrl, 'https://ahmverdun.ca/inscriptions');
assert.equal('secret' in normalized, false);

const unsafe = _test.normalizeKnowledge({
  id: 'faq:x',
  kind: 'faq',
  title: 'Unsafe',
  answer: 'Unsafe source',
  sourceUrl: 'http://example.test'
});
assert.equal(unsafe.sourceUrl, null);

const agent = readFileSync(new URL('../src/agent.js', import.meta.url), 'utf8');
const prompt = readFileSync(new URL('../src/prompt.js', import.meta.url), 'utf8');
assert.match(agent, /name: 'find_knowledge'/);
assert.match(agent, /findKnowledge/);
assert.match(prompt, /call find_knowledge/);
assert.match(prompt, /shared validated AHM Verdun knowledge base/);

console.log('AHMV Voice shared knowledge safeguards passed.');
