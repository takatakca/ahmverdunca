# AHM Verdun Voice AI

Standalone realtime Voice service for AHM Verdun.

## Boundaries

This folder owns the realtime Twilio ConversationRelay + OpenAI runtime only.

It does **not** own:

- AHMV schedule truth;
- Twilio SMS sending authority;
- GROUPE TAKATAK billing;
- marketing consent;
- AHMV public website content.

Those remain behind the private AHMV bridge at `https://ahmverdun.ca/api/ahmv/voice/`.

## Runtime entrypoint

```bash
npm ci
npm run verify
npm run preflight
npm start
```

Production starts `src/server.js`.

## Key folders

- `src/` — HTTP/WebSocket server.
- `runtime/src/` — agent, bridge, data, access, Twilio security, session and SMS modules.
- `runtime/fixtures/` — non-production deterministic data only.
- `test/` — standalone runtime unit tests.
- `scripts/` — runtime preflight.

## Environment

Copy variable names/defaults from `.env.example`. Keep all real credentials outside Git.

Production must keep:

- Twilio signature validation enabled;
- API schedule mode enabled;
- persistent store required;
- one Voice instance unless the session/concurrency design is deliberately redesigned;
- bounded call duration/concurrency/turn count.

## Access model

- Active 30-day trial: full phone feature capability.
- Active GROUPE TAKATAK premium entitlement: full capability.
- Expired non-blocked caller: verified next event remains available.
- Weekly schedule and personalized capabilities remain member-gated.
- Blocked callers receive no base capability.

## Twilio handoff

See:

`docs/voice-ai/TWILIO_HANDOFF.md`
