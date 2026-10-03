# TAKATAK ADS — AHMV publisher integration

AHM Verdun is the first pilot publisher for the GROUPE TAKATAK proprietary local advertising network.

## Runtime priority

Every existing AHMV house sponsor slot now follows this order:

1. **TAKATAK ADS** paid/local inventory.
2. Existing house sponsor inventory when no TAKATAK campaign fills the slot.

The existing homepage AdSense slot follows:

1. **TAKATAK ADS**.
2. Google AdSense when explicitly configured.
3. Existing AHMV house sponsor inventory.

This lets TAKATAK monetize its own traffic first without deleting the current fallback system.

## Privacy

The publisher sends only contextual fields needed for ad selection:

- publisher code
- placement code
- language
- coarse device class

It does **not** send:

- email
- phone
- member identity
- cookies
- localStorage identifiers
- browser fingerprint
- precise geolocation

The browser never receives an ADS signing secret or TAKATAK service token.

## Placement mapping

Existing AHMV placement names map into the central TAKATAK inventory:

- general pages -> `site-inline-01`
- home -> `home-main-01`
- schedule -> `schedule-inline-01`
- team pages -> `team-inline-01`
- news -> `news-inline-01`
- gallery -> `gallery-inline-01`

The central publisher seed is owned by the TAKATAK dashboard repository.

## Enablement

Do not enable the browser client until the TAKATAK backend migration and AHMV publisher seed are deployed.

Then set:

```env
VITE_TAKATAK_ADS_ENABLED=true
VITE_TAKATAK_ADS_ORIGIN=https://takatak.ca
VITE_TAKATAK_ADS_PUBLISHER=ahmv
```

No secret belongs in a `VITE_` variable.

## Fail-safe behavior

If the TAKATAK endpoint is unavailable, returns no fill, rejects the AHMV origin, or the request is blocked by the browser, AHMV renders its configured fallback inventory. Advertising must never make the hockey site unusable.

## Viewability and click measurement

An impression is emitted only after at least 50% of the TAKATAK ad is visible for one second when IntersectionObserver is available.

A click event is sent with `keepalive` and never blocks the outbound navigation.

The event token is created by the central TAKATAK server and is short-lived, signed and deduplicated there.
