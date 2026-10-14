# AHM Verdun — PROJECT STATUS

Updated 2026-10-14. Source authority: [takatakca/ahmverdunca](https://github.com/takatakca/ahmverdunca), branch `main`. This is an operational summary, not a claim of 100% feature completion. See `docs/RELEASE_HANDOFF_2026-10-14.md`, `docs/FINAL_RELEASE_STATUS.md` and `WORKLOG.md`.

## Verified
- Main before this corrective branch: `0decde9cd304273669f992ea6923edda5caf7432` (docs-only last merge).
- Latest certified **compiled application** release before this work: `ed18150e284bc9ba67cd86dcf00dbc2e90c19097`. CI [#38609679980](https://github.com/takatakca/ahmverdunca/actions/runs/38609679980), production [#38609816080](https://github.com/takatakca/ahmverdunca/actions/runs/38609816080), both succeeded. Production workflow certified compiled /healthz identity, Passenger restart, homepage, routes, robots/sitemap. Independent web retrieval was unavailable.
- PRs #404 (menu accessibility), #405 (mobile Assistant dock), #406 (nudge overlap) have green production releases. Former conflicting #391 closed as superseded.
- Draft PRs #401 (Louves M12B) and #403 (schedule carousel) have CI/visual tests but are **not approved or deployed**; #400 explicitly requires Louves design signoff.

## Open completion gates
- Production indexing approval not documented, yet automatic workflow previously defaulted to indexable. This branch changes it to explicit opt-in and requires approval.
- Source-verified continuous schedule; association approval of youth media, contact and legal policy.
- TeamLinkt public widgets, OAuth/syndication/Meta permissions and moderators.
- TAKATAK Auth/billing/entitlement provider, live Parent Premium acceptance (#120).
- Twilio/NumberBarn ownership, migration/RLS, SMS/Voice credentials, real calls (#127).
- Live ADS inventory, separate backend staging migration-history certification.

AHMV is an independent product. Shared TAKATAK identity and entitlements operate server-side; no master dashboard embedded into association website. For the next actionable task, use `docs/TASK_QUEUE.md`.
