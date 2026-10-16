# AHM Verdun — active agent handoff

**Updated 2026-10-16.** Read this file after `AGENTS.md`, then `docs/TASK_QUEUE.md`, top of `WORKLOG.md` and live GitHub state. Do not assume that the last source/doc SHA equals the deployed compiled SHA.

## Last completed task — priority security release

PR [#411](https://github.com/takatakca/ahmverdunca/pull/411) **merged to `main`** with merge SHA **`039111a8c723ffbfbf85f8a364f3132a2be0d447`**. Work included:
- Fixed a Family-session denial-of-service edge case where malformed percent escapes in untrusted `__Host-ahmv_experience` cookie could throw; reject oversized or malformed signatures fail-closed. Added tests.
- Bounded TAKATAK launch-code exchange to **5 seconds**; upstream network/timeout/JSON failures give no-store/noindex 503 without creating a session. TAKATAK remains the shared identity authority; live entitlements remain checked server-side.
- Unblocked critical XSS **GHSA-qx66-fv34-fjm8 / CVE-2026-102989**: pinned `@tanstack/react-start@1.168.60`, `@tanstack/start-server-core@1.169.39`, aligned `@tanstack/react-router@1.170.41`, `@tanstack/router-core@1.171.34`; regenerated Bun lockfile with exact integrity metadata, fixed typed routes `faq.tsx`, `horaires.tsx`, `__root.tsx`. One-time lock update GitHub Actions workflow was **deleted** after successful execution; it is not permanent deployment infrastructure.
- Changed/pushed: `src/features/ahmv-experience/session.server.ts`, `src/features/ahmv-experience/auth-handler.server.ts`, `scripts/ahmv-experience.test.ts`, `package.json`, `bun.lock`, `src/routes/faq.tsx`, `src/routes/horaires.tsx`, `src/routes/__root.tsx`, `WORKLOG.md`. Post-release documentation: `docs/PROJECT_STATUS.md`, `docs/TASK_QUEUE.md`, `docs/DEPLOYMENT.md`, `docs/DECISIONS.md`, this handoff.

## Exact verification and deployment reality

- Branch CI: [#38950318005](https://github.com/takatakca/ahmverdunca/actions/runs/38950318005) **success**; main CI: [#38950476979](https://github.com/takatakca/ahmverdunca/actions/runs/38950476979) **success**.
- Production auto deployment: [#38950582023](https://github.com/takatakca/ahmverdunca/actions/runs/38950582023) **success**, target **MochaHost cPanel/Passenger**, source `main`.
- At 2026-10-16 18:52:52 UTC the production Actions job observed `GET https://ahmverdun.ca/healthz` returning `{"ok":true,"service":"ahmverdun-web","release":"039111a8c723ffbfbf85f8a364f3132a2be0d447"}`. Homepage **noindex**, exact compiled CSS/JS assets, core public routes, `/recherche` noindex, robots and sitemap all passed. No unverified claim of a direct end-user browser test.
- `bun audit --audit-level=high` returned **0 vulnerabilities** (one-time refresh). CI ran `bun install --frozen-lockfile`, TypeScript, Family and broader runtime/phone/privacy/backend tests, lint, Voice checks, `bun run build`, release-artifact verification. No CI/security gate bypass.
- Troubleshooting record: initial CI [#38949382670](https://github.com/takatakca/ahmverdunca/actions/runs/38949382670) exposed two critical XSS findings; later type/build runs revealed TanStack Router version skew; fixed by aligning the patched package graph, rather than disabling security audit. These earlier failures are superseded by passing branch/main CI and successful deployed build.

## Commits and current active state

- Last production **compiled SHA**: **`039111a8c723ffbfbf85f8a364f3132a2be0d447`**.
- Last GitHub `main` commit **before this handoff write**: **`77dd81b6d6ca04b50d390d220d77232a0c3a30a9`** (docs-only security decision). This file update itself advances `main`; the next agent MUST query `main` to obtain the final docs-only SHA, not assume it was deployed.
- **Task in progress:** no uncommitted or pending implementation from PR #411. Next development task must be selected from the open, authorization-safe queue once latest GitHub state is checked. **Do not re-open or redo PR #411.**

## Open issues / access blockers

- [Issue #400](https://github.com/takatakca/ahmverdunca/issues/400) rejects earlier Louves visual UI; **draft PR #401** is still owner-gated pending bilingual rendered screenshot acceptance at 320/390/768/1440. **Draft PR #403** schedule carousel also requires owner visual/source approval. Green CI is NOT authorization; keep both unmerged.
- Official weekly schedule freshness needs an approved current provider/source timestamp; no fabricated games or results. Youth photographs/social feeds need explicit consent, moderation, official provider OAuth and exact-team permissions.
- TAKATAK Auth/Parent Premium production entitlement and billing handoff [#120](https://github.com/takatakca/ahmverdunca/issues/120) not live-accepted. Phone/SMS/Voice [#127](https://github.com/takatakca/ahmverdunca/issues/127) requires verified NumberBarn/Twilio ownership, migrations/RLS, TLS/WSS and real signed call QA. ADS inventory and protected staging DB acceptance outstanding.
- Prior read-only Supabase AHMV project lookup `bqflllsjxmhqsvemhhwv` was **permission denied**. No database writes/secret access were attempted here. Never paste secret values into GitHub.
- AHMV stays an independent site/tenant; TAKATAK owns centralized identity, entitlements and shared acquisition, not local client billing or AHMV menu.

## Exact next action

1. Query live `main`, open PR #401/#403 and issue #400, latest CI and production Actions. Read `AGENTS.md` plus newest worklog and task queue.
2. Confirm existing patched lockfile and production SHA before choosing a new task; never roll back to vulnerable TanStack Start versions or disable `bun audit --audit-level=high`.
3. If owner approved either visual PR, review actual screenshot artifacts and latest code, rebase non-destructively by merge only if necessary, validate and verify exact production runtime. Otherwise work on an independent authorized security or accessibility task.
4. For external services, request only the missing permission/official authorization; preserve provider disabled states until acceptance. Before stopping, update all five operational docs and the worklog with the **actual** latest Git SHA, CI/build result and deployment proof.

**Status:** verified production security release complete; project **not 100%** due owner/provider gates and incomplete external acceptance. No external orchestrator has been configured for automatic future agent relaunch.
