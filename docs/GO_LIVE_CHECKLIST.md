# AHM Verdun — Go-live checklist

Current verified AHMV production baseline: GitHub `main` at `04663346d6c9c3bceb436938e02face629972b94` is deployed on MochaHost. AHM Verdun CI #1046 succeeded and production deploy #814 succeeded on failed-job retry attempt 2 after the first attempt stopped safely at the hosting transport gate.

The successful deployment verified the immutable release marker, Passenger restart, `/healthz`, homepage, core public routes, search noindex behavior, `robots.txt` and `sitemap.xml`. This does **not** make external providers automatically ready.

## Technical release gate — completed

- [x] Runtime `.env` files are excluded from Git and rejected by CI.
- [x] TypeScript, content validation, SEO validation, lint and production build run in CI.
- [x] Required public routes are validated in the generated sitemap.
- [x] `robots.txt` is validated against the canonical sitemap URL.
- [x] Server responses apply the configured indexing policy and baseline security headers.
- [x] A lightweight `/healthz` endpoint is available for production monitoring.
- [x] Demo/illustrative media are prevented from silently appearing as approved public media.
- [x] Public gallery records with protected media require provenance.
- [x] Official hockey systems remain external sources of truth.
- [x] Legacy same-domain routes are redirected to current destinations.
- [x] Production deployment is pinned to the intended green `main` SHA with rollback safeguards.
- [x] MochaHost release `04663346…` passed the full production smoke.
- [x] Bounded MochaHost SSH/SFTP retry handling is present; a transport-only failure cannot masquerade as an application release.
- [x] Docs-only main commits no longer consume a production deployment window.
- [x] TAKATAK AHMV/Family/Product/ADS/Moderation schema is present in production and staging.
- [x] 24 exact public teams are present in both TAKATAK environments.
- [x] AHMV ADS publisher plus six active placements are present.
- [x] Essential is 10 CAD/week and active/self-serve; Premium is 30 CAD/week and planned/non-self-serve; Smart Departure remains Premium-only.
- [x] TAKATAK #100 migration-history reconciler is merged and guarded.
- [x] TAKATAK #102 bounded weekly schedule freshness is merged.
- [x] TAKATAK #103 operational readiness + fail-closed Team Feed provisioning is merged.
- [x] Production Team Feed service maps the exact 24 AHMV team IDs and remains `planned` with provider null.
- [x] AHMV Team Feed and Team Games have separate, fail-closed configuration contracts.
- [x] Official AHMV Week 5 (October 5–11) is structured in the website schedule with source provenance.
- [x] The TAKATAK weekly snapshot publisher refuses to invent the source publication timestamp.
- [x] Colour-only schedule groups fail closed instead of being guessed onto exact teams.
- [x] Voice production-host promotion requires exact-SHA preproduction attestation and leaves public Twilio routing unchanged.
- [x] The install prompt is resilient to competing overlays, has a 14-day dismissal TTL and provides iPhone/iPad Add-to-Home-Screen guidance.

## Readiness right now

| Area | State | Next acceptance |
| --- | --- | --- |
| AHMV core production | **Ready** | Keep `04663346…` as verified baseline until a later production-affecting deploy |
| Public teams | **Ready** | Keep exact 24-team mapping regression-tested |
| Team Games / results bridge | Source ready | Shared service credential + final live exact-team upstream smoke |
| TAKATAK ADS publisher | **Ready** | Six active placements exist |
| TAKATAK ADS delivery | **Not inventory-ready** | 0 ADS subscriptions/campaigns/creatives/events; add real authorized inventory, smoke serve/events, then enable browser gate |
| Weekly official schedule | **Ready for Oct. 5–11** | Keep source provenance pinned; do not infer colour groups |
| Trusted TAKATAK schedule snapshot | Publisher/backend ready; snapshot absent | Verify the real offset-aware source timestamp or onboard approved continuous feed; never fabricate freshness |
| Team Feed mapping | **Provisioned, fail-closed** | One planned service, 24 team IDs, provider null |
| Team Feed subscription | **Not entitled** | AHMV client is `free / social_unsubscribed`; make legitimate subscription decision before provider connection |
| Meta / social delivery | Gates OFF | Accept Meta invitation, authorize approved Page/Instagram, configure provider/server state, sync/tag content, verify fallback |
| Phone/SMS | Source ready; live OFF | Real signed Twilio smoke + consent/STOP/START/callback checks |
| Voice | Source/CI/deploy gate ready; live OFF | Exact preprod attestation, production host TLS/WSS/credentials, bridge readiness, FR/EN/ES real-call acceptance |
| Family/Product | Live catalog/prices/entitlements verified | Final launch/exchange/introspection and revoke/restore E2E |
| TAKATAK staging Prisma history | #100 merged; not certified reconciled | Add protected `TAKATAK_STAGING_DATABASE_URL`; guarded workflow must succeed |
| Public indexing | Manual gate, currently fail-closed | Enable only after release owner accepts public/legal/provider items |

The current TAKATAK backend authority after #103 is `8adfa23ca50f52f6a49e0eaec68e933c68dd1c78`. Post-merge CI #492 completed successfully. Automatic staging reconciler #28 then failed safely because protected `TAKATAK_STAGING_DATABASE_URL` was empty; staging deployment #31 correctly skipped.

Run:

```bash
bun run report:production-readiness
```

For a target cutover, require only the modules intended to go live, for example:

```bash
bun run report:production-readiness --strict --require=core,schedule,teamGames,ads
```

The command reports only configuration names/states, never secret values. Add `teamFeed` only when the social/news bridge itself is genuinely intended to go live.

## External / association acceptance still required

- [ ] Configure protected `TAKATAK_STAGING_DATABASE_URL` so the guarded staging Prisma-history reconciliation can succeed.
- [x] Integrate official AHMV Week 5 for October 5–11 as the bounded current website fallback.
- [ ] Verify an exact trusted source publication timestamp and/or continuous authoritative schedule source/update cadence for TAKATAK snapshot ingestion.
- [x] Provision the production Team Feed service mapping for all 24 exact teams without activating provider/billing.
- [ ] Make the legitimate Team Feed social subscription/entitlement decision; do not fabricate paid state.
- [ ] Accept the AHM Verdun Meta Business portfolio invitation before its November 2, 2026 expiry and connect only approved Page/Instagram assets.
- [ ] Configure current Team Feed provider credentials/state and verify attribution/unavailable-provider fallback.
- [ ] Create real authorized ADS subscription/campaign/creative inventory and complete serving/event smoke.
- [ ] Complete real Twilio provider acceptance before changing public phone routing.
- [ ] Deploy/verify the standalone Voice runtime through preproduction attestation with current credentials, TLS/WSS, bridge readiness and rollback.
- [ ] Validate public photo/video permissions involving minors.
- [ ] Confirm final privacy/legal/public-contact details required by the association.
- [ ] Approve analytics/Search Console/Google Business/social integrations before enabling them.
- [ ] Set `VITE_PUBLIC_INDEXING=true` only after the release owner accepts every item that affects public indexing.

## Operational rule

Never compensate for a missing provider credential, official source, authorization, real commercial inventory or protected database secret by inventing data, writing migration history by hand, changing billing state without authority, or weakening a fail-closed gate. Keep that module disabled and ship the rest of the verified site.

See `docs/FINAL_RELEASE_STATUS.md`, `docs/PRODUCTION_CONFIGURATION_INVENTORY.md` and `docs/COORDINATED_COMPLETION.md` for the release dossier.
