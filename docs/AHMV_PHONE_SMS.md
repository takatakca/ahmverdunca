# AHMV incoming phone and SMS

Public number: **581-666-6246** (1-581-666-6AHM). Production origin: **https://ahmverdun.ca**.

## Implemented

POST `/api/ahmv/twilio/voice`: bilingual keypad language selection, time-limited urgent bulletin, schedule/team/arena menu, exact spoken group lookup, bounded retries and hangup on silence.

POST `/api/ahmv/twilio/sms`: default French; `EN M12B` selects English. Returns the next published event, cancellation notice when applicable, and the filtered schedule link. HELP/AIDE returns instructions. Twilio Advanced Opt-Out owns opt-out replies; this endpoint never sends a custom STOP/START response.

POST `/api/ahmv/twilio/status`: authenticated acknowledgment and operational log. The first version logs channel, outcome and a hashed Twilio reference only, with no caller number or raw message. These are runtime logs, not a persistent analytics database.

Signature verification uses the official Twilio SDK with every received form field and the exact path/query appended to the configured public origin. Requests fail closed when disabled or when credentials are missing. POST/form-only, 16 KiB streaming body cap, account/destination checks, XML escaping and no-store responses apply.

## One schedule source

The website and phone engine both read `src/data/official-week.ts`. The demonstration calendar is never imported into phone responses. This is the existing PDF transcription, **not yet an automated live import**. No schedule is inferred from an age category or neighboring team. In particular M12B is not mapped to M11.

Publish verified activities in that shared source to update both channels. If AHMV approves an alternate code, set `AHMV_TEAM_ALIASES_JSON` to a JSON object with a normalized key and an exact official group name. No aliases are supplied by default. Query matching is exact after accent/punctuation normalization; recognition quality requires real-call QA.

The current source covers September 28–October 4, 2026 and only contains Monday/Tuesday activities. Remaining days are pending; a missing result says no upcoming event is confirmed in the integrated source. After the coverage period expires, the engine reports that the current schedule is unavailable. It never presents a historical event as upcoming.

## Activation prerequisites

1. Merge after CI validation and deploy the server build, not just static assets.
2. Store `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in server environment settings, never in source code, browser variables or chat. Configure `AHMV_WEBHOOK_ORIGIN=https://ahmverdun.ca` with no trailing slash and `AHMV_PUBLIC_PHONE=+15816666246`.
3. Verify that the number belongs to the expected Twilio account and supports incoming Voice and SMS. If NumberBarn still controls routing, confirm that routing/porting separately. This implementation does not assume porting is complete.
4. Set the incoming Voice webhook to `https://ahmverdun.ca/api/ahmv/twilio/voice`, method POST. Set incoming Messaging webhook to `https://ahmverdun.ca/api/ahmv/twilio/sms`, method POST. If a Messaging Service owns the number, configure its incoming routing and Advanced Opt-Out there. Status callback, when supported by the selected Twilio configuration: `https://ahmverdun.ca/api/ahmv/twilio/status`, POST.
5. Enable `AHMV_PHONE_ENABLED=true` only with the credentials configured. Test invalid signatures (403), valid signed webhooks, live French/English calls, silence, invalid keypad selection, team recognition, HELP, M12B, EN M12B, missing/pending data, cancelled events and urgent bulletin expiry. Confirm carrier delivery and Twilio request logs.
6. Confirm the deployment does not cache webhook POST responses and the proxy preserves the exact path and query. Run `bun test scripts/ahmv-phone.test.ts`, TypeScript, lint and build in CI.

Urgent bulletin settings: `AHMV_URGENT_FR`, `AHMV_URGENT_EN`, `AHMV_URGENT_UNTIL` (ISO timestamp with timezone). The matching language message plays before the voice menu and prefixes schedule SMS responses while active. If expiry is absent/invalid/past, no bulletin is shown.

## Remaining integration

Automated official-source ingestion, a GROUPE TAKATAK tenant-scoped schedule API, centrally managed bulletins/aliases, durable operational logs and production monitoring are subsequent work. No competing identity service or child-to-child dependency is introduced. TAKATAK remains the master identity/permissions authority; these public read-only schedule queries do not create accounts or bypass authentication for administrative operations.

This is an implementation awaiting configuration and real-channel QA. A successful local test or CI build is not evidence that the public number is active or available 24/7.

References: https://www.twilio.com/docs/usage/webhooks/webhooks-security and https://www.twilio.com/docs/voice/twiml/gather.
