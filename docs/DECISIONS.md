# AHM Verdun — decisions

Updated 2026-10-14. Retain original README/architecture documents. Do not overwrite approvals from external association owners.

## ADR-001: Release authority and runtime proof
Only GitHub `main` is release authority. Feature branches, legacy website-production branches and Lovable/editor previews are not deployed truth. Immutable release + Passenger restart + compiled SHA on /healthz are required evidence. No destructive force-push.

## ADR-002: Indexing is opt-in, not implicit
Documented release policy and `.env.example` require public indexing OFF until association/privacy/legal signoff. Automatic deploy previously defaulted to true, so this change uses false and requires two explicit production variables for true: `AHMV_PUBLIC_INDEXING=true`, `AHMV_PUBLIC_INDEXING_APPROVAL=PUBLIC-INDEXING-APPROVED`. Reject unauthorized indexing before upload. Manual deployment must also default to false, require its own explicit confirmation for true, pin the canonical `https://ahmverdun.ca` origin regardless of indexing mode, and fail before upload when the approved Passenger restart command is absent.

## ADR-003: Standalone AHM Verdun, TAKATAK as shared service
Site has its own AHMV identity and navigation. TAKATAK Auth handles cross-product identity; TAKATAK backend controls server-side subscription, entitlements and business data separation. Never mount TAKATAK operations dashboard in public AHMV.

## ADR-004: Real provenance and minors first
Schedules, public team exact IDs, TeamLinkt public widgets, social photos, source timestamps and results must be authorized and verifiable. No invented activities, rosters, scores, parents or private children images. Unapproved media remain hidden.

## ADR-005: Visual owner approval is a hard release gate
Louves visual failure #400 supersedes mere green CI. Draft #401 requires bilingual rendered screenshots at 320/390/768/1440 and explicit owner signoff. Draft schedule #403 likewise remains unmerged pending design/source review.

## ADR-006: Ship incrementally with quality gates
Continue coding independent features; commit/push to task branches, respect other agents, require CI critical security/build checks and actual production SHA proof before declaring any deployment finished. Never make external provider or billing changes without permissions/credentials.

## ADR-007: Manual release safeguards match automatic release

The manual workflow must default public indexing OFF and pin the exact canonical production origin even when indexing is disabled. An approved Passenger restart command is required **before** a release is uploaded. Search pages are required to be `noindex`; the runtime may legitimately choose `noindex, follow`, so the smoke test must not demand a mismatched follow directive.

## ADR-008: HTTP 403 WAF handling without false release success

The public deploy smoke uses verified TLS and preserves HTTP 4xx body content only so an identifiable WAF challenge can be detected. A recognized challenge may trigger the documented direct-origin diagnostic with the correct AHMV Host/SNI; arbitrary 4xx/5xx and transport errors must not be treated as success. This behavior is covered by a local fake-curl test and did not change youth data, SEO approval or external-provider gates.
