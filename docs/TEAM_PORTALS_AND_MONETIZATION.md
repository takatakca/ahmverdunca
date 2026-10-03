# AHMV team portals, GROUPE TAKATAK bridge and monetization

## Purpose

AHM Verdun remains the public hockey portal. Exact team mini-sites use the public AHMV team ID as their stable key.

GROUPE TAKATAK remains the authority for social-provider OAuth, subscriptions, cross-app permissions, and future payment/campaign services. AHMV must never store Facebook, Instagram, X, TikTok or YouTube provider tokens in browser code.

## Exact team personalization

Browser-only family bookmarks are stored locally on the device. Multiple exact public team IDs are supported. No player identity is required.

The public team ID is not a roster identifier. It is used only to route families to the correct public team page, schedule, results and approved public content.

## GROUPE TAKATAK team feed bridge

Server-only settings:

- `TAKATAK_TEAM_FEED_ENABLED=true|false`
- `TAKATAK_TEAM_FEED_ORIGIN=https://takatak.ca`
- `TAKATAK_TEAM_FEED_TOKEN=<server-only bearer token>`

Optional browser flag:

- `VITE_TAKATAK_TEAM_FEED_ENABLED=true|false`

Both sides should remain disabled until the GROUPE TAKATAK endpoint exists and the production token is provisioned.

Expected upstream endpoint:

`GET /api/integrations/ahmv/team-feed?teamId=<exact-public-team-id>`

AHMV accepts only approved public feed fields and never forwards upstream provider tokens or internal tenant metadata.

## Development support

The support widget is separate from AHM Verdun donations and team fundraising. The beneficiary is always displayed in the UI.

Browser settings:

- `VITE_SUPPORT_ENABLED=true|false`
- `VITE_SUPPORT_BENEFICIARY=GROUPE TAKATAK`
- `VITE_SUPPORT_URL_10=https://...`
- `VITE_SUPPORT_URL_25=https://...`
- `VITE_SUPPORT_URL_50=https://...`
- `VITE_SUPPORT_URL_100=https://...`
- `VITE_SUPPORT_URL_CUSTOM=https://...`

Use provider-created HTTPS payment links. Do not put payment secrets in VITE variables.

## Google AdSense

Browser settings:

- `VITE_ADSENSE_ENABLED=true|false`
- `VITE_ADSENSE_CLIENT=ca-pub-<digits>`
- `VITE_ADSENSE_SLOT=<numeric-slot-id>`

AdSense remains off until the real publisher ID, slot, privacy disclosures and applicable consent requirements are approved.

The site loads no AdSense script while `VITE_ADSENSE_ENABLED` is false.

## Release gates

Every CI and deployment path runs:

- GROUPE TAKATAK team-feed security tests
- monetization configuration validation
- existing AHMV phone/SMS tests
- data, SEO, runtime, navigation, media, canonical and external-link gates

Do not bypass these checks to activate a connector.
