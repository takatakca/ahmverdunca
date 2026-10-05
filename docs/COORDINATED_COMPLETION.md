# AHMVERDUN.CA — Coordinated completion queue

Checkpoint: 2026-10-05, America/Toronto.  
Canonical AHMV main at checkpoint: `cc7618651806f2b9fcc78c9e97b4d8f7395fd24a`.

This file separates **merged source**, **deployed production**, and **external live acceptance**. Never treat a missing credential/provider approval as a reason to fabricate data.

## Source authority

- `origin/main` is the only AHMV integration authority.
- Create fresh task branches from current `main`; do not revive stale Voice/backend branches.
- AHMV remains an independent product. TAKATAK provides shared server-side services without auto-mounting a hockey dashboard into AHMV.
- Official hockey providers remain authoritative for schedules, scores, standings and registration.
- TAKATAK remains authoritative for Product Catalog, pricing, billing and entitlements.

## Current integrated baseline

Current main includes the community/editability control plane, exact-team games/feed connectors, TAKATAK ADS publisher client/fallback, Family Experience boundary, phone/SMS v2, Voice runtime/bridge, schedule freshness/provenance guards, deployment safeguards and the full AHM Verdun CI.

Recent coordination cleanup is complete:

- backend control-plane work from former #307 is integrated in current main;
- stale Voice work from former #215 is superseded by current-main consolidation #338;
- #339 corrected the SMS XML-injection regression test without changing runtime behavior;
- no stale historical branch is release authority.

## Production baseline

- AHMV is deployed on MochaHost at `cc7618651806f2b9fcc78c9e97b4d8f7395fd24a`.
- Passenger/health/homepage/public routes/robots/sitemap are green for that release.
- TAKATAK production and staging contain the AHMV/Family/Product/ADS/Moderation schema.
- Both databases contain the exact 24 public teams.
- Both databases contain publisher `ahmverdun.ca` and six AHMV ADS placements.
- Essential: 10 CAD/week, active/self-serve.
- Premium: 30 CAD/week, planned/non-vendable.
- Smart Departure: Premium-only.
- Applied staging migrations match the Git SQL set at the last verified checkpoint.

## Readiness matrix

| ID | Area | Source/data state | Live state / remaining dependency |
| --- | --- | --- | --- |
| A01 | Current-source authority | Complete | Keep `main` as sole release authority |
| A02 | Teams | Exact 24-team contract/data complete | Ready |
| A03 | TAKATAK ADS | Publisher + six placements + routes complete | Ready for final live serve/event smoke before browser gate |
| A04 | Continuous official schedule | Adapters, provenance/freshness guards, Voice fallback complete | **Blocked:** approved authoritative source + live freshness/provenance |
| A05 | Team Feed / unified news-social | UI, filters, attribution/fallback contracts present | **Blocked:** authorized social/provider connectors |
| A06 | Gallery ↔ exact teams/seasons | Provenance and duplicate guards complete | Live permission/mobile review |
| A07 | Facebook team album reconciliation | Deterministic 24-team manifest complete | Authorized Facebook Page access and real provider IDs |
| A08 | Family/Product | Contract/schema/plan semantics present | Final launch/exchange/introspection + revoke/restore E2E |
| A09 | Phone/SMS | Source and security CI present | Real Twilio signatures, consent, STOP/START, callbacks/retries |
| A10 | Voice | Runtime/source/CI/Guardian present | Runtime credentials, TLS/WSS, bridge, FR/EN/ES real-call smoke |
| A11 | Production release | MochaHost `cc761865…` core HTTP smoke green | Re-run smoke after any new merge/deploy |
| A12 | Public indexing | Fail-closed gate present | Manual release-owner approval |
| A13 | Final handover | Non-secret inventory/runbooks present | Record final enabled gates, monitoring and rollback |

## External walls that must remain fail-closed

1. MochaHost/TAKATAK staging database or SSH credentials when a live environment mutation is required.
2. Approved authoritative schedule source.
3. Authorized social/Facebook provider accounts.
4. Twilio + Voice runtime credentials/provider state.

These are dependencies, not code defects. Do not replace them with synthetic values.

## Operator readiness command

Use the environment-local non-secret reporter:

```bash
bun run report:production-readiness
```

For a release that intends to activate specific modules:

```bash
bun run report:production-readiness --strict --require=core,schedule,teamFeed,ads
```

Only names and states are printed; secret values are never emitted.

## Cutover sequence

1. Keep all unaccepted feature gates OFF.
2. Verify core production at the exact candidate SHA.
3. Configure one external dependency at a time.
4. Run that subsystem's read-only/live smoke.
5. Enable only that subsystem's release gate.
6. Re-run health/routes/robots/sitemap plus the affected feature smoke.
7. Record exact deployed SHA and rollback target.
8. Never change the public Twilio number routing until Voice/Phone live acceptance and rollback snapshot are green.

## Done means

A production-affecting task is done only when all applicable layers are true:

1. current-main source;
2. current CI green;
3. correct non-secret configuration state;
4. required migration applied to the correct project;
5. live smoke against the actual hostname/provider;
6. rollback path verified;
7. deployed SHA recorded.
