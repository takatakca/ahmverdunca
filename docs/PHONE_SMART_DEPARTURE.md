# AHMV Phone smart departure

Smart departure is a premium-ready AHMV Phone feature.

## SMS commands

Parents can request it with:

```
DÉPART <team>
DEPART <team>
LEAVE <team>
ROUTE <team>
```

The SMS router resolves the same validated next event used by AHMV Phone.

If the parent has an active trial/premium `smart_departure` entitlement and the next event is currently scheduled, the system sends a temporary signed AHMV link.

## Location privacy

AHMV does not infer location from caller ID.

The landing page requests browser/device geolocation only after the parent taps the location button.

The browser sends latitude/longitude to the AHMV server only for the requested calculation.

The smart-departure endpoint does not persist the submitted origin. The response explicitly reports `locationStored: false`.

The signed URL contains only public event identity, an expiry and an HMAC signature. It contains no phone number or TAKATAK identity.

## Navigation fallback

The page always exposes the verified arena destination plus:

- Waze
- Google Maps
- Apple Maps

If no live route/traffic provider is configured, the page does not invent an ETA. It tells the user to open a navigation app instead.

## Optional TAKATAK route provider

Server-only configuration:

```
TAKATAK_ROUTE_MATRIX_URL=
TAKATAK_ROUTE_SERVICE_TOKEN=
```

The provider request contains only:

- tenant: `ahmverdun`
- source: `phone-smart-departure`
- driving mode
- user-approved origin latitude/longitude
- verified arena destination address
- event start timestamp

It must not receive the user's phone number, Twilio SID, TAKATAK identity, message history or marketing profile.

Expected response:

```json
{
  "durationMinutes": 31,
  "trafficDurationMinutes": 39,
  "distanceKm": 17.4,
  "provider": "provider-name"
}
```

Traffic duration falls back to normal duration only when the provider omits a separate traffic duration. AHMV itself never fabricates route time.

## Recommended departure

```
recommended departure
= event start
- traffic duration
- arrival buffer
```

Default arrival buffer:

```
AHMV_DEPARTURE_ARRIVAL_BUFFER_MINUTES=30
```

Allowed buffer range is 0–180 minutes.

## Signed link configuration

```
AHMV_SMART_DEPARTURE_ENABLED=false
AHMV_DEPARTURE_LINK_SECRET=
```

The secret must be dedicated, server-only and at least 32 characters.

The signed link lifetime defaults to 24 hours and is capped at 7 days.

## Endpoints

Landing:

```
GET /api/ahmv/departure?event=<id>&exp=<unix>&sig=<hmac>
```

Estimate:

```
POST /api/ahmv/departure/estimate
content-type: application/json
```

The estimate POST repeats the signed event fields and adds a browser-approved origin.

## Browser security

The landing response uses:

- `no-store`
- `noindex,nofollow`
- `Referrer-Policy: no-referrer`
- geolocation permission restricted to self
- CSP allowing only its own estimate request
- no external analytics/tracking scripts

## Launch

Keep `AHMV_SMART_DEPARTURE_ENABLED=false` until the signing secret is configured and the flow passes QA.

A traffic provider is optional for launch of the navigation handoff, but required before presenting a calculated traffic-aware departure time as available.
