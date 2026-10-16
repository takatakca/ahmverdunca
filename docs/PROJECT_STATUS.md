# AHM Verdun — PROJECT STATUS

Updated 2026-10-16. Source authority: [takatakca/ahmverdunca](https://github.com/takatakca/ahmverdunca), branch `main`. This is an operational summary, not a claim of 100% feature completion. See `docs/RELEASE_HANDOFF_2026-10-14.md`, `docs/FINAL_RELEASE_STATUS.md` and `WORKLOG.md`.

## Current certified production release (2026-10-16)

- PR [#411](https://github.com/takatakca/ahmverdunca/pull/411) merged into `main` at `039111a8c723ffbfbf85f8a364f3132a2be0d447`. Branch [CI #38950318005](https://github.com/takatakca/ahmverdunca/actions/runs/38950318005), main [CI #38950476979](https://github.com/takatakca/ahmverdunca/actions/runs/38950476979), and automatic [production #38950582023](https://github.com/takatakca/ahmverdunca/actions/runs/38950582023) all **succeeded**.
- Runner production `GET /healthz` returned `{"ok":true,"service":"ahmverdun-web","release":"039111a8c723ffbfbf85f8a364f3132a2be0d447"}`; homepage remained **noindex**, public routes, compiled CSS/JS, search noindex, robots and sitemap passed. This is production deployment proof, not approval of pending providers.
- Critical XSS advisory GHSA-qx66-fv34-fjm8 remediated by pinning audited `@tanstack/react-start@1.168.60`, `@tanstack/start-server-core@1.169.39` and compatible React Router/Router Core. Bun dependency audit reports **0 vulnerabilities**; protected CI and production artifact build succeeded. One-time lock refresh workflow was deleted after use.
- AHMV Family auth now rejects malformed/oversized cookie input without exceptions and limits TAKATAK login exchange to 5 seconds; provider failures return no-store/noindex 503 with **no session cookie**.
- **Open external gates unchanged**: Louves design issue #400/PR #401 and schedule PR #403 require owner acceptance; TAKATAK entitlements, official schedule sources, Twilio carrier, Supabase permissions and youth/social media still need verified approvals.

## Historical verified releases (2026-10-14)

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
