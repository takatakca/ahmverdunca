# AHMV Phone / SMS subsystem

This folder contains the communication edge used by AHM Verdun. It is intentionally separate from official hockey operations.

## Module map

- `twilio/` — provider-facing adapters only. Validate Twilio requests and generate provider responses. Do not put hockey or billing rules here.
- `conversation/` — user intent and command parsing.
- `contacts/` — phone-based communication profile, 30-day introductory access, team preferences, interaction audit.
- `teams/` — deterministic public-team resolution. Never guess between teams that share a category/level/name.
- `schedules/` — read-only answers built from approved schedule snapshots.
- `arenas/` — verified arena destination resolution and Google Maps / Apple Maps / Waze links.
- `messaging/` — transactional SMS delivery and delivery-state persistence.
- `entitlements/` — base/trial/premium capability gates.
- `takatak/` — tenant-scoped GROUPE TAKATAK identity/entitlement boundary.
- `audit/` — reserved for centralized audit/export helpers.

## Access model

Base information remains available:
- next validated event;
- requested arena directions.

The introductory 30-day window unlocks premium-ready commands:
- today;
- tomorrow;
- week;
- saved primary team;
- future reminder/calendar capabilities.

After the introductory period, those personalized capabilities require a valid GROUPE TAKATAK entitlement. AHMV does not mint a paid subscription locally.

A caller phone number is a communication identifier, not sufficient authentication for sensitive account changes.

## SMS commands

Default language is French. Prefix with `EN ` for English.

Examples:
- `M11 groupe 5` — next event
- `AUJOURD'HUI Junior`
- `DEMAIN Junior`
- `SEMAINE Junior`
- `SAUVE M13A`
- `EN WEEK Junior`
- `AIDE` / `HELP`

STOP/START and carrier opt-out behavior stay under Twilio Advanced Opt-Out. An inbound call or transactional request never grants marketing consent.

## Voice flow

1. Language.
2. Offer requested SMS follow-up.
3. Short menu.
4. Ask for exact team/group.
5. Answer with the next validated event.
6. If SMS was requested, send the detailed text and navigation destination.
7. Hang up promptly.

After bounded speech-recognition retries, the service can send an SMS fallback asking the caller to reply with the team, then ends the call.

## Navigation

A normal phone call does not provide trusted live GPS coordinates. The service sends the verified destination. Google Maps, Apple Maps or Waze on the user's device can then use device location with the user's permission.

Future smart-departure features must request location on the web/app side and must not infer a caller's location from caller ID.

## Authority

Official schedule/results providers remain authoritative for hockey data.

GROUPE TAKATAK owns the surrounding commercial communication layer:
- identity mapping;
- membership entitlement;
- messaging preferences;
- campaigns;
- analytics;
- subscription/billing integration;
- dashboard permissions.

## Production gates

Do not mark the system public until all are true:

- database migration applied;
- CI passes;
- server secrets are configured;
- production app is deployed;
- Twilio number routing is verified;
- Voice webhook POST points to `/api/ahmv/twilio/voice`;
- Messaging webhook POST points to `/api/ahmv/twilio/sms`;
- status callback POST points to `/api/ahmv/twilio/status`;
- real French and English calls pass;
- real inbound and outbound SMS pass;
- opt-out behavior is verified;
- carrier delivery is verified;
- only then set `AHMV_PHONE_PUBLIC=true`.

See `docs/AHMV_PHONE_V2_DEVELOPER_MAP.md` for the console handoff.
