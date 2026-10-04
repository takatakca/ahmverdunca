import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { _test } from '../src/ahm-data.js';

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
