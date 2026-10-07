# Public site hardening — October 7, 2026

This release follows production `403ba425087d1aa9e0b0c4fa9ef881875c95b9cb`.
The exact active release remains observable at `https://ahmverdun.ca/healthz`;
GitHub Actions deployment results are the release evidence.

## Dependency security

Seven compatible transitive resolutions were refreshed with Bun 1.4.2's
`bun audit fix`: both installed brace-expansion versions, js-yaml, nanoid,
seroval, shell-quote and source-map-js. Direct dependency ranges and framework
versions are unchanged. The audit changed from 16 advisories to zero. CI now
runs `bun audit --audit-level=high` after the frozen dependency install.
The standalone Voice service has a separate clean audit and remains subject
to its existing provider configuration and preproduction gates.

## Public Facebook feed

Browsers now request `GET /api/ahmv/community-feed` on the AHMV site. The
server contacts the existing fixed public TAKATAK community-feed endpoint,
without forwarding visitor cookies or credentials and without following
redirects. Concurrent requests share one operation, bounded to six seconds;
both successful and unavailable results are cached internally for one minute.
Only validated public post fields are returned. Other HTTP methods return 405.

An unavailable or unconnected provider returns explicit `connected: false`
and an empty item list. The official public Facebook Page plugin, external
Page link and genuine AHMV gallery remain available. This bridge does not
provide a Meta OAuth authorization or turn archived gallery photos into live
Facebook posts. The upstream endpoint still returned 404 during this release's
audit; enabling automatic ingestion requires the actual provider service.
Post dates are displayed in Montréal time.

## Mobile interaction

An expanded multi-team picker participates in the existing attention priority
policy, preventing the first-visit welcome or install prompt from interrupting
selection. Collapsing it releases that priority. Saved choices and exact-team
links retain their existing behavior.

Sponsorship proposals use `ahmverdun.ca@gmail.com` by default. Preparation
does not transmit the form; the visitor sends through the explicit email link
or downloads the complete proposal. No personal form data is stored as a UI
preference.
