# AHM Verdun — MochaHost preproduction setup

The deployment workflow is intentionally manual and will fail closed until every AHMV-specific value below is configured.

## GitHub environment

Create the GitHub environment named:

`preproduction`

Recommended: require manual approval for this environment before deployment.

## Required GitHub secrets

- `AHMV_MOCHAHOST_HOST` — AHM Verdun SSH hostname only.
- `AHMV_MOCHAHOST_SSH_PORT` — SSH port.
- `AHMV_MOCHAHOST_USER` — SSH/cPanel user.
- `AHMV_MOCHAHOST_APP_ROOT` — dedicated AHMV application root; do not reuse another TAKATAK app directory.
- `AHMV_MOCHAHOST_SSH_PRIVATE_KEY` — private deployment key dedicated/authorized for this account.
- `AHMV_MOCHAHOST_KNOWN_HOSTS` — pinned SSH host key generated from the real AHMV host.
- `AHMV_MOCHAHOST_RESTART_COMMAND` — the exact cPanel/Passenger restart command for this AHMV Node application.
- `AHMV_PREPRODUCTION_URL` — HTTPS preproduction hostname that resolves to this application.

Do not put these values in the repository.

## cPanel Node application

Use Node.js 20 or newer; Node 22 is preferred when available because Nitro 3 requires Node 20+. The application must execute the standalone Nitro Node server generated under `.output/server`.

The deployment layout is:

```text
<AHMV_APP_ROOT>/
  current -> releases/<SHA>/
  releases/
    <SHA>/
      RELEASE_SHA
      public/
      server/
```

The workflow never deploys a branch name. It requires the full 40-character SHA and verifies that it is exactly the current GitHub `main`.

## First deployment

1. Configure the GitHub environment and all secrets.
2. Configure the cPanel Node application to run from `<AHMV_APP_ROOT>/current`.
3. Configure the application startup entry to the generated server entry under `server/index.mjs` (or the generated Node entry confirmed by CI).
4. Keep public indexing disabled.
5. Run **Deploy AHM Verdun preproduction** manually and enter the exact current green `main` SHA.
6. Confirm the workflow health check succeeds.
7. Run the full smoke test from `docs/PRODUCTION_RUNBOOK.md`.

Do not point the public AHM Verdun DNS at this candidate until the preproduction gate passes.
