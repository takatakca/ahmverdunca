# AHM Verdun — Go-live checklist

Current verified release baseline: GitHub `main` at `4330086ca292c8f149c42865d04e9ba9fdae62d9` is deployed on MochaHost. AHM Verdun CI #1020 and production deploy #788 both succeeded.

The deploy verified the immutable release marker, Passenger restart, `/healthz`, homepage, core public routes, search noindex behavior, `robots.txt` and `sitemap.xml`. This does **not** make external providers automatically ready.

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
- [x] MochaHost release `4330086…` passed the full current production deployment smoke.
- [x] TAKATAK AHMV/Family/Product/ADS/Moderation database schema is present in production and staging.
- [x] 24 exact public teams are present in both TAKATAK environments.
- [x] AHMV ADS publisher plus six placements are present in both TAKATAK environments.
- [x] Essential remains 10 CAD/week and active/self-serve; Premium remains 30 CAD/week and non-vendable/planned; Smart Departure remains Premium-only.
- [x] TAKATAK #100 migration-history reconciler is merged and CI-validated before merge.
- [x] AHMV Team Feed and Team Games now have separate, fail-closed production configuration contracts.

## Readiness right now

| Area | State | Next acceptance |
| --- | --- | --- |
| AHMV core production | **Ready** | Keep `4330086…` as current verified baseline until next deploy |
| Public teams | **Ready** | Keep exact 24-team mapping regression-tested |
| Team Games / results bridge | Source ready | Shared service credential + final live exact-team upstream smoke |
| TAKATAK ADS backend/placements | Data/backend ready | Final live serve/event smoke, then intentionally enable browser gate |
| Continuous official schedule | Backend ready; source not live | Approved current authoritative source + freshness/provenance smoke |
| Team Feed / social delivery | Contract ready; gates OFF | Accept/authorize provider account, configure server credential, verify attribution/fallback |
| Phone/SMS | Source ready; live OFF | Real signed Twilio smoke + consent/STOP/START/callback checks |
| Voice | Source/CI ready; live OFF | Runtime credentials, TLS/WSS, bridge readiness, FR/EN/ES real-call acceptance |
| Family/Product | Contract/data present | Final launch/exchange/introspection and revoke/restore E2E before exposing gated UX |
| TAKATAK staging Prisma history | #100 merged; not certified reconciled | Add protected `TAKATAK_STAGING_DATABASE_URL`; guarded workflow must succeed |
| Public indexing | Manual gate | Enable only after release owner accepts remaining public/legal/provider items |

Run:

```bash
bun run report:production-readiness
```

For a target cutover, require only the modules intended to go live, for example:

```bash
bun run report:production-readiness --strict --require=core,schedule,teamGames,ads
```

The command reports only configuration names/states, never secret values. Add `teamFeed` only when the social/news bridge itself is intended to go live.

## External / association acceptance still required

- [ ] Configure the protected TAKATAK staging database URL so #100 can complete the guarded Prisma-history reconciliation automatically.
- [ ] Provide/verify the current authoritative continuous schedule source and update cadence.
- [ ] Accept/authorize the AHM Verdun Meta Business portfolio and connect only approved Page/Instagram assets.
- [ ] Configure current Team Feed provider credentials server-side and verify attribution/unavailable-provider fallback.
- [ ] Complete real Twilio provider acceptance before changing public phone routing.
- [ ] Verify the standalone Voice runtime with current credentials, TLS/WSS, bridge readiness and rollback.
- [ ] Validate public photo/video permissions involving minors.
- [ ] Confirm final privacy/legal/public-contact details required by the association.
- [ ] Approve analytics/Search Console/Google Business/social integrations before enabling them.
- [ ] Set `VITE_PUBLIC_INDEXING=true` only after the release owner accepts every item that affects public indexing.

## Operational rule

Never compensate for a missing provider credential, official source, authorization or protected database secret by inventing data, writing migration history by hand, or weakening a fail-closed gate. Keep that module disabled and ship the rest of the verified site.

See `docs/FINAL_RELEASE_STATUS.md`, `docs/PRODUCTION_CONFIGURATION_INVENTORY.md` and `docs/COORDINATED_COMPLETION.md` for the release dossier.
