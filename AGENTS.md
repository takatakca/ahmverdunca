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

## Cursor Cloud specific instructions

- The public site is a Bun `1.4.2` TanStack Start app. CI pins that version in `.github/workflows/ci.yml`. Both `bun` and `bunx` must be on `PATH` (`bunx` is a symlink to `bun`). Install from the lockfile with `bun install --frozen-lockfile`.
- Start the site with `bun run dev -- --host 0.0.0.0 --port 8080`. The Lovable Vite config also defaults to port 8080. Public pages, the schedule search, team pages, and the FR/EN switch render from local content and do not need Supabase credentials.
- Checks that match CI: `bunx tsc --noEmit`, `bun run test:phone`, `bun run test:team-feed`, `bun run test:assistant`, the `check:*` scripts in `package.json`, `bunx eslint . --rule 'prettier/prettier: off'`, then `bun run build` and `bun run check:release-artifact`. `bun run build` and `bun run check:seo` regenerate `public/sitemap.xml`. The dev server may rewrite `src/routeTree.gen.ts`.
- `services/ahmv-voice-ai` is a separate Node 22 app. Install with `npm ci --ignore-scripts --no-audit --no-fund` in that directory, then run `npm run check`. Do not start `node src/server.js` unless Twilio, OpenAI, and Supabase variables from `services/ahmv-voice-ai/.env.example` are set; missing required variables make the process exit.
