# AHM Verdun — Production cutover runbook

**Target:** https://ahmverdun.com  
**Rule:** deploy privately first with `VITE_PUBLIC_INDEXING=false`. Do not change hockey-operation systems.

## 1. Before DNS/cutover

- Confirm the candidate commit is the intended `main` commit.
- Require a green AHM Verdun CI run for that exact commit.
- Keep `VITE_PUBLIC_INDEXING=false`.
- Confirm the production environment contains only required secrets and public variables.
- Do not enable analytics, advertising, social publishing, newsletter, voice or TAKATAK integrations without explicit authorization.
- Keep `SITE.phonePublic=false` until a real inbound call succeeds.
- Confirm association approvals listed in `GO_LIVE_CHECKLIST.md`.

## 2. Private production smoke test

Test the candidate deployment before public DNS cutover:

- `/`
- `/horaires`
- `/equipes`
- `/inscriptions`
- `/tournois`
- `/nouvelles`
- `/galerie`
- `/arenas`
- `/faq`
- `/ressources`
- `/partenaires`
- `/contact`
- `/confidentialite`
- `/recherche`
- `/healthz`

Check FR/EN, mobile navigation, saved team, external official gateways, 404 and one legacy redirect.

## 3. HTTP verification after cutover

Run from a machine outside the hosting network:

```sh
curl -fsS https://ahmverdun.com/healthz
curl -I https://ahmverdun.com/
curl -I https://ahmverdun.com/recherche
curl -I https://ahmverdun.com/robots.txt
curl -I https://ahmverdun.com/sitemap.xml
curl -I https://ahmverdun.com/schedules
curl -I https://ahmverdun.com/news/38
curl -I https://ahmverdun.com/albums/1
```

Expected before public indexing approval:

- `/healthz`: HTTP 200, JSON, `Cache-Control: no-store`.
- HTML: `X-Content-Type-Options: nosniff`.
- HTML: `Referrer-Policy: strict-origin-when-cross-origin`.
- HTML: `X-Frame-Options: SAMEORIGIN`.
- HTML: restrictive `Permissions-Policy`.
- Public HTML before approval: `X-Robots-Tag: noindex, nofollow`.
- `/recherche`: remains noindex after launch.
- Legacy paths: permanent redirect to the intended current destination.

## 4. Public indexing activation

Only after all applicable approval items are complete:

1. Set `VITE_PUBLIC_INDEXING=true`.
2. Rebuild and redeploy the exact approved release.
3. Confirm the homepage HTML and HTTP header are indexable.
4. Confirm `/recherche` and HTTP error pages remain noindex.
5. Confirm sitemap and robots use the canonical HTTPS domain.
6. Only then submit/refresh the sitemap in the authorized search-console account.

## 5. Phone activation

Do not expose the reserved number as an active public call channel until:

1. carrier/forwarding configuration is complete;
2. inbound call succeeds from an unrelated phone;
3. language/menu behavior is verified;
4. failure/after-hours behavior is acceptable.

Then change `SITE.phonePublic` to `true` in a reviewed PR and run the full CI gate.

## 6. GO / NO-GO

GO only when:

- exact release commit is known;
- CI is green;
- health check is 200;
- critical routes render;
- mobile/desktop smoke test passes;
- official external links work;
- privacy/media/contact approvals are satisfied;
- noindex/index state matches the release phase.

NO-GO and rollback if:

- home/schedules/registration fail;
- unexpected 5xx responses occur;
- wrong or stale official information is exposed;
- protected media becomes public;
- search/error pages become indexable;
- redirects loop;
- HTTPS/certificate is invalid.

## 7. Rollback

Keep the previous known-good deployment/release available during cutover.

If a NO-GO condition occurs:

1. restore the previous deployment or point traffic back to the previous origin;
2. keep `VITE_PUBLIC_INDEXING=false` on the failed candidate;
3. verify the public hostname is healthy again;
4. record the failing URL, status, time and release commit;
5. fix through a reviewed PR and repeat this runbook.

Never “fix live” by changing hockey data, DNS, secrets or indexing without recording the change.
