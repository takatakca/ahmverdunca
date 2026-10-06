# AHM Verdun — Production cutover runbook

**Target:** https://ahmverdun.ca  
**Rule:** deploy privately first with `VITE_PUBLIC_INDEXING=false`. Do not change hockey-operation systems.

## 0. Release source of truth

- GitHub `main` is the release source of truth.
- Record the exact approved GitHub SHA before deployment.
- A Lovable/editor preview must not be treated as the release candidate unless its reported commit SHA matches that approved GitHub SHA.
- Never publish a stale preview simply because it renders successfully.
- If a hosting/editor platform is behind `main`, synchronize it first, then rerun the complete CI/smoke-test gate against the synchronized candidate.

## 1. Before DNS/cutover

- Confirm the candidate commit is the intended `main` commit and record its full SHA.
- Require a green AHM Verdun CI run for that exact commit.
- Keep `VITE_PUBLIC_INDEXING=false`.
- Confirm the production environment contains only required secrets and public variables.
- Do not enable analytics, advertising, social publishing, newsletter, voice or TAKATAK integrations without explicit authorization.
- Keep server-only `AHMV_PHONE_PUBLIC=false` until a real inbound call succeeds.
- Confirm association approvals listed in `GO_LIVE_CHECKLIST.md`.
- Confirm the GitHub `production` environment and secrets from `MOCHAHOST_PRODUCTION.md` are configured and protected.
- Use the manual **Deploy AHM Verdun production** workflow; do not upload an untracked build by hand.

## 2. Private production deployment and smoke test

Run **Deploy AHM Verdun production** with the exact current green `main` SHA and `public_indexing=false`. The workflow must finish successfully before DNS/cutover work continues.


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
curl -fsS https://ahmverdun.ca/healthz
curl -I https://ahmverdun.ca/
curl -I https://ahmverdun.ca/recherche
curl -I https://ahmverdun.ca/robots.txt
curl -I https://ahmverdun.ca/sitemap.xml
curl -I https://ahmverdun.ca/schedules
curl -I https://ahmverdun.ca/news/38
curl -I https://ahmverdun.ca/albums/1
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

1. Re-run **Deploy AHM Verdun production** for the exact current green `main` SHA with `public_indexing=true`.
2. Enter `PUBLIC-INDEXING-APPROVED` in the workflow launch-confirmation field; this is a deliberate technical safeguard, not a substitute for the association approvals above.
3. Confirm the workflow passes its health, security-header and indexing-policy checks on `https://ahmverdun.ca`.
4. Confirm the homepage HTML and HTTP header are indexable.
5. Confirm `/recherche` and HTTP error pages remain noindex.
6. Confirm sitemap and robots use the canonical HTTPS domain.
7. Only then submit/refresh the sitemap in the authorized search-console account.

## 5. Phone activation

Do not expose the reserved number as an active public call channel until:

1. carrier/forwarding configuration is complete;
2. inbound call succeeds from an unrelated phone;
3. language/menu behavior is verified;
4. failure/after-hours behavior is acceptable.

Then set server-only `AHMV_PHONE_PUBLIC=true`. `/api/ahmv/phone-status` will enable click-to-call automatically; run the full CI/release gate and verify the public surfaces.

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

## 8. Deploy fails at “Detect production transport”

Symptom: `Auto deploy AHM Verdun production` fails at step 9, **Detect production transport**, after several minutes of SSH retries, while `https://ahmverdun.ca/healthz` still answers and port 22 on the host is reachable. Nothing is uploaded or activated, so production stays on the previous release.

Cause seen on 2026-10-05 and 2026-10-06: the MochaHost shared account `bolon.ca` (server `s3650.can1.stableserver.net`, IP `209.42.24.127`), which hosts ahmverdun.ca, is exhausted by hung Node.js/Passenger processes — the CloudLinux 100-process ceiling or IOPS pinned at 100 % — so the host cannot open a new SSH session for the deploy.

Fix:

1. Sign in to `clients.mochahost.com` and open the live chat (Orbi).
2. Ask: **“Reset the process and kill”** for the `bolon.ca` account (ahmverdun.ca). Support terminates the hung processes; IOPS and CPU drop back to 0 % and Passenger respawns workers on the next request.
3. Re-run the failed deploy from GitHub Actions (**Re-run jobs**), or push the next commit to `main`.
4. Confirm `GET /healthz` reports the new `release` SHA.

If it keeps recurring, the durable fix is fewer Node.js apps on that cPanel account or a host without the shared process ceiling.
