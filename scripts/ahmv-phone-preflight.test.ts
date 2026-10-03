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


test("lifecycle mode requires phone integration and cron secret", () => {
  const checks = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_PHONE_LIFECYCLE_ENABLED: "true",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
  });
  assert.equal(checks.find((check) => check.id === "safe-lifecycle-gate")?.ok, false);
  assert.equal(checks.find((check) => check.id === "worker-cron-secret")?.ok, false);
  assert.equal(checks.find((check) => check.id === "twilio-account")?.required, true);
  assert.equal(checks.find((check) => check.id === "twilio-auth")?.required, true);
});

test("lifecycle mode passes its safety gates with provider and cron configuration", () => {
  const checks = phonePreflight({
    AHMV_PHONE_ENABLED: "true",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_PHONE_LIFECYCLE_ENABLED: "true",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
    TWILIO_ACCOUNT_SID: "ACexample",
    TWILIO_AUTH_TOKEN: "secret",
    LOVABLE_CRON_SECRET: "cron-secret",
  });
  assert.equal(checks.find((check) => check.id === "safe-lifecycle-gate")?.ok, true);
  assert.equal(checks.find((check) => check.id === "worker-cron-secret")?.ok, true);
});


test("reminder worker requires phone integration cron secret and explicit team mapping", () => {
  const checks = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_PHONE_REMINDERS_ENABLED: "true",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
    AHMV_REMINDER_TEAM_MAP_JSON: "{}",
  });
  assert.equal(checks.find((check) => check.id === "safe-reminder-gate")?.ok, false);
  assert.equal(checks.find((check) => check.id === "worker-cron-secret")?.ok, false);
  assert.equal(checks.find((check) => check.id === "reminder-team-map")?.ok, false);
  assert.equal(checks.find((check) => check.id === "twilio-account")?.required, true);
});

test("reminder worker safety gates pass with explicit mapping and provider config", () => {
  const checks = phonePreflight({
    AHMV_PHONE_ENABLED: "true",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_PHONE_REMINDERS_ENABLED: "true",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
    AHMV_REMINDER_TEAM_MAP_JSON: '{"Junior":"2025191400035011"}',
    TWILIO_ACCOUNT_SID: "ACexample",
    TWILIO_AUTH_TOKEN: "secret",
    LOVABLE_CRON_SECRET: "cron-secret",
  });
  assert.equal(checks.find((check) => check.id === "safe-reminder-gate")?.ok, true);
  assert.equal(checks.find((check) => check.id === "worker-cron-secret")?.ok, true);
  assert.equal(checks.find((check) => check.id === "reminder-team-map")?.ok, true);
});


test("calendar links require a dedicated 32-character server secret when enabled", () => {
  const missing = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_CALENDAR_LINKS_ENABLED: "true",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
  });
  assert.equal(missing.find((check) => check.id === "calendar-link-secret")?.ok, false);

  const configured = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_CALENDAR_LINKS_ENABLED: "true",
    AHMV_CALENDAR_LINK_SECRET: "12345678901234567890123456789012",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
  });
  assert.equal(configured.find((check) => check.id === "calendar-link-secret")?.ok, true);
});


test("smart-departure requires a dedicated signing secret when enabled", () => {
  const missing = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_SMART_DEPARTURE_ENABLED: "true",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
  });
  assert.equal(missing.find((check) => check.id === "departure-link-secret")?.ok, false);

  const configured = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_SMART_DEPARTURE_ENABLED: "true",
    AHMV_DEPARTURE_LINK_SECRET: "abcdefghijklmnopqrstuvwxyz123456",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
  });
  assert.equal(configured.find((check) => check.id === "departure-link-secret")?.ok, true);
  assert.equal(configured.find((check) => check.id === "departure-provider")?.required, false);
});


test("TAKATAK membership sync requires the server service token", () => {
  const missing = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED: "true",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
  });
  assert.equal(
    missing.find((check) => check.id === "membership-sync-token")?.ok,
    false,
  );

  const configured = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED: "true",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
    TAKATAK_AHMV_SERVICE_TOKEN: "server-secret",
  });
  assert.equal(
    configured.find((check) => check.id === "membership-sync-token")?.ok,
    true,
  );
});


test("commercial campaigns require phone provider service token cron secret and legal info URL", () => {
  const missing = phonePreflight({
    AHMV_PHONE_ENABLED: "false",
    AHMV_PHONE_CAMPAIGNS_ENABLED: "true",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
  });

  assert.equal(missing.find((check) => check.id === "safe-campaign-gate")?.ok, false);
  assert.equal(missing.find((check) => check.id === "campaign-service-token")?.ok, false);
  assert.equal(missing.find((check) => check.id === "campaign-cron-secret")?.ok, false);
  assert.equal(missing.find((check) => check.id === "campaign-legal-info-url")?.ok, false);
  assert.equal(missing.find((check) => check.id === "twilio-account")?.required, true);

  const configured = phonePreflight({
    AHMV_PHONE_ENABLED: "true",
    AHMV_PHONE_CAMPAIGNS_ENABLED: "true",
    AHMV_PHONE_PUBLIC: "false",
    AHMV_PUBLIC_PHONE: "+15816666246",
    AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
    AHMV_PHONE_TRIAL_DAYS: "30",
    TAKATAK_AHMV_MEMBER_URL: "https://takatak.ca/login?next=%2Fdashboard%2Fhockey",
    TAKATAK_AHMV_SERVICE_TOKEN: "service-secret",
    LOVABLE_CRON_SECRET: "cron-secret",
    TAKATAK_SMS_CEM_INFO_URL: "https://takatak.ca/sms-info",
    TWILIO_ACCOUNT_SID: "ACexample",
    TWILIO_AUTH_TOKEN: "twilio-secret",
  });

  assert.equal(configured.find((check) => check.id === "safe-campaign-gate")?.ok, true);
  assert.equal(configured.find((check) => check.id === "campaign-service-token")?.ok, true);
  assert.equal(configured.find((check) => check.id === "campaign-cron-secret")?.ok, true);
  assert.equal(configured.find((check) => check.id === "campaign-legal-info-url")?.ok, true);
});
