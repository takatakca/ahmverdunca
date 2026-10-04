# TAKATAK ADS - AHMV publisher integration

AHM Verdun keeps its local advertising inventory as the always-available fallback and can later become a publisher for the GROUPE TAKATAK advertising network.

## Runtime priority

House sponsor placements:

1. TAKATAK ADS network creative, only when the browser-safe publisher client is explicitly enabled and receives a valid fill.
2. Existing AHMV local visual creatives and local business cards.

AdSense placements:

1. TAKATAK ADS when explicitly enabled and filled.
2. Google AdSense when explicitly configured.
3. Existing AHMV local visual creatives and local business cards.

A network timeout, CORS failure, invalid payload, no-fill response, ad blocker or tracking failure must never remove the local AHMV inventory.

## Privacy boundary

The browser publisher sends only contextual advertising fields:

- publisher code
- placement code
- language
- coarse device class

It does not read or send parent identity, email, phone, cookies, localStorage/sessionStorage identifiers, browser fingerprints or precise geolocation. Browser requests use `credentials: "omit"`.

No TAKATAK service token, signing key, Stripe secret or member entitlement belongs in a `VITE_` variable.

## Placement mapping

Current network placement codes:

- general / arenas / partners -> `site-inline-01`
- home -> `home-main-01`
- schedules -> `schedule-inline-01`
- team pages -> `team-inline-01`
- news -> `news-inline-01`
- gallery -> `gallery-inline-01`

Arena- and partner-specific network placements can be introduced later by the central publisher catalog without changing the local fallback inventory.

## Enablement

The publisher client is disabled by default. Do not enable it until the central TAKATAK ADS serve/event endpoints and the AHMV publisher seed are deployed and tested.

```env
VITE_TAKATAK_ADS_ENABLED=true
VITE_TAKATAK_ADS_ORIGIN=https://takatak.ca
VITE_TAKATAK_ADS_PUBLISHER=ahmv
```

All network creative destination, click and image URLs are rejected by the AHMV client unless they use HTTPS.

## Measurement

When supported, an impression is sent only after at least 50% of the network creative has remained visible for one second. Click tracking never blocks navigation. Tracking tokens are treated as short-lived opaque values issued by the central service.

## Production rule

Enabling TAKATAK ADS is a separate operational cutover. The AHMV deployment may ship this publisher capability while keeping `VITE_TAKATAK_ADS_ENABLED=false`; that state preserves the current live advertising experience unchanged.
