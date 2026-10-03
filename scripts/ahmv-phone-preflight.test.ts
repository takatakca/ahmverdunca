import test from "node:test";
import assert from "node:assert/strict";
import { phonePreflight } from "../scripts/ahmv-phone-preflight.ts";

test("preflight passes base non-public configuration without Twilio credentials", () => {
  const checks = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
    AHMV_PHONE_DEMO_ENABLED: "false",
  });
  assert.equal(checks.filter((check) => check.required && !check.ok).length, 0);
});

test("preflight requires Twilio credentials when phone integration is enabled", () => {
  const checks = phonePreflight({
    AHMV_PHONE_ENABLED: "true",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
  });
  assert.equal(checks.find((check) => check.id === "twilio-account")?.ok, false);
  assert.equal(checks.find((check) => check.id === "twilio-account")?.required, true);
  assert.equal(checks.find((check) => check.id === "twilio-auth")?.ok, false);
});

test("public flag cannot pass while phone integration is disabled", () => {
  const checks = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "true",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
  });
  assert.equal(checks.find((check) => check.id === "safe-public-gate")?.ok, false);
});

test("demo mode requires a separate demo token", () => {
  const checks = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
    AHMV_PHONE_DEMO_ENABLED: "true",
  });
  assert.equal(checks.find((check) => check.id === "demo-token")?.ok, false);
  assert.equal(checks.find((check) => check.id === "demo-token")?.required, true);
});
