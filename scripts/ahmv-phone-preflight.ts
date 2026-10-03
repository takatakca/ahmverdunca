import { approvedReminderTeamMap } from "../src/features/ahmv-phone/reminders/source.ts";

type Settings = Record<string, string | undefined>;

export interface PhonePreflightCheck {
  id: string;
  ok: boolean;
  required: boolean;
  detail: string;
}

function bool(value: string | undefined) {
  return value === "true";
}

function present(value: string | undefined) {
  return Boolean(value?.trim());
}

function validHttpsOrigin(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === value;
  } catch {
    return false;
  }
}

export function phonePreflight(settings: Settings = process.env): PhonePreflightCheck[] {
  const demoEnabled = bool(settings["AHMV_PHONE_DEMO_ENABLED"]);
  const phoneEnabled = bool(settings["AHMV_PHONE_ENABLED"]);
  const publicEnabled = bool(settings["AHMV_PHONE_PUBLIC"]);
  const lifecycleEnabled = bool(settings["AHMV_PHONE_LIFECYCLE_ENABLED"]);
  const remindersEnabled = bool(settings["AHMV_PHONE_REMINDERS_ENABLED"]);

  return [
    {
      id: "public-phone",
      ok: settings["AHMV_PUBLIC_PHONE"] === "+15816666246",
      required: true,
      detail: "AHMV public number must be +15816666246.",
    },
    {
      id: "webhook-origin",
      ok:
        validHttpsOrigin(settings["AHMV_WEBHOOK_ORIGIN"]) &&
        settings["AHMV_WEBHOOK_ORIGIN"] === "https://ahmverdun.ca",
      required: true,
      detail: "Webhook origin must be exactly https://ahmverdun.ca.",
    },
    {
      id: "twilio-account",
      ok: present(settings["TWILIO_ACCOUNT_SID"]),
      required: phoneEnabled || publicEnabled || lifecycleEnabled || remindersEnabled,
      detail: "Twilio Account SID is configured server-side.",
    },
    {
      id: "twilio-auth",
      ok: present(settings["TWILIO_AUTH_TOKEN"]),
      required: phoneEnabled || publicEnabled || lifecycleEnabled || remindersEnabled,
      detail: "Twilio Auth Token is configured server-side.",
    },
    {
      id: "trial-days",
      ok: Number(settings["AHMV_PHONE_TRIAL_DAYS"] ?? "30") === 30,
      required: true,
      detail: "GROUPE TAKATAK introductory period is 30 days.",
    },
    {
      id: "member-url",
      ok: present(settings["TAKATAK_AHMV_MEMBER_URL"]),
      required: true,
      detail: "TAKATAK member activation URL is configured.",
    },
    {
      id: "takatak-entitlement",
      ok:
        present(settings["TAKATAK_AHMV_ENTITLEMENT_URL"]) &&
        present(settings["TAKATAK_AHMV_SERVICE_TOKEN"]),
      required: false,
      detail: "TAKATAK remote entitlement verification is connected.",
    },
    {
      id: "demo-token",
      ok: !demoEnabled || present(settings["AHMV_PHONE_DEMO_TOKEN"]),
      required: demoEnabled,
      detail: "Internal demo endpoint has a separate token when enabled.",
    },
    {
      id: "worker-cron-secret",
      ok:
        !(lifecycleEnabled || remindersEnabled) ||
        present(settings["LOVABLE_CRON_SECRET"]),
      required: lifecycleEnabled || remindersEnabled,
      detail: "Phone background workers require the protected cron secret.",
    },
    {
      id: "reminder-team-map",
      ok:
        !remindersEnabled ||
        (() => {
          try {
            return Object.keys(approvedReminderTeamMap(settings)).length > 0;
          } catch {
            return false;
          }
        })(),
      required: remindersEnabled,
      detail: "Reminder delivery requires a valid explicit official-group to public-team mapping.",
    },
    {
      id: "safe-lifecycle-gate",
      ok: !lifecycleEnabled || phoneEnabled,
      required: true,
      detail: "Lifecycle dispatch cannot be enabled while the phone integration is disabled.",
    },
    {
      id: "safe-reminder-gate",
      ok: !remindersEnabled || phoneEnabled,
      required: true,
      detail: "Reminder dispatch cannot be enabled while the phone integration is disabled.",
    },
    {
      id: "safe-public-gate",
      ok: !publicEnabled || phoneEnabled,
      required: true,
      detail: "Public phone flag can never be true while the phone integration is disabled.",
    },
  ];
}

function main() {
  const checks = phonePreflight();
  const strict = process.argv.includes("--strict");
  let failedRequired = 0;

  console.log("AHMV Phone/SMS preflight");
  console.log("=========================");
  for (const check of checks) {
    const status = check.ok ? "PASS" : check.required ? "FAIL" : "OPTIONAL";
    console.log(status.padEnd(8) + check.id.padEnd(24) + check.detail);
    if (!check.ok && check.required) failedRequired += 1;
  }

  console.log("");
  console.log(
    failedRequired === 0
      ? "Required configuration checks passed."
      : failedRequired + " required configuration check(s) are incomplete.",
  );

  if (strict && failedRequired > 0) process.exitCode = 1;
}

if (import.meta.main) main();
