# AHM Verdun — agent handoff

Updated 2026-10-14. This is the current operational checkpoint. Always check live GitHub `main`, `AGENTS.md`, top of `WORKLOG.md`, open issues/PRs and Actions before resuming. The older checkpoints remain in Git history.

## Last completed work

Two independent production release safety corrections were completed, merged and **runtime-verified**:

1. **PR #409** (manual production deployment safety): `public_indexing` defaults `false` instead of `true`; manual activation pins the exact `https://ahmverdun.ca` production origin and validates required Passenger restart command **before upload**. `/recherche` noindex smoke matches the real response policy (`noindex, follow` can be valid). Feature-branch and main CI passed. Main merge SHA **`08fcd8042e1de55f978deb49914bab70cdfa89bf`**; main [CI #38622825907](https://github.com/takatakca/ahmverdunca/actions/runs/38622825907) and [auto deploy #38622947479](https://github.com/takatakca/ahmverdunca/actions/runs/38622947479) passed with exact compiled `/healthz` SHA and homepage noindex.
2. **PR #410** (deploy smoke WAF HTTP 403): public curl retains 403 body with `--fail-with-body`, identifies recognized WAF/browser challenge **before** exiting for status 22, then uses only the existing constrained origin diagnostic fallback. Ordinary curl/network failures continue to fail; public TLS validation remains required. Added a fake-curl HTTP 403 integration regression test. Main merge SHA **`de96f2e65d403b398209f5ba5042ee0ca7a61903`**; main [CI #38623287164](https://github.com/takatakca/ahmverdunca/actions/runs/38623287164) and [auto deploy #38623392436](https://github.com/takatakca/ahmverdunca/actions/runs/38623392436) **passed**.

**Latest certified compiled production SHA: `de96f2e65d403b398209f5ba5042ee0ca7a61903`.** At 2026-10-14 19:25 UTC the MochaHost Actions runner got `{"ok":true,"service":"ahmverdun-web","release":"de96f2e65d403b398209f5ba5042ee0ca7a61903"}` from production `/healthz`, checked homepage **noindex**, `/recherche` noindex, core routes and exact release CSS/JS; the production deployment job ended SUCCESS. This is runtime evidence, not acceptance of external vendors or owner visuals.

## Branches, files, and commits

- Release authority: `takatakca/ahmverdunca`, default `main`. Last source-changing merge: `de96f2e65d403b398209f5ba5042ee0ca7a61903`. Most recent documentation commit completed before this handoff edit: `357b453ed60be5e7c21c969617059e8afe464887`. Docs-only commits after the compiled release do not redeploy the app; retrieve current `main` SHA anew before changes.
- PR #409 changed `.github/workflows/deploy-production.yml`, `scripts/validate-deployment-concurrency.ts`, `docs/PRODUCTION_CONFIGURATION_INVENTORY.md`, `docs/DEPLOYMENT.md`, `docs/DECISIONS.md` and `WORKLOG.md`.
- PR #410 changed `scripts/deploy-production-http-smoke.sh`, `scripts/deploy-production-http-smoke.test.ts` and `WORKLOG.md`.
- Post-release docs-only updates: `WORKLOG.md`, `docs/PROJECT_STATUS.md`, `docs/TASK_QUEUE.md`, `docs/DEPLOYMENT.md`, `docs/DECISIONS.md`, `docs/RELEASE_HANDOFF_2026-10-14.md` and this handoff.

## Checks performed and known issues

- GitHub connector inspections: repository/main, latest commits, open issues and draft PRs, GitHub Actions checks/jobs/logs, build/deploy workflows, application robots runtime policy.
- CI validated deployed build via TypeScript, Bun tests (including `test:deploy-smoke` and `check:deploy-concurrency`), privacy/backend, Phone, TAKATAK boundary, media/SEO/canonical, ESLint, separate Voice service audit/build, production artifact. Branch CI #38623140506 passed PR #410 as well as main CI #38623287164.
- Production deployed on **MochaHost cPanel/Passenger** through automatic green-main workflow. HTTPS health marker, restart, indexing, routes, assets, robots and sitemap passed. Do not infer that an independent browser outside the Actions runner reached production.
- Prior read-only Supabase lookup for AHMV project `bqflllsjxmhqsvemhhwv` was **permission denied**. No database writes attempted. No phone/Voice/TAKATAK billing/social provider was activated.

## Current task / external blockers

No independent production-code change is left open by this session. **Do not merge draft #401 or #403 without association owner visual acceptance.** Issue #400 explicitly rejects earlier Louves UI; rendered FR/EN 320/390/768/1440 owner signoff is required. Schedule carousel #403 also needs owner design/source review. Both remain draft and unmerged.

Other gates: association-approved verified current weekly schedule provider/source timestamp; youth photography and social moderation consent; public indexing legal/privacy signoff; Meta OAuth/provider permissions; TAKATAK Auth/entitlements/billing (#120); Twilio/NumberBarn routing evidence and RLS/Voice testing (#127); allowed ADS inventory; protected staging database permissions. Never manufacture data, approvals, credentials or youth images. AHMV remains its own UX and tenant; TAKATAK identity/entitlements stay server-side.

## Exact next action

1. Read `AGENTS.md`, this handoff, `docs/TASK_QUEUE.md` and the newest `WORKLOG.md` entries. Query the **current live** `main` SHA, PRs #401/#403, issue #400, and latest CI and production Jobs (do not confuse docs SHA with compiled runtime SHA).
2. If owner bilingual visual signoff appears, inspect real screenshot artifacts and requested changes; only then consider merging the approved draft with current-main CI and exact production deployment verification. Otherwise keep those release blockers intact.
3. Choose the next independently executable security/runtime task from code and queue. For protected Supabase/Phone/TAKATAK integration, first resolve actual connector access and provider proof; do not bypass missing permissions.
4. On every new code merge, wait for the exact green `main` CI and production `/healthz` SHA and noindex smoke before writing docs-only follow-up commits. Log the exact files/SHAs and leave this handoff updated.

**Do not claim the entire project 100% complete while these human/provider gates remain outstanding.**
