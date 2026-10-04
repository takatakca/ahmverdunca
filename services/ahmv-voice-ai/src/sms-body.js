import { languageKey } from './caller.js';

function compact(value) {
  return String(value || '').trim();
}

function timeRange(item) {
  const start = compact(item.time);
  const end = compact(item.endTime);
  return start && end ? `${start}–${end}` : start || end;
}

function lineForItem(item, lang) {
  if (!item || typeof item !== 'object') return null;
  if (item.type === 'event') {
    const cancelled = String(item.status || '').toLowerCase() === 'cancelled';
    const cancelledLabel = { fr: 'ANNULÉ', en: 'CANCELLED', es: 'CANCELADO' }[lang] || 'ANNULÉ';
    const status = cancelled ? cancelledLabel : null;
    const core = [status, item.label, item.date, timeRange(item), item.arena, item.address]
      .map(compact).filter(Boolean).join(' — ');
    const link = compact(item.mapsUrl || item.url || item.sourceUrl);
    return { core: core ? `• ${core}` : '', link };
  }
  if (item.type === 'arena') {
    const phone = compact(item.phone);
    const core = [item.name, item.address, phone].map(compact).filter(Boolean).join(' — ');
    const link = compact(item.mapsUrl || item.url || item.sourceUrl);
    return { core: core ? `• ${core}` : '', link };
  }
  if (item.type === 'link' && item.url) {
    const labels = item.labels && typeof item.labels === 'object' ? item.labels : null;
    const label = compact(labels?.[lang] || item.label || item.text || ({ fr: 'Lien', en: 'Link', es: 'Enlace' }[lang]));
    return { core: `• ${label}: ${compact(item.url)}`, link: '' };
  }
  if (item.text) return { core: `• ${compact(item.text)}`, link: '' };
  return null;
}

function composeWithinLimit({ header, items, fallback, official, maxChars }) {
  const parts = [header];
  const canAdd = (value) => [...parts, value, official].filter(Boolean).join('\n').length <= maxChars;
  for (const item of items) {
    if (!item?.core) continue;
    if (!canAdd(item.core)) break;
    parts.push(item.core);
    if (item.link) {
      const linkLine = `  ${item.link}`;
      if (canAdd(linkLine)) parts.push(linkLine);
    }
  }
  if (parts.length === 1 && canAdd(fallback)) parts.push(fallback);
  parts.push(official);
  let body = parts.filter(Boolean).join('\n');
  if (body.length > maxChars) {
    const minimum = [header, official].join('\n');
    if (minimum.length <= maxChars) return minimum;
    body = official.length <= maxChars ? official : official.slice(0, maxChars);
  }
  return body;
}

export function buildSmsBody(session, { fallbackUrl, websiteUrl, maxChars = 1200 }) {
  const lang = languageKey(session?.language);
  const headers = {
    fr: 'AHM Verdun — résumé de votre appel :',
    en: 'AHM Verdun — call summary:',
    es: 'AHM Verdun — resumen de su llamada:'
  };
  const fallback = {
    fr: `Horaires et informations : ${fallbackUrl}`,
    en: `Schedules and information: ${fallbackUrl}`,
    es: `Horarios e información: ${fallbackUrl}`
  };
  const official = {
    fr: `Site officiel : ${websiteUrl}`,
    en: `Official website: ${websiteUrl}`,
    es: `Sitio oficial: ${websiteUrl}`
  };
  const items = (session?.smsItems || []).map((item) => lineForItem(item, lang)).filter(Boolean).slice(0, 6);
  return composeWithinLimit({
    header: headers[lang],
    items,
    fallback: fallback[lang],
    official: official[lang],
    maxChars
  });
}

export const _test = { lineForItem, composeWithinLimit };
