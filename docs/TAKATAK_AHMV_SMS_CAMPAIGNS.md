# TAKATAK -> AHMV commercial SMS campaigns

GROUPE TAKATAK owns commercial campaign creation, audience intent and marketing governance.

AHMV is only the execution edge for the AHMV phone number. It must never infer marketing consent from:
- an inbound call;
- a schedule lookup;
- a requested directions SMS;
- a 30-day trial;
- an active paid membership.

## Explicit consent

AHMV recognizes explicit SMS commands:

```
OFFRES OUI
OFFRES NON
OFFERS YES
OFFERS NO
```

Equivalent PROMO / MARKETING forms are also accepted.

A plain `OUI` or `YES` is not sufficient.

Consent events are written to:

```
ahmv_phone_marketing_consent_events
```

Each event includes:
- unique evidence/event ID;
- contact reference;
- consent true/false;
- source;
- occurred timestamp;
- whether the event was applied.

Supported evidence sources:
- `sms_keyword`
- `takatak_verified`
- `carrier_opt_out`

Events are ordered and idempotent. A stale event is retained for audit but cannot overwrite a newer decision.

## Carrier STOP / START

Twilio Advanced Opt-Out remains authoritative for carrier-level STOP/START responses.

When AHMV receives a STOP indication:
- transactional SMS permission is disabled locally;
- marketing consent is disabled locally;
- the revocation is recorded as consent evidence;
- AHMV does not send a competing custom STOP response.

When AHMV receives START:
- transactional SMS permission can be restored;
- marketing consent remains false;
- the user must explicitly opt back into commercial offers.

## TAKATAK verified consent sync

TAKATAK may project verified consent only for an AHMV contact already linked to the same TAKATAK identity.

Endpoint:

```
POST /api/ahmv/takatak/marketing-consent
Authorization: Bearer <TAKATAK_AHMV_SERVICE_TOKEN>
Content-Type: application/json
```

Feature flag:

```
AHMV_TAKATAK_MARKETING_CONSENT_SYNC_ENABLED=false
```

Payload:

```json
{
  "eventId": "consent_evt_123",
  "phoneE164": "+15816666246",
  "identityId": "takatak_identity_123",
  "consent": true,
  "occurredAt": "2026-10-03T12:00:00.000Z"
}
```

Rules:
- the endpoint never creates a new AHMV contact;
- it never starts the 30-day trial;
- the phone must already exist;
- the contact must already be linked to the exact TAKATAK identity;
- consent evidence is written with source `takatak_verified`;
- stale events do not overwrite newer consent state.

## Campaign API

Endpoint:

```
POST /api/ahmv/takatak/campaigns
Authorization: Bearer <TAKATAK_AHMV_SERVICE_TOKEN>
Content-Type: application/json
```

Feature flag:

```
AHMV_PHONE_CAMPAIGNS_ENABLED=false
```

Example:

```json
{
  "campaignId": "camp_2026_10_03_001",
  "campaignName": "Registration reminder",
  "bodyFr": "Les inscriptions sont ouvertes.",
  "bodyEn": "Registration is open.",
  "audience": {
    "kind": "all_opted_in"
  },
  "scheduledAt": "2026-10-04T12:00:00.000Z"
}
```

Team audience:

```json
{
  "audience": {
    "kind": "teams",
    "teamIds": ["2025191400035011"]
  }
}
```

Only exact public AHMV team IDs are accepted.

## Eligible recipients

At queue time and again immediately before delivery, the recipient must have:
- `marketing_sms_consent=true`;
- a non-null consent timestamp;
- evidence source `sms_keyword` or `takatak_verified`;
- `transactional_sms_allowed=true`;
- access tier not blocked.

Revoking consent after campaign creation cancels that recipient's queued message at delivery time.

## Message footer

TAKATAK campaign authors supply only the campaign message body.

AHMV appends:

```
GROUPE TAKATAK / AHMV • Infos: <configured HTTPS information page> • STOP
```

Required configuration:

```
TAKATAK_SMS_CEM_INFO_URL=https://<approved-information-page>
```

The information URL must be HTTPS.

Do not enable commercial campaigns until that page contains the approved sender/contact information and is publicly accessible.

## No unsolicited opt-in campaign

Do not use this campaign system to send non-consented contacts a commercial SMS asking them to opt in.

Consent must originate from a proactive user action or a TAKATAK consent flow with its own valid evidence.

## Idempotency

`campaignId` is immutable and unique.

Reposting the same ID with the exact same campaign contract is safe.

Reposting the same ID with different:
- campaign name;
- FR/EN body;
- audience;
- schedule;
- legal information URL

is rejected as a conflict.

Each recipient job uses:

```
campaign:<campaignId>:contact:<contactId>
```

as its unique dedupe key.

## Status

```
GET /api/ahmv/takatak/campaigns?campaignId=<id>
Authorization: Bearer <TAKATAK_AHMV_SERVICE_TOKEN>
```

Returns aggregate delivery state only:
- pending
- sending
- sent
- failed
- cancelled

It does not return phone numbers or message recipient identity.

## Cancellation

```
DELETE /api/ahmv/takatak/campaigns?campaignId=<id>
Authorization: Bearer <TAKATAK_AHMV_SERVICE_TOKEN>
```

Pending jobs are cancelled.

Messages already accepted by the carrier cannot be recalled.

A cancelled campaign cannot be re-queued using the same campaign ID.

## Dispatcher

```
POST /api/ahmv/cron/phone-campaigns
Authorization: Bearer <LOVABLE_CRON_SECRET>
```

The dispatcher:
1. claims due jobs;
2. revalidates explicit marketing consent;
3. revalidates carrier permission;
4. revalidates campaign state;
5. sends through the shared Twilio adapter;
6. applies bounded retries;
7. finalizes campaigns after delivery callbacks settle.

## Launch requirements

Before setting `AHMV_PHONE_CAMPAIGNS_ENABLED=true`:

- correct AHMV Supabase migrations applied;
- Twilio production SMS verified;
- `AHMV_PHONE_ENABLED=true`;
- `TAKATAK_AHMV_SERVICE_TOKEN` configured;
- `LOVABLE_CRON_SECRET` configured;
- approved HTTPS `TAKATAK_SMS_CEM_INFO_URL` configured;
- STOP/START live-tested;
- explicit opt-in live-tested;
- no unconsented recipient can enter a campaign;
- `bun run check:phone-preflight --strict` passes.

Commercial campaigns remain disabled by default.
