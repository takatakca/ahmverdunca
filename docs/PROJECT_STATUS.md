# AHM Verdun — PROJECT STATUS

Updated 2026-10-14. Source authority: [takatakca/ahmverdunca](https://github.com/takatakca/ahmverdunca), branch `main`. This is an operational summary, not a claim of 100% feature completion. See `docs/RELEASE_HANDOFF_2026-10-14.md`, `docs/FINAL_RELEASE_STATUS.md` and `WORKLOG.md`.

## Latest verified releases (2026-10-14)

- **Current certified production application:** `de96f2e65d403b398209f5ba5042ee0ca7a61903`, merged PR [#410](https://github.com/takatakca/ahmverdunca/pull/410). Main [CI #38623287164](https://github.com/takatakca/ahmverdunca/actions/runs/38623287164) and [production #38623392436](https://github.com/takatakca/ahmverdunca/actions/runs/38623392436) succeeded. Runner HTTP `/healthz` reported exact compiled SHA; homepage `noindex`, routes, CSS/JS and search `noindex` passed. Curl WAF 403 body handling corrected with controlled CI integration test.
- **Previous release:** `08fcd8042e1de55f978deb49914bab70cdfa89bf`, PR [#409](https://github.com/takatakca/ahmverdunca/pull/409); [main CI #38622825907](https://github.com/takatakca/ahmverdunca/actions/runs/38622825907) and [production #38622947479](https://github.com/takatakca/ahmverdunca/actions/runs/38622947479) succeeded. Manual deploy defaults public indexing off, pins `https://ahmverdun.ca`, verifies Passenger restart config before upload and checks the true `/recherche` noindex contract.
- Source-only documentation commits may advance `main` after these releases; do **not** mistake the latest Markdown SHA for the compiled runtime release.
- Owner-gated draft PRs #401 (Louves, issue #400) and #403 (schedule carousel) remain **unmerged**. No public youth/social/Telecom/TAKATAK entitlement integrations were activated by these releases.

## Historical verified checkpoints
- Main before this corrective branch: `0decde9cd304273669f992ea6923edda5caf7432` (docs-only last merge).
- Previous certified **compiled application** release before this work: `ed18150e284bc9ba67cd86dcf00dbc2e90c19097`. CI [#38609679980](https://github.com/takatakca/ahmverdunca/actions/runs/38609679980), production [#38609816080](https://github.com/takatakca/ahmverdunca/actions/runs/38609816080), both succeeded. Production workflow certified compiled /healthz identity, Passenger restart, homepage, routes, robots/sitemap. Independent web retrieval was unavailable.
- PRs #404 (menu accessibility), #405 (mobile Assistant dock), #406 (nudge overlap) have green production releases. Former conflicting #391 closed as superseded.
- Draft PRs #401 (Louves M12B) and #403 (schedule carousel) have CI/visual tests but are **not approved or deployed**; #400 explicitly requires Louves design signoff.

## October 14 production correction completed

- PR [#408](https://github.com/takatakca/ahmverdunca/pull/408) merged to `main`, compiled SHA `c614dc9be786ce04710d2e9463c9c576f85369ce`.
- Main CI [#38613657967](https://github.com/takatakca/ahmverdunca/actions/runs/38613657967) **success**; auto production [#38614134421](https://github.com/takatakca/ahmverdunca/actions/runs/38614134421) **success**.
- Production GitHub-runner HTTP evidence at 2026-10-14 18:22:56 UTC: `GET /healthz` returned `{"ok":true,"service":"ahmverdun-web","release":"c614dc9be786ce04710d2e9463c9c576f85369ce"}`; homepage check confirmed `Public indexing is disabled and homepage is correctly noindex.`
- This proves runtime / public indexing state, **not** external Phone/Voice/Parent Premium/social provider acceptance.

## Open completion gates
- Public SEO indexing remains disabled; association release/privacy/legal acceptance is still outstanding. Both automatic and manual release defaults are protected by explicit opt-in.
- Source-verified continuous schedule; association approval of youth media, contact and legal policy.
- TeamLinkt public widgets, OAuth/syndication/Meta permissions and moderators.
- TAKATAK Auth/billing/entitlement provider, live Parent Premium acceptance (#120).
- Twilio/NumberBarn ownership, migration/RLS, SMS/Voice credentials, real calls (#127).
- Live ADS inventory, separate backend staging migration-history certification.

AHMV is an independent product. Shared TAKATAK identity and entitlements operate server-side; no master dashboard embedded into association website. For the next actionable task, use `docs/TASK_QUEUE.md`.
