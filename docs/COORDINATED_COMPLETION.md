# AHMVERDUN.CA — Coordinated completion queue

Checkpoint: 2026-10-05, America/Toronto.  
Canonical AHMV main and verified production release: `04663346d6c9c3bceb436938e02face629972b94`.  
Canonical TAKATAK backend repository: `takatakca/takatak-v1`.  
Current TAKATAK main after AHMV readiness/Team Feed merge #103: `8adfa23ca50f52f6a49e0eaec68e933c68dd1c78`.

This file separates **merged source**, **deployed production**, **database state**, **provider authorization**, and **live acceptance**. Missing provider credentials or approvals must never be replaced with synthetic data or fake readiness.

## Source authority

- `takatakca/ahmverdunca:main` is the only AHMV website integration authority.
- `takatakca/takatak-v1:main` is the TAKATAK backend authority for shared AHMV services.
- AHMV remains an independent product. TAKATAK supplies server-side shared services without turning AHMV into a TAKATAK dashboard.
- Official hockey providers remain authoritative for schedules, scores, standings and registration.
- TAKATAK remains authoritative for Product Catalog, pricing, billing and entitlements.
- Historical Voice/backend branches are not deployment authority.

## Current AHMV production baseline

AHMV production on MochaHost is verified at `04663346d6c9c3bceb436938e02face629972b94`.

AHM Verdun CI #1046 succeeded. Production deployment #814 initially stopped safely before upload because MochaHost closed all bounded SSH/SFTP transport attempts. The failed deployment changed no production release. Failed-job retry attempt 2 then completed successfully and passed:

- exact-green-release checkout and stale-main refusal;
- full release gate and deployment-configuration validation;
- immutable release upload/activation;
- Passenger restart;
- `/healthz`;
- production homepage;
- core public routes;
- search noindex policy;
- `robots.txt`;
- `sitemap.xml`;
- deployment summary.

The same source line adds the guarded Voice production-host deployment gate from #350. It does **not** change the public Twilio number routing.

## Current TAKATAK / database baseline

- TAKATAK production and staging contain the AHMV/Family/Product/ADS/Moderation schema and the exact 24 public teams.
- TAKATAK production contains the canonical active AHM Verdun brand. Staging currently does not contain that canonical brand, so Team Feed provisioning correctly refuses to write there.
- Production AHMV Team Feed now has exactly one `social_media` service instance in `planned` state with the exact 24 public team IDs; provider remains null.
- The AHMV client's social subscription remains `free / social_unsubscribed`. No paid social entitlement was fabricated.
- Production contains the AHMV ADS publisher `ahmverdun.ca` plus six active placements.
- ADS delivery inventory is still intentionally empty: zero ADS subscriptions, campaigns, creatives and events. Browser ADS remains OFF/no-fill until real commercial inventory exists.
- AHMV Parent Experience is active. Essential is 10 CAD/week and self-serve. Premium is 30 CAD/week, planned and non-self-serve. `smart_departure` belongs to Premium only.
- TAKATAK #102 is merged and preserves a reviewed official weekly AHMV document through its bounded covered week without rewriting its real source timestamp.
- TAKATAK #103 is merged at `8adfa23ca50f52f6a49e0eaec68e933c68dd1c78`; its post-merge CI #492 is the current final backend verification run.
- PR #100's staging-history reconciler remains the only approved Prisma-history reconciliation path. No ad-hoc write to `_prisma_migrations` is permitted.

## Readiness matrix

| ID | Area | Source/data state | Live state / remaining dependency |
| --- | --- | --- | --- |
| A01 | Current-source authority | AHMV `04663346…`; TAKATAK `8adfa23…` | Current authority pinned |
| A02 | AHMV production | CI + immutable deploy + live HTTP smoke | **Ready** at `04663346…` |
| A03 | Teams | Exact 24-team contract/data complete | **Ready** |
| A04 | Team Games / results | Exact-team connector/source guards complete | Shared service credential + live exact-team upstream smoke |
| A05 | TAKATAK ADS | Publisher + six placements complete | **No real sellable inventory yet:** 0 subscription/campaign/creative/event; browser gate stays OFF |
| A06 | Weekly official schedule | Official Week 5, October 5–11, structured with provenance | **Ready for the bounded current week**; colour-only groups stay fail-closed |
| A07 | Continuous official schedule | Snapshot store/read/ingest + bounded weekly freshness complete | No snapshot is fabricated: exact source timestamp / approved continuous feed still required |
| A08 | Team Feed / unified news-social | 24-team production mapping provisioned, service `planned`, provider null | Social subscription is `social_unsubscribed`; Meta OAuth/provider/content still required |
| A09 | Gallery ↔ exact teams/seasons | Provenance and duplicate guards complete | Final permission/mobile review |
| A10 | Facebook / Meta | Invitation located; TAKATAK Facebook connection flow exists | Interactive invitation acceptance + approved Page/Instagram OAuth required |
| A11 | Family/Product | Live catalog/prices/entitlements verified | Final launch/exchange/introspection + revoke/restore E2E |
| A12 | Phone/SMS | Source/security CI present | Current Twilio credentials + signed-request/consent/STOP/START/callback smoke |
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
