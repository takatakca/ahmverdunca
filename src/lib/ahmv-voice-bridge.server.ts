import { createHash, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../integrations/supabase/client.server";
import { ARENAS, arenaDirectionsTargetForVenue } from "../data/arenas";
import { OFFICIAL_WEEK_ACTIVITIES, OFFICIAL_WEEK_META } from "../data/official-week";
import { localClock, normalizeTeam } from "./ahmv-phone";
import { mapsDirectionsUrl } from "./site";
import { legacyTeamScheduleUrl } from "../data/team-directory";
import { resolvePublicTeam, compactTeamChoices } from "../features/ahmv-phone/teams/resolve";
import { safeTouchPhoneContact } from "../features/ahmv-phone/contacts/store.server";
import { canUse } from "../features/ahmv-phone/entitlements/access";
import { memberActivationUrl, resolvePhoneEntitlement } from "../features/ahmv-phone/entitlements/service.server";
import { safeRecordPhoneInteraction } from "../features/ahmv-phone/audit/store.server";
import { sendTransactionalSms } from "../features/ahmv-phone/messaging/send.server";
import { fetchLiveSchedule, liveEventToVoiceMatch, liveScheduleIsReady } from "../features/ahmv-phone/schedules/live.server";

type Settings = Record<string, string | undefined>;
type VoiceLanguage = "fr" | "en" | "es";
const ROOT = "/api/ahmv/voice";
const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
function authorized(request: Request, settings: Settings) {
  const expected = settings["AHMV_VOICE_BRIDGE_TOKEN"]?.trim();
  if (!expected || expected.length < 24) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = /^Bearer\s+/i.test(header)
    ? header.replace(/^Bearer\s+/i, "").trim()
    : "";
  return Boolean(token) && safeEqual(token, expected);
}
function limited(value: unknown, max = 100) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-CA").replace(/[^a-z0-9]+/g, " ").trim();
}
function validPhone(value: unknown): value is string {
  return typeof value === "string" && /^\+[1-9][0-9]{7,14}$/.test(value);
}
function validUuid(value: unknown): value is string {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
async function readJson(
  request: Request,
  maxBytes = 8192,
): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) return null;
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > maxBytes) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}
function arenaForVenue(venue: string) {
  const target = arenaDirectionsTargetForVenue(venue);
  if (target === venue) return null;
  return ARENAS.find((item) =>
    item.address === target && item.addressVerified
  ) ?? null;
}
function routeLinks(address: string) {
  const encoded = encodeURIComponent(address);
  return {
    mapsUrl: mapsDirectionsUrl(address),
    wazeUrl: `https://www.waze.com/ul?q=${encoded}&navigate=yes`,
    appleMapsUrl: `https://maps.apple.com/?daddr=${encoded}`,
  };
}
async function schedule(request: Request, settings: Settings) {
  const url = new URL(request.url);
  const team = limited(url.searchParams.get("team"), 80);
  const category = limited(url.searchParams.get("category"), 80);
  const date = limited(url.searchParams.get("date"), 10);
  const now = localClock(new Date());
  if (date && !/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
    return json({ ok: false, code: "INVALID_DATE" }, 400);
  }

  const resolutionQuery = team || category;
  const resolution = resolutionQuery
    ? resolvePublicTeam(resolutionQuery)
    : { kind: "none", teams: [] } as const;
  const officialTeamScheduleUrl =
    resolution.kind === "exact" ? legacyTeamScheduleUrl(resolution.team) : null;
  const teamChoices =
    resolution.kind === "ambiguous" ? compactTeamChoices(resolution.teams, 6) : [];

  const live = await fetchLiveSchedule({ team, category, date }, settings);
  if (liveScheduleIsReady(live)) {
    const matches = live.events.map(liveEventToVoiceMatch).slice(0, 10);
    return json({
      ok: true,
      status: matches.length
        ? "verified_live"
        : resolution.kind === "ambiguous"
          ? "ambiguous_team"
          : "no_match",
      liveScheduleStatus: live.status,
      liveUpdatedAt: live.updatedAt ?? null,
      sourceWindow: null,
      sourceUrl: live.sourceUrl ?? "https://ahmverdun.ca/horaires",
      teamResolution: resolution.kind,
      teamChoices,
      officialTeamScheduleUrl,
      matches,
    });
  }

  if (now.date > OFFICIAL_WEEK_META.end) {
    return json({
      ok: true,
      status: "source_expired",
      liveScheduleStatus: live.status,
      sourceWindow: OFFICIAL_WEEK_META,
      sourceUrl: "https://ahmverdun.ca/horaires",
      teamResolution: resolution.kind,
      teamChoices,
      officialTeamScheduleUrl,
      matches: [],
    });
  }
  if (date && (date < OFFICIAL_WEEK_META.start || date > OFFICIAL_WEEK_META.end)) {
    return json({
      ok: true,
      status: "outside_source_window",
      liveScheduleStatus: live.status,
      sourceWindow: OFFICIAL_WEEK_META,
      sourceUrl: "https://ahmverdun.ca/horaires",
      teamResolution: resolution.kind,
      teamChoices,
      officialTeamScheduleUrl,
      matches: [],
    });
  }

  const teamKey = team ? normalizeTeam(team) : "";
  const categoryKey = category ? normalizeTeam(category) : "";
  const matches = OFFICIAL_WEEK_ACTIVITIES
    .filter((item) => {
      const groupKey = normalizeTeam(item.group);
      if (teamKey && groupKey !== teamKey) return false;
      const groupCategory = item.group.match(/^M\\d+/i)?.[0] ?? "";
      if (categoryKey && normalizeTeam(groupCategory) !== categoryKey) return false;
      if (date && item.date !== date) return false;
      if (!date && (item.date < now.date || (item.date === now.date && item.end <= now.time))) {
        return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))
    .slice(0, 10)
    .map((item) => {
      const venue = arenaForVenue(item.venue);
      return {
        id: item.id,
        type: item.activity,
        team: item.group,
        category: item.group.match(/^M\\d+/i)?.[0]?.toUpperCase() ?? null,
        date: item.date,
        time: item.start,
        endTime: item.end,
        status: item.status,
        arena: item.venue,
        arenaAddress: venue?.address ?? null,
        ...(venue ? routeLinks(venue.address) : {}),
        sourceUrl: "https://ahmverdun.ca/horaires",
      };
    });

  return json({
    ok: true,
    status: matches.length
      ? "verified"
      : resolution.kind === "ambiguous"
        ? "ambiguous_team"
        : "no_match",
    liveScheduleStatus: live.status,
    sourceWindow: OFFICIAL_WEEK_META,
    sourceUrl: "https://ahmverdun.ca/horaires",
    teamResolution: resolution.kind,
    teamChoices,
    officialTeamScheduleUrl,
    matches,
  });
}
function arena(request: Request) {
  const query = limited(new URL(request.url).searchParams.get("arena"), 80);
  if (!query) return json({ ok: false, code: "ARENA_REQUIRED" }, 400);
  const target = arenaDirectionsTargetForVenue(query);
  const needle = normalize(query);
  const matches = ARENAS.filter((item) => {
    if (!item.addressVerified) return false;
    if (item.address === target && target !== query) return true;
    const name = normalize(item.name);
    const slug = normalize(item.slug);
    const address = normalize(item.address);
    return name === needle || name.includes(needle) || needle.includes(name)
      || slug === needle || address.includes(needle);
  }).slice(0, 5).map((item) => ({
    name: item.name,
    address: item.address,
    addressVerified: true,
    website: item.website ?? null,
    ...routeLinks(item.address),
    sourceUrl: `https://ahmverdun.ca/arenas/${item.slug}`,
  }));
  return json({ ok: true, status: matches.length ? "verified" : "no_match", matches });
}
async function bootstrap(request: Request, settings: Settings) {
  const body = await readJson(request);
  if (!body) return json({ ok: false, code: "INVALID_JSON" }, 400);
  const phone = validPhone(body["phoneE164"]) ? body["phoneE164"] : null;
  const language: VoiceLanguage = ["fr", "en", "es"].includes(String(body["language"]))
    ? body["language"] as VoiceLanguage
    : "fr";
  const smsRequested = body["smsRequested"] === true && Boolean(phone);
  const contact = phone
    ? await safeTouchPhoneContact({ phoneE164: phone, language, smsRequested, settings })
    : null;
  if (phone && !contact) return json({ ok: false, code: "CONTACT_STORE_UNAVAILABLE" }, 503);

  const entitlement = await resolvePhoneEntitlement(contact, "weekly_schedule", settings);
  const trialActive = contact?.accessTier === "trial" && canUse(entitlement, "weekly_schedule");
  const premium = entitlement.tier === "premium";
  return json({
    ok: true,
    source: "ahmv-phone-v2",
    contact: contact ? {
      id: contact.id,
      phoneE164: contact.phoneE164,
      accessTier: contact.accessTier,
      trialExpiresAt: contact.trialExpiresAt,
      transactionalSmsAllowed: contact.transactionalSmsAllowed,
      smsConsent: contact.smsConsent,
      voiceLanguage: language,
    } : {
      id: null,
      phoneE164: null,
      accessTier: "guest",
      trialExpiresAt: null,
      transactionalSmsAllowed: false,
      smsConsent: false,
      voiceLanguage: language,
    },
    entitlement: {
      trialActive,
      premium,
      nextEvent: canUse(entitlement, "next_event"),
      weeklySchedule: canUse(entitlement, "weekly_schedule"),
      membershipUrl: memberActivationUrl(settings),
    },
  });
}
async function voiceLanguage(request: Request, settings: Settings) {
  const body = await readJson(request);
  if (!body) return json({ ok: false, code: "INVALID_JSON" }, 400);
  const contactId = body["contactId"];
  const phone = body["phoneE164"];
  const language: VoiceLanguage = ["fr", "en", "es"].includes(String(body["language"]))
    ? body["language"] as VoiceLanguage
    : "fr";
  if (!validUuid(contactId) || !validPhone(phone)) {
    return json({ ok: false, code: "INVALID_LANGUAGE_REQUEST" }, 400);
  }
  const touched = await safeTouchPhoneContact({ phoneE164: phone, language, settings });
  if (!touched) return json({ ok: false, code: "CONTACT_STORE_UNAVAILABLE" }, 503);
  if (touched.id !== contactId) return json({ ok: false, code: "CONTACT_MISMATCH" }, 409);
  return json({ ok: true, language });
}
async function voiceSms(request: Request, settings: Settings) {
  const body = await readJson(request, 16384);
  if (!body) return json({ ok: false, code: "INVALID_JSON" }, 400);
  const contactId = body["contactId"];
  const phone = body["phoneE164"];
  const text = limited(body["body"], 1500);
  const purpose = limited(body["purpose"], 80) || "voice-ai-recap";
  const callSid = limited(body["callSid"], 100);
  const dedupeKey = callSid ? `voice-ai:${purpose}:${callSid}` : undefined;
  if (!validUuid(contactId) || !validPhone(phone) || !text) {
    return json({ ok: false, code: "INVALID_SMS_REQUEST" }, 400);
  }
  const lookup = await db().from("ahmv_phone_contacts")
    .select("id,phone_e164,sms_consent,transactional_sms_allowed")
    .eq("id", contactId).eq("phone_e164", phone).maybeSingle();
  if (lookup.error) return json({ ok: false, code: "CONTACT_LOOKUP_FAILED" }, 503);
  if (!lookup.data) return json({ ok: false, code: "CONTACT_NOT_FOUND" }, 404);
  if (lookup.data.transactional_sms_allowed !== true || lookup.data.sms_consent !== true) {
    return json({ ok: true, sent: false, reason: "transactional_sms_not_allowed" });
  }
  const sent = await sendTransactionalSms({
    to: phone,
    body: text,
    purpose,
    contactId,
    dedupeKey,
    settings,
  });
  return json(sent.sent
    ? { ok: true, sent: true, sid: sent.sid }
    : { ok: true, sent: false, reason: sent.reason });
}
async function interaction(request: Request) {
  const body = await readJson(request);
  if (!body) return json({ ok: false, code: "INVALID_JSON" }, 400);
  const contactId = validUuid(body["contactId"]) ? body["contactId"] : undefined;
  const callSid = limited(body["callSid"], 100);
  const outcome = limited(body["outcome"], 100);
  if (!outcome) return json({ ok: false, code: "OUTCOME_REQUIRED" }, 400);
  const providerReferenceHash = callSid
    ? createHash("sha256").update(callSid).digest("hex")
    : undefined;
  await safeRecordPhoneInteraction({
    contactId,
    channel: "voice",
    providerReferenceHash,
    intent: "voice-ai",
    outcome,
    metadata: {
      language: limited(body["language"], 10) || null,
      turnCount: Number.isInteger(body["turnCount"]) ? Number(body["turnCount"]) : 0,
      relayErrorCode: limited(body["relayErrorCode"], 50) || null,
      smsRequested: body["smsRequested"] === true,
      smsItemCount: Number.isInteger(body["smsItemCount"]) ? Number(body["smsItemCount"]) : 0,
    },
  });
  return json({ ok: true });
}
async function humanHandoff(request: Request) {
  const body = await readJson(request);
  if (!body) return json({ ok: false, code: "INVALID_JSON" }, 400);

  const contactId = body["contactId"];
  const phone = body["phoneE164"];
  const callSid = limited(body["callSid"], 100);
  const language: VoiceLanguage = ["fr", "en", "es"].includes(String(body["language"]))
    ? body["language"] as VoiceLanguage
    : "fr";
  const reason = limited(body["reason"], 40);
  const preferredWindow = limited(body["preferredWindow"], 40);

  const allowedReasons = new Set([
    "schedule", "registration", "team", "arena",
    "billing_access", "technical", "other",
  ]);
  const allowedWindows = new Set([
    "asap", "morning", "afternoon", "evening", "no_preference",
  ]);

  if (
    !validUuid(contactId) ||
    !validPhone(phone) ||
    !allowedReasons.has(reason) ||
    !allowedWindows.has(preferredWindow)
  ) {
    return json({ ok: false, code: "INVALID_HANDOFF_REQUEST" }, 400);
  }

  const lookup = await db().from("ahmv_phone_contacts")
    .select("id,phone_e164")
    .eq("id", contactId)
    .eq("phone_e164", phone)
    .maybeSingle();
  if (lookup.error) return json({ ok: false, code: "CONTACT_LOOKUP_FAILED" }, 503);
  if (!lookup.data) return json({ ok: false, code: "CONTACT_NOT_FOUND" }, 404);

  const providerReferenceHash = callSid
    ? createHash("sha256").update(callSid).digest("hex")
    : undefined;

  if (providerReferenceHash) {
    const existing = await db().from("ahmv_phone_interactions")
      .select("id")
      .eq("provider_reference_hash", providerReferenceHash)
      .eq("intent", "human_handoff")
      .eq("outcome", "requested")
      .limit(1)
      .maybeSingle();
    if (existing.error) {
      return json({ ok: false, code: "HANDOFF_LOOKUP_FAILED" }, 503);
    }
    if (existing.data) {
      return json({ ok: true, requested: true, duplicate: true });
    }
  }

  await safeRecordPhoneInteraction({
    contactId,
    channel: "voice",
    providerReferenceHash,
    intent: "human_handoff",
    outcome: "requested",
    metadata: {
      language,
      reason,
      preferredWindow,
      source: "voice-ai",
    },
  });

  return json({ ok: true, requested: true, duplicate: false });
}

async function readiness(settings: Settings) {
  const live = await fetchLiveSchedule({}, settings);
  const staticScheduleReady = localClock(new Date()).date <= OFFICIAL_WEEK_META.end;
  const liveReady = liveScheduleIsReady(live);

  if (!liveReady && !staticScheduleReady) {
    return json({
      ready: false,
      reason: live.status === "not_configured"
        ? "schedule_source_expired"
        : `live_schedule_${live.status}`,
      liveSchedule: { status: live.status, reason: live.reason ?? null },
      sourceWindow: OFFICIAL_WEEK_META,
    }, 503);
  }

  const probe = await db().from("ahmv_phone_contacts")
    .select("id", { head: true, count: "exact" }).limit(1);
  if (probe.error) {
    return json({
      ready: false,
      reason: "ahmv_phone_store_unavailable",
      liveSchedule: { status: live.status, reason: live.reason ?? null },
      sourceWindow: OFFICIAL_WEEK_META,
    }, 503);
  }
  return json({
    ready: true,
    reason: liveReady
      ? "ahmv_phone_v2_and_live_schedule_ready"
      : "ahmv_phone_v2_and_static_schedule_ready",
    liveSchedule: {
      status: live.status,
      updatedAt: live.updatedAt ?? null,
      sourceUrl: live.sourceUrl ?? null,
      reason: live.reason ?? null,
    },
    sourceWindow: OFFICIAL_WEEK_META,
    phoneStore: "ready",
  });
}
export async function handleAhmvVoiceBridge(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  const routes = new Set([
    `${ROOT}/schedule`, `${ROOT}/arena`, `${ROOT}/bootstrap`,
    `${ROOT}/language`, `${ROOT}/sms`, `${ROOT}/interaction`,
    `${ROOT}/handoff`, `${ROOT}/readiness`,
  ]);
  if (!routes.has(url.pathname)) return null;
  if (!authorized(request, settings)) return json({ ok: false, code: "UNAUTHORIZED" }, 401);

  const readOnly = [`${ROOT}/schedule`, `${ROOT}/arena`, `${ROOT}/readiness`];
  if (readOnly.includes(url.pathname) && !["GET", "HEAD"].includes(request.method)) {
    return new Response(JSON.stringify({ ok: false, code: "METHOD_NOT_ALLOWED" }), {
      status: 405, headers: { ...HEADERS, Allow: "GET, HEAD" },
    });
  }
  if (!readOnly.includes(url.pathname) && request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, code: "METHOD_NOT_ALLOWED" }), {
      status: 405, headers: { ...HEADERS, Allow: "POST" },
    });
  }

  let response: Response;
  if (url.pathname === `${ROOT}/schedule`) response = await schedule(request, settings);
  else if (url.pathname === `${ROOT}/arena`) response = arena(request);
  else if (url.pathname === `${ROOT}/bootstrap`) response = await bootstrap(request, settings);
  else if (url.pathname === `${ROOT}/language`) response = await voiceLanguage(request, settings);
  else if (url.pathname === `${ROOT}/sms`) response = await voiceSms(request, settings);
  else if (url.pathname === `${ROOT}/interaction`) response = await interaction(request);
  else if (url.pathname === `${ROOT}/handoff`) response = await humanHandoff(request);
  else response = await readiness(settings);

  return request.method === "HEAD"
    ? new Response(null, { status: response.status, headers: response.headers })
    : response;
}
