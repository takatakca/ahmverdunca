# AHM Verdun — release handoff (2026-10-14)

> Scope: public AHMV website only. `main` is the release authority; AHMV remains standalone from the TAKATAK dashboard. Provider credentials and production approvals remain outside Git.

## Certified production changes

| PR | Change | Main merge SHA | CI | MochaHost deploy |
| --- | --- | --- | --- | --- |
| [#404](https://github.com/takatakca/ahmverdunca/pull/404) | Accessible mobile navigation dialog (close, keyboard focus, Escape, Tab) | `20d8a1ab20588d3afd12ada61cf80d47471d9d7e` | [green #38607569927](https://github.com/takatakca/ahmverdunca/actions/runs/38607569927) | [green #38607964690](https://github.com/takatakca/ahmverdunca/actions/runs/38607964690) |
| [#405](https://github.com/takatakca/ahmverdunca/pull/405) | Assistant in mobile bottom navigation, no floating launcher on phones | `90c4bae854e00e4cc82bbf5abc5333c29134fb96` | [green #38608226675](https://github.com/takatakca/ahmverdunca/actions/runs/38608226675) | [green #38608519994](https://github.com/takatakca/ahmverdunca/actions/runs/38608519994) |
| [#406](https://github.com/takatakca/ahmverdunca/pull/406) | Opt-in Assistant nudge hidden on phones | `ed18150e284bc9ba67cd86dcf00dbc2e90c19097` | [green #38609477969](https://github.com/takatakca/ahmverdunca/actions/runs/38609477969) | [green #38609816080](https://github.com/takatakca/ahmverdunca/actions/runs/38609816080) |

The #406 production workflow certified immutable release activation, Passenger restart, compiled SHA `/healthz`, homepage, public routes, `robots.txt` and `sitemap.xml`. External direct HTTP requests by this agent were unavailable; rely on the GitHub deployment logs for verification, not a claim of an independent browser visit. Docs-only commits after this release intentionally may advance `main` without a deployment.

The original conflicting Assistant PR [#391](https://github.com/takatakca/ahmverdunca/pull/391) was replayed byte-for-byte as #405 against current `main` and closed as superseded, not merged itself.

## Open design reviews — DO NOT merge automatically

- [PR #401](https://github.com/takatakca/ahmverdunca/pull/401): Louves M12B standalone app design. Reconciled onto `main` with merge commit `a379d7e47cab7891a92c94e5a26725ca844b484b`; no conflicts. [CI #38609229128](https://github.com/takatakca/ahmverdunca/actions/runs/38609229128) and [rendered Chromium QA #38609228602](https://github.com/takatakca/ahmverdunca/actions/runs/38609228602) green; artifact `louves-m12b-visual-32`. Still **DRAFT**: [issue #400](https://github.com/takatakca/ahmverdunca/issues/400) requires owner visual signoff at 320, 390, 768 and 1440 px, FR/EN before merge or deployment. Approved TeamLinkt public widget URLs required before activation.
- [PR #403](https://github.com/takatakca/ahmverdunca/pull/403): visual team carousel above the schedule; CI and visual QA green, remains **DRAFT** until owner review of screenshot artifacts. Keep official schedule provenance and privacy guards.

## Remaining external go-live gates

1. **Official schedules:** independently verify source date, signed-off weekly data and an authorized continuously refreshed official provider; never expose mock events as real. See `docs/AHMV_MAIL_SCHEDULE_TEAM_CONNECT.md` and `docs/COORDINATED_COMPLETION.md`.
2. **Family / Parent Premium (#120):** production TAKATAK auth/entitlement provider, launch/introspection/revoke acceptance, approved billing and public release policy. Do not bypass entitlement boundary.
3. **Phone / SMS / Voice (#127):** carrier ownership and routing proof, Twilio and preproduction TLS/WSS configuration, secure credentials and actual FR/EN/ES call acceptance before enabling public numbers.
4. **Team Feed / Facebook / Instagram:** association OAuth, public reuse permissions, child-media consent, moderation and TAKATAK tenant-boundaries before auto publication. Provider/service remains `planned`.
5. **Privacy, approved official contact, youth photos and search indexing:** confirm written association signoff. The 2026-10-14 production workflow logs for #405 reported **homepage indexing enabled** while the configuration inventory says `VITE_PUBLIC_INDEXING=false` until approval. Resolve the policy discrepancy explicitly with the release owner rather than silently changing SEO behavior. The `/recherche` noindex smoke passed.
6. **ADS / subscriptions:** no unapproved creatives, billing or external provider switches; enable only after service and publisher verification.

## Next agent command sequence

Read `AGENTS.md`, the top of `WORKLOG.md`, and open PRs first; pick an unclaimed task. Work on fresh branches, preserve `main`, run the full CI gates, merge only authorized green features, and require GitHub Actions production confirmation with exact compiled `/healthz` SHA. Never commit tokens, credentials or private children data. Use the above links as traceable evidence; do not claim a blocked feature is live.


## Certified default-deny indexing repair (2026-10-14)

PR [#408](https://github.com/takatakca/ahmverdunca/pull/408), main compiled merge `c614dc9be786ce04710d2e9463c9c576f85369ce`: [CI #38613657967](https://github.com/takatakca/ahmverdunca/actions/runs/38613657967) and [MochaHost deploy #38614134421](https://github.com/takatakca/ahmverdunca/actions/runs/38614134421) both succeeded. The deployment runner read `/healthz` containing the **exact compiled** SHA and verified `Public indexing is disabled and homepage is correctly noindex.` Automatic production is now opt-in for indexing, requiring the association release approval marker; the previous homepage-indexability discrepancy is resolved in this certified runtime. Provider and owner visual gates listed above remain unresolved. Persistent continuation: `docs/PROJECT_STATUS.md`, `docs/TASK_QUEUE.md`, `docs/AGENT_HANDOFF.md`, `docs/DEPLOYMENT.md`, `docs/DECISIONS.md`.

## Later 2026-10-14 release evidence — manual launch and HTTP smoke

- PR [#409](https://github.com/takatakca/ahmverdunca/pull/409) corrected the manual workflow: `public_indexing` defaults to false, exact `https://ahmverdun.ca` origin and approved restart command are validated before upload, and `/recherche` checks `noindex` without incorrectly requiring `nofollow`. Main CI [#38622825907](https://github.com/takatakca/ahmverdunca/actions/runs/38622825907) and production [#38622947479](https://github.com/takatakca/ahmverdunca/actions/runs/38622947479) **passed**. Compiled runtime SHA `08fcd8042e1de55f978deb49914bab70cdfa89bf` and homepage `noindex` verified by production runner.
- PR [#410](https://github.com/takatakca/ahmverdunca/pull/410) repaired public smoke handling of HTTP 403 WAF challenges, with a fake-curl integration test and unchanged public TLS verification. Main CI [#38623287164](https://github.com/takatakca/ahmverdunca/actions/runs/38623287164) and production [#38623392436](https://github.com/takatakca/ahmverdunca/actions/runs/38623392436) **passed**. `GET /healthz` returned compiled runtime `de96f2e65d403b398209f5ba5042ee0ca7a61903`; homepage `noindex`, routes, CSS/JS and `/recherche` noindex passed.
- **The latest deployed app SHA is `de96f2e65d403b398209f5ba5042ee0ca7a61903`.** Later docs-only commits advance source main but not the compiled app release. PR #401 (Louves) and #403 (schedule carousel) remain owner-gated draft PRs. Provider secrets and youth-media signoff remain external blockers.
