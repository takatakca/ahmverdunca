# Louves M12B — parent bag checklist increment

**Scope:** An optional, interactive packing reminder for parents inside the existing premium team microsite. The general AHMV homepage, menus, TAKATAK V1, schedule and TeamLinkt integrations are untouched.

## User journey

On the Louves M12B team hub, after the two verified public actions (AHMV schedule and gallery), a compact card asks **« Mon sac est-il prêt? »** with a visible 0/6 progress indicator. Tapping **Voir** reveals six basic packing prompts: patins, casque, gants, bâton, protège-cou and gourde (translated for English users).

Users can check items, see an updated count/progress bar, close the checklist without losing progress, refresh the browser and continue, or choose **Recommencer** for the next activity. The feature never pretends to know the next game or practice and does not imply this short list replaces the team's actual protective-equipment requirements.

## Privacy and reuse

- Each list is localStorage-only, never submitted to AHMV, TAKATAK or TeamLinkt.
- Stores only predefined item IDs, not parent/player names, emails, dates or roster data.
- Team-specific versioned key `ahmv:ice-bag:v1:<exact team slug>` prevents team cross-contamination. Invalid slugs rejected; unexpected/oversized persisted data ignored.
- Works without available localStorage (private browsing, policy restrictions), with in-session interactions still usable.
- Common component `src/components/team-ice-bag-checklist.tsx` is keyed by team slug and FR/EN language. Reuse on other authorized team microsites without cloning any backend customer database.
- Accessible controls: real checkboxes, keyboard-visible focus, progress with live status, reduced-motion transitions, opening control with `aria-expanded`/`aria-controls`, minimum 44px interaction targets.

## Changed files

- `src/lib/team-ice-bag.ts`: six general reminders, sanitizer, serialization, exact-team scoping.
- `src/components/team-ice-bag-checklist.tsx`: bilingual responsive interactive UI.
- `src/components/team-premium-microsite.tsx`: one insertion after the verified public modules.
- `scripts/team-ice-bag.test.ts` and `package.json`: unit/security checks in normal data gate.
- `scripts/visual-smoke-louves.py`: actual Chromium React route QA across 320/390/768/1440 now checks checkbox toggle, refresh persistence and reset.

## Acceptance gates

1. CI: TypeScript, Bun data/unit tests, security & permission boundaries, lint, production build, release artifact.
2. Chromium real local React screenshots 320/390/768/1440: no horizontal overflow; proper accessible native checkbox and 44px controls; saved state survives reload; reset empties checklist.
3. Review captured screenshots: the add-on must remain **visually secondary to calendar/gallery**, with readable labels and no overwhelming mobile viewport height.
4. Review interaction with ongoing global Assistant overlap PR #391 when that change merges; no competing fix in this branch.
5. Production release may only be considered verified after documented merge/CI, MochaHost deployment, matching /healthz release SHA and a real on-site route check.

**No claim is made that equipment reminders are official AHMV rules or that TeamLinkt permissions are connected.**
