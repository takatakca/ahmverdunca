<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Git: main belongs to the owner (owner's order, 2026-10-08)
Nobody but the owner touches `main`. Not even a docs-only commit.
- **Never:** commit on local `main`; `git push origin main` or `HEAD:main`; merge into `main`; rebase, reset or rewrite `main`; force-push.
- **Work flow:** `git fetch origin`, then `git switch -c <type>/<name> origin/main` (type: `feature`, `fix`, `refactor`, `docs` or `agent`). Push only that branch: `git push -u origin <type>/<name>`.
- **Before "done":** you are not on `main`, the checks ran, the work is committed, the branch is pushed, the working tree is clean.
- **Report:** branch, SHA, what changed, checks and results, env / migration / deploy notes, and "ready for owner review/merge". The owner merges and deploys.
- **Never discard uncommitted work you did not create** (`reset --hard`, `clean -fd`, `checkout -- .`, `restore .`). Report it to the owner instead.
- The owner works in the main checkout, on `main`. Never commit there: use a git worktree (`git worktree add <dir> -b <type>/<name> origin/main`).
- **`main` of this repository is synced to Lovable.** A push to `main` lands in the owner's Lovable project at once. Never push it.
- A local `pre-push` hook refuses any push to `main` when the environment variable `CLAUDECODE` is set. It never blocks the owner. Do not work around it.

## Cloud / Cursor agent operating instructions

- Treat the current `origin/main` as the only integration authority. Before starting work: `git fetch origin`, then create a fresh task branch from it with `git switch -c <type>/<name> origin/main` (do not work on local `main`). Historical Voice/preproduction branches are not deployment authority.
- Do not force-push, rewrite, amend, or rebase already-published history. This repository is connected to Lovable and rewritten history can break project synchronization.
- Public site runtime: Bun `1.4.2` (matching CI). Install with `bun install --frozen-lockfile`.
- Start a local public-site server explicitly with `bun run dev -- --host 0.0.0.0 --port 8080`.
- Before proposing a merge, run the same gates that matter in CI: TypeScript, phone/SMS tests, TAKATAK↔AHMV backend/boundary tests, team feed/games, schedule normalizer, assistant tests, monetization, Parent Premium, newsletter, data/SEO/runtime/mobile/PWA/Supabase/media/canonical/external-link checks, ESLint, deployment-smoke tests, production build, and release-artifact validation.
- The Voice service is separate under `services/ahmv-voice-ai`, requires Node `>=22`, and should be installed with `npm ci --ignore-scripts --audit=false --fund=false` then checked with `npm run check`. Do not start the Voice runtime unless its required Twilio/OpenAI/Supabase/server variables are configured outside git.
- Never put runtime `.env` files, bearer tokens, database URLs, Twilio credentials, OpenAI keys, Supabase service-role keys, SSH keys, or other production secrets into source control.
- Keep AHMV standalone: backend TAKATAK integrations must remain server-side and must not auto-mount TAKATAK dashboard UI into the public AHMV experience.
