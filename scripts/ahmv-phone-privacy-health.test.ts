import test from "node:test";
import assert from "node:assert/strict";
import { handleAhmvPhoneOpsHealth } from "../src/features/ahmv-phone/ops/health-handler.server.ts";
import { handleAhmvPhoneRetention } from "../src/features/ahmv-phone/privacy/handler.server.ts";
import { phoneRetentionPolicy } from "../src/features/ahmv-phone/privacy/retention.server.ts";

test("phone ops health is disabled by default", async () => {
  const response = await handleAhmvPhoneOpsHealth(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/health"),
    {},
  );
  assert.equal(response?.status, 404);
});

test("phone ops health rejects bad bearer token before database access", async () => {
  const response = await handleAhmvPhoneOpsHealth(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/health", {
      headers: { authorization: "Bearer wrong" },
    }),
    {
      AHMV_PHONE_OPS_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 403);
  assert.doesNotMatch(await response!.text(), /secret/);
});

test("retention endpoint is disabled by default", async () => {
  const response = await handleAhmvPhoneRetention(
    new Request("https://ahmverdun.ca/api/ahmv/cron/phone-retention", {
      method: "POST",
    }),
    {},
  );
  assert.equal(response?.status, 404);
});

test("retention policy defaults are bounded and deterministic", () => {
  assert.deepEqual(phoneRetentionPolicy({}), {
    messageBodyDays: 30,
    interactionDays: 90,
    messageJobDays: 180,
  });
  assert.deepEqual(
    phoneRetentionPolicy({
      AHMV_PHONE_MESSAGE_BODY_RETENTION_DAYS: "14",
      AHMV_PHONE_INTERACTION_RETENTION_DAYS: "60",
      AHMV_PHONE_JOB_RETENTION_DAYS: "365",
    }),
    {
      messageBodyDays: 14,
      interactionDays: 60,
      messageJobDays: 365,
    },
  );
});

test("invalid retention settings fall back instead of disabling privacy cleanup", () => {
  assert.deepEqual(
    phoneRetentionPolicy({
      AHMV_PHONE_MESSAGE_BODY_RETENTION_DAYS: "0",
      AHMV_PHONE_INTERACTION_RETENTION_DAYS: "9999",
      AHMV_PHONE_JOB_RETENTION_DAYS: "-2",
    }),
    {
      messageBodyDays: 30,
      interactionDays: 90,
      messageJobDays: 180,
    },
  );
});
