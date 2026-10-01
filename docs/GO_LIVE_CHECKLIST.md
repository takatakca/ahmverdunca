# AHM Verdun — Go-live checklist

This project is intentionally safe for proposal/pre-production use by default.

## Required before public indexing

1. Set `VITE_PUBLIC_INDEXING=true` in the production environment only.
2. Confirm the official AHM Verdun general email and mailing address before publishing them.
3. Approve the final privacy policy with the association.
4. Confirm authorized sponsor logos and visibility levels before replacing name-only partner cards.
5. Confirm the current weekly schedule ingestion source and update cadence.
6. Validate all public photo/video permissions involving minors.
7. Connect approved analytics, Search Console, Google Business Profile and social integrations only after authorization.
8. Keep Spordle, WLLV, league standings/results and other hockey-operation systems as the official source of truth.
9. Verify `/robots.txt`, `/sitemap.xml`, title/meta previews and social sharing on the production domain.
10. Run the full CI workflow and test mobile widths before release.

## Indexing behavior

- Default / preview builds: `noindex, nofollow`
- Production with `VITE_PUBLIC_INDEXING=true`: `index, follow`
- The server also sends a matching `X-Robots-Tag` header for HTML responses.

This prevents an accidental preview deployment from being indexed while making go-live a deliberate one-setting switch.
