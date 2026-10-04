import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
let fixtureCache;
let readinessCache = { at: 0, value: null };

async function loadFixture() {
  fixtureCache ||= JSON.parse(await fs.readFile(path.join(here, '..', 'fixtures', 'ahm-sample.json'), 'utf8'));
  return fixtureCache;
}

function clean(value, max = 300) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text.slice(0, max) : null;
}

function safeHttpsUrl(value) {
  const text = clean(value, 1000);
  if (!text) return null;
  try {
    const parsed = new URL(text);
    return parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function normalizeEvent(raw = {}) {
  return {
    id: clean(raw.id, 120),
    type: clean(raw.type) || 'activity',
    team: clean(raw.team),
    category: clean(raw.category),
    date: clean(raw.date, 10),
    time: clean(raw.time, 8),
    endTime: clean(raw.endTime || raw.end_time, 8),
    status: clean(raw.status, 40) || 'scheduled',
    opponent: clean(raw.opponent),
    arena: clean(raw.arena),
    arenaAddress: clean(raw.arenaAddress || raw.arena_address, 500),
    mapsUrl: safeHttpsUrl(raw.mapsUrl || raw.maps_url),
    wazeUrl: safeHttpsUrl(raw.wazeUrl || raw.waze_url),
    appleMapsUrl: safeHttpsUrl(raw.appleMapsUrl || raw.apple_maps_url),
    sourceUrl: safeHttpsUrl(raw.sourceUrl || raw.source_url)
  };
}

function localizedText(raw, max = 600) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const fr = clean(raw.fr, max);
  const en = clean(raw.en, max);
  return fr || en ? { fr, en } : null;
}

function localizedList(raw, maxItems = 8, max = 240) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, maxItems).map((item) => localizedText(item, max)).filter(Boolean);
}

function normalizeArena(raw = {}) {
  const parking = raw.parking && typeof raw.parking === 'object' && !Array.isArray(raw.parking)
    ? {
        type: clean(raw.parking.type, 40),
        accessible: raw.parking.accessible === true,
        evCharging: raw.parking.evCharging === true || raw.parking.ev_charging === true,
        details: localizedText(raw.parking.details, 600)
      }
    : null;
  const publicStatus = raw.publicStatus && typeof raw.publicStatus === 'object' && !Array.isArray(raw.publicStatus)
    ? {
        code: clean(raw.publicStatus.code, 60),
        label: localizedText(raw.publicStatus.label, 240),
        note: localizedText(raw.publicStatus.note, 800)
      }
    : null;

  return {
    name: clean(raw.name || raw.arena),
    address: clean(raw.address, 500),
    addressVerified: raw.addressVerified === true || raw.address_verified === true,
    website: safeHttpsUrl(raw.website),
    phone: clean(raw.phone, 40),
    phoneExtension: clean(raw.phoneExtension || raw.phone_extension, 20),
    description: localizedText(raw.description, 900),
    facilities: localizedText(raw.facilities, 600),
    parking,
    accessibility: localizedList(raw.accessibility),
    amenities: localizedList(raw.amenities),
    activities: localizedList(raw.activities),
    publicStatus,
    sourceVerifiedAt: clean(raw.sourceVerifiedAt || raw.source_verified_at, 10),
    mapsUrl: safeHttpsUrl(raw.mapsUrl || raw.maps_url),
    wazeUrl: safeHttpsUrl(raw.wazeUrl || raw.waze_url),
    appleMapsUrl: safeHttpsUrl(raw.appleMapsUrl || raw.apple_maps_url),
    sourceUrl: safeHttpsUrl(raw.sourceUrl || raw.source_url)
  };
}

function normalizeKnowledge(raw = {}) {
  const kind = ['faq', 'arena'].includes(String(raw.kind)) ? String(raw.kind) : null;
  return {
    id: clean(raw.id, 160),
    kind,
    title: clean(raw.title, 300),
    answer: clean(raw.answer, 1800),
    answerFr: clean(raw.answerFr, 1800),
    answerEn: clean(raw.answerEn, 1800),
    translationRequired: raw.translationRequired === true,
    sourceUrl: safeHttpsUrl(raw.sourceUrl || raw.source_url),
    score: Number.isFinite(Number(raw.score)) ? Number(raw.score) : null
  };
}

async function api(pathname, params = {}) {
  if (!config.ahmBridgeApiUrl) {
    return { ok: false, code: 'LIVE_DATA_NOT_CONFIGURED', message: 'Live AHM schedule data is not connected yet.' };
  }

  const base = config.ahmBridgeApiUrl.endsWith('/') ? config.ahmBridgeApiUrl : `${config.ahmBridgeApiUrl}/`;
  const url = new URL(pathname, base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  const headers = {
    accept: 'application/json',
    'user-agent': `AHMV-Voice-AI/${config.appVersion}`
  };
  if (config.ahmBridgeToken) headers.authorization = `Bearer ${config.ahmBridgeToken}`;

  try {
    const response = await fetch(url, {
      headers,
      redirect: 'error',
      signal: AbortSignal.timeout(config.ahmDataTimeoutMs)
    });
    if (!response.ok) return { ok: false, code: 'UPSTREAM_ERROR', status: response.status };

    const type = response.headers.get('content-type') || '';
    if (!type.toLowerCase().includes('application/json')) {
      return { ok: false, code: 'UPSTREAM_INVALID_CONTENT_TYPE' };
    }

    const text = await response.text();
    if (text.length > 512 * 1024) return { ok: false, code: 'UPSTREAM_RESPONSE_TOO_LARGE' };
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false, code: 'UPSTREAM_INVALID_JSON' };
    }
    return { ok: true, data, source: url.toString() };
  } catch (error) {
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return {
      ok: false,
      code: timeout ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNAVAILABLE',
      message: clean(error?.message, 300)
    };
  }
}

function contains(value, query) {
  if (!query) return true;
  return String(value || '').toLocaleLowerCase('fr-CA').includes(String(query).toLocaleLowerCase('fr-CA'));
}

async function fixtureSchedule({ team, category, date }) {
  const fixture = await loadFixture();
  const matches = fixture.schedule
    .filter((item) => contains(item.team, team) && contains(item.category, category) && contains(item.date, date))
    .map(normalizeEvent);
  return { ok: true, data: { status: matches.length ? 'verified' : 'no_match', matches }, source: 'fixture' };
}

async function fixtureArena({ arena }) {
  const fixture = await loadFixture();
  const matches = fixture.arenas.filter((item) => contains(item.name, arena)).map(normalizeArena);
  return { ok: true, data: { status: matches.length ? 'verified' : 'no_match', matches }, source: 'fixture' };
}

export function assessSchedulePayloadForReadiness(result) {
  if (!result?.ok) return { ready: false, reason: result?.code || 'schedule_probe_failed' };
  const status = clean(result.status || result.data?.status, 80);
  if (status === 'source_expired') return { ready: false, reason: 'schedule_source_expired' };
  return { ready: true, reason: status || 'verified' };
}

export async function probeAhmDataReadiness({ force = false } = {}) {
  if (config.ahmDataMode === 'fixture') return { ready: true, reason: 'fixture_mode' };
  const now = Date.now();
  if (!force && readinessCache.value && now - readinessCache.at < config.ahmReadinessProbeTtlMs) {
    return readinessCache.value;
  }
  const raw = await api('schedule', {});
  const value = assessSchedulePayloadForReadiness(raw.ok ? { ok: true, status: raw.data?.status, data: raw.data } : raw);
  readinessCache = { at: now, value };
  return value;
}

export async function findSchedule({ team, category, date }) {
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return { ok: false, code: 'INVALID_DATE', message: 'date must be YYYY-MM-DD' };
  }
  const result = config.ahmDataMode === 'fixture'
    ? await fixtureSchedule({ team, category, date })
    : await api('schedule', { team, category, date });

  if (!result.ok) return result;
  const rawMatches = Array.isArray(result.data?.matches)
    ? result.data.matches
    : Array.isArray(result.data)
      ? result.data
      : result.data?.match
        ? [result.data.match]
        : [];
  return {
    ok: true,
    status: clean(result.data?.status, 80),
    sourceWindow: result.data?.sourceWindow || result.data?.source_window || null,
    sourceUrl: safeHttpsUrl(result.data?.sourceUrl || result.data?.source_url),
    teamResolution: clean(result.data?.teamResolution || result.data?.team_resolution, 40),
    teamChoices: Array.isArray(result.data?.teamChoices)
      ? result.data.teamChoices.map((value) => clean(value, 160)).filter(Boolean).slice(0, 6)
      : [],
    officialTeamScheduleUrl: safeHttpsUrl(result.data?.officialTeamScheduleUrl || result.data?.official_team_schedule_url),
    matches: rawMatches.map(normalizeEvent).slice(0, 10),
    source: result.source
  };
}

export async function findArena({ arena }) {
  const result = config.ahmDataMode === 'fixture'
    ? await fixtureArena({ arena })
    : await api('arena', { arena });
  if (!result.ok) return result;
  const rawMatches = Array.isArray(result.data?.matches)
    ? result.data.matches
    : Array.isArray(result.data)
      ? result.data
      : result.data?.name || result.data?.arena
        ? [result.data]
        : [];
  return {
    ok: true,
    status: clean(result.data?.status, 80),
    matches: rawMatches.map(normalizeArena).slice(0, 10),
    source: result.source
  };
}

export async function findKnowledge({ query, language = 'fr' }) {
  const cleanQuery = clean(query, 300);
  if (!cleanQuery) return { ok: false, code: 'QUERY_REQUIRED' };
  if (config.ahmDataMode === 'fixture') {
    return { ok: true, status: 'no_match', hits: [], source: 'fixture' };
  }

  const result = await api('knowledge', { q: cleanQuery, lang: clean(language, 8) || 'fr' });
  if (!result.ok) return result;
  const hits = (Array.isArray(result.data?.hits) ? result.data.hits : [])
    .slice(0, 5)
    .map(normalizeKnowledge)
    .filter((hit) => hit.id && hit.kind && hit.answer && hit.sourceUrl);

  return {
    ok: true,
    status: clean(result.data?.status, 80) || (hits.length ? 'verified' : 'no_match'),
    hits,
    source: result.source
  };
}


export const _test = { safeHttpsUrl, normalizeEvent, normalizeArena, normalizeKnowledge };
