# AHM Verdun Voice AI — production deployment runbook

This runbook covers the infrastructure step after the AHMV Voice integration CI is green. It **does not authorize the live Twilio number cutover** by itself.

## Current integration authority

- Repository: `takatakca/ahmverdunca`
- Production code authority: `main`
- Website Voice integration: merged into `main`
- Standalone realtime Voice service: merged into `main`
- Current Voice service line: v0.9 preproduction
- Production website: `https://ahmverdun.ca`
- Dedicated realtime host: `https://voice.ahmverdun.ca`
- Public AHMV phone: `+1 581-666-6246`

The live phone webhook stays unchanged until every gate below passes.

Before any infrastructure operation, review `docs/VOICE_SECRETS_AND_ENVIRONMENTS.md` and `docs/CURSOR_TWILIO_HANDOFF.md`. Never place secret values in Git.

Useful repository workflows:
- `.github/workflows/voice-db-dry-run.yml` — project-locked Supabase migration preview only;
- `.github/workflows/deploy-voice-integration-preproduction.yml` — isolated website-side Voice preproduction deployment with bridge smoke and rollback.

## 1. Database identity gate

Do not guess the Supabase project.

Before applying the Voice session migration, prove that the target database contains the existing AHMV phone tables, including:

- `public.ahmv_phone_contacts`
- `public.ahmv_phone_message_jobs`
- `public.ahmv_phone_interactions`

Then confirm the official migrations from main are present, especially:

- `20261003090500_ahmv_phone_message_dedupe.sql`
- `20261003110000_ahmv_phone_spanish.sql`

Only then apply:

- `20261003091000_ahmv_voice_sessions.sql`

Run Supabase security/performance advisors after the migration and verify:

- RLS enabled on `public.ahmv_voice_sessions`;
- `anon` and `authenticated` have no direct access;
- no `transcript_summary` column exists;
- `detected_language` is limited to FR/EN/ES;
- `turn_count` is bounded.

## 2. Website bridge configuration

Install server-side environment values on the AHMV website:

```env
AHMV_VOICE_BRIDGE_TOKEN=<strong shared secret, 24+ characters>
TAKATAK_AHMV_SCHEDULE_URL=<approved HTTPS authoritative schedule feed>
TAKATAK_AHMV_SERVICE_TOKEN=<server-side feed credential>
AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES=360
AHMV_VOICE_SESSION_RETENTION_DAYS=90
```

Never expose these as `VITE_*` variables.

Run:

```bash
npm run preflight:voice
npm run smoke:voice-bridge -- https://ahmverdun.ca
```

The bridge smoke must exit 0 and report `ready: true`.

## 3. Dedicated Voice service host

Required baseline:

- Node.js 22+
- one active Voice process only;
- `VOICE_INSTANCE_MODE=single`;
- Nginx with WebSocket proxying;
- valid TLS for `voice.ahmverdun.ca`;
- systemd restart policy;
- secrets only in `/etc/ahmv-voice-ai.env`;
- application installed at `/opt/ahmv-voice-ai`.

Create the service account and directories:

```bash
sudo useradd --system --home /opt/ahmv-voice-ai --shell /usr/sbin/nologin ahmvvoice || true
sudo mkdir -p /opt/ahmv-voice-ai
sudo chown -R ahmvvoice:ahmvvoice /opt/ahmv-voice-ai
sudo install -m 0600 /dev/null /etc/ahmv-voice-ai.env
```

Deploy the reviewed standalone Voice release to `/opt/ahmv-voice-ai`. Do not deploy `node_modules` from a developer machine.

The release must have a real reviewed lockfile before production:

```bash
npm ci
npm run verify
npm run preflight
```

Do not restart the service if any command fails.

## 4. Nginx and TLS

Install:

```bash
sudo install -m 0644 services/ahmv-voice-ai/deploy/nginx-voice.ahmverdun.ca.conf /etc/nginx/sites-available/voice.ahmverdun.ca
sudo ln -sfn /etc/nginx/sites-available/voice.ahmverdun.ca /etc/nginx/sites-enabled/voice.ahmverdun.ca
sudo nginx -t
```

Provision/renew the certificate for `voice.ahmverdun.ca` using the server's approved ACME/Certbot process, then rerun `sudo nginx -t` and reload Nginx.

The reverse proxy must preserve the public host and HTTPS scheme exactly because Twilio request-signature validation depends on the canonical public URL.

## 5. systemd

Install the supplied service:

```bash
sudo install -m 0644 services/ahmv-voice-ai/deploy/ahmv-voice.service /etc/systemd/system/ahmv-voice.service
sudo systemctl daemon-reload
sudo systemctl enable ahmv-voice
sudo systemctl restart ahmv-voice
sudo systemctl status ahmv-voice --no-pager --full
```

The Voice application's shutdown grace must remain below systemd `TimeoutStopSec=20`.

## 6. Post-deploy gate

From a trusted operator machine:

```bash
npm run smoke:voice -- https://voice.ahmverdun.ca
npm run smoke:voice-bridge -- https://ahmverdun.ca
```

Both commands must exit 0.

Also verify manually:

```bash
curl -fsS https://voice.ahmverdun.ca/healthz
curl -fsS https://voice.ahmverdun.ca/readyz
```

Never paste bearer tokens into shell history or public logs.

## 7. Twilio sandbox acceptance

Before changing the production number, use a staging/test number or controlled webhook and complete:

- press 1 required before AI begins;
- FR call;
- EN call;
- ES call;
- caller interruption;
- relay reconnect;
- schedule match;
- schedule no-match;
- stale/upstream schedule failure;
- arena address/directions;
- SMS consent;
- opt-out;
- duplicate callback produces one recap SMS;
- private/anonymous caller remains voice-only;
- OpenAI timeout/failure;
- AHMV bridge outage;
- graceful restart during a call;
- max-call-duration enforcement;
- concurrency saturation/busy path.

Record the result and timestamp for every case.

## 8. Production cutover

Only after all previous gates are green:

1. record the current Twilio production webhook/voice configuration verbatim;
2. keep that value as the rollback target;
3. point the production number to the approved Voice entry webhook;
4. place one controlled production call in FR, EN and ES;
5. verify the recap SMS exactly once;
6. inspect health/readiness and provider logs;
7. stop rollout immediately on any critical regression.

## 9. Rollback

Rollback is the first response to a critical public-call failure.

1. restore the exact recorded Twilio webhook/voice configuration;
2. verify the deterministic legacy IVR answers;
3. keep the Voice host online only for diagnosis if safe;
4. do not retry public cutover until the failed acceptance case is reproduced and fixed.

Do not use DNS propagation as the primary emergency rollback mechanism; restoring the Twilio route is faster and deterministic.

## Release decision

A green GitHub CI proves the code build. A green bridge smoke proves the AHMV backend dependency. A green Voice smoke proves the realtime host. Real staging calls prove Twilio/OpenAI/WebSocket behavior. **All four are required before the public number is changed.**
