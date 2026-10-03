# AHMV Phone/SMS — authoritative event change alerts

This layer turns a validated provider update into a notification candidate.

It never scrapes a display sentence and never guesses whether two games are the same.

## Required identity

Each compared event must carry the same:

- provider event ID;
- exact public team ID.

The snapshot also carries:

- absolute start timestamp;
- venue;
- scheduled/cancelled status.

## Detected changes

- cancellation;
- restoration;
- time change;
- venue change.

Multiple changes can be reported together.

## Dedupe

The dedupe key includes the exact current:

- team ID;
- provider event ID;
- start timestamp;
- normalized venue;
- status.

Receiving the same provider state twice therefore produces the same key.

## Notification eligibility

A personalized change alert is a service notification, not a marketing campaign.

It requires all of:

- the parent requested SMS service;
- transactional SMS is still allowed;
- reminders are enabled for that exact team;
- the parent currently has the `game_reminders` capability through trial/premium entitlement.

Marketing consent is not required for the team service alert and must not be inferred from it.

## Delivery

This module only detects and formats alert candidates.

Automatic fan-out remains disabled until the AHMV production database has the unique queue/deduplication constraint and the authoritative exact-team connector is live.
