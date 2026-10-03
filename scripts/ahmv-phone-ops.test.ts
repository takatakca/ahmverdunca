import test from "node:test";
import assert from "node:assert/strict";
import { handleAhmvPhoneOpsSummary } from "../src/features/ahmv-phone/ops/handler.server.ts";
import { handleAhmvPhoneOpsFunnel } from "../src/features/ahmv-phone/ops/funnel-handler.server.ts";
import { handleAhmvVoiceValueReport } from "../src/features/ahmv-phone/ops/value-report-handler.server.ts";
import { aggregateAhmvVoiceValueReport } from "../src/features/ahmv-phone/ops/value-report.aggregate.ts";

test("phone ops endpoint is disabled by default", async () => {
  const response = await handleAhmvPhoneOpsSummary(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/summary"),
    {},
  );
  assert.equal(response?.status, 404);
});

test("phone ops endpoint is read only", async () => {
  const response = await handleAhmvPhoneOpsSummary(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/summary", {
      method: "POST",
    }),
    {
      AHMV_PHONE_OPS_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 405);
});

test("phone ops endpoint rejects missing or incorrect bearer token before database access", async () => {
  const settings = {
    AHMV_PHONE_OPS_ENABLED: "true",
    TAKATAK_AHMV_SERVICE_TOKEN: "secret",
  };

  const missing = await handleAhmvPhoneOpsSummary(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/summary"),
    settings,
  );
  assert.equal(missing?.status, 403);

  const wrong = await handleAhmvPhoneOpsSummary(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/summary", {
      headers: { authorization: "Bearer wrong" },
    }),
    settings,
  );
  assert.equal(wrong?.status, 403);
  assert.doesNotMatch(await wrong!.text(), /secret/);
});


test("phone funnel endpoint is disabled by default", async () => {
  const response = await handleAhmvPhoneOpsFunnel(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/funnel"),
    {},
  );
  assert.equal(response?.status, 404);
});

test("phone funnel endpoint rejects bad bearer token before database access", async () => {
  const settings = {
    AHMV_PHONE_OPS_ENABLED: "true",
    TAKATAK_AHMV_SERVICE_TOKEN: "secret",
  };

  const response = await handleAhmvPhoneOpsFunnel(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/funnel", {
      headers: { authorization: "Bearer wrong" },
    }),
    settings,
  );

  assert.equal(response?.status, 403);
  const body = await response!.text();
  assert.doesNotMatch(body, /secret|phone_e164|provider_sid|payload/i);
});

test("phone funnel endpoint is read only", async () => {
  const response = await handleAhmvPhoneOpsFunnel(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/funnel", {
      method: "POST",
    }),
    {
      AHMV_PHONE_OPS_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 405);
});


test("Voice value report endpoint is disabled and read-only by default", async () => {
  const disabled = await handleAhmvVoiceValueReport(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/value-report"),
    {},
  );
  assert.equal(disabled?.status, 404);

  const post = await handleAhmvVoiceValueReport(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/value-report", {
      method: "POST",
    }),
    {
      AHMV_PHONE_OPS_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(post?.status, 405);
});

test("Voice value report rejects bad bearer token before database access", async () => {
  const response = await handleAhmvVoiceValueReport(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/value-report", {
      headers: { authorization: "Bearer wrong" },
    }),
    {
      AHMV_PHONE_OPS_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );

  assert.equal(response?.status, 403);
  assert.doesNotMatch(await response!.text(), /secret|phone|call.?sid|transcript|message.?body/i);
});

test("Voice value report aggregation is privacy-safe and computes client value", () => {
  const report = aggregateAhmvVoiceValueReport({
    generatedAt: "2026-10-03T19:00:00.000Z",
    sessions: [
      {
        detected_language: "fr",
        session_duration_seconds: 120,
        turn_count: 5,
        sms_sent_at: "2026-10-03T18:55:00.000Z",
        started_at: "2026-10-03T18:50:00.000Z",
        session_state: {
          metrics: {
            scheduleLookups: 2,
            scheduleAuthoritative: 1,
            scheduleMatched: 1,
            arenaLookups: 1,
            arenaAuthoritative: 1,
            arenaMatched: 0,
          },
          usage: { estimatedSessionUsd: 0.1 },
        },
      },
      {
        detected_language: "en",
        session_duration_seconds: 60,
        turn_count: 3,
        sms_sent_at: null,
        started_at: "2026-10-03T18:40:00.000Z",
        session_state: {
          metrics: {
            scheduleLookups: 1,
            scheduleAuthoritative: 1,
            scheduleMatched: 1,
            arenaLookups: 0,
            arenaAuthoritative: 0,
            arenaMatched: 0,
          },
          usage: { estimatedSessionUsd: 0.2 },
        },
      },
    ],
    interactions: [
      {
        intent: "human_handoff",
        outcome: "requested",
        created_at: "2026-10-03T18:51:00.000Z",
      },
      {
        intent: "voice-ai",
        outcome: "completed",
        created_at: "2026-10-03T18:52:00.000Z",
      },
    ],
    messages: [
      { status: "sent", created_at: "2026-10-03T18:55:00.000Z" },
      { status: "failed", created_at: "2026-10-03T18:56:00.000Z" },
    ],
  });

  assert.equal(report.service.voiceCalls, 2);
  assert.equal(report.service.automatedVoiceMinutes, 3);
  assert.equal(report.service.averageCallSeconds, 90);
  assert.equal(report.service.totalTurns, 8);
  assert.deepEqual(report.service.languages, { fr: 1, en: 1, es: 0, unknown: 0 });

  assert.equal(report.verifiedData.totalLookups, 4);
  assert.equal(report.verifiedData.authoritativeResponses, 3);
  assert.equal(report.verifiedData.verifiedDataHitRatePct, 75);
  assert.equal(report.followUp.humanCallbackRequests, 1);
  assert.equal(report.followUp.recapSmsSent, 1);

  assert.equal(report.cost.estimatedTrackedUsd, 0.3);
  assert.equal(report.cost.averageEstimatedTrackedUsdPerCall, 0.15);
  assert.equal(report.cost.costCoveragePct, 100);
  assert.equal(report.cost.billingAuthority, false);

  assert.deepEqual(report.privacy, {
    containsPhoneNumbers: false,
    containsCallSids: false,
    containsMessageBodies: false,
    containsTranscripts: false,
  });
});
