# AHM Verdun — Go-live checklist

This project is intentionally safe for proposal/pre-production use by default.

## Technical release gate — completed in code

- [x] Runtime `.env` files are excluded from Git and rejected by CI.
- [x] TypeScript, content validation, SEO validation, lint and production build run in CI.
- [x] Required public routes are validated in the generated sitemap.
- [x] `robots.txt` is validated against the canonical sitemap URL.
- [x] Preview builds default to `noindex, nofollow`.
- [x] Server responses apply matching `X-Robots-Tag` behavior, including permanent noindex handling for Search and HTML error responses.
- [x] Baseline browser security headers are enabled and runtime response policy is regression-tested in CI.
- [x] A lightweight `/healthz` endpoint is available for production health monitoring without invoking hockey operations.
- [x] Demo/illustrative media are prevented from silently appearing as approved public media.
- [x] Unapproved team social accounts and inactive communication services are hidden from public launch mode.
- [x] Public gallery records with protected media require an official source URL.
- [x] Spordle, WLLV, standings/results and other hockey-operation systems remain external sources of truth.
- [x] Legacy same-domain routes are redirected to current destinations for domain cutover.
- [x] The reserved phone is hidden from indexed production until explicitly activated.
- [x] Production deployment is manual, environment-protected, pinned to the exact current green `main` SHA and has automatic rollback on failed activation.

## Association / production approvals still required before indexing

- [ ] Configure and protect the GitHub `production` environment plus the AHMV-specific production deployment secrets documented in `MOCHAHOST_PRODUCTION.md`.

- [ ] Confirm the official AHM Verdun general email.
- [ ] Confirm the official mailing address.
- [ ] Approve the final privacy policy with the association.
- [ ] Confirm authorized sponsor logos and visibility levels.
- [ ] Confirm the current weekly schedule ingestion source and update cadence.
- [ ] Validate all public photo/video permissions involving minors.
- [ ] Approve any analytics, Search Console, Google Business Profile and social integrations.
- [ ] Complete the approved production hosting/DNS cutover for `ahmverdun.ca`.
- [ ] Activate and test the reserved phone with a real inbound call, then set `AHMV_PHONE_PUBLIC=true`.
- [ ] Verify `/healthz`, `/robots.txt`, `/sitemap.xml`, `/recherche` noindex headers, title/meta previews, legacy redirects and social sharing on the actual new production deployment.
- [ ] Run the full CI workflow and perform the final mobile/desktop smoke test against the production hostname.
- [ ] Set `VITE_PUBLIC_INDEXING=true` only after every item above that affects public release is approved.

## Indexing behavior

- Default / preview builds: `noindex, nofollow`
- Production before approval: keep `VITE_PUBLIC_INDEXING=false`
- Approved public production: set `VITE_PUBLIC_INDEXING=true` and redeploy
- The server sends a matching `X-Robots-Tag` header for HTML responses.

This makes go-live a deliberate release decision rather than a side effect of deployment.

See `docs/FINAL_RELEASE_STATUS.md` for the complete release dossier.
