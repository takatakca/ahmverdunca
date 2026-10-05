# AHMVERDUN.CA — Coordinated completion queue

Checkpoint: 2026-10-04, America/Toronto.  
Canonical AHMV main at checkpoint: `1e10ff61a87a68a2dead3048f24924637c491ba6`.

This file is an execution checkpoint, not proof that hosting/provider configuration is live. Source, CI and live acceptance are tracked separately.

## Source authority

- `origin/main` is the only integration authority.
- Create fresh task branches from the current fast-forwarded `main`.
- Do not merge stale historical Voice/preproduction/backend branches into current main.
- Do not rewrite published history; this repository is connected to Lovable.
- AHMV remains an independent product. TAKATAK shared services stay server-side and do not auto-mount a hockey dashboard into AHMV.
- Official hockey providers remain authoritative for schedules, scores, standings, registration and other official hockey facts.
- TAKATAK remains authoritative for identity, Product Catalog, pricing, billing, Stripe and entitlements.

## Current integrated source baseline

Current main includes:

- community correction/overlay system with fail-closed production gates;
- CI-enforced editability coverage for arenas, schedule, news, teams, gallery, FAQ and sponsor inventory;
- schedule corrections requiring evidence;
- detachable TAKATAK ↔ AHMV managed-services control-plane foundation;
- exact-team TAKATAK games/feed connectors;
- TAKATAK ADS publisher client with local fallback, disabled by default;
- current News Centre and verified NewsArticle structured data;
- independent private Family Experience at `/experience`, disabled by default;
- TAKATAK-owned Family product contract:
  - product `ahmv`
  - initial plan `parent_essential`
  - access entitlement `ahmv_access`
- no browser-owned AHMV price/cadence authority;
- private/noindex Family Experience and hidden membership preview excluded from the public sitemap;
- Voice v0.9 runtime, package lock, bridge, production runbooks and current-main activation authority;
- full AHM Verdun CI covering TypeScript, phone/SMS, TAKATAK boundaries, schedules, assistant, monetization, Family contract, community editability, SEO/runtime/privacy, media, deployment smoke, Voice runtime, build and release artifact.

## Active branch coordination

### AHMV PR #307 — backend control-plane continuation

Status: open, draft/stale, non-mergeable at last inspection.

Rules:

1. Rebuild from current main `1e10ff61a87a68a2dead3048f24924637c491ba6` or newer.
2. Keep backend-only.
3. Fix its publication-schedule SQL dollar-quote defect before merge.
4. Preserve all current front/Family/editability contracts.
5. Require `behind=0` and full AHM Verdun CI green before merge.

### AHMV PR #215 — Voice/SMS hardening

Status: historically green but stale/non-mergeable at last inspection.

Rules:

1. Rebuild only still-missing VIP/release-gate changes from current main.
2. Preserve current Voice v0.9 runtime and current-main activation authority.
3. Re-run AHM Verdun CI + Voice service CI + Voice Guardian.
4. Do not make live Twilio-number writes until real provider smoke and rollback readiness are proven.

### TAKATAK PR #74 — AHMV Product Catalog / entitlement gate

Status: historical CI green but stale/non-mergeable at last inspection.

Expected contract:

- product `ahmv`
- initial plan `parent_essential`
- entitlement `ahmv_access`
- one-time launch endpoint
- launch-code exchange endpoint
- live entitlement introspection endpoint
- server-to-server `TAKATAK_AHMV_SERVICE_TOKEN`

Rebuild from current TAKATAK main before merge. Do not restore native hockey dashboard navigation or browser-owned pricing.

## Ordered remaining work

| ID | Task | Source state | Live acceptance needed |
| --- | --- | --- | --- |
| A01 | Current-source baseline and agent authority | Completed | Keep main as sole authority |
| A02 | Team preference clear/sync behavior | Source implemented | Browser acceptance on deployed release |
| A03 | Retire obsolete Voice generations | Completed; old #139/#162 closed | None; use current v0.9 |
| A04 | Continuous official schedule | Source adapters/guards present | Approved live feed, provenance, freshness, expired-feed failure, exact-team checks |
| A05 | Unified news feed | UI/filters/archive present | Real connector delivery, source attribution, unavailable-provider fallback |
| A06 | Authentic gallery ↔ exact teams/seasons | Pending/partial | Asset inventory, permission/provenance, duplicate and mobile review |
| A07 | Facebook team album reconciliation | Pending | Authorized Facebook access and exact official team mapping |
| A08 | Separate AHMV product access through TAKATAK | AHMV source foundation merged (#325) | TAKATAK #74 rebuilt/deployed; launch/exchange/introspection; revoke/restore E2E |
| A09 | Catalog/subscription/VIP behavior | AHMV no longer owns browser pricing | TAKATAK catalog, billing and entitlement acceptance |
| A10 | Phone/SMS v2 | Source/CI present | Real Twilio signatures, consent, STOP/START, callbacks, retries and duplicate protection |
| A11 | Voice v0.9 | Runtime/source/CI present | Server boot, TLS/WSS, FR/EN/ES calls, interruption/reconnect, bridge readiness, recap and rollback |
| A12 | Real production release validation | Deployment automation/source present | Exact deployed SHA, public HTTPS health, routes, FR/EN/mobile, schedules/news/gallery, robots/sitemap, rollback |
| A13 | Enable release-ready integrations/indexing | Gates default OFF | Enable one integration at a time only after its live acceptance |
| A14 | Final handover | Pending | Deployed SHA, non-secret configuration inventory, monitoring, rollback and known limitations |

## Production cutover dependencies

Do not enable the following merely because source is merged:

### Community content corrections

Keep disabled until TAKATAK moderation is deployed, migration is applied and the shared token is configured on both services:

- `VITE_TAKATAK_CONTENT_CONTRIBUTIONS_VISIBLE=false`
- `TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED=false`

Then run the TAKATAK read-only AHMV content production smoke before exposing the correction UI.

### Family Experience

Keep:

`AHMV_EXPERIENCE_ENABLED=false`

until TAKATAK launch/exchange/introspection, the shared service token, AHMV session secret, Family migration and entitlement revoke/restore flow are verified end to end.

### TAKATAK ADS

Keep:

`VITE_TAKATAK_ADS_ENABLED=false`

until the TAKATAK ADS backend, event signing secret and AHMV publisher seed are deployed and tested.

### Voice / Phone

Do not route the public number or enable public phone/Voice flags until live Twilio/TLS/WSS/bridge tests and rollback snapshot/readiness pass.

## Done means

A task is not complete because code exists or an old CI run was green.

For production-affecting work, “done” requires:

1. current-main source;
2. current CI green;
3. correct production configuration without exposing secrets;
4. required database migration applied to the correct project;
5. live smoke/acceptance against the actual hostname/provider;
6. rollback path verified;
7. deployed SHA recorded.
