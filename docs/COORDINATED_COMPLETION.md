# AHMVERDUN.CA — Coordinated completion queue

Checkpoint: 2026-10-05, America/Toronto.  
Canonical AHMV main and verified production release: `9d190d6e018c867cee6a8f55be7221704b48bd9c`.  
Canonical TAKATAK backend repository: `takatakca/takatak-v1`.  
TAKATAK main after migration-history reconciliation merge #100: `d86d3bde5ef159400e962fd98c1a21ae10cb7878`.

This file separates **merged source**, **deployed production**, **database reconciliation**, and **external live acceptance**. Never treat a missing credential/provider approval as a reason to fabricate data.

## Source authority

- `takatakca/ahmverdunca:main` is the only AHMV website integration authority.
- `takatakca/takatak-v1:main` is the current TAKATAK backend authority for AHMV shared services.
- Create fresh task branches from current `main`; do not revive stale Voice/backend branches.
- AHMV remains an independent product. TAKATAK provides shared server-side services without auto-mounting a hockey dashboard into AHMV.
- Official hockey providers remain authoritative for schedules, scores, standings and registration.
- TAKATAK remains authoritative for Product Catalog, pricing, billing and entitlements.

## Current AHMV production baseline

AHMV production on MochaHost is verified at `9d190d6e018c867cee6a8f55be7221704b48bd9c`.

GitHub Actions production release #801 completed successfully after AHM Verdun CI #1033. The production workflow passed:

- exact-green-release checkout and stale-main refusal;
- full release gate and deployment-configuration validation;
- immutable release packaging and previous-release capture;
- upload, extraction, release-marker verification and atomic activation;
- Passenger restart;
- live health check;
- live homepage check;
- core public-route smoke;
- search noindex verification;
- `robots.txt` verification;
- `sitemap.xml` verification;
- rollback was not required.

The deployment retained the newest five immutable releases.

## Current TAKATAK / database baseline

- TAKATAK production and staging contain the AHMV/Family/Product/ADS/Moderation schema.
- Both databases contain the exact 24 public teams.
- Both databases contain publisher `ahmverdun.ca` and six AHMV ADS placements.
- Essential: 10 CAD/week, active/self-serve.
- Premium: 30 CAD/week, planned/non-vendable.
- Smart Departure: Premium-only.
- TAKATAK PR #100 is merged. Its reconciler verifies exact canonical SQL before recording externally-applied Supabase migrations in Prisma history.
- Direct read-only staging verification shows the staging project is healthy and the reviewed AHMV/ADS migrations are already represented in Supabase history.
- **Prisma history reconciliation is not yet certified complete.** The latest observed automatic staging reconciler stopped at its protected configuration gate because `TAKATAK_STAGING_DATABASE_URL` was absent. No ad-hoc writes to `_prisma_migrations` are permitted as a workaround.

## Readiness matrix

| ID | Area | Source/data state | Live state / remaining dependency |
| --- | --- | --- | --- |
| A01 | Current-source authority | Complete | AHMV `9d190d6e…`; TAKATAK `d86d3bde…` |
| A02 | AHMV production | CI + immutable deployment + live HTTP smoke complete | **Ready** at `9d190d6e…` |
| A03 | Teams | Exact 24-team contract/data complete | **Ready** |
| A04 | Team Games / results | Exact-team connector/source guards complete | Shared service credential + final live upstream exact-team smoke |
| A05 | TAKATAK ADS | Publisher + six placements + canonical routes complete | Backend/data ready; final live serve/event smoke before browser gate |
| A06 | Weekly official schedule | Official AHMV Week 5 (October 5–11) is structured, provenance-pinned and live | **Ready for the current published week**; colour-only groups remain fail-closed for exact-team attribution |
| A07 | Continuous official schedule | Snapshot store, ingestion/read APIs, provenance/freshness and Voice fallback complete | **Blocked externally:** reviewed continuous export/API/calendar source |
| A08 | Team Feed / unified news-social | UI/proxy contract complete; server/browser gates default OFF | Meta/provider authorization + server credential + attribution/fallback acceptance |
| A09 | Gallery ↔ exact teams/seasons | Provenance and duplicate guards complete | Final permission/mobile review |
| A10 | Facebook / Meta | Deterministic 24-team manifest complete | Meta Business invitation exists; interactive acceptance/provider connection still required |
| A11 | Family/Product | Contract/schema/plan semantics present | Final launch/exchange/introspection + revoke/restore E2E |
| A12 | Phone/SMS | Source/security CI present | Real current Twilio credentials, signed-request/consent/STOP/START/callback smoke |
| A13 | Voice | Runtime/source/CI/Guardian present | Runtime credentials, TLS/WSS, bridge, FR/EN/ES real-call acceptance |
| A14 | TAKATAK staging migration history | #100 merged; drift characterized and guarded | **Blocked:** protected `TAKATAK_STAGING_DATABASE_URL` must exist for automatic reconcile |
| A15 | Public indexing | Fail-closed gate present | Manual release-owner acceptance; keep OFF until public/legal/provider items are accepted |
| A16 | Final handover | Non-secret inventory/runbooks present | Record final enabled gates, monitoring and rollback |

## Schedule reality for the October 6 start

The official AHMV Week 5 PDF covering October 5–11 is now transcribed into the shared structured schedule used by the website and bounded Phone/Calendar fallback. Its source URL and publication date remain attached, and colour-only groups are not guessed onto exact teams. The separate continuous schedule bridge is still fail-closed until a reviewed current export/API/calendar source is connected; exact-team game/result links remain the official-provider fallback.

## External walls that must remain fail-closed

1. Protected TAKATAK staging database URL and, separately, MochaHost staging transport configuration where a staging deployment is required.
2. Continuous authoritative schedule source/export beyond the currently integrated official Week 5 publication.
3. Interactive Meta/social authorization and provider credentials.
4. Current Twilio + Voice runtime credentials/provider state.

These are dependencies, not code defects. Do not replace them with synthetic values.

## Operator readiness command

Use the environment-local non-secret reporter:

```bash
bun run report:production-readiness
```

For a release that intends to activate specific modules:

```bash
bun run report:production-readiness --strict --require=core,schedule,teamGames,ads
```

Only names and states are printed; secret values are never emitted. `teamGames` and `teamFeed` are intentionally distinct readiness targets.

## Cutover sequence

1. Keep all unaccepted feature gates OFF.
2. Verify core production at the exact candidate SHA.
3. Configure one external dependency at a time in its protected environment.
4. Run that subsystem's read-only/live smoke.
5. Enable only that subsystem's release gate.
6. Re-run health/routes/robots/sitemap plus the affected feature smoke.
7. Record exact deployed SHA and rollback target.
8. Never change public Twilio routing until Voice/Phone live acceptance and rollback snapshot are green.
9. Never mark Prisma history reconciled merely because Supabase SQL exists; require the guarded reconciliation workflow to succeed.

## Done means

A production-affecting task is done only when all applicable layers are true:

1. current-main source;
2. current CI green;
3. correct non-secret configuration state;
4. required guarded migration/reconciliation completed on the correct project;
5. live smoke against the actual hostname/provider;
6. rollback path verified;
7. deployed SHA recorded.
