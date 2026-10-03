# AHM Verdun Voice AI — secrets and environment matrix

No secret value belongs in Git. This document records **names, owners and scope only**.

## GitHub environment: preproduction

Required by `.github/workflows/deploy-voice-integration-preproduction.yml`:

| Secret | Purpose |
| --- | --- |
| `AHMV_MOCHAHOST_HOST` | SSH host for AHMV preproduction |
| `AHMV_MOCHAHOST_SSH_PORT` | SSH port |
| `AHMV_MOCHAHOST_USER` | SSH user |
| `AHMV_MOCHAHOST_APP_ROOT` | Absolute application root |
| `AHMV_PREPRODUCTION_URL` | HTTPS origin used by health/bridge smoke |
| `AHMV_MOCHAHOST_SSH_PRIVATE_KEY` | Deployment SSH private key |
| `AHMV_MOCHAHOST_KNOWN_HOSTS` | Pinned SSH host keys |
| `AHMV_MOCHAHOST_RESTART_COMMAND` | Approved Passenger/application restart command |
| `AHMV_VOICE_BRIDGE_TOKEN` | Shared private bearer secret used only server-to-server |

The workflow refuses to deploy if any required value is empty or malformed.

## GitHub environment: production — Supabase dry-run only

Required by `.github/workflows/voice-db-dry-run.yml`:

| Secret | Purpose |
| --- | --- |
| `AHMV_SUPABASE_ACCESS_TOKEN` | Supabase CLI authentication |
| `AHMV_SUPABASE_DB_PASSWORD` | Remote Postgres password for the linked AHMV project |

The project ref is not a secret and is intentionally hard-coded to:

`bqflllsjxmhqsvemhhwv`

The workflow is non-mutating: it runs `migration list --linked` and `db push --linked --dry-run` only.

## AHMV website runtime — server-side only

These belong in the server environment for `ahmverdun.ca` / approved preproduction, never in `VITE_*` variables:

- `AHMV_VOICE_BRIDGE_TOKEN`
- `TAKATAK_AHMV_SCHEDULE_URL`
- `TAKATAK_AHMV_SERVICE_TOKEN`
- `AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES`
- `AHMV_VOICE_SESSION_RETENTION_DAYS`
- existing Supabase server credentials used by the AHMV phone subsystem

The bridge token installed on the website must match the token installed on the dedicated Voice service.

## Dedicated Voice host — `voice.ahmverdun.ca`

The standalone Voice service uses its own protected environment file, for example `/etc/ahmv-voice-ai.env`. Required production classes include:

- public origins: `PUBLIC_BASE_URL`, `PUBLIC_WSS_URL`;
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, signature validation and selected TTS voice;
- OpenAI: `OPENAI_API_KEY`, model/latency settings;
- private AHMV bridge: `AHM_VOICE_BRIDGE_URL`, `AHM_VOICE_BRIDGE_TOKEN`;
- Voice-session persistence: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`;
- bounded concurrency/call duration and `VOICE_INSTANCE_MODE=single`.

Use `services/ahmv-voice-ai/.env.example` (v0.8) as the exact variable-name/default contract. Never place real values in that file. Never copy a real `.env` into Git or a support ticket.

## Rotation order

For `AHMV_VOICE_BRIDGE_TOKEN`, rotate both ends in a controlled window:

1. keep the production Twilio Voice AI route disabled;
2. install the new token on the AHMV website;
3. install the identical token on the Voice host;
4. restart/reload both services;
5. run the private bridge smoke;
6. only then resume Voice acceptance testing.

For Twilio/OpenAI/Supabase credentials, rotate provider-side first according to each provider's overlap/revocation process, update the Voice host secret file, run preflight + smoke, then revoke the old credential.

## Forbidden handling

- no secret in `.env.example`;
- no secret in GitHub comments/issues;
- no `VITE_*` prefix for server credentials;
- no bearer token in command output;
- no raw Twilio auth token or Supabase service-role key in logs;
- no production credential in the standalone ZIP.


## GitHub environment: voice-preproduction

Required by `.github/workflows/deploy-voice-runtime-preproduction.yml`:

| Secret | Purpose |
| --- | --- |
| `AHMV_VOICE_PREPROD_HOST` | SSH host for the standalone Voice runtime |
| `AHMV_VOICE_PREPROD_SSH_PORT` | SSH port |
| `AHMV_VOICE_PREPROD_USER` | Restricted deployment user |
| `AHMV_VOICE_PREPROD_APP_ROOT` | Absolute immutable release root, e.g. `/opt/ahmv-voice-ai` |
| `AHMV_VOICE_PREPROD_URL` | Public HTTPS Voice runtime origin used by health/readiness smoke |
| `AHMV_VOICE_PREPROD_SSH_PRIVATE_KEY` | Deployment SSH private key |
| `AHMV_VOICE_PREPROD_KNOWN_HOSTS` | Pinned SSH host keys |
| `AHMV_VOICE_PREPROD_RESTART_COMMAND` | Approved command that restarts the standalone Voice service |

These GitHub secrets deploy code only. Twilio, OpenAI, Supabase and bridge credentials remain in the protected host environment file `/etc/ahmv-voice-ai.env`; the workflow never prints or copies them.
