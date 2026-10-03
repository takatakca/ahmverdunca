# AHMV Phone/SMS → TAKATAK Dashboard contract

This document defines the commercial/operational boundary for the phone and SMS service.

## Ownership

AHMV remains the hockey-information tenant.

GROUPE TAKATAK owns the surrounding commercial communication platform:

- master contact/identity resolution;
- memberships and entitlements;
- billing integration;
- communication preferences;
- campaign management;
- aggregate analytics;
- dashboard permissions.

The AHMV phone service must continue to function for base public information even if TAKATAK analytics/event delivery is temporarily unavailable.

## Events

The AHMV application can publish two event classes to the configured HTTPS TAKATAK endpoint.

### contact_sync

Used when TAKATAK needs to resolve the communication contact to the master identity.

Contains:

- tenant = ahmverdun;
- source = phone;
- AHMV communication contact reference;
- E.164 phone number;
- language;
- local access tier;
- trial expiry;
- requested-SMS consent;
- marketing-SMS consent;
- optional known TAKATAK identity ID;
- event timestamp.

This is the only standard phone event that carries the raw E.164 number.

### interaction

Used for operational analytics.

Contains:

- tenant;
- source;
- contact reference;
- optional TAKATAK identity ID;
- channel: voice / sms / system;
- intent;
- outcome;
- optional team code;
- optional arena slug;
- timestamp.

It does **not** carry the raw phone number, SMS body, speech transcript, Twilio Auth Token or provider credential.

## Event delivery

Server configuration:

```
TAKATAK_AHMV_EVENTS_URL=
TAKATAK_AHMV_SERVICE_TOKEN=
```

Rules:

- HTTPS only.
- Bearer token is server-only.
- Three-second timeout.
- Event delivery failure must not block a parent's call or SMS response.
- No provider OAuth/Twilio credentials are sent to TAKATAK through this event contract.

## Protected aggregate summary

Future TAKATAK Dashboard widgets may call:

```
GET https://ahmverdun.ca/api/ahmv/phone-ops/summary
Authorization: Bearer <TAKATAK_AHMV_SERVICE_TOKEN>
```

The endpoint is disabled unless:

```
AHMV_PHONE_OPS_ENABLED=true
```

Returned data is aggregate-only:

- total communication contacts;
- active 30-day trials;
- premium contacts;
- explicit marketing SMS opt-ins;
- voice/SMS interaction counts;
- sent/failed/pending SMS counts.

It does not return:

- phone numbers;
- names;
- SMS content;
- transcripts;
- Twilio SIDs;
- auth credentials.

## Trial lifecycle

The 30-day GROUPE TAKATAK introductory period is separate from marketing consent.

Allowed service lifecycle:

1. trial welcome after the user requested SMS service;
2. three-day expiry notice;
3. expiry notice.

A separate membership promotional offer is only eligible when explicit marketing SMS consent exists.

Calling AHMV, receiving a requested transactional text, or starting the 30-day trial does not automatically grant marketing consent.

## Campaigns

Do not run general campaigns from the AHMV app.

Campaign creation, audience rules, consent enforcement, scheduling, suppression lists and reporting belong in TAKATAK Dashboard. The AHMV app may later receive approved tenant-scoped campaign delivery jobs from TAKATAK.

## Data minimization

Default analytics should use contact references and TAKATAK identity IDs instead of repeatedly transmitting the raw phone number.

Do not store voice transcripts by default.

Do not put player/minor roster data into communication analytics.
