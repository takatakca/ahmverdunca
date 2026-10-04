# Cursor + Twilio activation runbook — AHM Verdun Voice AI

This is the operator handoff for connecting the merged AHM Verdun Voice service to Twilio safely.

## Current architecture

Production website:
- https://ahmverdun.ca

Realtime Voice host:
- https://voice.ahmverdun.ca

Voice webhook:
- https://voice.ahmverdun.ca/twilio/voice

ConversationRelay WebSocket:
- wss://voice.ahmverdun.ca/twilio/conversation

Public phone target:
- +1 581-666-6246

AHMV Supabase project ref:
- bqflllsjxmhqsvemhhwv

Runtime:
- services/ahmv-voice-ai
- Node.js 22+
- Twilio ConversationRelay
- OpenAI Responses API
- FR / EN / ES
- press-1 activation required
- post-call transactional SMS
- no raw transcript persistence by default

## 1. Open the project in Cursor

Start from the current production authority: `main`. Do not use the historical `voice-ai-preprod-v4` or `cursor-twilio-activation` branches as deployment authority; they may be useful only for archaeology.

Create a fresh operator branch from the current `main` before making any activation-related code or documentation change:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b voice-master-connection-$(date +%Y%m%d)
```

If the operator branch already exists, rebase or recreate it from the current `main` before continuing. Never deploy a stale activation branch merely because an older runbook named it.

## 2. Connect Twilio to Cursor

Preferred:

Open Cursor Composer and run:

```text
/add-plugin twilio-developer-kit
```

The project already includes:

```text
.cursor/mcp.json
```

with Twilio's official documentation MCP:

```text
https://mcp.twilio.com/docs
```

Verify what Cursor can actually access:

```bash
agent mcp list
agent mcp list-tools twilio-docs
```

Important:
- Do not assume account-write access exists merely because the docs MCP is connected.
- If the Developer Kit exposes authenticated Twilio account tools, Cursor may use them.
- If only documentation tools are available, perform account writes through the Twilio Console or the Twilio SDK scripts in this repository.

## 3. Keep secrets local

Never paste credentials into source files.

Configure locally or in the server secret store:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+15816666246
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AHM_VOICE_BRIDGE_TOKEN=
```

Do not commit a runtime .env file.

## 4. Verify the merged Voice runtime first

From:

```bash
cd services/ahmv-voice-ai
```

run:

```bash
npm ci
npm run check
npm run guardian
npm run preflight
```

Do not continue if any gate fails.

## 5. Enable Twilio ConversationRelay prerequisites

In Twilio Console, confirm the Predictive and Generative AI/ML Features Addendum for Voice / ConversationRelay has been accepted.

ConversationRelay requires a publicly accessible secure WebSocket endpoint and Twilio signs the initial WebSocket handshake with X-Twilio-Signature.

Do not disable signature validation to make a test pass.

## 6. Deploy the Voice host before routing calls

Deploy the Voice service to:

```text
voice.ahmverdun.ca
```

Required:

- valid public TLS certificate;
- HTTPS;
- WSS;
- Nginx WebSocket proxy;
- Node 22;
- systemd;
- single active service instance;
- production environment values installed outside git.

Then run:

```bash
npm run smoke -- https://voice.ahmverdun.ca
npm run smoke:bridge -- https://ahmverdun.ca
```

Expected:

- /healthz => 200
- /readyz => 200
- ready=true
- bridge ready=true

## 7. Test Twilio signature + press-1 without changing the phone number

With TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN available locally:

```bash
npm run smoke:twilio-signed -- https://voice.ahmverdun.ca/twilio/voice
```

This must verify:

- signed request => HTTP 200;
- invalid signature => HTTP 403;
- response contains <Gather>;
- response does NOT contain <ConversationRelay> before the caller presses 1.

Do not proceed until this is green.

## 8. Snapshot the live Twilio number before any write

Run:

```bash
npm run twilio:snapshot
```

This creates a local rollback file under:

```text
services/ahmv-voice-ai/.local/
```

The directory is gitignored.

Do not change the public number unless a rollback snapshot exists.

## 9. Prefer a staging TwiML App first

Create a TwiML App such as:

```text
AHMV Voice AI - Staging
```

Voice Request URL:

```text
https://voice.ahmverdun.ca/twilio/voice
```

Method:

```text
POST
```

Do not associate the public AHMV phone number yet.

Use a test/staging Twilio number if available.

If no spare number is available, keep the TwiML App unassigned and complete all HTTP/WSS/signed-smoke tests before the production cutover.

## 10. Cursor staging acceptance

Give Cursor this exact mission:

> Work only on the AHM Verdun Voice AI Twilio activation. Read .cursor/rules/ahmv-voice-twilio.mdc and docs/CURSOR_TWILIO_ACTIVATION.md first. Inspect the current Twilio configuration using the connected Twilio tools without changing the live phone number. Verify ConversationRelay prerequisites, Voice host health/readiness, webhook signature validation, press-1 gate, FR/EN/ES configuration, SMS idempotency and rollback readiness. Use staging resources where possible. Fix code/configuration defects in a branch, run all Guardian/CI checks, and do not alter +1 581-666-6246 until every release gate is green. Before any eventual live write, show the existing Twilio configuration and ensure npm run twilio:snapshot has succeeded.

## 11. Real staging calls

Pass all of these before live cutover:

- French call;
- English call;
- Spanish call;
- caller presses 1;
- caller does not press 1;
- interruption while assistant speaks;
- reconnect;
- verified schedule lookup;
- arena lookup;
- schedule no-match;
- stale schedule;
- bridge outage;
- OpenAI timeout;
- SMS recap;
- SMS opt-out;
- duplicate callback => one SMS only;
- private caller => no SMS;
- max call duration;
- graceful restart.

Record:
- release SHA;
- timestamp;
- PASS/FAIL;
- expected result;
- observed result.

## 12. Production-number cutover

Only after all previous gates pass.

First re-run:

```bash
npm run twilio:snapshot
npm run smoke
npm run smoke:bridge
npm run smoke:twilio-signed
npm run guardian
```

Then inspect the IncomingPhoneNumber configuration for +1 581-666-6246.

Twilio behavior to remember:
- if voiceApplicationSid is set, Twilio ignores voiceUrl;
- if a SIP trunk is configured, direct voiceUrl routing may not be active;
- do not overwrite unrelated messaging configuration.

Choose ONE routing model:

### Preferred controlled model

Associate the production number with the reviewed TwiML App whose Voice URL is:

```text
https://voice.ahmverdun.ca/twilio/voice
```

### Direct webhook model

Only if no voiceApplicationSid/trunk is intended:

```text
voiceUrl=https://voice.ahmverdun.ca/twilio/voice
voiceMethod=POST
```

Do not change SMS routing as part of the Voice cutover.

## 13. Immediate post-cutover test

Place three controlled calls:

1. FR
2. EN
3. ES

Verify:

- press-1;
- ConversationRelay establishes;
- assistant answers naturally;
- verified data tool works;
- SMS exactly once where permitted;
- no PII appears in health/log output.

Watch:

- /healthz
- /readyz
- Twilio call logs
- Voice service logs
- AHMV bridge readiness

## 14. Rollback

On any critical regression:

1. restore the exact Twilio configuration from the local rollback snapshot;
2. verify the previous call flow answers again;
3. leave Voice host available for diagnosis only if safe;
4. fix and rerun the full staging acceptance before another cutover.

Do not use DNS propagation as the emergency rollback mechanism.

## 15. Secondary automated reviewer

The repository contains:

```text
.cursor/BUGBOT.md
```

If Cursor Bugbot is enabled for the repository, run a review on Voice changes.

Cursor's built-in project rules and Bugbot are secondary reviewers.

The release authority remains:
- repository CI;
- AHMV Voice Guardian;
- real Twilio smoke tests;
- E2E call acceptance;
- rollback readiness.
