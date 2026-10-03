import { createHash } from 'node:crypto';

export function opaqueRef(value, prefix = 'ref') {
  const raw = String(value || '');
  if (!raw) return `${prefix}:none`;
  const digest = createHash('sha256').update(raw).digest('hex').slice(0, 12);
  return `${prefix}:${digest}`;
}

export function safeRequestPath(rawUrl = '') {
  const raw = String(rawUrl || '');
  if (!raw || raw.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(raw)) return '/invalid-request-target';
  const question = raw.indexOf('?');
  const hash = raw.indexOf('#');
  let end = raw.length;
  if (question >= 0) end = Math.min(end, question);
  if (hash >= 0) end = Math.min(end, hash);
  const path = raw.slice(0, end) || '/';
  return path.startsWith('/') ? path.slice(0, 300) : '/invalid-request-target';
}

export function safeRelayError(message = {}) {
  return {
    type: typeof message?.type === 'string' ? message.type.slice(0, 40) : 'error',
    code: typeof message?.code === 'string' || typeof message?.code === 'number'
      ? String(message.code).slice(0, 40)
      : null,
    description: typeof message?.description === 'string'
      ? message.description.slice(0, 240)
      : typeof message?.message === 'string'
        ? message.message.slice(0, 240)
        : null
  };
}
