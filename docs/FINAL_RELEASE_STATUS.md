# AHM Verdun — Final release status

**Date:** 2026-10-05  
**Project:** AHM Verdun 2026–2027  
**Digital delivery:** GROUPE TAKATAK  
**Production domain:** https://ahmverdun.ca  
**Verified AHMV production SHA:** `9d190d6e018c867cee6a8f55be7221704b48bd9c`

## 1. Current status

The AHMV public application is live on MochaHost at the verified SHA above.

AHM Verdun CI #1033 succeeded and production deployment #801 completed successfully. The release workflow verified its immutable release marker, restarted Passenger and passed live health, homepage, core public-route, search-noindex, `robots.txt` and `sitemap.xml` checks. Automatic rollback was not needed.

The public application remains intentionally conservative around unfinished provider integrations. A provider-backed feature is not called live merely because its source code exists.

Public indexing remains an explicit release-owner gate through `VITE_PUBLIC_INDEXING`.

## 2. Completed public/product foundation

- Home / parent quick-access hub
- Team/category directory and exact 24-team mapping
- Individual team/category pages and exact-team match centre
- Registration guidance and official-provider handoffs
- WLLV / tournament gateways
- News centre and Team Feed UI contract
- Photo/video archive with provenance/fallback rules
- Coach and volunteer resources
- Arena directory and verified address handling
- FAQ and local site search
- Hockey resources and financial-assistance links
- Partners / sponsorship presentation
- Contact and volunteering surfaces
- Privacy surface
- FR/EN interface
- Mobile quick navigation and saved preferred team
- Voice-assisted local search when supported
- 404 and catastrophic SSR error handling
- TAKATAK ADS publisher/placement integration contract
- Family/Product entitlement boundary
- Phone/SMS v2 source and security boundary
- Standalone Voice service source/bridge boundary
- Non-secret production-readiness reporter
- Official AHMV Week 5 structured schedule for October 5–11
- Fail-closed exact-team matching for colour-only weekly groups
- Resilient PWA install prompt with iOS/iPad manual install guidance

## 3. Verified production safeguards

- Runtime `.env` files are not tracked and CI rejects committed runtime environment files.
- Server-only secrets are separated from public `VITE_` variables.
- Public indexing remains fail-closed until explicit acceptance.
- Matching server-side indexing policy and noindex exceptions are validated.
- Baseline browser hardening headers are enabled.
- Sitemap, robots, canonical domain and required public routes are CI-validated.
- Content integrity, references, dates, times and HTTPS links are validated.
- Demo/illustrative media cannot silently become approved public media.
- Protected photo provenance is preserved.
- Exact public team-directory cardinality is pinned.
- Team Games and Team Feed are separate, independently gated systems.
- Team Feed server/browser gates default OFF.
- Phone/Voice public routing remains OFF until real provider acceptance.
- Schedule consumers fail closed on unavailable, stale or provenance-free data.
- Deployment uses immutable releases, a stale-main refusal and rollback capture.

## 4. TAKATAK shared-services status

The active backend authority is `takatakca/takatak-v1`.

Verified shared-service state includes:

- AHMV/Family/Product/ADS/Moderation schema in production and staging;
- exact 24-team data in both environments;
- AHMV ADS publisher `ahmverdun.ca` plus six placements;
- Essential at 10 CAD/week, active/self-serve;
- Premium at 30 CAD/week, planned/non-vendable;
- Smart Departure restricted to Premium;
- authoritative schedule snapshot storage and authenticated ingestion/read APIs;
- exact-team games bridge;
- separately gated Team Feed bridge;
- operational readiness diagnostics.

TAKATAK PR #100 is merged at backend main `d86d3bde5ef159400e962fd98c1a21ae10cb7878`. The reconciler verifies canonical SQL before it can record externally-applied Supabase migrations in Prisma history.

The staging database itself is healthy and the reviewed AHMV/ADS SQL is present in Supabase migration history. The Prisma-history reconciliation is **not yet certified complete** because the latest observed automatic reconcile run stopped safely when the protected `TAKATAK_STAGING_DATABASE_URL` was absent.

## 5. Schedule status

The official AHMV Week 5 publication covering October 5–11 is integrated as the current bounded structured schedule. The website and the bounded Phone/Calendar fallback now read those published activities with the official source URL and publication date preserved. Published colour groups are not guessed onto an exact public team unless the source itself names the team.

The normalized backend continuous-schedule bridge is also ready. It accepts only reviewed authoritative snapshots with source provenance and freshness metadata and refuses stale/unavailable data.

A continuous automatically refreshed upstream export/API/calendar source is not yet certified. Until that source is connected, exact-team pages retain official-provider fallbacks beyond the bounded weekly publication and the continuous feed remains fail-closed.

No weekly PDF or historical schedule may be stamped with a new timestamp to simulate freshness.

## 6. Install / PWA status

The AHMV install prompt is active in the current production source. It now retries after competing navigation/assistant surfaces close, uses a 14-day dismissal TTL rather than disappearing permanently, listens for successful installation, and provides iPhone/iPad instructions through the Share → Add to Home Screen flow when the browser does not expose a native install prompt.

The prompt remains browser-capability dependent; its absence alone is not treated as a rollback of the public application.

## 7. Social / Team Feed status

The AHMV Team Feed browser/server contract is complete and disabled by default.

An AHM Verdun Meta Business portfolio invitation exists and remains an interactive authorization step. Provider access must be accepted through the authorized Meta account, then the corresponding Page/Instagram connection, server credential, exact-team mapping, attribution and unavailable-provider fallback must pass live acceptance before Team Feed is enabled.

Provider OAuth/access tokens remain in TAKATAK and must never be exposed to browser code.

## 8. Phone / Voice status

Phone/SMS and Voice source, tests and security gates exist, but public routing remains fail-closed.

Real current provider acceptance still requires:

- current Twilio runtime credentials;
- signed webhook verification;
- consent and STOP/START behavior;
- callback/retry behavior;
- Voice TLS/WSS;
- AHMV bridge readiness;
- FR/EN/ES real-call smoke;
- verified rollback before public-number routing changes.

Historical account material is not a substitute for a current runtime acceptance test.

## 9. Remaining release-owner / external gates

These are not code defects and must not be fabricated:

- protected TAKATAK staging database URL for guarded Prisma-history reconciliation;
- continuous authoritative export/API/calendar source for automatic refresh beyond the integrated Week 5 publication;
- interactive Meta/provider authorization;
- current Team Feed server credentials;
- current Twilio/Voice runtime credentials and provider acceptance;
- final public photo/video permissions where minors are involved;
- final privacy/legal/public-contact approvals required by the association;
- approved analytics/Search Console/Google Business/social integrations;
- explicit public-indexing acceptance.

## 10. Safe completion sequence

1. Keep every unfinished external integration gate OFF.
2. Complete TAKATAK staging migration-history reconciliation through the guarded workflow only.
3. Onboard one current authoritative schedule source and prove freshness/provenance.
4. Accept/connect approved Meta assets and prove Team Feed attribution/fallback.
5. Complete Twilio Phone/SMS live acceptance.
6. Complete standalone Voice TLS/WSS/bridge/real-call acceptance.
7. Enable only the subsystem that passed its own acceptance.
8. Re-run AHMV health/public-route/robots/sitemap smoke after every production-affecting deploy.
9. Record exact SHA and rollback target.
10. Enable public indexing only after the release owner accepts the remaining public/legal/provider gates.

## 11. Operating rule

Families should always receive either a verified current answer or an explicit official destination. Never trade provenance, privacy, authorization or rollback safety for a cosmetic “ready” state.

For architectural boundaries, see `docs/TAKATAK_INTEGRATION_BOUNDARY.md`.  
For launch gates, see `docs/GO_LIVE_CHECKLIST.md`.  
For the live work queue, see `docs/COORDINATED_COMPLETION.md`.
