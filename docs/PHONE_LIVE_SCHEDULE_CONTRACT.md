# Continuous AHMV schedule feed contract

The static `OFFICIAL_WEEK_META` schedule is a bounded fallback only. Production Voice AI must have a continuously refreshed authoritative server-to-server feed before that snapshot expires.

Configuration:

```env
TAKATAK_AHMV_SCHEDULE_URL=
TAKATAK_AHMV_SERVICE_TOKEN=
AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES=360
```

AHMV calls the configured HTTPS endpoint with optional `team`, `category`, and `date=YYYY-MM-DD` query parameters, a bearer service token, and `X-AHMV-Tenant: ahmverdun`.

The response must include:
- `updatedAt` as an ISO timestamp;
- top-level HTTPS `sourceUrl`;
- `events[]` with stable public event ID, ISO `startsAt`, event type/status, team/category when known, venue/address when known, and official/source HTTPS URLs when available.

Safety rules:
- stale feeds are rejected according to `AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES`;
- materially future-dated feeds are rejected;
- missing provenance is rejected;
- malformed events are dropped;
- redirects are rejected;
- response size is bounded;
- caller-facing times are converted to `America/Toronto`;
- a healthy `no_match` response is distinct from an unavailable/stale feed;
- stale/unavailable live data never overrides the verified weekly fallback;
- after the weekly fallback expires, a missing/stale live feed keeps Voice readiness red;
- no private roster, minor, billing, credential, or private-contact data belongs in this feed.
