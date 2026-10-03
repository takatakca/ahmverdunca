import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server.ts";
import { officialPhoneSchedule } from "../../../lib/ahmv-phone.ts";
import type { AhmvPhoneContact } from "../contacts/store.server.ts";
import { resolvePhoneEntitlement } from "../entitlements/service.server.ts";
import {
  claimMessageJob,
  loadDueMessageJobs,
  messageBodyFromPayload,
  queueMessageJob,
  updateMessageJob,
} from "../messaging/jobs.server.ts";
import { lifecycleRetryDelayMinutes } from "../messaging/lifecycle.ts";
import { sendQueuedSms } from "../messaging/send.server.ts";
import { eventChangeAlertText } from "./change-alert.ts";
import {
  detectAuthoritativeEventChanges,
  eventChangeDedupeKey,
  type AuthoritativeEventSnapshot,
} from "./change-detector.ts";
import { planGameReminder, reminderLeadMinutes } from "./planner.ts";
import { canSendTeamServiceAlert } from "./policy.ts";
import {
  approvedReminderTeamMap,
  authoritativeEventsFromSchedule,
} from "./source.ts";
import { gameReminderText } from "./templates.ts";

type Settings = Record<string, string | undefined>;

type SnapshotRow = {
  provider_event_id: string;
  public_team_id: string;
  starts_at: string;
  venue: string;
  status: "scheduled" | "cancelled";
};

type PreferenceRow = {
  contact_id: string;
  public_team_id: string;
  reminders_enabled: boolean;
};

type ContactRow = {
  id: string;
  phone_e164: string;
  language: string;
  access_tier: AhmvPhoneContact["accessTier"];
  trial_expires_at: string;
  sms_consent: boolean;
  transactional_sms_allowed: boolean;
  marketing_sms_consent: boolean;
  takatak_identity_id: string | null;
};

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function contactFromRow(row: ContactRow): AhmvPhoneContact {
  return {
    id: row.id,
    phoneE164: row.phone_e164,
    language: row.language === "en" ? "en" : "fr",
    accessTier: row.access_tier,
    trialExpiresAt: row.trial_expires_at,
    smsConsent: Boolean(row.sms_consent),
    transactionalSmsAllowed: Boolean(row.transactional_sms_allowed),
    marketingSmsConsent: Boolean(row.marketing_sms_consent),
    takatakIdentityId: row.takatak_identity_id ?? undefined,
  };
}

function eventFromRow(row: SnapshotRow): AuthoritativeEventSnapshot {
  return {
    providerEventId: row.provider_event_id,
    publicTeamId: row.public_team_id,
    startsAt: new Date(row.starts_at).toISOString(),
    venue: row.venue,
    status: row.status,
  };
}

async function loadSnapshotByIds(
  providerEventId: string,
  publicTeamId: string,
) {
  const result = await db()
    .from("ahmv_phone_event_snapshots")
    .select("provider_event_id,public_team_id,starts_at,venue,status")
    .eq("provider_event_id", providerEventId)
    .eq("public_team_id", publicTeamId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ? eventFromRow(result.data as SnapshotRow) : null;
}

async function loadSnapshot(event: AuthoritativeEventSnapshot) {
  return loadSnapshotByIds(event.providerEventId, event.publicTeamId);
}

async function saveSnapshot(
  event: AuthoritativeEventSnapshot,
  now: Date,
) {
  const result = await db()
    .from("ahmv_phone_event_snapshots")
    .upsert(
      {
        provider_event_id: event.providerEventId,
        public_team_id: event.publicTeamId,
        starts_at: event.startsAt,
        venue: event.venue,
        status: event.status,
        updated_at: now.toISOString(),
      },
      { onConflict: "provider_event_id,public_team_id" },
    );

  if (result.error) throw result.error;
}

async function reminderSubscribers(publicTeamId: string) {
  const preferencesResult = await db()
    .from("ahmv_phone_team_preferences")
    .select("contact_id,public_team_id,reminders_enabled")
    .eq("public_team_id", publicTeamId)
    .eq("reminders_enabled", true)
    .limit(2000);

  if (preferencesResult.error) throw preferencesResult.error;

  const preferences = (preferencesResult.data ?? []) as PreferenceRow[];
  const ids = [...new Set(preferences.map((row) => row.contact_id))];
  if (!ids.length) {
    return [] as Array<{
      contact: AhmvPhoneContact;
      remindersEnabled: boolean;
    }>;
  }

  const contactsResult = await db()
    .from("ahmv_phone_contacts")
    .select(
      "id,phone_e164,language,access_tier,trial_expires_at,sms_consent,transactional_sms_allowed,marketing_sms_consent,takatak_identity_id",
    )
    .in("id", ids);

  if (contactsResult.error) throw contactsResult.error;

  return ((contactsResult.data ?? []) as ContactRow[]).map((row) => ({
    contact: contactFromRow(row),
    remindersEnabled: true,
  }));
}

async function loadContact(contactId: string) {
  const result = await db()
    .from("ahmv_phone_contacts")
    .select(
      "id,phone_e164,language,access_tier,trial_expires_at,sms_consent,transactional_sms_allowed,marketing_sms_consent,takatak_identity_id",
    )
    .eq("id", contactId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ? contactFromRow(result.data as ContactRow) : null;
}

async function reminderPreferenceEnabled(
  contactId: string,
  publicTeamId: string,
) {
  const result = await db()
    .from("ahmv_phone_team_preferences")
    .select("reminders_enabled")
    .eq("contact_id", contactId)
    .eq("public_team_id", publicTeamId)
    .maybeSingle();

  if (result.error) throw result.error;
  return Boolean(result.data?.["reminders_enabled"]);
}

async function cancelPendingEventReminders(
  event: AuthoritativeEventSnapshot,
  now: Date,
) {
  const result = await db()
    .from("ahmv_phone_message_jobs")
    .update({
      status: "cancelled",
      last_error: "Authoritative event changed",
      updated_at: now.toISOString(),
    })
    .eq("purpose", "game_reminder")
    .eq("status", "pending")
    .contains("payload", {
      providerEventId: event.providerEventId,
      publicTeamId: event.publicTeamId,
    })
    .select("id");

  if (result.error) throw result.error;
  return result.data?.length ?? 0;
}

async function queueReminderForContact(
  contact: AhmvPhoneContact,
  event: AuthoritativeEventSnapshot,
  settings: Settings,
  now: Date,
) {
  const entitlement = await resolvePhoneEntitlement(
    contact,
    "game_reminders",
    settings,
  );

  if (
    !canSendTeamServiceAlert({
      contact,
      remindersEnabled: true,
      entitlement,
    })
  ) {
    return "ineligible" as const;
  }

  const plan = planGameReminder(
    event,
    reminderLeadMinutes(settings),
    now,
  );
  if (!plan) return "not-plannable" as const;

  return await queueMessageJob({
    contactId: contact.id,
    purpose: "game_reminder",
    body: gameReminderText(event, contact.language),
    notBefore: plan.sendAt,
    dedupeKey: `contact:${contact.id}:${plan.dedupeKey}`,
    consentBasis: "service",
    payload: {
      publicTeamId: event.publicTeamId,
      providerEventId: event.providerEventId,
      eventStartsAt: event.startsAt,
      venue: event.venue,
      status: event.status,
    },
  });
}

async function queueChangeAlertForContact(
  contact: AhmvPhoneContact,
  event: AuthoritativeEventSnapshot,
  changes: ReturnType<typeof detectAuthoritativeEventChanges>,
  settings: Settings,
  now: Date,
) {
  const entitlement = await resolvePhoneEntitlement(
    contact,
    "game_reminders",
    settings,
  );

  if (
    !canSendTeamServiceAlert({
      contact,
      remindersEnabled: true,
      entitlement,
    })
  ) {
    return "ineligible" as const;
  }

  return await queueMessageJob({
    contactId: contact.id,
    purpose: "event_change",
    body: eventChangeAlertText(changes, contact.language),
    notBefore: now.toISOString(),
    dedupeKey:
      `contact:${contact.id}:${eventChangeDedupeKey(event)}`,
    consentBasis: "service",
    payload: {
      publicTeamId: event.publicTeamId,
      providerEventId: event.providerEventId,
      eventStartsAt: event.startsAt,
      venue: event.venue,
      status: event.status,
      changeKinds: changes.map((change) => change.kind),
    },
  });
}

export async function syncPhoneReminderEvents(
  settings: Settings = process.env,
  now = new Date(),
) {
  const teamMap = approvedReminderTeamMap(settings);
  const events = authoritativeEventsFromSchedule(
    officialPhoneSchedule,
    teamMap,
  );

  const summary = {
    mappedEvents: events.length,
    newSnapshots: 0,
    changedEvents: 0,
    cancelledOldReminders: 0,
    reminderJobsInserted: 0,
    reminderJobsDuplicate: 0,
    changeJobsInserted: 0,
    changeJobsDuplicate: 0,
    ineligible: 0,
  };

  for (const event of events) {
    const previous = await loadSnapshot(event);
    const subscribers = await reminderSubscribers(event.publicTeamId);

    if (!previous) {
      await saveSnapshot(event, now);
      summary.newSnapshots += 1;
    } else {
      const changes = detectAuthoritativeEventChanges(previous, event);
      if (changes.length) {
        summary.changedEvents += 1;
        summary.cancelledOldReminders +=
          await cancelPendingEventReminders(event, now);
        await saveSnapshot(event, now);

        for (const subscriber of subscribers) {
          const result = await queueChangeAlertForContact(
            subscriber.contact,
            event,
            changes,
            settings,
            now,
          );
          if (result === "inserted") summary.changeJobsInserted += 1;
          else if (result === "duplicate") summary.changeJobsDuplicate += 1;
          else summary.ineligible += 1;
        }
      }
    }

    if (event.status === "scheduled") {
      for (const subscriber of subscribers) {
        const result = await queueReminderForContact(
          subscriber.contact,
          event,
          settings,
          now,
        );
        if (result === "inserted") summary.reminderJobsInserted += 1;
        else if (result === "duplicate") summary.reminderJobsDuplicate += 1;
        else if (result === "ineligible") summary.ineligible += 1;
      }
    }
  }

  return summary;
}

function payloadEventState(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const value = payload as Record<string, unknown>;
  const publicTeamId = value["publicTeamId"];
  const providerEventId = value["providerEventId"];
  const eventStartsAt = value["eventStartsAt"];
  const venue = value["venue"];
  const status = value["status"];

  if (
    typeof publicTeamId !== "string" ||
    !publicTeamId ||
    typeof providerEventId !== "string" ||
    !providerEventId ||
    typeof eventStartsAt !== "string" ||
    !Number.isFinite(Date.parse(eventStartsAt)) ||
    typeof venue !== "string" ||
    !venue ||
    (status !== "scheduled" && status !== "cancelled")
  ) {
    return null;
  }

  return {
    publicTeamId,
    providerEventId,
    eventStartsAt: new Date(eventStartsAt).toISOString(),
    venue,
    status,
  } as const;
}

function reminderJobStillMatchesSnapshot(
  jobState: NonNullable<ReturnType<typeof payloadEventState>>,
  current: AuthoritativeEventSnapshot | null,
) {
  return Boolean(
    current &&
      current.publicTeamId === jobState.publicTeamId &&
      current.providerEventId === jobState.providerEventId &&
      current.startsAt === jobState.eventStartsAt &&
      current.venue === jobState.venue &&
      current.status === jobState.status,
  );
}

export async function dispatchDuePhoneReminderMessages(
  settings: Settings = process.env,
  now = new Date(),
) {
  const providerReady =
    settings["AHMV_PHONE_ENABLED"] === "true" &&
    Boolean(settings["TWILIO_ACCOUNT_SID"]?.trim()) &&
    Boolean(settings["TWILIO_AUTH_TOKEN"]?.trim()) &&
    settings["AHMV_WEBHOOK_ORIGIN"] === "https://ahmverdun.ca";

  if (!providerReady) {
    return {
      due: 0,
      claimed: 0,
      accepted: 0,
      cancelled: 0,
      retried: 0,
      failed: 0,
      skippedConfiguration: true,
    };
  }

  const dueJobs = await loadDueMessageJobs(
    ["game_reminder", "event_change"],
    now,
    50,
  );

  const summary = {
    due: dueJobs.length,
    claimed: 0,
    accepted: 0,
    cancelled: 0,
    retried: 0,
    failed: 0,
    skippedConfiguration: false,
  };

  for (const row of dueJobs) {
    const claimed = await claimMessageJob(row, now);
    if (!claimed) continue;
    summary.claimed += 1;

    const contact = await loadContact(claimed.contact_id);
    const jobState = payloadEventState(claimed.payload);
    const body = messageBodyFromPayload(claimed.payload);

    if (!contact || !jobState || !body) {
      await updateMessageJob(
        claimed.id,
        {
          status: "cancelled",
          last_error: "Reminder payload/contact unavailable",
        },
        now,
      );
      summary.cancelled += 1;
      continue;
    }

    const currentSnapshot = await loadSnapshotByIds(
      jobState.providerEventId,
      jobState.publicTeamId,
    );

    if (
      !reminderJobStillMatchesSnapshot(jobState, currentSnapshot) ||
      (claimed.purpose === "game_reminder" &&
        (jobState.status !== "scheduled" ||
          Date.parse(jobState.eventStartsAt) <= now.getTime()))
    ) {
      await updateMessageJob(
        claimed.id,
        {
          status: "cancelled",
          last_error: "Reminder job no longer matches the current authoritative event",
        },
        now,
      );
      summary.cancelled += 1;
      continue;
    }

    const remindersEnabled = await reminderPreferenceEnabled(
      contact.id,
      jobState.publicTeamId,
    );
    const entitlement = await resolvePhoneEntitlement(
      contact,
      "game_reminders",
      settings,
    );

    if (
      !canSendTeamServiceAlert({
        contact,
        remindersEnabled,
        entitlement,
      })
    ) {
      await updateMessageJob(
        claimed.id,
        {
          status: "cancelled",
          last_error: "Reminder preference, consent, or entitlement no longer valid",
        },
        now,
      );
      summary.cancelled += 1;
      continue;
    }

    const result = await sendQueuedSms({
      jobId: claimed.id,
      to: contact.phoneE164,
      body,
      settings,
    });

    if (result.accepted) {
      summary.accepted += 1;
      continue;
    }

    if (result.reason === "provider" && claimed.attempts < 3) {
      const delayMinutes = lifecycleRetryDelayMinutes(claimed.attempts);
      await updateMessageJob(
        claimed.id,
        {
          status: "pending",
          not_before: new Date(
            now.getTime() + delayMinutes * 60_000,
          ).toISOString(),
          last_error: result.error ?? "Provider send failed",
        },
        now,
      );
      summary.retried += 1;
    } else {
      await updateMessageJob(
        claimed.id,
        {
          status: "failed",
          last_error: result.error,
        },
        now,
      );
      summary.failed += 1;
    }
  }

  return summary;
}

export async function runPhoneReminderWorker(
  settings: Settings = process.env,
  now = new Date(),
) {
  const sync = await syncPhoneReminderEvents(settings, now);
  const dispatch = await dispatchDuePhoneReminderMessages(settings, now);
  return {
    generatedAt: now.toISOString(),
    sync,
    dispatch,
  };
}
