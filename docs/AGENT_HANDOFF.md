# AHM Verdun — agent handoff

Updated 2026-10-14. Read `AGENTS.md` and `WORKLOG.md` first. Restart from the latest GitHub facts, not assumptions.

## Latest verified release and checkpoint (2026-10-14)

**Production correction completed:** PR #408 merged; main CI [#38613657967](https://github.com/takatakca/ahmverdunca/actions/runs/38613657967) and auto production [#38614134421](https://github.com/takatakca/ahmverdunca/actions/runs/38614134421) succeeded. Exact compiled `/healthz` release SHA: `c614dc9be786ce04710d2e9463c9c576f85369ce`; deployed homepage security verification returned **noindex**. The known production runtime is this SHA; later docs-only commits are not new compiled releases.

**Files actually changed and pushed in PR #408:** `AGENTS.md`, `.github/workflows/deploy-production-auto.yml`, `scripts/validate-deployment-concurrency.ts`, `docs/PRODUCTION_CONFIGURATION_INVENTORY.md`, `WORKLOG.md`, `docs/PROJECT_STATUS.md`, `docs/TASK_QUEUE.md`, `docs/AGENT_HANDOFF.md`, `docs/DEPLOYMENT.md`, `docs/DECISIONS.md`.

**Validation executed:** GitHub CI TypeScript, data/auth/privacy, full release gates, ESLint, voice audit/build and production smoke; MochaHost release activation, Passenger restart, HTTP /healthz, homepage noindex, main routes, CSS/JS assets, robots and sitemap all passed.

**Known blockage on next integration:** A read-only Supabase AHMV project lookup (`bqflllsjxmhqsvemhhwv`) returned `You do not have permission to perform this action`. No database migration, table access or provider setup was attempted after this denial. External association approvals remain required for Louves #400/#401, schedule #403, public youth content, Phone/SMS #127, Parent Premium #120 and Meta OAuth. No secrets are stored here.

**Exact next action for resuming agent:** inspect current `main`, `WORKLOG.md` and draft PRs #401/#403; request or find owner visual review evidence before either merge. If those remain blocked, continue a separate independent code task from `docs/TASK_QUEUE.md`, or obtain valid Supabase connector permissions to assess issue #127 safely. Keep indexing fail-closed and confirm every future compiled SHA with production Actions.

## Last completed
PR #404 mobile menu, #405 mobile Assistant, #406 floating nudge all merged with successful separate exact-SHA production workflows; release handoff documented in PR #407.

## Currently active
Branch `fix/ahmv-indexing-release-gate-20261014`: correct auto production indexing to default false and require explicit association approval for true. Add CI assertions and five durable operating files. PR, CI, merge and deployment are **not yet certified** at initial writing.

## Base / files / commits
- Source main at task start: `0decde9cd304273669f992ea6923edda5caf7432`.
- Branch commits before documentation: workflow change `d435836335054eea8821885c640cb9f10222990c`, CI guard `b2f38137a2c1f1be7b8c3e5789764d30888374cf`.
- Modified: `.github/workflows/deploy-production-auto.yml`, `scripts/validate-deployment-concurrency.ts`, `docs/PRODUCTION_CONFIGURATION_INVENTORY.md`, `WORKLOG.md`.
- Created: `docs/PROJECT_STATUS.md`, `docs/TASK_QUEUE.md`, `docs/AGENT_HANDOFF.md`, `docs/DEPLOYMENT.md`, `docs/DECISIONS.md`.
- After subsequent commits, look up **current branch HEAD**; this paragraph is a historical checkpoint, not the final commit SHA.

## Checks and known deployment
- GitHub repository metadata, branch/PR/Actions state, workflow policy, release documents, response security policy and regression validators inspected using GitHub connector.
- Follow-up CI must execute `bun scripts/validate-deployment-concurrency.ts`, `bun run check:production-config`, `bun run check:runtime-policy`, TypeScript, tests, ESLint, build and artifact validation.
- Certified previous compiled production SHA: `ed18150e284bc9ba67cd86dcf00dbc2e90c19097` (production Actions #38609816080).
- Direct agent web requests to /healthz and robots.txt were unavailable; no direct browser-based production proof.

## Blocking permissions/access
- Issue #400 / PR #401 Louves design acceptance and PR #403 schedule visual review.
- Association public indexing/legal/official contact and youth-media permissions.
- Twilio carrier + secrets and RLS, TAKATAK identity/entitlement configuration, Facebook/Instagram OAuth, verified official schedule feed, staging database protected secret.
- Never put private minor/parent data or secret values in git. Keep all unapproved providers off.

## Exact next action
Read this branch's current GitHub HEAD and PR checks, correct any CI failures, merge only the green safe release guard, verify MochaHost Actions compiled /healthz SHA and homepage noindex, then replace the open-task markers with the **actual** verified SHA/CI/deploy status. If unapproved `AHMV_PUBLIC_INDEXING=true` blocks deployment, preserve production safely and report needed owner config correction without bypassing the guard. Resume independent queue tasks.
