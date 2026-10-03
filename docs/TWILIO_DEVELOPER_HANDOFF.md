# AHMV Phone/SMS v2 — Twilio developer handoff

Audience: developer/operator with access to the Twilio Console and the AHMV production server.

The application code is already built. Do not redesign the call flow in Twilio Studio unless this document explicitly says so. Twilio should route calls/messages into the application webhooks; business logic stays in the repository.

## Public number

- Display: `1 (581) 666-6AHM`
- E.164: `+15816666246`
- Production site: `https://ahmverdun.ca`

If NumberBarn is still involved in voice routing, confirm that the original caller ID is preserved. The application expects the caller's real E.164 number in Twilio's `From` field when available.

## 1. Server prerequisites before touching Twilio

Deploy the approved green commit first.

Apply the Supabase migration:

`supabase/migrations/20261003070000_ahmv_phone_communications.sql`

Expected AHMV Supabase project reference from the repository:

`bqflllsjxmhqsvemhhwv`

Do not apply this migration to a TAKATAK, FESTI ICE, Food Hub, or unrelated Supabase project.

Required server variables:

```
AHMV_PHONE_ENABLED=false
AHMV_PHONE_PUBLIC=false
AHMV_PHONE_TRIAL_DAYS=30
AHMV_WEBHOOK_ORIGIN=https://ahmverdun.ca
AHMV_PUBLIC_PHONE=+15816666246

TWILIO_ACCOUNT_SID=<server secret>
TWILIO_AUTH_TOKEN=<server secret>

TAKATAK_AHMV_MEMBER_URL=https://takatak.ca/login?next=%2Fdashboard%2Fhockey
TAKATAK_AHMV_ENTITLEMENT_URL=
TAKATAK_AHMV_SERVICE_TOKEN=
```

Optional:

```
AHMV_TEAM_ALIASES_JSON={}
AHMV_URGENT_FR=
AHMV_URGENT_EN=
AHMV_URGENT_ES=
AHMV_URGENT_UNTIL=
```

Never put Twilio or TAKATAK secrets in browser variables, GitHub source, screenshots, tickets, or chat.

## 2. Twilio number configuration

In Twilio Console, open the phone number that receives AHMV calls/messages.

### Voice

Set **A call comes in** to:

`https://ahmverdun.ca/api/ahmv/twilio/voice`

Method: **POST**

Do not use GET.

### Messaging

Set **A message comes in** to:

`https://ahmverdun.ca/api/ahmv/twilio/sms`

Method: **POST**

If the number is attached to a Messaging Service, configure the inbound routing on the Messaging Service instead of creating conflicting number-level rules.

### Delivery status

The application sets the outbound SMS status callback itself:

`https://ahmverdun.ca/api/ahmv/twilio/status`

No second callback should override it.

## 3. Advanced Opt-Out

Enable/configure Twilio Advanced Opt-Out for the messaging sender/service.

The application deliberately does not generate its own STOP/START response. Carrier/Twilio opt-out behavior remains authoritative.

An inbound call or a requested transactional SMS does **not** grant marketing consent.

## 4. Enable the private integration first

After the migration and server secrets exist:

```
AHMV_PHONE_ENABLED=true
AHMV_PHONE_PUBLIC=false
```

Restart the production Node/Passenger application.

At this stage the webhooks can work, but the public website must still treat the phone service as unverified.

## 5. Required real-channel QA

Use a real Canadian mobile phone.

### Voice — French

1. Call the public AHMV number.
2. Press 1 for French.
3. Choose SMS follow-up.
4. Ask for a validated team/group.
5. Confirm the spoken answer is short.
6. Confirm a transactional SMS arrives when requested.
7. Confirm the SMS contains the schedule result and arena/navigation information when available.
8. Confirm the call ends promptly.

### Voice — English

Repeat with English using option 2.

### Voice — Spanish

1. Call the public AHMV number.
2. Press 3 for Spanish.
3. Confirm Spanish TTS and speech recognition use the Spanish flow.
4. Request SMS follow-up.
5. Ask for a validated team/group.
6. Confirm the spoken answer and SMS follow-up are in Spanish.
7. Confirm the call ends promptly.

### Silence fallback

1. Choose SMS follow-up.
2. Stay silent when asked for the team.
3. Let the bounded retry finish.
4. Confirm the service sends the fallback SMS asking for the team.
5. Confirm the call hangs up.

### Inbound SMS

Test:

```
AIDE
HELP
Junior
SEMAINE Junior
EN WEEK Junior
ES SEMANA Junior
ES CALENDARIO M13A
ES SALIDA M13A
SAVE M13A
```

During an active 30-day trial, personalized commands can be available. After trial expiry, the base next-event answer remains available while personalized member features are gated through TAKATAK.

### Ambiguous team

Test a category/level that maps to multiple teams, such as `M11B`.

The system must ask for a more specific team. It must not guess.

### Opt-out

Test the configured STOP/START flow according to the Twilio Messaging Service/carrier configuration. Confirm the application does not send a competing custom opt-out message.

## 6. Database QA

Confirm records are created in:

- `ahmv_phone_contacts`
- `ahmv_phone_team_preferences`
- `ahmv_phone_interactions`
- `ahmv_phone_message_jobs`

Verify:

- first contact creates a trial window;
- repeated calls do not restart the trial;
- language updates across `fr`, `en`, and `es`;
- requested SMS consent is distinct from marketing consent;
- marketing consent remains false unless explicitly collected elsewhere;
- message delivery status updates;
- phone interactions do not store raw Twilio auth data.

## 7. Public activation

Only after all real-channel checks pass:

```
AHMV_PHONE_PUBLIC=true
```

Restart the app and verify:

`https://ahmverdun.ca/api/ahmv/phone-status`

The public website may then expose click-to-call.

## 8. ConversationRelay / AI voice

Do not switch the production number to ConversationRelay until a stable WebSocket endpoint is deployed and tested.

Current Twilio ConversationRelay requires a `wss://` application endpoint. The existing AHMV production runtime is deployed through Node/Passenger, and this repository does not currently prove WebSocket proxy support on that hosting path.

The deterministic voice/speech flow is therefore the safe production baseline.

When a dedicated WebSocket service is available, add it behind a feature flag and preserve the same AHMV schedule, contact, SMS, entitlement, and audit services. Do not fork a second source of truth.

## 9. Ownership boundary

AHMV owns hockey information and official hockey-source decisions.

GROUPE TAKATAK owns the surrounding commercial platform layer:

- communication identity mapping;
- memberships/entitlements;
- billing integration;
- communication preferences;
- campaigns;
- centralized analytics;
- TAKATAK Dashboard permissions.

The phone number alone is not sufficient authentication for sensitive account operations.
