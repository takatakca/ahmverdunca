# AHM Verdun — Final release status

**Date:** 2026-10-01  
**Project:** AHM Verdun 2026–2027  
**Digital delivery:** GROUPE TAKATAK  
**Target domain:** https://ahmverdun.com

## 1. Current status

The public-site code is feature-complete for the approved public-information scope.

The application is intentionally safe in pre-production by default. It does not become indexable until the production environment explicitly sets `VITE_PUBLIC_INDEXING=true`.

The current public architecture does **not** recreate hockey operations. Spordle, WLLV, official tournament systems and league/schedule systems remain authoritative for registration, standings, results and other hockey operations.

## 2. Completed public sections

- Home / parent quick-access hub
- Weekly schedules and official schedule gateways
- Team/category directory: M5, M7, M9, M11, M13, M15, M18, Junior and girls' hockey
- Individual team/category pages
- Registration guidance and official Spordle handoff
- WLLV AA/BB gateway
- M11 tournament gateway
- News centre
- Photo/video archive with official AHMV album fallbacks
- Coach and volunteer resources
- Arena directory and individual arena pages
- FAQ and local site search
- Hockey resources and financial-assistance links
- Partners and sponsorship presentation
- Contact and operations/volunteering contact
- Privacy page
- FR/EN interface
- Mobile quick navigation and saved preferred team
- Voice-assisted local search when the browser supports it
- 404 and catastrophic SSR error handling

## 3. Production safeguards already implemented

- Runtime `.env` files are not tracked.
- CI rejects committed runtime environment files.
- Server-only secrets are separated from public `VITE_` variables.
- HTML defaults to `noindex, nofollow` until explicit launch approval.
- Matching `X-Robots-Tag` headers are applied server-side.
- Baseline browser hardening headers are enabled.
- Sitemap is generated from the current content model.
- CI validates `robots.txt`, canonical sitemap domain, duplicate URLs and required public routes.
- CI validates content integrity, references, dates, times and HTTPS links.
- Demo/illustrative media cannot silently become public production media.
- Unapproved team social accounts are hidden.
- Planned newsletter/voice-service messaging is preview-only.
- Protected photo albums retain official AHMV source links without copying media involving minors.
- Empty public filter categories are hidden instead of showing dead/empty states.
- Critical filter state is exposed to assistive technologies.

## 4. Current verified public sources

The project currently uses or links to these authoritative/public sources as appropriate:

- AHM Verdun legacy/public site for migrated public news, albums and weekly published information.
- Spordle for hockey registration and official member services.
- WLLV for AA/BB hockey.
- Official M11 tournament website for tournament registration/rules.
- Official schedule/standings providers for hockey schedule data.
- Municipal/institutional arena pages for addresses and facilities.
- Hockey Québec, Hockey Canada and named assistance programs for external resources.

The site must continue to treat those operational systems as sources of truth rather than duplicating their authority.

## 5. CI release gate

Every pull request and push to `main` runs:

1. Repository hygiene
2. Dependency installation
3. TypeScript type check
4. Content/data integrity validation
5. Public SEO/sitemap validation
6. ESLint
7. Production build

A release candidate should not be merged when any gate fails.

## 6. What still requires external approval or access

These are not code defects and must not be fabricated:

- official general AHM Verdun email address;
- official mailing address;
- final association approval of the privacy policy;
- approved sponsor logos and visibility levels;
- approved official hero/news/gallery media and permissions involving minors;
- authorization for analytics, Search Console, Google Business Profile and social integrations;
- authorization/credentials for newsletter, voice or other future communication services;
- production hosting/DNS cutover from the current site to the new application.

Until those approvals exist, the code intentionally uses safe fallbacks.

## 7. Production cutover sequence

1. Deploy the current `main` build to the approved production hosting environment with `VITE_PUBLIC_INDEXING=false`.
2. Test the production hostname privately: home, schedules, teams, registration, arenas, news, gallery, search, FR/EN, mobile navigation and external gateways.
3. Confirm the final public media, privacy approval, sponsor assets and association contact details.
4. Confirm the current weekly schedule source/update process.
5. Perform the approved hosting/DNS cutover for `ahmverdun.com`.
6. Verify HTTPS, redirects, `/robots.txt`, `/sitemap.xml`, 404 behavior and server headers on the actual production domain.
7. Set `VITE_PUBLIC_INDEXING=true` only after the new production domain is confirmed correct.
8. Rebuild/redeploy and verify the HTML robots meta plus `X-Robots-Tag`.
9. Connect only the analytics/social/search tools explicitly authorized by the association.
10. Submit/refresh the sitemap in the approved search-console account.

## 8. Operating rule after launch

Families should always be able to find the correct answer or official destination quickly.

Do not add a feature merely because it is technically possible. New functionality must improve a real parent, volunteer, coach, sponsor or association workflow and preserve the separation between public digital experience and hockey operations.

For architectural boundaries, see `docs/TAKATAK_INTEGRATION_BOUNDARY.md`.
For launch approvals, see `docs/GO_LIVE_CHECKLIST.md`.
