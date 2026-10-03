import OpenAI from 'openai';
import { config } from './config.js';
import { SYSTEM_PROMPT } from './prompt.js';
import { findSchedule, findArena } from './ahm-data.js';
import { requestHumanHandoff } from './ahm-bridge.js';
import { persistSessionSnapshot, saveSession } from './store.js';
import { throwIfAborted } from './turn-controller.js';
import { assertCompletedResponse } from './openai-contract.js';
import { recordOpenAiUsage } from './usage.js';
import { recordArenaLookup, recordHumanHandoff, recordScheduleLookup } from './metrics.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
  timeout: config.openaiTimeoutMs,
  maxRetries: 1
});

const tools = [
  {
    type: 'function',
    name: 'check_access',
    description: 'Check whether the caller is currently allowed to use the voice service. Use only when access status matters or the caller asks about membership access.',
    strict: true,
    parameters: { type: 'object', properties: {}, required: [], additionalProperties: false }
  },
  {
    type: 'function',
    name: 'find_schedule',
    description: 'Look up verified AHM Verdun schedule/activity information. Always use before stating a specific game, practice, date, time, opponent or scheduled arena.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        team: { type: ['string', 'null'], description: 'Team/group name if known.' },
        category: { type: ['string', 'null'], description: 'Category such as M11, M13, Junior, etc.' },
        date: { type: ['string', 'null'], description: 'Exact local date YYYY-MM-DD if the caller specified a day; otherwise null.' }
      },
      required: ['team', 'category', 'date'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'find_arena',
    description: 'Look up the verified arena name, address and route links. Always use before stating a specific arena address.',
    strict: true,
    parameters: {
      type: 'object',
      properties: { arena: { type: 'string' } },
      required: ['arena'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'remember_official_page',
    description: 'Add one pre-approved official AHM Verdun page to the automatic post-call SMS.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          enum: ['home', 'schedules', 'registration', 'arenas', 'faq', 'coaches', 'wllv', 'teams', 'contact']
        }
      },
      required: ['page'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'request_human_handoff',
    description: 'Record a privacy-safe request for an AHM Verdun human follow-up. Use when the caller explicitly asks to speak with a person, requests a callback, or the issue cannot be safely resolved by the automated assistant. Never promise an exact callback time.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          enum: ['schedule', 'registration', 'team', 'arena', 'billing_access', 'technical', 'other']
        },
        preferredWindow: {
          type: 'string',
          enum: ['asap', 'morning', 'afternoon', 'evening', 'no_preference']
        }
      },
      required: ['reason', 'preferredWindow'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'set_sms_preference',
    description: 'Enable or disable the automatic service SMS sent after this call.',
    strict: true,
    parameters: {
      type: 'object',
      properties: { enabled: { type: 'boolean' } },
      required: ['enabled'],
      additionalProperties: false
    }
  }
];

function addSmsItem(session, item) {
  if (!item || typeof item !== 'object') return;
  const sanitized = Object.fromEntries(
    Object.entries(item).filter(([, value]) => value !== null && value !== undefined && value !== '')
  );
  const signature = JSON.stringify(sanitized);
  if (!session.smsItems.some((existing) => JSON.stringify(existing) === signature)) {
    session.smsItems.push(sanitized);
    session.smsItems = session.smsItems.slice(-12);
  }
}

function rememberScheduleResults(session, result) {
  if (!result?.ok || !Array.isArray(result.matches)) return;
  if (!result.matches.length && result.officialTeamScheduleUrl) {
    addSmsItem(session, {
      type: 'link',
      labels: {
        fr: 'Horaire officiel de cette équipe',
        en: 'Official schedule for this team',
        es: 'Horario oficial de este equipo'
      },
      url: result.officialTeamScheduleUrl
    });
  }
  for (const event of result.matches.slice(0, 3)) {
    const labelParts = [event.team, event.opponent ? `vs ${event.opponent}` : null].filter(Boolean);
    addSmsItem(session, {
      type: 'event',
      label: labelParts.join(' ') || event.type || 'Activité',
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      status: event.status,
      arena: event.arena,
      address: event.arenaAddress,
      mapsUrl: event.mapsUrl,
      wazeUrl: event.wazeUrl,
      appleMapsUrl: event.appleMapsUrl,
      sourceUrl: event.sourceUrl || result.sourceUrl,
      url: event.mapsUrl || event.sourceUrl || result.sourceUrl
    });
  }
}

function rememberArenaResults(session, result) {
  if (!result?.ok || !Array.isArray(result.matches)) return;
  for (const arena of result.matches.slice(0, 2)) {
    addSmsItem(session, {
      type: 'arena',
      name: arena.name,
      address: arena.address,
      mapsUrl: arena.mapsUrl,
      wazeUrl: arena.wazeUrl,
      appleMapsUrl: arena.appleMapsUrl,
      sourceUrl: arena.sourceUrl,
      url: arena.mapsUrl || arena.sourceUrl
    });
  }
}

async function checkpoint(session, persist = true) {
  if (!persist) return;
  saveSession(session);
  await persistSessionSnapshot(session).catch(() => {});
}

async function runTool(session, call, { signal, persist = true } = {}) {
  throwIfAborted(signal);
  let args = {};
  try {
    args = call.arguments ? JSON.parse(call.arguments) : {};
  } catch {
    return { ok: false, code: 'INVALID_TOOL_ARGUMENTS' };
  }

  let result;
  switch (call.name) {
    case 'check_access':
      result = session.access || { allowed: false, mode: config.accessMode, reason: 'unknown' };
      break;
    case 'find_schedule':
      if (!config.featureScheduleLookup) {
        result = { ok: false, code: 'FEATURE_DISABLED', feature: 'schedule_lookup' };
        break;
      }
      result = await findSchedule(args);
      recordScheduleLookup(session, result);
      rememberScheduleResults(session, result);
      break;
    case 'find_arena':
      if (!config.featureArenaLookup) {
        result = { ok: false, code: 'FEATURE_DISABLED', feature: 'arena_lookup' };
        break;
      }
      result = await findArena(args);
      recordArenaLookup(session, result);
      rememberArenaResults(session, result);
      break;
    case 'remember_official_page': {
      const pages = {
        home: ['AHM Verdun', '/'],
        schedules: ['Horaires', '/horaires'],
        registration: ['Inscriptions', '/inscriptions'],
        arenas: ['Arénas', '/arenas'],
        faq: ['F.A.Q.', '/faq'],
        coaches: ['Zone entraîneur', '/entraineurs'],
        wllv: ['WLLV AA/BB', '/wllv'],
        teams: ['Équipes', '/equipes'],
        contact: ['Contact', '/contact']
      };
      const selected = pages[args.page];
      if (!selected) return { ok: false, saved: false };
      addSmsItem(session, {
        type: 'link',
        label: selected[0],
        url: new URL(selected[1], config.ahmWebsiteUrl).toString()
      });
      result = { ok: true, saved: true };
      break;
    }
    case 'request_human_handoff': {
      if (!config.featureHumanHandoff) {
        result = { ok: false, code: 'FEATURE_DISABLED', feature: 'human_handoff' };
        break;
      }
      if (session.handoffRequested) {
        result = { ok: true, requested: true, duplicate: true };
        break;
      }

      result = await requestHumanHandoff({
        session,
        reason: args.reason,
        preferredWindow: args.preferredWindow
      });

      recordHumanHandoff(session, result);
      if (result?.ok && result.requested) {
        session.handoffRequested = true;
        session.handoffReason = args.reason;
        session.handoffPreferredWindow = args.preferredWindow;
        const lang = String(session.language || '').toLowerCase();
        const text = lang.startsWith('en')
          ? 'Your callback request was recorded. AHM Verdun will follow up when a representative is available.'
          : lang.startsWith('es')
            ? 'Su solicitud de devolución de llamada fue registrada. AHM Verdun hará el seguimiento cuando haya un representante disponible.'
            : 'Votre demande de rappel a été enregistrée. AHM Verdun fera le suivi lorsqu’un représentant sera disponible.';
        addSmsItem(session, { type: 'text', text });
      }
      break;
    }
    case 'set_sms_preference':
      session.smsEnabled = Boolean(
        args.enabled &&
        /^\+[1-9]\d{7,14}$/.test(String(session.from || '')) &&
        config.smsEnabled &&
        config.featureSmsRecap
      );
      result = { ok: true, enabled: session.smsEnabled };
      break;
    default:
      return { ok: false, code: 'UNKNOWN_TOOL' };
  }

  throwIfAborted(signal);
  await checkpoint(session, persist);
  return result;
}

function languageInstruction(lang) {
  if (String(lang).toLowerCase().startsWith('en')) return 'The caller is currently speaking English. Respond in concise natural English.';
  if (String(lang).toLowerCase().startsWith('es')) return 'The caller is currently speaking Spanish. Respond in concise natural Spanish.';
  return 'The caller is currently speaking French. Respond in concise natural Canadian French.';
}

function torontoClock() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day} ${byType.hour}:${byType.minute} America/Toronto`;
}

function fallbackAnswer(lang) {
  if (String(lang).toLowerCase().startsWith('en')) return 'I am sorry, I could not complete that request.';
  if (String(lang).toLowerCase().startsWith('es')) return 'Lo siento, no pude completar esa solicitud.';
  return 'Désolé, je n’ai pas pu compléter cette demande.';
}

export async function answerCaller({ session, text, lang, signal, persist = true }) {
  throwIfAborted(signal);
  const userItem = { role: 'user', content: String(text).slice(0, 4000) };
  const input = [...session.messages, userItem].slice(-24);

  for (let loops = 0; loops < 5; loops += 1) {
    const request = {
      model: config.openaiModel,
      instructions: [
        SYSTEM_PROMPT,
        languageInstruction(lang),
        `Current local date/time: ${torontoClock()}.`,
        `Access state: ${JSON.stringify(session.access || {})}.`,
        `Official website: ${config.ahmWebsiteUrl}`,
        `Membership URL: ${config.membershipUrl}`
      ].join('\n\n'),
      input,
      tools,
      parallel_tool_calls: false,
      store: false,
      max_output_tokens: config.openaiMaxOutputTokens
    };
    request.reasoning = { effort: config.openaiReasoningEffort };

    const response = await openai.responses.create(request, signal ? { signal } : undefined);
    throwIfAborted(signal);
    assertCompletedResponse(response);
    recordOpenAiUsage(session, response.usage || {});
    input.push(...response.output);
    const calls = response.output.filter((item) => item.type === 'function_call');

    if (!calls.length) {
      const answer = response.output_text?.trim() || fallbackAnswer(lang);
      session.messages = [...session.messages, userItem, { role: 'assistant', content: answer }].slice(-24);
      await checkpoint(session, persist);
      return answer;
    }

    for (const call of calls) {
      const result = await runTool(session, call, { signal, persist });
      input.push({ type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(result) });
    }
  }

  throw new Error('AI tool loop exceeded safety limit');
}
