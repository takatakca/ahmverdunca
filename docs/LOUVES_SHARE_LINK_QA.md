# Louves M12B — Public team page sharing

**Status:** code authored on an isolated branch; verification required before merge. This is a small practical improvement for parents, built using the existing premium Louves microsite without changing the AHMV homepage, navigation or TAKATAK V1.

## Parent experience

The Louves M12B header now has a discreet 44px touch-friendly **« Partager l’équipe » / “Share this team”** control below the public-schedule clarification. Parents can send the team microsite link using the phone's normal native share sheet. On devices without that API, clicking copies the public URL to the clipboard. If clipboard access is denied, a selectable read-only URL appears for manual copying. A cancelled OS share is not reported as success.

No login, contact scraping, social publishing plugin, TeamLinkt invitation, account permission or backend feature is involved. It shares **only** the public path `/equipes/louves-m12b` based on the current origin, without a tracking query, fragment, secret, provider ID or access token.

## Files and separation

- `src/lib/team-page-share.ts`: strict exact-team path validation, HTTP(S) origin normalization, native share/cancel/copy/manual outcomes.
- `src/components/team-page-share.tsx`: bilingual responsive button, accessible status and manual text input.
- `src/components/team-premium-microsite.tsx`: one isolated team-header insertion; the main AHMV header and other pages are unchanged.
- `scripts/team-page-share.test.ts` + `package.json`: security tests in existing CI `check:data`.
- `scripts/visual-smoke-louves.py`: actual Playwright test of the rendered React button and approved public URL across the existing 320/390/768/1440px breakpoints, mocking the OS share sheet **only inside the CI browser**.

## Quality gates

1. Bun 1.4.2 CI: typecheck, unit/privacy tests, lint, security, production build and release checks.
2. Real local React Playwright browser: hero share button responds at 320, 390, 768 and 1440; target URL is precisely the team microsite, status announced, no horizontal overflow or regression of the bag checklist.
3. Inspect actual screenshot artifacts for link placement, tap size and overlap with global assistant.
4. Keep the unresolved *global* assistant overlay within the existing PR #391; do not modify another agent's navigation code.
5. Do not call production `LIVE` without main CI, successful MochaHost deployment and matching `/healthz` SHA plus real route checks.

## Confirmed browser verification — 2026-10-11

- **AHM Verdun CI #1221: SUCCESS**, commit `7a9192f5c8a4136c346376a663044a2751e83c2c`.
- **AHMV Louves Visual QA #21: SUCCESS**, run `38113206146`, [screenshots and measurements](https://github.com/takatakca/ahmverdunca/actions/runs/38113206146/artifacts/11692556489).
- Real local React/TanStack app HTTP 200; widths **320/390/768/1440** all had zero horizontal overflow, real Louves crest loaded, exact team heading, schedule/gallery links and all seven non-public modules collapsed.
- Native share sheet mocked **only in Playwright's isolated tab**, verifying public URL `http://127.0.0.1:8080/equipes/louves-m12b`, visible bilingual feedback, and no private links on all four widths.
- Existing parent checklist keyboard toggling, localStorage persistence after reload and reset also remained green.
- Browser QA initially exposed a hydration race where early clicks on the server-rendered Share button did not invoke its handler; the control is now disabled until React hydration sets `data-ahmv-share-ready="true"`. This prevents an apparently clickable but inactive control during the first page load.
- Visual screenshots reviewed on mobile 390px and desktop 1440px: share is intentionally a quiet third action below the schedule clarification; calendar/gallery remain the primary family routes. Global floating Assistant overlaps the mobile transition region and is **still owned by PR #391**, not this change.

**These are screenshots from the real locally running React page, not from MochaHost. A live production claim requires main CI, automatic deployment evidence and matching `/healthz` SHA.**
