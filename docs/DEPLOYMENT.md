# AHM Verdun — deployment

## Actual environment
- Production: https://ahmverdun.ca — MochaHost cPanel / Passenger, immutable releases. Source GitHub `main`; build in GitHub Actions (Bun 1.4.2), not on constrained shared host.
- Website CI: `.github/workflows/ci.yml`. Automatic production: `.github/workflows/deploy-production-auto.yml` on successful green main CI only; docs-only commits skip CI/deploy by path policy.
- Manual production: `.github/workflows/deploy-production.yml`, explicit indexing launch confirmation. Voice service is separate, Node >=22, guarded preproduction attestation, no implicit Twilio switch.
- Secrets: protected GitHub environment, SSH host/port/user/known_hosts/key/app root, authorized Passenger restart. Do not expose secret contents or hardcode credential paths.

## Release contract
1. Checkout exact green main SHA, refuse stale current-main drift.
2. Run dependency, TypeScript, server/privacy/data tests, ESLint, build and compiled artifact checks.
3. Validate exact production HTTPS origin, indexing policy, SSH transport and server restart ability.
4. Create immutable release, upload/extract, activate symlink, restart Passenger with approved command.
5. Confirm production `GET /healthz` **compiled** release equals intended SHA, homepage and public routes respond, appropriate `X-Robots-Tag`, search noindex, robots.txt and sitemap.xml. Roll back on failed activation/smoke.

## Indexing release approval
Automatic production **defaults to false** when `AHMV_PUBLIC_INDEXING` is unset/false. To switch on, require both protected variables `AHMV_PUBLIC_INDEXING=true` and `AHMV_PUBLIC_INDEXING_APPROVAL=PUBLIC-INDEXING-APPROVED` after association legal/privacy/release acceptance. Unapproved true or invalid values fail before release upload. Verify the resulting homepage header, not just environment/source. The manual release defaults `public_indexing=false` and retains separate `launch_confirmation` for true. Both paths pin `https://ahmverdun.ca` and validate the approved Passenger restart command before uploading.

## Latest verified deployed release (2026-10-14)

- PR #408 merge SHA: `c614dc9be786ce04710d2e9463c9c576f85369ce`.
- Main CI [#38613657967](https://github.com/takatakca/ahmverdunca/actions/runs/38613657967): **success**.
- Production [#38614134421](https://github.com/takatakca/ahmverdunca/actions/runs/38614134421): **success**, compiled `/healthz` returned `c614dc9be786ce04710d2e9463c9c576f85369ce`, homepage is **noindex**, routes, CSS/JS, Passenger restart, robots and sitemap passed.
- A docs-only commit after this verified runtime may advance `main`; it does not silently redeploy the server.

## Last successfully certified compiled release before indexing correction
`ed18150e284bc9ba67cd86dcf00dbc2e90c19097`: [CI #38609679980](https://github.com/takatakca/ahmverdunca/actions/runs/38609679980) and [production #38609816080](https://github.com/takatakca/ahmverdunca/actions/runs/38609816080) green. That workflow reported homepage indexability, inconsistent with the unapproved-indexing hold in documentation. Do not claim remediation is deployed until its own green production run.

Rollback and operational detail: `docs/PRODUCTION_RUNBOOK.md`, `docs/MOCHAHOST_PRODUCTION.md`.
