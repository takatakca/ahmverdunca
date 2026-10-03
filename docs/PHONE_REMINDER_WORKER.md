# AHMV Phone reminder worker

This worker turns an explicitly approved AHMV schedule-to-team mapping into reminder SMS jobs and event-change alerts.

## Safety boundary

The worker never guesses a team mapping.

The currently integrated weekly AHMV schedule contains public group labels. Reminder preferences are stored using public team IDs. The bridge between those two identifiers must therefore be configured explicitly.

Example:

```
AHMV_REMINDER_TEAM_MAP_JSON={"Junior":"2025191400035011"}
```

Only team IDs present in the public AHMV team directory are accepted.

If a group is not mapped, it is ignored for reminders.

## Feature flag

Keep this false until the AHMV communication migrations, exact mapping, Twilio configuration and live QA are complete:

```
AHMV_PHONE_REMINDERS_ENABLED=false
```

The worker also requires:

```
AHMV_PHONE_ENABLED=true
LOVABLE_CRON_SECRET=<server secret>
TWILIO_ACCOUNT_SID=<server secret>
TWILIO_AUTH_TOKEN=<server secret>
AHMV_WEBHOOK_ORIGIN=https://ahmverdun.ca
```

## Cron endpoint

```
POST https://ahmverdun.ca/api/ahmv/cron/phone-reminders
Authorization: Bearer <LOVABLE_CRON_SECRET>
```

The endpoint is disabled unless `AHMV_PHONE_REMINDERS_ENABLED=true`.

## What each run does

1. Reads the validated AHMV schedule snapshot.
2. Applies only the explicit group-to-team mapping.
3. Converts local Montreal/Toronto event times to exact UTC instants.
4. Stores a minimal authoritative event snapshot.
5. Detects cancellation, restoration, time changes and venue changes.
6. Cancels old pending reminders when the authoritative event changes.
7. Queues an immediate change alert for eligible subscribers.
8. Replans the game reminder against the new authoritative event state.
9. Claims due reminder/change jobs.
10. Revalidates the current event snapshot, reminder preference, SMS consent and trial/premium entitlement.
11. Sends through the same Twilio queue/provider adapter used by the rest of AHMV Phone.
12. Uses bounded provider retries.

## Eligibility

A reminder/change alert requires all of the following at delivery time:

- the parent requested SMS service;
- transactional SMS is still allowed;
- reminders remain enabled for that exact team;
- the parent still has the `game_reminders` entitlement through an active 30-day trial or TAKATAK premium entitlement;
- the queued event still matches the current authoritative event snapshot.

Marketing consent is not used for game reminders. These are service alerts tied to a reminder the user explicitly enabled.

## Event state

The table `ahmv_phone_event_snapshots` stores only:

- provider event ID;
- public team ID;
- start time;
- venue;
- status;
- timestamps.

No roster, player, child, address or private hockey record is stored.

## Dedupe

Every queued reminder/change message includes the contact ID in its dedupe key. This prevents duplicate messages while still allowing the same event to be sent to multiple subscribed parents.

## Changes

When an event changes:

- pending reminders for the old state are cancelled;
- an event-change alert is queued;
- a new reminder is planned from the new start time if still applicable.

A stale queued message is checked again against the authoritative snapshot immediately before sending and is cancelled if it no longer matches.

## Deployment order

1. Apply all AHMV phone migrations.
2. Configure the exact reminder team map.
3. Run `bun run check:phone-preflight --strict`.
4. Keep the reminder flag false.
5. Validate Twilio/Supabase live paths.
6. Enable the reminder worker privately.
7. Run a controlled reminder test.
8. Verify database jobs and Twilio delivery callback.
9. Only then use a recurring cron schedule.
