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


## TAKATAK endpoint

The reviewed AHMV consumer URL is:

```
https://takatak.ca/api/integrations/ahmv/schedule
```

Required request headers:

```
Authorization: Bearer <TAKATAK_AHMV_SERVICE_TOKEN>
X-AHMV-Tenant: ahmverdun
```

TAKATAK is a normalization/distribution layer only. A fresh snapshot must first be ingested from a reviewed official AHMV source. If no fresh official snapshot exists, the endpoint returns unavailable rather than manufacturing an empty schedule.

Current official-source discovery indicates AHM de Verdun publishes its organization schedule through Rétroaction. The importer should use a reviewed Rétroaction export/API/calendar feed (or another AHMV-authorized publisher), not HTML scraping.
