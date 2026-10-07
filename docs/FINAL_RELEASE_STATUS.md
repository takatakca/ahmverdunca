# AHM Verdun — Final release status

**Date:** 2026-10-07  
**Project:** AHM Verdun 2026–2027  
**Digital delivery:** GROUPE TAKATAK  
**Production domain:** https://ahmverdun.ca  
**Verified AHMV production SHA:** `e366ba134ea84ed92eabb22861623b819ad47597`

## 1. Current status

The AHMV public application is live on MochaHost at the verified SHA above.

AHM Verdun CI #1094 succeeded and production deployment #863 completed successfully. The deployment used the approved cPanel/Passenger restart command and then proved that the `release` JSON field returned by `GET /healthz` matched the exact compiled SHA `e366ba134ea84ed92eabb22861623b819ad47597`. Homepage, core public routes, search-noindex policy, `robots.txt` and `sitemap.xml` also passed.

The earlier stale-Passenger failure is closed: production acceptance now requires the compiled runtime SHA, not merely the active symlink or release marker.

The public application remains intentionally conservative around unfinished provider integrations. A provider-backed feature is not presented as live merely because source code exists.

Public indexing remains an explicit release-owner gate through `VITE_PUBLIC_INDEXING` and is currently fail-closed.

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
- Guarded preproduction-to-production Voice host deployment workflow
- Non-secret production-readiness reporter
- Official AHMV Week 5 structured schedule for October 5–11
- Bounded official-week freshness without fake source timestamps
- Guarded weekly schedule publisher for TAKATAK ingestion
- Fail-closed exact-team matching for colour-only weekly groups
- Resilient PWA install prompt with iOS/iPad manual install guidance
- Docs-only main commits excluded from the production release train
- Compiled runtime SHA exposed by `/healthz` and verified during every automatic production release
- Approved cPanel/Passenger restart command required before runtime acceptance
- Weekly schedule metadata locked to the newest official weekly document
- Family Experience session/exchange/introspection/revoke/restore contract covered by CI
- News Centre and team-microsite editability protected by regression checks
- Imported youth media fail closed from the public gallery while consent is pending
- Public Phone/SMS additionally requires explicit `AHMV_PHONE_CARRIER=twilio` carrier proof
- Historical `website-production-*` branch train reconciled against current `main`

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
- Phone/Voice public routing remains OFF until real provider acceptance.
- Schedule consumers fail closed on unavailable, stale or provenance-free data.
- Weekly schedule ingestion refuses to infer the real publication time.
- Deployment uses immutable releases, stale-main refusal, rollback capture, bounded resilient transport retries, the approved cPanel/Passenger restart command and exact compiled-SHA runtime proof.
- Voice host promotion requires a successful exact-SHA preproduction attestation and leaves Twilio routing unchanged.

## 4. TAKATAK shared-services status

The active backend authority is `takatakca/takatak-v1`. Current merged main after #103 is `8adfa23ca50f52f6a49e0eaec68e933c68dd1c78`.

Verified shared-service state includes:

- AHMV/Family/Product/ADS/Moderation schema in production and staging;
- exact 24-team data in both environments;
- canonical AHMV brand in TAKATAK production;
- AHMV ADS publisher `ahmverdun.ca` plus six active placements;
- one AHMV Team Feed service in production, `planned`, provider null, mapped to the exact 24 team IDs;
- AHMV social subscription remains `free / social_unsubscribed`;
- zero production AHMV social accounts and zero synchronized AHMV social content;
- Essential at 10 CAD/week, active/self-serve;
- Premium at 30 CAD/week, planned/non-self-serve;
- Smart Departure restricted to Premium;
- authoritative schedule snapshot storage and authenticated ingestion/read APIs;
- bounded official-week freshness policy;
- exact-team games bridge;
- operational readiness diagnostics.

TAKATAK #102 and #103 are merged. Post-merge CI #492 for `8adfa23…` completed successfully, including RLS/PostgREST checks, tenant isolation, build, production artifact audit and clean artifact startup.

The staging database is healthy and the reviewed schema/data are present, but Prisma-history reconciliation is **not yet certified complete**. Reconciler run #28 for `8adfa23…` failed safely at the protected configuration gate because `TAKATAK_STAGING_DATABASE_URL` was empty; the subsequent rerun never received a runner and the dependent staging deployment correctly skipped. Read-only reconciliation audit confirms all 102 repo migrations are already represented by 87 Prisma-applied migrations plus 15 matching Supabase-history migrations, with zero canonical SQL mismatches. No manual `_prisma_migrations` write is an acceptable substitute.

## 5. Schedule status

The official AHMV Week 5 publication covering October 5–11 is integrated as the bounded structured website schedule. Its public source URL and publication date remain preserved. Published colour groups are not guessed onto exact teams.

The TAKATAK schedule bridge now also supports a reviewed weekly AHMV document remaining fresh through its actual covered activities when it comes from the approved AHMV storage host and stays within strict weekly/cap constraints. This does not rewrite `updatedAt`.

The trusted TAKATAK production schedule snapshot is still intentionally absent. The exact offset-aware publication timestamp for the Week 5 document has not been independently established, and the guarded publisher refuses to invent it. A continuous automatically refreshed upstream export/API/calendar source is also not yet certified.

No weekly PDF or historical schedule may be stamped with a new timestamp to simulate freshness.

## 6. Media / consent status

The public gallery now fails closed for imported youth media. Staging currently contains 55 media assets; 29 are marked as containing minors with consent still pending. Those imported youth assets are no longer rendered publicly through the static gallery fallback. Consent state itself was not changed or fabricated.

Albums blocked by consent render an explicit protected-media state instead of unrelated generic fallback imagery. Existing official public media remains a separate source path.

## 7. Install / PWA status

The AHMV install prompt is active in current production source. It retries after competing navigation/assistant surfaces clear, uses a 14-day dismissal TTL, listens for successful installation and provides iPhone/iPad Share → Add to Home Screen guidance when no native install prompt is exposed.

The prompt remains browser-capability dependent; its absence alone is not a rollback condition.

## 8. Social / Team Feed status

The Team Feed contract is no longer only theoretical. Production now has one fail-closed AHMV `social_media` service in `planned` state with all 24 exact public team IDs.

It is **not live**:

- provider is null;
- AHMV social subscription is `free / social_unsubscribed`;
- AHMV social account count is zero;
- synchronized AHMV social content count is zero;
- browser/server gates remain OFF.

An AHM Verdun Meta Business portfolio invitation is present in the authorized TAKATAK mailbox and expires November 2, 2026. Accepting that invitation and authorizing approved Facebook/Instagram assets is interactive provider work. TAKATAK's internal Facebook connection flow exists at the social dashboard, but access must not be obtained by fabricating a paid subscription.

Provider OAuth/access tokens remain server-side and must never be exposed to AHMV browser code or release documentation.

## 9. ADS status

The AHMV publisher and six placements are present and active. However production currently has zero ADS subscriptions, zero campaigns, zero creatives and zero ad events.

Therefore TAKATAK ADS is **publisher-ready but not inventory-ready**. The AHMV browser ADS gate must remain OFF/no-fill until a real authorized advertiser/subscription/campaign/creative exists and serving/event acceptance succeeds.

No fake advertiser, campaign, creative, spend or conversion data may be inserted to make this module appear complete.

## 10. Family/Product status

The live TAKATAK product catalog confirms:

- `AHMV Parent Experience` is active;
- `parent_essential`: 10 CAD/week, active, self-serve;
- `parent_premium`: 30 CAD/week, planned, non-self-serve;
- `smart_departure` is a Premium entitlement and not an Essential entitlement.

The Family Experience session contract is now covered by CI for signed cookies, launch exchange, live entitlement introspection, expiry/tamper rejection, revoke, restore and same-origin logout. The remaining gate is production service configuration plus one real provider-backed launch/introspection/revoke/restore acceptance smoke before the public Family gate is enabled. It is not a missing catalog/schema issue.

## 11. Phone / Voice status

Phone/SMS and Voice source, CI and security gates exist, but public routing remains fail-closed. The website now additionally requires server-only `AHMV_PHONE_CARRIER=twilio`; blank or `numberbarn` cannot expose public click-to-call even if other Phone flags are accidentally enabled.

The Voice source line now contains a guarded production-host workflow that requires:

- exact merged green SHA;
- Voice service CI + Guardian + site CI;
- exact successful preproduction attestation;
- production host/origin validation;
- immutable release;
- rollback capture;
- host smoke and website bridge smoke.

No production Voice host acceptance has yet proven current TLS/WSS/runtime credentials. The public number remains treated as NumberBarn-controlled until ownership/routing to the intended Twilio account is actually proven; no source or deployment state may override that carrier fact.

Real provider acceptance still requires actual Twilio ownership/routing proof, then `AHMV_PHONE_CARRIER=twilio`, current Twilio credentials, signed webhook verification, consent/STOP/START behavior, callback/retry behavior, Voice TLS/WSS, bridge readiness, FR/EN/ES real calls and verified rollback.

## 12. Remaining release-owner / external gates

These are not code defects and must not be fabricated:

- protected `TAKATAK_STAGING_DATABASE_URL` for guarded Prisma-history reconciliation;
- exact trusted schedule publication timestamp and/or approved continuous export/API/calendar feed;
- legitimate Team Feed subscription/entitlement decision;
- interactive Meta invitation acceptance and approved Page/Instagram OAuth;
- real ADS commercial inventory;
- Team Games shared credential/live upstream smoke;
- current Twilio/Voice runtime credentials and real-call acceptance;
- final public photo/video permissions where minors are involved;
- final privacy/legal/public-contact approvals required by the association;
- approved analytics/Search Console/Google Business/social integrations;
- explicit public-indexing acceptance.

## 13. Safe completion sequence

1. Keep every unfinished external integration gate OFF.
2. Require current backend CI to be green.
3. Complete TAKATAK staging migration-history reconciliation through the guarded workflow only.
4. Onboard a trusted current schedule publisher/feed without inventing timestamps.
5. Make the legitimate social subscription decision, then accept/connect approved Meta assets and prove Team Feed attribution/fallback.
6. Add real authorized ADS inventory and pass serving/event smoke before enabling browser ADS.
7. Complete Twilio Phone/SMS live acceptance.
8. Deploy/accept the standalone Voice host through preproduction attestation, then complete real-call acceptance.
9. Enable only the subsystem that passed its own acceptance.
10. Re-run AHMV health/public-route/robots/sitemap smoke after production-affecting deploys.
11. Record exact SHA and rollback target.
12. Enable public indexing only after the release owner accepts remaining public/legal/provider gates.

Historical branch reconciliation is recorded in `docs/WEBSITE_PRODUCTION_BRANCH_RECONCILIATION.md`.

## 14. Operating rule

Families should always receive either a verified current answer or an explicit official destination. Never trade provenance, privacy, billing authority, provider authorization or rollback safety for a cosmetic “ready” state.

For architectural boundaries, see `docs/TAKATAK_INTEGRATION_BOUNDARY.md`.  
For launch gates, see `docs/GO_LIVE_CHECKLIST.md`.  
For the live work queue, see `docs/COORDINATED_COMPLETION.md`.
