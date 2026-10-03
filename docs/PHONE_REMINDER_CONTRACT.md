# AHMV Phone/SMS — reminder contract

Reminder preferences are a personalized service capability. They are not marketing consent.

## SMS commands

French:

```
RAPPEL M13A
RAPPEL OFF M13A
```

English:

```
REMIND M13A
REMIND OFF M13A
```

Rules:

- enabling reminders requires an active 30-day trial or a GROUPE TAKATAK membership entitlement;
- disabling reminders is always allowed when the contact/team can be identified;
- STOP/START remain carrier/Twilio opt-out commands and are never reused as team-reminder controls;
- ambiguous teams are rejected instead of guessed;
- the preference is stored against the exact public team ID.

## Scheduling boundary

The planner accepts only an event with:

- provider event ID;
- exact public team ID;
- absolute start timestamp;
- venue;
- scheduled/cancelled status.

It does not infer an event from a display name.

Default lead time is 120 minutes:

```
AHMV_GAME_REMINDER_LEAD_MINUTES=120
```

The planner generates a dedupe key containing the team ID, provider event ID and exact start timestamp. If the authoritative provider reschedules the same event, the changed timestamp produces a new key.

## Delivery is intentionally not active yet

No cron currently sends these reminders.

Before automatic delivery is enabled, the production database must have a uniqueness/deduplication guarantee for reminder jobs and the authoritative exact-team event connector must be live.

This prevents duplicate texts and prevents reminders based on inferred/unverified hockey data.
