# AHMVERDUN.CA — Coordinated completion queue

Checkpoint: 2026-10-03, America/New_York.
Inspected main commit: fdb775e2a012697f4b0b2b3dd1a5a03d8dcd297b.
This queue reconciles the requirements visible in the coordinating conversation with inspected source. It does not claim that every historical chat was available or that a deployed feature was tested.

## Source precedence and execution

Use current GitHub source before the October 2 uploaded archive. Keep published history intact because this repository syncs with Lovable. Apply changes on review branches.
Run one integration/release task at a time. Finish its validation before starting dependent work. Do not create duplicate contacts, SMS queues, billing authority or schedule authority.
Coordination is scoped to this repository; it cannot stop other ChatGPT conversations or guarantee ChatGPT usage limits.
Done requires implementation evidence and relevant validation. A UI component or historical PASS claim alone does not prove live operation.

## Verified findings

- Current canonical domain in src/lib/site.ts is https://ahmverdun.ca; the .com instructions in the older archive are superseded for the website domain. Published .com contact addresses are separate and must not be mechanically rewritten.
- Current /nouvelles uses NewsCentre. Source includes team/source/association/time filters, sorting, saved local preferences and reset; live connector delivery remains unverified.
- Current team preferences support multiple exact team IDs, individual removal and clearing all preferences. The team directory exposes X removal controls.
- Homepage ScheduleFinder still kept its local category when a preference was cleared elsewhere. This branch synchronizes the empty preference and adds an explicit bilingual clear control.
- Current main includes services/ahmv-voice-ai v0.9.0-preproduction and package-lock.json. The older v0.4 missing-lockfile blocker must not be applied to current main without fresh evidence.
- The saved v0.4 archive passed npm run verify here: 62 tests, 62 passed. This is package-specific verification, not v0.9 runtime or live-provider acceptance.
- PR #139 is open, draft and reported mergeable=false. Its branch diverged: 26 commits ahead and 215 behind the inspected main. Current main already contains the private bridge, live schedule adapter, SMS deduplication, retention and server wiring, plus replacement migrations 20261003091000_ahmv_voice_sessions.sql and 20261003110000_ahmv_phone_spanish.sql. Do not merge the old migration filenames or old bridge wholesale.
- Current main's weekly fallback still ends 2026-10-04. Schedule refresh is a concrete release dependency.
- Corrected the production runbook's obsolete npm run verify command: v0.9 exposes check, guardian, release:report and preflight.
- Current CI includes phone/SMS, team-feed, assistant, data, SEO, runtime, mobile navigation, media, monetization, Parent Premium, deployment safeguards, standalone voice install/check/audit, production build and artifact validation.

## Ordered tasks

| ID | Task | Dependency | Evidence required to close | Status |
| --- | --- | --- | --- | --- |
| A01 | Establish current source baseline and avoid old ZIP regressions | None | Commit SHA, current packages and current route inspections | Completed at checkpoint |
| A02 | Clear optional homepage category, including preference changes from another surface | A01 | Review fix, passing CI; browser check select/clear/reload and cross-surface clear | Implemented on coordination branch; validation pending |
| A03 | Reconcile PR #139 against current main | A01 | File-level comparison; resolve only remaining changes/conflicts; no duplicate migrations or features | Main already contains core functionality and replacement migrations; old draft must not be merged wholesale |
| A04 | Refresh official schedule continuously | A01 | Approved authoritative feed, provenance, freshness checks, expired-feed failure and exact-team lookup | Live configuration unverified |
| A05 | Verify the unified news feed end to end | A01 | Real official/community source delivery, source attribution, team/date filters, saved/reset preferences; unavailable provider leaves archive usable | UI present; connector acceptance unverified |
| A06 | Map authentic gallery assets to exact teams and seasons | A01 | Asset inventory, source/permission metadata, duplicate review, album/team links and mobile image checks | Pending |
| A07 | Reconcile Facebook team albums with the official team directory | A06 | Exact current team names/IDs, season naming, matching website albums; authorized account access for creation | Pending |
| A08 | Enforce separate AHMV product access through TAKATAK | A01 | AHMV absent from default dashboard; active ahmv_access required in server/API/UI and direct URLs; revoke/restore without data deletion | Cross-product acceptance unverified |
| A09 | Validate catalog, subscription and VIP behavior | A08 | Configurable prices, entitlement activation/revocation, preserved trial, no duplicate membership authority | Pending acceptance |
| A10 | Validate existing phone/SMS v2 against deployed environment | A04,A08 | Signature checks, contacts, consent, delivery callbacks, STOP/START, retries, duplicate-callback tests and reminder behavior | Source/CI scripts present; live unverified |
| A11 | Validate current Voice v0.9 | A03,A04,A10 | npm ci/check/audit, server boot, bridge readiness, TLS/WSS, FR/EN/ES calls, interruption/reconnect, one recap, cost/retention limits | Runtime present; live unverified |
| A12 | Validate release on actual production hostname | A02,A05,A06 | Green exact-SHA CI; public HTTPS health, FR/EN/mobile, news/gallery/schedules, redirects, robots/sitemap, rollback | Pending |
| A13 | Enable only release-ready integrations and indexing | A08-A12 | Product-specific live acceptance and recorded operational ownership; successful post-release smoke | Pending |
| A14 | Final handover | A13 | Deployed SHA, configuration inventory without secrets, monitoring, rollback and remaining limitations | Pending |

## Architecture reconciliation

The coordinating user's accepted architecture makes AHMV an independent product/experience powered by TAKATAK shared services. It must not appear automatically in the standard TAKATAK Dashboard. An active AHMV entitlement gates its private experience and direct/API access. Public schedules/news remain readable without a parent subscription.
The older TAKATAK_INTEGRATION_BOUNDARY.md describes a workspace inside TAKATAK and forbids a second hockey operational dashboard. Preserve that ban on recreating official hockey operations, while reconciling product navigation/access with the user's newer entitlement requirement. Inspect the actual TAKATAK implementation before changing its architecture.
Spordle, WLLV and official hockey providers retain authority for registration, scores, standings and schedule decisions.

## Release constraints and next evidence

The coordinating session has source access, not verified hosting/provider credentials or complete historical conversations. Do not mark account configuration, migrations, DNS, social publication or real calls complete from source inspection.
The saved voice fallback window ends 2026-10-04; inspect the current deployed feed/window before release. Do not bypass expired-data readiness.
First close A02 through CI. Then compare PR #139 and validate current schedule readiness. Keep each checkpoint tied to a commit and distinguish source presence, automated PASS, and live acceptance.
