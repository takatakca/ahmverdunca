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

function validHttpsUrl(value: string | undefined) {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function supabaseMatchesProjectRef(
  urlValue: string | undefined,
  projectRef: string | undefined,
) {
  if (!urlValue || !projectRef) return false;
  try {
    const url = new URL(urlValue);
    return (
      url.protocol === "https:" &&
      url.hostname === projectRef + ".supabase.co"
    );
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
  const calendarEnabled = bool(settings["AHMV_CALENDAR_LINKS_ENABLED"]);
  const departureEnabled = bool(settings["AHMV_SMART_DEPARTURE_ENABLED"]);
  const membershipSyncEnabled = bool(settings["AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED"]);
  const campaignsEnabled = bool(settings["AHMV_PHONE_CAMPAIGNS_ENABLED"]);
  const marketingConsentSyncEnabled = bool(settings["AHMV_TAKATAK_MARKETING_CONSENT_SYNC_ENABLED"]);
  const databaseRequired =
    phoneEnabled ||
    lifecycleEnabled ||
    remindersEnabled ||
    campaignsEnabled ||
    membershipSyncEnabled ||
    marketingConsentSyncEnabled ||
    bool(settings["AHMV_PHONE_OPS_ENABLED"]) ||
    bool(settings["AHMV_PHONE_RETENTION_ENABLED"]);

  return [
    {
      id: "ahmv-supabase-target",
      ok:
        !databaseRequired ||
        (
          settings["AHMV_SUPABASE_PROJECT_REF"] === "bqflllsjxmhqsvemhhwv" &&
          supabaseMatchesProjectRef(
            settings["SUPABASE_URL"],
            settings["AHMV_SUPABASE_PROJECT_REF"],
          )
        ),
      required: databaseRequired,
      detail: "Database-backed AHMV Phone features must target Supabase project bqflllsjxmhqsvemhhwv, never a TAKATAK/FESTI ICE/Food Hub project.",
    },
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
      required: phoneEnabled || publicEnabled || lifecycleEnabled || remindersEnabled || campaignsEnabled,
      detail: "Twilio Account SID is configured server-side.",
    },
    {
      id: "twilio-auth",
      ok: present(settings["TWILIO_AUTH_TOKEN"]),
      required: phoneEnabled || publicEnabled || lifecycleEnabled || remindersEnabled || campaignsEnabled,
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
      id: "marketing-consent-sync-token",
      ok:
        !marketingConsentSyncEnabled ||
        present(settings["TAKATAK_AHMV_SERVICE_TOKEN"]),
      required: marketingConsentSyncEnabled,
      detail: "TAKATAK marketing consent sync requires the server-to-server service token.",
    },
    {
      id: "campaign-service-token",
      ok:
        !campaignsEnabled ||
        present(settings["TAKATAK_AHMV_SERVICE_TOKEN"]),
      required: campaignsEnabled,
      detail: "Commercial campaigns require the TAKATAK server-to-server service token.",
    },
    {
      id: "campaign-cron-secret",
      ok:
        !campaignsEnabled ||
        present(settings["LOVABLE_CRON_SECRET"]),
      required: campaignsEnabled,
      detail: "Commercial campaign dispatch requires the protected cron secret.",
    },
    {
      id: "campaign-legal-info-url",
      ok:
        !campaignsEnabled ||
        validHttpsUrl(settings["TAKATAK_SMS_CEM_INFO_URL"]),
      required: campaignsEnabled,
      detail: "Commercial SMS requires the configured HTTPS sender/contact information page.",
    },
    {
      id: "safe-campaign-gate",
      ok: !campaignsEnabled || phoneEnabled,
      required: true,
      detail: "Commercial campaign dispatch cannot be enabled while the phone integration is disabled.",
    },
    {
      id: "membership-sync-token",
      ok:
        !membershipSyncEnabled ||
        present(settings["TAKATAK_AHMV_SERVICE_TOKEN"]),
      required: membershipSyncEnabled,
      detail: "TAKATAK membership sync requires the shared server-to-server service token.",
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
      id: "departure-link-secret",
      ok:
        !departureEnabled ||
        (settings["AHMV_DEPARTURE_LINK_SECRET"]?.trim().length ?? 0) >= 32,
      required: departureEnabled,
      detail: "Smart-departure links require a dedicated server secret of at least 32 characters.",
    },
    {
      id: "departure-provider",
      ok:
        Boolean(settings["TAKATAK_ROUTE_MATRIX_URL"]?.trim()) &&
        Boolean(settings["TAKATAK_ROUTE_SERVICE_TOKEN"]?.trim()),
      required: false,
      detail: "Optional TAKATAK route/traffic provider is connected for live ETA.",
    },
    {
      id: "calendar-link-secret",
      ok:
        !calendarEnabled ||
        (settings["AHMV_CALENDAR_LINK_SECRET"]?.trim().length ?? 0) >= 32,
      required: calendarEnabled,
      detail: "Signed calendar links require a dedicated server secret of at least 32 characters.",
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
