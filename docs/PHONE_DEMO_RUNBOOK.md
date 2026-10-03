# AHMV Phone demo runbook

The demo layer exists so the complete communication funnel can be reviewed before Twilio and the AHMV Supabase project are connected.

## Safety rules

- Demo data is synthetic and explicitly labelled DÉMO / DEMO.
- Demo data is never written into official schedule tables.
- The demo endpoint is disabled by default.
- If enabled, it requires a separate demo token.
- Never reuse the Twilio Auth Token as the demo token.
- Never enable demo mode merely to make production QA easier.

## Terminal demo

From the repository:

```bash
bun run demo:phone
```

This runs representative FR/EN scenarios without Twilio, Supabase, carrier delivery, or live hockey data.

## Demo endpoint

Server settings:

```
AHMV_PHONE_DEMO_ENABLED=true
AHMV_PHONE_DEMO_TOKEN=<random demo-only secret>
```

Request:

```bash
curl -X POST https://ahmverdun.ca/api/ahmv/phone-demo \
  -H "content-type: application/json" \
  -H "x-ahmv-demo-token: <demo-only secret>" \
  -d '{"channel":"voice","lang":"fr","message":"M13A","access":"trial","wantsSms":true}'
```

Supported access simulations:

- `guest`
- `trial`
- `expired`
- `premium`

Supported channels:

- `voice`
- `sms`

Useful demo messages:

- `M13A`
- `Junior`
- `AUJOURD'HUI M13A`
- `DEMAIN M13A`
- `SEMAINE M13A`
- `EN WEEK M13A`
- `SAUVE M13A`
- `SAVE M13A`

## Activation preflight

Run:

```bash
bun run check:phone-preflight
```

For a final production gate:

```bash
bun run check:phone-preflight --strict
```

The script prints only presence/state checks. It never prints credential values.

## Recommended demo presentation

1. French voice request for M13A.
2. Show the short spoken answer.
3. Show the requested follow-up SMS containing the arena destination and navigation link.
4. Show weekly access during the 30-day trial.
5. Switch the same scenario to `expired` and show the membership gate.
6. Switch to `premium` and show saved-team behavior.
7. Explain that real Twilio/Supabase credentials are intentionally deferred until launch wiring.

After the presentation, return `AHMV_PHONE_DEMO_ENABLED=false`.
