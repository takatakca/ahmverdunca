# AHMV Phone calendar sync

Calendar access is a premium-ready AHMV Phone feature backed by GROUPE TAKATAK entitlements.

## User flow

A parent can text:

```
CALENDRIER <team>
CALENDAR <team>
CAL <team>
```

The SMS router resolves the same validated next event used by AHMV Phone.

If the parent has an active 30-day trial or TAKATAK `calendar_sync` entitlement and the next event is currently scheduled, the service returns a temporary signed AHMV link.

The temporary landing page provides:

- Google Calendar
- Apple / Outlook / standard `.ics`
- Directions to the verified arena destination

No Google OAuth is required.

## Privacy model

The signed URL contains only:

- public event ID;
- expiry timestamp;
- HMAC signature.

It does **not** contain:

- phone number;
- contact ID;
- TAKATAK identity;
- team preference;
- Twilio SID;
- message body;
- subscription information.

The landing page uses `no-store`, `noindex,nofollow`, a restrictive CSP and `Referrer-Policy: no-referrer`.

## Configuration

Keep the feature disabled until a dedicated server secret exists:

```
AHMV_CALENDAR_LINKS_ENABLED=false
AHMV_CALENDAR_LINK_SECRET=
```

The secret must be at least 32 characters and must never use the Twilio Auth Token, Supabase service key, TAKATAK service token, or any browser-exposed secret.

When enabled:

```
AHMV_CALENDAR_LINKS_ENABLED=true
AHMV_CALENDAR_LINK_SECRET=<dedicated-random-server-secret>
```

Run:

```bash
bun run check:phone-preflight --strict
```

## Security properties

- HMAC SHA-256 signature
- bounded expiry
- maximum link lifetime: 14 days
- default link lifetime: 7 days
- constant-time signature comparison
- signed event ID and expiry
- unknown event IDs return 404
- invalid or expired signatures return 403
- feature flag off returns 404

## Event authority

The calendar file is generated from the same validated AHMV schedule snapshot used by the phone/SMS service.

If the source marks an event cancelled, the calendar export uses `STATUS:CANCELLED`.

No calendar event is invented when the schedule is unpublished or unavailable.

## Time zone

AHMV public schedule times are interpreted in `America/Toronto`, then converted to exact UTC timestamps in the calendar export.

This handles daylight-saving time correctly rather than using a fixed UTC offset.

## Smart departure boundary

Calendar sync does not claim to know the parent's current location.

Future smart-departure functionality must request browser/device geolocation with explicit user permission and pass only the necessary origin/destination to an approved routing provider. It must never infer location from caller ID.
