# AHMV Phone/SMS v2 — developer map

This subsystem is deliberately modular. Do not put all Twilio, hockey, billing and identity logic in one webhook file.

## Ownership boundary
- AHMV / official providers remain authoritative for hockey schedules, results and team records.
- GROUPE TAKATAK owns the commercial communication layer: contact identity mapping, entitlements, subscriptions, campaigns, preferences, analytics and future TAKATAK Dashboard controls.
- A phone number is a communication identifier, not sufficient authentication for sensitive account operations.
- The initial 30-day access window is a GROUPE TAKATAK trial. It does not create marketing consent.
- Premium billing/entitlements must eventually be confirmed by TAKATAK; AHMV must not create a competing billing authority.

## Target folders
```
src/features/ahmv-phone/
  twilio/          # Twilio request validation + TwiML only
  conversation/    # voice state machine, language, timeout, intents
  contacts/        # phone normalization, 30-day access, TAKATAK identity link
  teams/           # team resolution against validated public directory
  schedules/       # read-only normalized official schedule answers
  arenas/          # arena lookup + navigation destinations
  messaging/       # transactional SMS composition, queue, delivery state
  entitlements/    # guest/trial/premium feature gates
  audit/           # privacy-minimized operational events
  takatak/         # TAKATAK identity/entitlement/campaign contracts
```

## Free/trial behavior
An inbound caller can receive the next validated event and a transactional SMS requested during the call. The system may create/update the communication contact and start the configured trial window. Do not silently subscribe the caller to marketing.

## Premium-ready behavior
Future premium capabilities include weekly schedule, reminders, saved teams, calendar sync, smart departure, richer SMS commands and personalized notifications. Gate these through an entitlement interface so TAKATAK can become the authority without rewriting Twilio routing.

## Voice cost rule
Voice should be concise. Ask language, state that an optional requested SMS can follow, answer the intent, offer one useful next action, then finish. Silence and failed recognition use bounded retries; prefer a transactional SMS fallback when appropriate.

## Navigation
Never claim the caller's current GPS location from a phone call. Send the verified arena destination and links that let the user's device open its navigation app. Live origin/traffic features require device location permission on the web/app side.

## Twilio console handoff
The developer performing Twilio console work should only need:
1. Production Voice webhook (POST): `https://ahmverdun.ca/api/ahmv/twilio/voice`
2. Production Messaging webhook (POST): `https://ahmverdun.ca/api/ahmv/twilio/sms`
3. Status callback (POST): `https://ahmverdun.ca/api/ahmv/twilio/status`
4. Server secrets: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
5. Server config: `AHMV_WEBHOOK_ORIGIN=https://ahmverdun.ca`, `AHMV_PUBLIC_PHONE=+15816666246`
6. Keep `AHMV_PHONE_ENABLED=false` and `AHMV_PHONE_PUBLIC=false` until deployment and real-channel QA pass.
7. Enable Twilio Advanced Opt-Out and verify Canadian messaging compliance/configuration before production marketing use.

No Twilio secret belongs in GitHub source, screenshots, browser variables, or chat.
