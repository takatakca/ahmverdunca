# AHMVERDUN.CA — Coordinated completion queue

Checkpoint: 2026-10-07, America/Toronto.  
Canonical AHMV source authority: `takatakca/ahmverdunca:main`.  
Verified deployed AHMV production release: `5d7d545782da9f8aff9e69f9c76eb2082c30f453`.  
Canonical TAKATAK backend repository: `takatakca/takatak-v1`.  
Current TAKATAK main: `f13932daf713dd39d64ccc6f6a889f3a97ec12c6`.

This file separates **merged source**, **deployed production**, **database state**, **provider authorization**, and **live acceptance**. Missing provider credentials or approvals must never be replaced with synthetic data or fake readiness.

## 2026-10-07 live refresh

- AHMV `main` is `5d7d545782da9f8aff9e69f9c76eb2082c30f453`.
- AHM Verdun CI #1089 succeeded for that SHA and automatic production deploy #858 succeeded, including release activation, Passenger restart, health, homepage, core routes, robots and sitemap verification.
- PR #369 merged the public-copy cleanup for partner/promotion surfaces.
- PR #370 merged visible gallery-photo recovery and dark frontend continuity.
- The current final-consolidation pass is intentionally limited to remaining public UX regressions: bottom-nav safe area, unambiguous active mobile navigation, dark continuity on the teams directory and removal of internal TAKATAK wording from public sponsor labels.
- TAKATAK `main` is `f13932daf713dd39d64ccc6f6a889f3a97ec12c6`; CI #518 succeeded.
- TAKATAK staging migration reconciliation #54 still fails at the protected `TAKATAK_STAGING_DATABASE_URL` validation step, therefore staging deployment remains skipped rather than bypassing the guard.
- Open AHMV coordination gates remain Phone/SMS production activation (#127) and Parent Premium ↔ TAKATAK coordination (#120); TAKATAK issue #33 remains the matching backend ownership/integration contract.

## Source authority

- `takatakca/ahmverdunca:main` is the only AHMV website integration authority.
- `takatakca/takatak-v1:main` is the TAKATAK backend authority for shared AHMV services.
- AHMV remains an independent product. TAKATAK supplies server-side shared services without turning AHMV into a TAKATAK dashboard.
- Official hockey providers remain authoritative for schedules, scores, standings and registration.
- TAKATAK remains authoritative for Product Catalog, pricing, billing and entitlements.
- Historical Voice/backend branches are not deployment authority.

## Current AHMV production baseline

AHMV production on MochaHost is verified at `5d7d545782da9f8aff9e69f9c76eb2082c30f453`.

AHM Verdun CI #1089 succeeded. Production deployment #858 completed successfully and passed:

- exact-green-release checkout and stale-main refusal;
- full release gate and deployment-configuration validation;
- immutable release upload/activation;
- approved cPanel/Passenger restart command;
- exact compiled runtime SHA verification through the `release` JSON field returned by `GET /healthz`;
- production homepage;
- core public routes;
- search noindex policy;
- `robots.txt`;
- `sitemap.xml`;
- deployment summary.

This closes the previously proven stale-Passenger failure mode: an active symlink or disk marker is no longer accepted as proof that the live Node process is serving the new build.

The current source also keeps the guarded Voice production-host deployment gate and the explicit Phone carrier proof. It does **not** change the public NumberBarn/Twilio routing.

## Current TAKATAK / database baseline

- TAKATAK production and staging contain the AHMV/Family/Product/ADS/Moderation schema and the exact 24 public teams.
- TAKATAK production contains the canonical active AHM Verdun brand. Staging currently does not contain that canonical brand, so Team Feed provisioning correctly refuses to write there.
- Production AHMV Team Feed now has exactly one `social_media` service instance in `planned` state with the exact 24 public team IDs; provider remains null.
- The AHMV client's social subscription remains `free / social_unsubscribed`. No paid social entitlement was fabricated.
- Production contains the AHMV ADS publisher `ahmverdun.ca` plus six active placements.
- ADS delivery inventory is still intentionally empty: zero ADS subscriptions, campaigns, creatives and events. Browser ADS remains OFF/no-fill until real commercial inventory exists.
- AHMV Parent Experience is active. Essential is 10 CAD/week and self-serve. Premium is 30 CAD/week, planned and non-self-serve. `smart_departure` belongs to Premium only.
- TAKATAK #102 is merged and preserves a reviewed official weekly AHMV document through its bounded covered week without rewriting its real source timestamp.
- TAKATAK #103 is merged at `8adfa23ca50f52f6a49e0eaec68e933c68dd1c78`; post-merge CI #492 completed successfully.
- PR #100's staging-history reconciler remains the only approved Prisma-history reconciliation path. Reconciler run #28 for `8adfa23…` failed at its protected configuration gate because `TAKATAK_STAGING_DATABASE_URL` was empty; the later rerun never received a runner and the dependent staging deploy remained skipped. Read-only comparison confirms the 102 repo migrations are represented by 87 Prisma-applied plus 15 Supabase-history migrations with canonical SQL matches and zero mismatches. The guarded workflow must still certify that state; no ad-hoc write to `_prisma_migrations` is permitted.

## Readiness matrix

| ID | Area | Source/data state | Live state / remaining dependency |
| --- | --- | --- | --- |
| A01 | Current-source authority | AHMV `main`; TAKATAK `8adfa23…` | `main` is source authority; docs-only commits may advance without changing deployed runtime |
| A02 | AHMV production | CI + immutable deploy + cPanel restart + compiled-SHA live HTTP proof | **Ready** at `5d7d545…` |
| A03 | Teams | Exact 24-team contract/data complete | **Ready** |
| A04 | Team Games / results | Exact-team connector/source guards complete | Shared service credential + live exact-team upstream smoke |
| A05 | TAKATAK ADS | Publisher + six placements complete | **No real sellable inventory yet:** 0 subscription/campaign/creative/event; browser gate stays OFF |
| A06 | Weekly official schedule | Official Week 5, October 5–11, structured with provenance | **Ready for the bounded current week**; colour-only groups stay fail-closed |
| A07 | Continuous official schedule | Snapshot store/read/ingest + bounded weekly freshness complete | No snapshot is fabricated: exact source timestamp / approved continuous feed still required |
| A08 | Team Feed / unified news-social | 24-team production mapping provisioned, service `planned`, provider null | Social subscription is `social_unsubscribed`; Meta OAuth/provider/content still required |
| A09 | Gallery ↔ exact teams/seasons | Provenance/duplicate guards + public youth-media fail-closed complete | Imported assets with pending minor consent remain hidden; final permissions can be approved without exposing them first |
| A10 | Facebook / Meta | Invitation located; TAKATAK Facebook connection flow exists | Interactive invitation acceptance + approved Page/Instagram OAuth required |
| A11 | Family/Product | Live catalog/prices/entitlements + local session/exchange/introspection/revoke/restore contract verified | Production service configuration + live provider-backed launch smoke before public enablement |
| A12 | Phone/SMS | Source/security CI + explicit carrier-proof gate present | Public number still must actually route through intended Twilio account; set `AHMV_PHONE_CARRIER=twilio` only after proof, then complete signed-request/consent/STOP/START/callback smoke |
| A13 | Voice | Runtime/source/CI/Guardian + guarded production-host deploy workflow present | Preprod attestation, host TLS/WSS/credentials, bridge + FR/EN/ES calls still required |
| A14 | TAKATAK staging Prisma history | #100 reconciler merged and guarded | Protected `TAKATAK_STAGING_DATABASE_URL` still required |
| A15 | Public indexing | Fail-closed gate present and production remains noindex | Manual release-owner acceptance after public/legal/provider gates |
| A16 | Final handover | Runbooks + inventories present | Record final provider acceptances, enabled gates and rollback targets |

## Schedule reality for the October 6 start

The official AHMV Week 5 PDF covering October 5–11 is transcribed into the website's structured schedule with its source URL and publication date preserved. TAKATAK can now keep such a reviewed bounded weekly publication fresh through the activities it actually covers, subject to strict host/span/cap rules.

The trusted TAKATAK snapshot store remains empty because the exact offset-aware source publication timestamp has not been independently verified. The operator publisher deliberately refuses to invent that timestamp. A continuous upstream export/API/calendar also remains unapproved. Exact-team pages therefore retain official-provider fallbacks where the weekly source does not provide an exact team identity.

## Team Feed reality

The internal backend preparation is now materially complete without pretending provider readiness:

1. the exact 24 public teams are present;
2. the canonical AHMV brand exists in TAKATAK production;
3. one `planned` Team Feed service maps those 24 IDs;
4. the service has no provider connection;
5. the client remains `free / social_unsubscribed`;
6. production has zero AHMV social accounts and zero synchronized social content.

The Meta Business invitation for AHM Verdun exists and remains an interactive user/provider authorization step. No OAuth token belongs in Git, browser configuration or release documentation.

## Historical website-production branch reconciliation

The historical `website-production-*` build train has been compared against the current AHMV production line. Sixty-nine branches were inventoried. Most are fully contained by current `main`; the branches that still report unique historical commits were inspected semantically rather than merged wholesale.

Current `main` already contains the intended outcomes for revenue actions, sponsor conversion, Game Day departure, coach command centre, Gallery event filters, related-news relevance, NewsArticle structured data, dark arena/event surfaces, assistant voice discoverability, attention orchestration, compact mobile navigation/team finder, accessible flip cards, authentic media/community rails, house creative gallery, mobile sponsor swipe, official logo assets, Runway creative assets/classification manifest and the touch-snap hockey wall.

Diverged historical alternatives are not deployment authority. Older ungated popups, superseded visual experiments, and one-time import/cleanup commits must not be merged over the current certified production source.

See `docs/WEBSITE_PRODUCTION_BRANCH_RECONCILIATION.md` for the reconciliation record.

## External walls that remain fail-closed

1. Protected `TAKATAK_STAGING_DATABASE_URL` for guarded staging Prisma-history reconciliation.
2. Exact authoritative timestamp/feed for trusted schedule snapshot ingestion and continuous refresh.
3. Legitimate social subscription decision plus interactive Meta invitation/OAuth/Page/Instagram selection.
4. Real paid ADS campaign/subscription/creative inventory.
5. Current Twilio + Voice runtime credentials/provider acceptance.
6. Team Games shared credential/live upstream acceptance.
7. Association privacy/legal/media/public-indexing approvals.

These are dependencies, not code defects. Do not replace them with synthetic values.

## Operator readiness command

Use the environment-local non-secret reporter:

```bash
bun run report:production-readiness
```

For a cutover, require only the modules intentionally being enabled:

```bash
bun run report:production-readiness --strict --require=core,schedule,teamGames,ads
```

Only names and states are printed; secret values are never emitted. `teamGames` and `teamFeed` remain distinct readiness targets.

## Cutover sequence

1. Keep every unaccepted provider/browser gate OFF.
2. Verify the exact current-main SHA and CI.
3. Configure one protected external dependency at a time.
4. Run that subsystem's guarded/live smoke.
5. Enable only the subsystem that passed acceptance.
6. Re-run AHMV health/routes/robots/sitemap plus the affected feature smoke.
7. Record exact deployed SHA and rollback target.
8. Never change public Twilio routing until Phone/Voice acceptance and rollback snapshot are green.
9. Never mark Prisma history reconciled merely because equivalent SQL exists; require the guarded reconciliation workflow.
10. Never stamp an old schedule with a new timestamp to make it appear fresh.

## Done means

A production-affecting task is done only when all applicable layers are true:

1. current-main source;
2. current CI green;
3. correct non-secret configuration state;
4. required guarded migration/reconciliation completed on the correct project;
5. real provider/hostname smoke where applicable;
6. rollback path verified;
7. deployed SHA recorded.
