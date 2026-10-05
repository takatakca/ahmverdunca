# AHM Verdun — Go-live checklist

Current release baseline: GitHub `main` at `cc7618651806f2b9fcc78c9e97b4d8f7395fd24a` is deployed on MochaHost. Core Passenger/HTTP health, homepage, public routes, robots and sitemap have passed the current production smoke. This does **not** make external providers automatically ready.

## Technical release gate — completed in code / production baseline

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
- [x] Current MochaHost release `cc761865…` passed core HTTP deployment smoke.
- [x] TAKATAK AHMV/Family/Product/ADS/Moderation database schema is present in production and staging.
- [x] 24 exact public teams are present in both TAKATAK environments.
- [x] AHMV ADS publisher plus six placements are present in both TAKATAK environments.
- [x] Essential remains 10 CAD/week and active/self-serve; Premium remains 30 CAD/week and non-vendable/planned; Smart Departure remains Premium-only.

## Readiness right now

| Area | State | Next acceptance |
| --- | --- | --- |
| Public teams | Ready | Keep exact 24-team mapping regression-tested |
| TAKATAK ADS backend/placements | Ready in data/source | Enable browser gate only after final live serve/event smoke |
| Continuous official schedule | Blocked externally | Approved authoritative source + freshness/provenance smoke |
| Team Feed / social delivery | Blocked externally | Authorized provider accounts/connectors + attribution/fallback smoke |
| Phone/SMS | Source ready, live blocked | Real signed Twilio smoke + consent/STOP/START/callback checks |
| Voice | Source/CI ready, live blocked | Runtime credentials, TLS/WSS, bridge readiness, FR/EN/ES real-call acceptance |
| Family/Product | Contract/data present | Final launch/exchange/introspection and revoke/restore E2E before exposing gated UX |
| Public indexing | Manual gate | Enable only after release owner accepts remaining public/legal/provider items |

Run:

```bash
bun run report:production-readiness
```

For a target cutover, require only the modules intended to go live, for example:

```bash
bun run report:production-readiness --strict --require=core,schedule,teamFeed,ads
```

The command reports only configuration names/states, never secret values.

## External / association approvals still required

- [ ] Provide/verify the approved continuous schedule source and update cadence.
- [ ] Authorize the social accounts/connectors used for Team Feed and Facebook reconciliation.
- [ ] Complete real Twilio provider acceptance before changing public phone routing.
- [ ] Verify the standalone Voice runtime with real credentials, TLS/WSS, bridge readiness and rollback.
- [ ] Validate public photo/video permissions involving minors.
- [ ] Confirm final privacy/legal/public-contact details required by the association.
- [ ] Approve analytics/Search Console/Google Business/social integrations before enabling them.
- [ ] Set `VITE_PUBLIC_INDEXING=true` only after the release owner accepts every item that affects public indexing.

## Operational rule

Never compensate for a missing provider credential, official source, or authorization by inventing data or weakening a fail-closed gate. Keep that module disabled and ship the rest of the verified site.

See `docs/FINAL_RELEASE_STATUS.md`, `docs/PRODUCTION_CONFIGURATION_INVENTORY.md` and `docs/COORDINATED_COMPLETION.md` for the release dossier.
