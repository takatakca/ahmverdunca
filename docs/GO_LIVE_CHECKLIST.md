# AHM Verdun — Go-live checklist

This project is intentionally safe for proposal/pre-production use by default.

## Technical release gate — completed in code

- [x] Runtime `.env` files are excluded from Git and rejected by CI.
- [x] TypeScript, content validation, SEO validation, lint and production build run in CI.
- [x] Required public routes are validated in the generated sitemap.
- [x] `robots.txt` is validated against the canonical sitemap URL.
- [x] Preview builds default to `noindex, nofollow`.
- [x] Server responses apply matching `X-Robots-Tag` behavior.
- [x] Baseline browser security headers are enabled.
- [x] Demo/illustrative media are prevented from silently appearing as approved public media.
- [x] Unapproved team social accounts and inactive communication services are hidden from public launch mode.
- [x] Public gallery records with protected media require an official source URL.
- [x] Legacy AHMV news, album, schedule and photo URLs have cutover redirects so indexed/bookmarked links do not become 404s.
- [x] Functional operations and girls-hockey contact emails are validated by CI.
- [x] The reserved AHMV phone number is hidden from indexed production, including structured data, until explicitly activated.
- [x] Spordle, WLLV, standings/results and other hockey-operation systems remain external sources of truth.

## Association / production approvals still required before indexing

- [ ] Confirm the official AHM Verdun general email.
- [ ] Activate and test 1 (581) 666-6AHM with the chosen carrier/phone system, then set `SITE.phonePublic=true` only when calls are ready for families.
- [ ] Confirm the official mailing address.
- [ ] Approve the final privacy policy with the association.
- [ ] Confirm authorized sponsor logos and visibility levels.
- [ ] Confirm the current weekly schedule ingestion source and update cadence.
- [ ] Validate all public photo/video permissions involving minors.
- [ ] Approve any analytics, Search Console, Google Business Profile and social integrations.
- [ ] Complete the approved production hosting/DNS cutover for `ahmverdun.com`.
- [ ] Verify `/robots.txt`, `/sitemap.xml`, title/meta previews, redirects and social sharing on the actual new production deployment.
- [ ] Run the full CI workflow and perform the final mobile/desktop smoke test against the production hostname. Browser automation was not available in the repository session, so this must be completed on the actual deployment.
- [ ] Set `VITE_PUBLIC_INDEXING=true` only after every item above that affects public release is approved.

## Indexing behavior

- Default / preview builds: `noindex, nofollow`
- Production before approval: keep `VITE_PUBLIC_INDEXING=false`
- Approved public production: set `VITE_PUBLIC_INDEXING=true` and redeploy
- The server sends a matching `X-Robots-Tag` header for HTML responses.

This makes go-live a deliberate release decision rather than a side effect of deployment.

See `docs/FINAL_RELEASE_STATUS.md` for the complete release dossier.
