const blockedCallerIds = new Set(['anonymous', 'unknown', 'private', 'restricted', 'unavailable']);

export function isSmsCapableCaller(value) {
  const phone = String(value || '').trim();
  if (!phone || blockedCallerIds.has(phone.toLowerCase())) return false;
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export function normalizeLanguage(lang) {
  const value = String(lang || '').toLowerCase();
  if (value.startsWith('en')) return 'en-US';
  if (value.startsWith('es')) return 'es-US';
  if (value.startsWith('fr')) return 'fr-CA';
  return 'multi';
}

export function languageKey(lang) {
  const value = String(lang || '').toLowerCase();
  if (value.startsWith('en')) return 'en';
  if (value.startsWith('es')) return 'es';
  return 'fr';
}
