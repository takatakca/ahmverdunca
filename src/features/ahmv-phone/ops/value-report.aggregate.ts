export type VoiceValueSessionRow = {
  detected_language: string | null;
  session_duration_seconds: number | null;
  turn_count: number | null;
  session_state: unknown;
  sms_sent_at: string | null;
  started_at: string;
};

export type VoiceValueInteractionRow = {
  intent: string | null;
  outcome: string;
  created_at: string;
};

export type VoiceValueMessageRow = {
  status: string;
  created_at: string;
};

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function finite(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function integer(value: unknown) {
  return Math.floor(finite(value));
}

function percent(numerator: number, denominator: number) {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 10_000) / 100;
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export interface AhmvVoiceValueReport {
  generatedAt: string;
  windowDays: 30;
  service: {
    voiceCalls: number;
    automatedVoiceMinutes: number;
    automatedVoiceHours: number;
    averageCallSeconds: number | null;
    totalTurns: number;
    languages: {
      fr: number;
      en: number;
      es: number;
      unknown: number;
    };
  };
  verifiedData: {
    scheduleLookups: number;
    scheduleAuthoritative: number;
    scheduleMatched: number;
    arenaLookups: number;
    arenaAuthoritative: number;
    arenaMatched: number;
    authoritativeResponses: number;
    totalLookups: number;
    verifiedDataHitRatePct: number | null;
  };
  followUp: {
    humanCallbackRequests: number;
    recapSmsSent: number;
    messageJobsSent: number;
    messageJobsFailed: number;
  };
  cost: {
    currency: "USD";
    estimatedTrackedUsd: number;
    averageEstimatedTrackedUsdPerCall: number | null;
    sessionsWithCostEstimate: number;
    costCoveragePct: number | null;
    billingAuthority: false;
  };
  privacy: {
    containsPhoneNumbers: false;
    containsCallSids: false;
    containsMessageBodies: false;
    containsTranscripts: false;
  };
  limits: {
    voiceRowsCapped: boolean;
    interactionRowsCapped: boolean;
    messageRowsCapped: boolean;
  };
}

export function aggregateAhmvVoiceValueReport(input: {
  generatedAt: string;
  sessions: VoiceValueSessionRow[];
  interactions: VoiceValueInteractionRow[];
  messages: VoiceValueMessageRow[];
  rowLimit?: number;
}): AhmvVoiceValueReport {
  const { generatedAt, sessions, interactions, messages } = input;
  const rowLimit = input.rowLimit ?? 10_000;

  let totalDurationSeconds = 0;
  let totalTurns = 0;
  let scheduleLookups = 0;
  let scheduleAuthoritative = 0;
  let scheduleMatched = 0;
  let arenaLookups = 0;
  let arenaAuthoritative = 0;
  let arenaMatched = 0;
  let estimatedTrackedUsd = 0;
  let sessionsWithCostEstimate = 0;
  let recapSmsSent = 0;
  const languages = { fr: 0, en: 0, es: 0, unknown: 0 };

  for (const session of sessions) {
    totalDurationSeconds += finite(session.session_duration_seconds);
    totalTurns += integer(session.turn_count);
    if (session.sms_sent_at) recapSmsSent += 1;

    const language = String(session.detected_language ?? "");
    if (language === "fr" || language === "en" || language === "es") {
      languages[language] += 1;
    } else {
      languages.unknown += 1;
    }

    const state = objectValue(session.session_state);
    const metrics = objectValue(state["metrics"]);
    scheduleLookups += integer(metrics["scheduleLookups"]);
    scheduleAuthoritative += integer(metrics["scheduleAuthoritative"]);
    scheduleMatched += integer(metrics["scheduleMatched"]);
    arenaLookups += integer(metrics["arenaLookups"]);
    arenaAuthoritative += integer(metrics["arenaAuthoritative"]);
    arenaMatched += integer(metrics["arenaMatched"]);

    const usage = objectValue(state["usage"]);
    if (Object.prototype.hasOwnProperty.call(usage, "estimatedSessionUsd")) {
      sessionsWithCostEstimate += 1;
      estimatedTrackedUsd += finite(usage["estimatedSessionUsd"]);
    }
  }

  const totalLookups = scheduleLookups + arenaLookups;
  const authoritativeResponses = scheduleAuthoritative + arenaAuthoritative;
  const humanCallbackRequests = interactions.filter(
    (row) => row.intent === "human_handoff" && row.outcome === "requested",
  ).length;
  const messageJobsSent = messages.filter((row) => row.status === "sent").length;
  const messageJobsFailed = messages.filter((row) => row.status === "failed").length;

  return {
    generatedAt,
    windowDays: 30,
    service: {
      voiceCalls: sessions.length,
      automatedVoiceMinutes: round(totalDurationSeconds / 60, 1),
      automatedVoiceHours: round(totalDurationSeconds / 3600, 2),
      averageCallSeconds: sessions.length
        ? round(totalDurationSeconds / sessions.length, 1)
        : null,
      totalTurns,
      languages,
    },
    verifiedData: {
      scheduleLookups,
      scheduleAuthoritative,
      scheduleMatched,
      arenaLookups,
      arenaAuthoritative,
      arenaMatched,
      authoritativeResponses,
      totalLookups,
      verifiedDataHitRatePct: percent(authoritativeResponses, totalLookups),
    },
    followUp: {
      humanCallbackRequests,
      recapSmsSent,
      messageJobsSent,
      messageJobsFailed,
    },
    cost: {
      currency: "USD",
      estimatedTrackedUsd: round(estimatedTrackedUsd, 4),
      averageEstimatedTrackedUsdPerCall: sessions.length
        ? round(estimatedTrackedUsd / sessions.length, 4)
        : null,
      sessionsWithCostEstimate,
      costCoveragePct: percent(sessionsWithCostEstimate, sessions.length),
      billingAuthority: false,
    },
    privacy: {
      containsPhoneNumbers: false,
      containsCallSids: false,
      containsMessageBodies: false,
      containsTranscripts: false,
    },
    limits: {
      voiceRowsCapped: sessions.length >= rowLimit,
      interactionRowsCapped: interactions.length >= rowLimit,
      messageRowsCapped: messages.length >= rowLimit,
    },
  };
}
