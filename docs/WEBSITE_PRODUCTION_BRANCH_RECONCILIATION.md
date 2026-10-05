# AHMV website-production branch reconciliation

**Audit date:** 2026-10-05  
**Production authority:** `takatakca/ahmverdunca:main`  
**Certified production SHA at audit:** `b33f45adeb3a482c323725a8d07a184977e4c752`  
**Production evidence:** AHM Verdun CI #1066, Voice Guardian #50, Auto deploy #835, exact compiled runtime SHA accepted by `/healthz.release`.

This document closes the historical `website-production-*` branch train without treating old diverged branches as deployment authority.

## Method

1. Inventory every branch matching `website-production-*`.
2. Compare each branch against the current certified `main`.
3. For branches with no commits ahead of current `main`, classify them as absorbed.
4. For branches with historical commits still ahead, inspect the intended feature and verify whether the same or safer outcome exists in current source.
5. Never merge a months/commits-behind branch wholesale over current production.
6. Keep external-provider gates fail-closed when the missing dependency is authorization, inventory, credentials or an authoritative feed rather than code.

## Inventory

Sixty-nine historical branches were found:

```text
website-production-2-premium
website-production-3-team-microsites
website-production-4-front-demo
website-production-5-member-demo-switch
website-production-6-smart-parent-deck
website-production-7-parent-quick-access
website-production-8-parent-command-home
website-production-9-social-share-polish
website-production-10-pwa-install
website-production-11-compact-mobile-menu
website-production-12-partner-showcase
website-production-13-game-day-mobile
website-production-14-house-ad-library
website-production-15-arena-directions
website-production-16-compact-welcome-popup
website-production-16b-compact-welcome-popup
website-production-17-visual-help-resources
website-production-18-footer-parent-hub
website-production-19-sponsor-coverage
website-production-20-access-gateway
website-production-21-search-parent-command
website-production-22-story-album-details
website-production-23-arena-detail-directions
website-production-24-motion-depth
website-production-25-home-exact-team
website-production-26-game-day-mode
website-production-27-team-game-day-nav
website-production-28-adsense-auto-ready
website-production-29-no-fake-game-times
website-production-30-gallery-archive-expansion
website-production-31-rotating-ad-network
website-production-32-final-schedule-purification
website-production-33-home-parent-purification
website-production-34-remove-construction-language
website-production-35-contact-finalization
website-production-36-final-team-surfaces
website-production-37-public-language-cleanup
website-production-38-member-preview-polish
website-production-39-mobile-media-priority
website-production-40-home-parent-order
website-production-41-member-adsense
website-production-41-member-adsense-consistency
website-production-42-revenue-surfaces
website-production-43-sponsor-conversion
website-production-45-game-day-v2
website-production-46-coach-experience
website-production-47-gallery-final
website-production-48-news-final
website-production-49-seo-schema-hardening
website-production-arena-event-dark-current
website-production-assistant-nudge
website-production-attention-orchestration
website-production-compact-mobile-menu
website-production-compact-team-finder-mobile
website-production-frontpage-color-flip
website-production-frontpage-density-v2
website-production-frontpage-interaction-v3
website-production-header-menu-visibility
website-production-home-authentic-media
website-production-home-dark-community
website-production-home-dark-editorial
website-production-home-dark-newsroom
website-production-house-ad-gallery
website-production-local-ads-swipe
website-production-logo-gallery-2026
website-production-purify-onboarding
website-production-runway-ad-import
website-production-touch-slide-hockey-wall
```

## Fully absorbed branch ranges

The following numbered branches have no commits ahead of the certified current `main` and are therefore already contained by later work:

- `website-production-2-*` through `website-production-15-*`
- `website-production-16b-*` through `website-production-40-*`

They must not be merged again.

## Historical branches with unique commits but current outcome already present

### Onboarding / attention

- `website-production-16-compact-welcome-popup` — historical ungated popup variant. Current source is safer: `VITE_COMMUNICATIONS_PREVIEW_ENABLED` defaults OFF, the preview is non-blocking, attention-aware and coordinated with navigation/assistant/install surfaces.
- `website-production-assistant-nudge` — current assistant includes the one-session nudge behavior and voice affordance, behind `VITE_ASSISTANT_NUDGE_ENABLED`.
- `website-production-attention-orchestration` — current install prompt and communication preview use attention-surface coordination and do not stack over active navigation/assistant UI.
- `website-production-purify-onboarding` — current onboarding is gated/non-blocking by default.

### Navigation / mobile interaction

- `website-production-compact-mobile-menu` — current header already uses compact mobile quick-action typography.
- `website-production-compact-team-finder-mobile` — current schedule finder already uses the compact two/three-column mobile layout.
- `website-production-header-menu-visibility` — current mobile-navigation contract and header layering guards supersede the historical branch.
- `website-production-local-ads-swipe` — current `HouseSponsorSlot` already uses mobile snap/swipe and pauses auto-rotation on mobile.
- `website-production-touch-slide-hockey-wall` — current real-hockey wall already uses mobile touch-snap/swipe rails.

### Front-page visual system

- `website-production-frontpage-color-flip` — current styles include accessible 3D flip-card behavior and reduced-motion fallback.
- `website-production-frontpage-density-v2` — current homepage includes `HomeCreativeRail`.
- `website-production-frontpage-interaction-v3` — current assistant exposes voice/microphone discoverability.
- `website-production-home-authentic-media` — current homepage uses the real AHMV hockey wall.
- `website-production-home-dark-community`, `website-production-home-dark-editorial`, `website-production-home-dark-newsroom` — their dark/authentic-media composition outcomes are represented in the later current homepage; these are historical styling alternatives, not additive release units.

### Revenue / sponsors / advertising surfaces

- `website-production-41-member-adsense` and `website-production-41-member-adsense-consistency` — current source already contains the AdSense slot/controller boundary. Browser activation remains configuration-gated; these historical variants are not merged over current monetization rules.
- `website-production-42-revenue-surfaces` — current homepage imports and renders `RevenueActionPanel`.
- `website-production-43-sponsor-conversion` — current `/partenaires` already contains the sponsor-conversion copy, inventory surfaces and no-invented-metrics rules.
- `website-production-house-ad-gallery` — current partners page iterates the house creative library while keeping it distinct from official sponsors.
- `website-production-runway-ad-import` — current source contains the Runway creative assets and classification manifest. Entries remain marked for sponsor classification and must not be promoted into real paid inventory without verified advertiser identity/authorization.

### Parent / coach / game-day flows

- `website-production-45-game-day-v2` — current `TeamGameCenter` contains the exact-data unavailable copy, venue address and “Partir maintenant / Leave now” directions action.
- `website-production-46-coach-experience` — current coach page includes the coach command centre and `CoachMatchDayChecklist`.

### Gallery / news / SEO

- `website-production-47-gallery-final` — current gallery includes season + event-type filters and reset-empty-state behavior, plus later consent protections.
- `website-production-48-news-final` — current article page ranks related news by category/team relevance.
- `website-production-49-seo-schema-hardening` — current article page contains validated `NewsArticle` structured data and CI coverage.
- `website-production-arena-event-dark-current` — current event/arena surfaces already contain the dark competition styling introduced by this branch.

### Branding

- `website-production-logo-gallery-2026` — current public branding contains the AHMV Gallery logo assets. The historical one-time importer/cleanup sequence is not runtime authority.

## Later safety work on top of the branch train

Current `main` also contains release/safety work that did not exist in the old numbered train:

- exact compiled runtime SHA proof through `/healthz.release`;
- required approved cPanel/Passenger restart command;
- fail-closed SFTP-only production activation;
- weekly schedule metadata consistency guard;
- Family Experience session/exchange/introspection/revoke/restore CI contract;
- News Centre and team-microsite editability regression coverage;
- imported youth-media consent fail-closed behavior;
- explicit `AHMV_PHONE_CARRIER=twilio` proof before public Phone/SMS can become active.

These later protections are why historical branches must not be merged wholesale.

## What remains genuinely external

The remaining project walls are not forgotten website-production branches:

1. protected `TAKATAK_STAGING_DATABASE_URL` so the guarded TAKATAK staging reconciliation can certify migration history;
2. exact authoritative timestamp and/or approved continuous feed for trusted schedule snapshot ingestion;
3. legitimate Team Feed subscription/provider authorization and approved Meta assets;
4. real authorized ADS subscriptions/campaigns/creatives/events before TAKATAK ADS browser delivery is enabled;
5. real NumberBarn → intended Twilio ownership/routing proof and live Phone/SMS acceptance;
6. standalone Voice host TLS/WSS/credentials/preproduction attestation and real-call acceptance;
7. association legal/privacy/media approvals before public indexing is enabled.

No synthetic value should be used to make these dependencies appear complete.

## Release rule

Only current `main`, green CI/Guardian, exact runtime SHA proof and subsystem-specific live acceptance define release state. Historical `website-production-*` branches are retained only as implementation history.
