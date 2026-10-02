# AHM Verdun — MochaHost production setup

The production deployment is intentionally manual, environment-protected and fail-closed.

It deploys only the exact current GitHub `main` commit, requires a successful **AHM Verdun CI** run for that SHA, reruns the full release gate, verifies the active release marker and performs post-activation HTTP checks.

## GitHub environment

Create the GitHub environment named:

`production`

Recommended protections:

- require manual approval before deployment;
- restrict deployment to the `main` branch;
- limit who may approve the environment;
- keep all production SSH values as environment-scoped secrets.

## Required GitHub production secrets

- `AHMV_PRODUCTION_HOST` — AHM Verdun production SSH hostname.
- `AHMV_PRODUCTION_SSH_PORT` — production SSH port.
- `AHMV_PRODUCTION_USER` — production SSH/cPanel user.
- `AHMV_PRODUCTION_APP_ROOT` — dedicated AHMV production application root.
- `AHMV_PRODUCTION_SSH_PRIVATE_KEY` — production deployment private key.
- `AHMV_PRODUCTION_KNOWN_HOSTS` — pinned SSH host key for the real production server.
- `AHMV_PRODUCTION_RESTART_COMMAND` — exact cPanel/Passenger restart command.
- `AHMV_PRODUCTION_URL` — HTTPS production origin used for health verification.

Do not put these values in the repository.

## Deployment modes

### Private production deployment

Use this before final public indexing approval:

- `public_indexing=false`
- leave `launch_confirmation` empty
- the workflow requires the homepage to return `X-Robots-Tag: noindex, nofollow`

This is the preferred mode for the production-host smoke test before public launch.

### Public launch deployment

Use only after the applicable go-live approvals are complete:

- `public_indexing=true`
- `launch_confirmation=PUBLIC-INDEXING-APPROVED`
- `AHMV_PRODUCTION_URL` must be exactly `https://ahmverdun.com`

The workflow will fail if the homepage remains noindex, while `/recherche` must continue to return `noindex, nofollow`.

## Production layout

The workflow deploys the standalone Nitro artifact to:

```text
<AHMV_PRODUCTION_APP_ROOT>/
  current -> releases/<SHA>/
  releases/
    <SHA>/
      RELEASE_SHA
      public/
      server/
```

The exact deployed SHA is written to `RELEASE_SHA` and verified after activation.

## Release procedure

1. Merge only a reviewed candidate with a green **AHM Verdun CI** run.
2. Record the full 40-character `main` SHA.
3. Complete the applicable approvals in `docs/GO_LIVE_CHECKLIST.md`.
4. Run **Deploy AHM Verdun production** manually.
5. Enter the exact current green `main` SHA.
6. Keep `public_indexing=false` for the private production smoke test.
7. Complete the smoke-test and DNS/cutover steps in `docs/PRODUCTION_RUNBOOK.md`.
8. Only after approval, rerun the same exact current green release with `public_indexing=true` and the required launch confirmation.
9. Confirm the post-launch checks and search-indexing state.

## Rollback

The workflow records the previous `current` release before activation. If restart or verification fails, it restores the previous symlink and restarts the application automatically.

DNS changes remain outside this workflow and must follow the production runbook.
