# AHM Verdun Voice AI — Twilio Developer Handoff

This document is the operator handoff for the Twilio engineer. The application code, private AHMV bridge, access rules, post-call SMS logic, Voice session persistence, FR/EN/ES behavior, CI gates, deployment assets and rollback plan are already prepared in the repository.

## 1. Public number

AHM Verdun public number:

- Display: `1-581-666-6AHM`
- E.164: `+15816666246`

Do not change the live production routing until the preproduction acceptance checklist passes.

## 2. What is already built

The application already contains:

- incoming Voice activation gate: caller presses 1 before AI starts;
- FR / EN / ES automatic ConversationRelay transcription and response flow;
- Twilio HTTP webhook signature validation;
- Twilio ConversationRelay WebSocket signature validation;
- caller/session consistency checks using CallSid;
- bounded call duration, turn count, concurrency and reconnect attempts;
- verified AHMV schedule/arena tools;
- no schedule guessing when the source is stale or unavailable;
- 30-day introductory entitlement integration;
- after trial expiry, base `next_event` access remains available;
- weekly schedule and personalized capabilities remain member-gated;
- automatic operational post-call SMS when the caller accepted it;
- one-SMS-per-call idempotency using CallSid;
- STOP/START/HELP handling remains on the existing AHMV SMS system;
- GROUPE TAKATAK membership handoff;
- Voice session retention without storing raw call transcripts;
- preproduction health/readiness checks and rollback workflows.

## 3. Repository folders

```text
services/ahmv-voice-ai/
  src/server.js                         standalone Fastify + WebSocket runtime
  runtime/src/agent.js                 OpenAI tool-calling agent
  runtime/src/access-policy.js         base vs member capability enforcement
  runtime/src/ahm-bridge.js            private calls to ahmverdun.ca
  runtime/src/ahm-data.js              schedule/arena adapter
  runtime/src/twiml.js                 ConversationRelay TwiML
  runtime/src/twilio-security.js       HTTP + WebSocket signature validation
  runtime/src/store.js                 Voice session persistence
  runtime/src/sms.js                   post-call SMS
  runtime/src/sms-body.js              FR/EN/ES recap content
  runtime/src/turn-controller.js       interruption / cancellation handling
  test/runtime.test.js                 standalone runtime tests
  .env.example                         Voice host variable contract

src/features/ahmv-phone/
  contacts/                            phone identity + trial state
  entitlements/                        30-day / premium capability logic
  schedules/                           schedule source + live adapter
  arenas/                              verified arena / route links
  reminders/                           reminders/change alerts
  calendar/                            signed calendar links
  departure/                           signed smart-departure links
  messaging/                           transactional SMS queue
  marketing/                           separate explicit-consent campaigns
  privacy/                             retention
  takatak/                             GROUPE TAKATAK authority boundary

src/lib/
  ahmv-voice-bridge.server.ts          private website API for Voice runtime
  ahmv-twilio.server.ts                existing deterministic Twilio SMS/IVR

services/ahmv-voice-ai/deploy/
  ahmv-voice.service                   systemd unit
  nginx-voice.ahmverdun.ca.conf        TLS/WebSocket reverse proxy

supabase/migrations/
  20261003091000_ahmv_voice_sessions.sql

docs/voice-ai/
  TWILIO_HANDOFF.md                    this file
```

## 4. Twilio Voice configuration — preproduction first

Use a staging/test Twilio number or controlled routing before changing `+15816666246`.

Configure the incoming Voice webhook:

- Method: `POST`
- URL: `https://voice.ahmverdun.ca/twilio/voice`

The application returns the TwiML. Do **not** manually create the ConversationRelay TwiML in Twilio Console.

The application-generated TwiML connects Twilio to:

- WebSocket: `wss://voice.ahmverdun.ca/twilio/conversation`
- Connect action: `https://voice.ahmverdun.ca/twilio/voice/connect-ended`

These are runtime endpoints. The phone number itself only needs the incoming Voice webhook above.

Keep HTTPS/WSS hostnames exact. Twilio signature validation depends on the canonical public URL.

## 5. Twilio Messaging configuration

Keep incoming AHMV SMS on the website application:

- Method: `POST`
- URL: `https://ahmverdun.ca/api/ahmv/twilio/sms`

Keep outbound delivery status callback:

- Method: `POST`
- URL: `https://ahmverdun.ca/api/ahmv/twilio/status`

The post-call Voice service does not send SMS directly from the standalone Voice host. It calls the private AHMV bridge, and the existing AHMV Twilio messaging layer sends the message. This keeps one SMS authority.

If the number belongs to a Twilio Messaging Service, enable and verify Advanced Opt-Out before commercial messaging launch. The application already understands Twilio's `OptOutType` and must not duplicate Twilio's STOP/START/HELP confirmation message.

Recommended operational keywords:

- STOP / START / UNSTOP / HELP
- French help can also be handled in the application as AIDE
- Spanish help can also be handled in the application as AYUDA

Commercial consent is separate from carrier STOP:

- `OFFRES OUI / OFFRES NON`
- `OFFERS YES / OFFERS NO`
- `OFERTAS SI / OFERTAS NO`

Do not combine service-SMS consent with marketing consent.

## 6. Dedicated Voice host variables

Install real values only in the protected host environment, for example:

`/etc/ahmv-voice-ai.env`

Use `services/ahmv-voice-ai/.env.example` as the exact variable-name contract.

Critical production classes:

- `PUBLIC_BASE_URL=https://voice.ahmverdun.ca`
- `PUBLIC_WSS_URL=wss://voice.ahmverdun.ca`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER=+15816666246`
- `TWILIO_VALIDATE_SIGNATURES=true`
- `TWILIO_TTS_VOICE=<approved/listening-tested ElevenLabs voice id>`
- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-5.6-terra`
- `AHM_VOICE_BRIDGE_URL=https://ahmverdun.ca/api/ahmv/voice/`
- `AHM_VOICE_BRIDGE_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VOICE_INSTANCE_MODE=single`

For controlled preproduction:

- `ACCESS_MODE=free_beta`

For the intended membership model after acceptance:

- `ACCESS_MODE=paid`
- `PAID_ACCESS_POLICY=premium_or_trial`

With that production policy, an expired non-blocked caller can still receive the verified next event because AHMV grants the base `next_event` capability, while weekly/personalized features remain gated.

## 7. Website-side private bridge variables

On the AHMV website server:

- `AHMV_VOICE_BRIDGE_TOKEN`
- `TAKATAK_AHMV_SCHEDULE_URL`
- `TAKATAK_AHMV_SERVICE_TOKEN`
- `AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES=360`
- `AHMV_VOICE_SESSION_RETENTION_DAYS=90`
- existing server-only Supabase credentials

The bridge token must match the Voice host token.

Never expose any of these as `VITE_*`.

## 8. Database step

Before applying the Voice session migration, verify the target is the AHM Verdun Supabase project and that these existing tables are present:

- `public.ahmv_phone_contacts`
- `public.ahmv_phone_message_jobs`
- `public.ahmv_phone_interactions`

Then apply/review:

- `20261003090500_ahmv_phone_message_dedupe.sql`
- `20261003110000_ahmv_phone_spanish.sql`
- `20261003091000_ahmv_voice_sessions.sql`

The Voice table stores operational metadata, not raw call transcripts.

## 9. Required acceptance calls

Before production cutover, complete all of these on the staging/test route:

1. Press 1 starts the AI.
2. No key after bounded retries exits cleanly.
3. French call.
4. English call.
5. Spanish call.
6. Caller interruption while AI is speaking.
7. Next-event lookup.
8. Weekly schedule during active trial/member access.
9. Expired trial receives next event only.
10. Expired trial asking for weekly schedule receives only the next event plus member-access explanation.
11. Ambiguous team asks one clarification.
12. Stale/unavailable schedule produces no guessed answer.
13. Arena address and directions.
14. Caller accepts post-call SMS.
15. Caller says no SMS.
16. Duplicate callback creates no duplicate recap SMS.
17. Private/anonymous Caller ID remains voice-only.
18. OpenAI timeout/failure path.
19. AHMV bridge outage.
20. ConversationRelay disconnect/reconnect.
21. Turn limit.
22. Call-duration limit.
23. Per-caller concurrency limit.
24. Global concurrency limit.
25. Graceful service restart during an active call.

## 10. Production cutover

Only after the AHMV website bridge and Voice runtime both report ready:

1. Record the existing production Voice webhook exactly.
2. Save it as the rollback target.
3. Change **A call comes in** for `+15816666246` to:
   `https://voice.ahmverdun.ca/twilio/voice`
4. Method: `POST`.
5. Save.
6. Call once in FR, EN and ES.
7. Confirm one post-call SMS when accepted.
8. Confirm STOP still blocks future SMS.
9. Confirm health/readiness remain green.

## 11. Immediate rollback

If a critical production call fails:

1. Restore the exact previously recorded Twilio Voice webhook.
2. Save the Twilio number configuration.
3. Verify the previous deterministic AHMV IVR works.
4. Keep the Voice host available only for diagnosis if safe.
5. Do not re-cut over until the failed acceptance case is reproduced and fixed.

Do not use DNS changes as the primary rollback.

## 12. What the Twilio developer still has to do

The remaining Twilio-side work is deliberately small:

- confirm the public number `+15816666246` is in the correct Twilio account;
- confirm Voice is enabled for the number;
- confirm ConversationRelay is available for the account/project;
- choose/listening-test the production ElevenLabs voice and set its ID on the Voice host;
- verify Messaging Service / Sender Pool association;
- configure and verify Advanced Opt-Out if not already enabled;
- run staging acceptance;
- change the incoming Voice webhook only after all gates are green;
- preserve the previous Voice webhook for rollback.

No Twilio Auth Token, OpenAI key, Supabase service key or bridge token should ever be pasted into a chat, GitHub issue, PR comment or source file.

## 13. Reference documentation

Twilio Voice webhooks:
https://www.twilio.com/docs/usage/webhooks/voice-webhooks

Twilio ConversationRelay onboarding:
https://www.twilio.com/docs/voice/conversationrelay/onboarding

Twilio ConversationRelay WebSocket messages:
https://www.twilio.com/docs/voice/conversationrelay/websocket-messages

Twilio Advanced Opt-Out:
https://www.twilio.com/docs/messaging/tutorials/advanced-opt-out
