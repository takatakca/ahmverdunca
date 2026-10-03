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

function normalizeArena(raw = {}) {
  return {
    name: clean(raw.name || raw.arena),
    address: clean(raw.address, 500),
    addressVerified: raw.addressVerified === true || raw.address_verified === true,
    website: safeHttpsUrl(raw.website),
    mapsUrl: safeHttpsUrl(raw.mapsUrl || raw.maps_url),
    wazeUrl: safeHttpsUrl(raw.wazeUrl || raw.waze_url),
    appleMapsUrl: safeHttpsUrl(raw.appleMapsUrl || raw.apple_maps_url),
    sourceUrl: safeHttpsUrl(raw.sourceUrl || raw.source_url)
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

export const _test = { safeHttpsUrl, normalizeEvent, normalizeArena };
