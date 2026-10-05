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

## Cloud / Cursor agent operating instructions

- Treat the current `origin/main` as the only integration authority. Before starting work: `git fetch origin`, `git checkout main`, `git pull --ff-only origin main`, then create a fresh task branch. Historical Voice/preproduction branches are not deployment authority.
- Do not force-push, rewrite, amend, or rebase already-published history. This repository is connected to Lovable and rewritten history can break project synchronization.
- Public site runtime: Bun `1.4.2` (matching CI). Install with `bun install --frozen-lockfile`.
- Start a local public-site server explicitly with `bun run dev -- --host 0.0.0.0 --port 8080`.
- Before proposing a merge, run the same gates that matter in CI: TypeScript, phone/SMS tests, TAKATAK↔AHMV backend/boundary tests, team feed/games, schedule normalizer, assistant tests, monetization, Parent Premium, newsletter, data/SEO/runtime/mobile/PWA/Supabase/media/canonical/external-link checks, ESLint, deployment-smoke tests, production build, and release-artifact validation.
- The Voice service is separate under `services/ahmv-voice-ai`, requires Node `>=22`, and should be installed with `npm ci --ignore-scripts --audit=false --fund=false` then checked with `npm run check`. Do not start the Voice runtime unless its required Twilio/OpenAI/Supabase/server variables are configured outside git.
- Never put runtime `.env` files, bearer tokens, database URLs, Twilio credentials, OpenAI keys, Supabase service-role keys, SSH keys, or other production secrets into source control.
- Keep AHMV standalone: backend TAKATAK integrations must remain server-side and must not auto-mount TAKATAK dashboard UI into the public AHMV experience.
