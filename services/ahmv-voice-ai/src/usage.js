import { config } from './config.js';

function finite(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export function emptyUsage() {
  return {
    openaiRequests: 0,
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    estimatedOpenAiUsd: 0,
    estimatedVoiceTransportUsd: 0,
    estimatedSessionUsd: 0
  };
}

export function estimateOpenAiUsd(usage) {
  const input = finite(usage?.inputTokens);
  const cached = Math.min(input, finite(usage?.cachedInputTokens));
  const uncached = Math.max(0, input - cached);
  const output = finite(usage?.outputTokens);
  return (
    (uncached * config.openaiInputUsdPerMillion) +
    (cached * config.openaiCachedInputUsdPerMillion) +
    (output * config.openaiOutputUsdPerMillion)
  ) / 1_000_000;
}

export function estimateVoiceTransportUsd(durationSeconds = 0) {
  const minutes = finite(durationSeconds) / 60;
  return minutes * (
    config.twilioInboundUsdPerMinute +
    config.twilioConversationRelayUsdPerMinute
  );
}

export function recordOpenAiUsage(session, apiUsage = {}) {
  session.usage ||= emptyUsage();

  const inputTokens = finite(apiUsage.input_tokens);
  const cachedInputTokens = finite(apiUsage.input_tokens_details?.cached_tokens);
  const outputTokens = finite(apiUsage.output_tokens);
  const totalTokens = finite(apiUsage.total_tokens || inputTokens + outputTokens);

  session.usage.openaiRequests += 1;
  session.usage.inputTokens += inputTokens;
  session.usage.cachedInputTokens += cachedInputTokens;
  session.usage.outputTokens += outputTokens;
  session.usage.totalTokens += totalTokens;
  session.usage.estimatedOpenAiUsd = estimateOpenAiUsd(session.usage);
  session.usage.estimatedSessionUsd =
    session.usage.estimatedOpenAiUsd +
    finite(session.usage.estimatedVoiceTransportUsd);

  session.costGuardExceeded = Boolean(
    config.costGuardSessionUsd > 0 &&
    session.usage.estimatedSessionUsd >= config.costGuardSessionUsd
  );

  return session.usage;
}

export function finalizeUsageCost(session) {
  session.usage ||= emptyUsage();
  session.usage.estimatedVoiceTransportUsd = estimateVoiceTransportUsd(
    session.sessionDurationSeconds || 0
  );
  session.usage.estimatedOpenAiUsd = estimateOpenAiUsd(session.usage);
  session.usage.estimatedSessionUsd =
    session.usage.estimatedOpenAiUsd +
    session.usage.estimatedVoiceTransportUsd;
  session.costGuardExceeded = Boolean(
    config.costGuardSessionUsd > 0 &&
    session.usage.estimatedSessionUsd >= config.costGuardSessionUsd
  );
  return session.usage;
}

export function publicUsageSummary(session) {
  const usage = session?.usage || emptyUsage();
  return {
    openaiRequests: finite(usage.openaiRequests),
    inputTokens: finite(usage.inputTokens),
    cachedInputTokens: finite(usage.cachedInputTokens),
    outputTokens: finite(usage.outputTokens),
    totalTokens: finite(usage.totalTokens),
    estimatedOpenAiUsd: Number(finite(usage.estimatedOpenAiUsd).toFixed(6)),
    estimatedVoiceTransportUsd: Number(finite(usage.estimatedVoiceTransportUsd).toFixed(6)),
    estimatedSessionUsd: Number(finite(usage.estimatedSessionUsd).toFixed(6)),
    costGuardExceeded: Boolean(session?.costGuardExceeded)
  };
}
