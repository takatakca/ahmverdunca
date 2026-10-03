# TAKATAK -> AHMV membership sync

GROUPE TAKATAK is the commercial authority for the AHMV Phone/SMS membership.

AHMV does **not** create subscriptions, charge cards, or make Stripe decisions. It only receives a minimal server-to-server entitlement projection.

## Product code

Current AHMV Phone membership product code:

```
hockey_member_weekly_10
```

The exact billing price and Stripe configuration remain owned by TAKATAK.

## Endpoint

```
POST https://ahmverdun.ca/api/ahmv/takatak/membership
Authorization: Bearer <TAKATAK_AHMV_SERVICE_TOKEN>
Content-Type: application/json
```

The endpoint is disabled unless:

```
AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED=true
```

## Payload

Active membership:

```json
{
  "eventId": "evt_unique_123",
  "tenant": "ahmverdun",
  "phoneE164": "+15816666246",
  "identityId": "takatak_identity_123",
  "productCode": "hockey_member_weekly_10",
  "status": "active",
  "expiresAt": "2026-10-10T12:00:00.000Z",
  "occurredAt": "2026-10-03T12:00:00.000Z"
}
```

Inactive membership:

```json
{
  "eventId": "evt_unique_124",
  "tenant": "ahmverdun",
  "phoneE164": "+15816666246",
  "identityId": "takatak_identity_123",
  "productCode": "hockey_member_weekly_10",
  "status": "inactive",
  "occurredAt": "2026-10-10T12:00:00.000Z"
}
```

Blocked:

```json
{
  "eventId": "evt_unique_125",
  "tenant": "ahmverdun",
  "phoneE164": "+15816666246",
  "identityId": "takatak_identity_123",
  "productCode": "hockey_member_weekly_10",
  "status": "blocked",
  "occurredAt": "2026-10-10T12:05:00.000Z"
}
```

## Rules

- `eventId` is globally idempotent.
- `tenant` must be exactly `ahmverdun`.
- `phoneE164` must be a valid E.164 phone.
- `productCode` must be exactly `hockey_member_weekly_10`.
- active status requires a future `expiresAt`.
- event timestamps more than five minutes in the future are rejected.
- events are ordered using `occurredAt`; stale events are audited but do not overwrite newer state.
- one TAKATAK identity can be linked to only one AHMV phone contact.
- a phone contact already linked to another TAKATAK identity cannot be silently reassigned.
- the database projection uses a transaction-level advisory lock and row lock.
- AHMV premium capability expires automatically when the projected TAKATAK expiry passes.

## Access projection

`active`:
- AHMV contact tier -> `premium`
- `premium_expires_at` -> exact TAKATAK expiry

`inactive`:
- if original 30-day AHMV trial is still active -> `trial`
- otherwise -> `guest`
- `premium_expires_at` cleared

`blocked`:
- contact tier -> `blocked`
- `premium_expires_at` cleared

## Consent isolation

Membership sync never grants marketing permission.

For a new contact created from a TAKATAK active membership event:

- `sms_consent=false`
- `marketing_sms_consent=false`
- `transactional_sms_allowed=true`

This means membership access can exist before the member explicitly asks AHMV to text them.

Existing SMS/marketing consent is not changed by membership events.

## Atomicity

The Supabase RPC:

```
public.ahmv_apply_takatak_membership_sync(...)
```

performs ordering, identity collision checks, contact projection and audit insertion in one PostgreSQL transaction.

The function:
- is `SECURITY DEFINER`;
- fixes `search_path=public`;
- is revoked from `public`;
- is executable only by `service_role`.

## AHMV database fields

`ahmv_phone_contacts.premium_expires_at` is a cache of the TAKATAK entitlement expiry, not a billing record.

Audit table:

```
ahmv_phone_entitlement_sync_events
```

stores:
- event ID;
- contact reference;
- TAKATAK identity ID;
- product code;
- membership status;
- entitlement expiry;
- occurred/received timestamps.

It does not store Stripe card/payment credentials.

## Remote entitlement fallback

AHMV can also use the existing TAKATAK entitlement lookup endpoint for a real-time capability check.

An `active=true` response is accepted only when it includes a valid future `expiresAt`.

This prevents a stale or malformed remote response from granting indefinite premium access.

## Launch order

1. Apply all AHMV phone database migrations to the correct AHMV Supabase project.
2. Configure `TAKATAK_AHMV_SERVICE_TOKEN` on both systems.
3. Keep `AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED=false`.
4. Run phone CI and `bun run check:phone-preflight --strict`.
5. Send controlled active/inactive/blocked events from TAKATAK staging.
6. Verify idempotency and out-of-order behavior.
7. Verify membership sync does not alter SMS/marketing consent.
8. Enable the membership sync endpoint privately.
9. Only then connect the production TAKATAK subscription lifecycle.

