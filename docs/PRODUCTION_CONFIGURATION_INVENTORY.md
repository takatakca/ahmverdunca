# AHM Verdun — production configuration inventory

This document records **variable names, scope and activation state only**. Never add real secret values to Git, PR comments, support tickets or chat.

## Operating rule

- GitHub `main` is the release source of truth.
- cPanel/MochaHost operators inspect **presence only** for secret values.
- Keep every gated subsystem OFF until its own live acceptance is complete.
- A server credential must never use a `VITE_` prefix.
- The standalone Voice service has its own environment contract in `services/ahmv-voice-ai/.env.example` and `docs/VOICE_SECRETS_AND_ENVIRONMENTS.md`.

## Core AHMV website / Supabase

| Variable | Scope | Production note |
| --- | --- | --- |
| `SUPABASE_URL` | server | AHMV Supabase origin |
| `SUPABASE_SERVICE_ROLE_KEY` | server secret | never browser-visible |
| `AHMV_SUPABASE_PROJECT_REF` | server safety pin | must remain the AHMV project ref |
| `VITE_SUPABASE_URL` | browser-safe | public Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | browser-safe | publishable/anon credential only |
| `LOVABLE_CRON_SECRET` | server secret | cron authentication where used |
| `LOVABLE_CRON_SECRET_PREVIOUS` | server secret | optional overlap during rotation |

## Release / public UI gates

These remain OFF until deliberately accepted:

- `VITE_PUBLIC_INDEXING=false`
- `VITE_DEMO_MEMBER_PREVIEW_ENABLED=false`
- `VITE_COMMUNICATIONS_PREVIEW_ENABLED=false`
- `VITE_ASSISTANT_NUDGE_ENABLED=false`

Public indexing is the final SEO gate, not a substitute for production smoke testing.

## Community content corrections

Keep OFF until TAKATAK moderation is deployed, its migration is applied, and the shared token is configured on both services:

- `VITE_TAKATAK_CONTENT_CONTRIBUTIONS_VISIBLE=false`
- `TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED=false`
- `TAKATAK_CONTENT_ORIGIN`
- `TAKATAK_AHMV_CONTENT_TOKEN` — server secret

Activation order: TAKATAK production → authorized read-only smoke → AHMV server bridge → correction UI visibility.

## Family Experience / TAKATAK entitlement

Keep OFF until TAKATAK Product Catalog launch/exchange/introspection is live and the Family migration is applied:

- `VITE_PARENT_PREMIUM_VISIBLE=false`
- `VITE_PARENT_PREMIUM_LAUNCH_ENABLED=false`
- `VITE_TAKATAK_AUTH_START_URL`
- `AHMV_EXPERIENCE_ENABLED=false`
- `TAKATAK_AHMV_LAUNCH_URL`
- `TAKATAK_AHMV_EXCHANGE_URL`
- `TAKATAK_AHMV_INTROSPECT_URL`
- `TAKATAK_AHMV_SERVICE_TOKEN` — server secret
- `AHMV_EXPERIENCE_SESSION_SECRET` — server secret

TAKATAK remains pricing, billing and entitlement authority. AHMV never receives browser-owned pricing authority.

## Exact-team games / live schedule

- `TAKATAK_TEAM_GAMES_ENABLED=true` — current source default; emergency kill switch may set false
- `TAKATAK_TEAM_GAMES_ORIGIN`
- `TAKATAK_AHMV_SERVICE_TOKEN` — shared server credential
- `TAKATAK_AHMV_SCHEDULE_URL`
- `AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES`

Official hockey providers remain authoritative. A stale or provenance-free feed must fail closed.

## TAKATAK ADS

Keep OFF until the TAKATAK ADS backend, event signing, publisher seed and no-fill fallback are verified:

- `VITE_TAKATAK_ADS_ENABLED=false`
- `VITE_TAKATAK_ADS_ORIGIN`
- `VITE_TAKATAK_ADS_PUBLISHER`

No provider secret belongs in browser variables.

## Phone / SMS

Keep public routing OFF until a real signed Twilio smoke succeeds:

- `AHMV_PHONE_ENABLED=false`
- `AHMV_PHONE_PUBLIC=false`
- `TWILIO_ACCOUNT_SID` — server credential
- `TWILIO_AUTH_TOKEN` — server secret
- `AHMV_WEBHOOK_ORIGIN`
- `AHMV_PUBLIC_PHONE`

Additional gated modules remain OFF by default:

- `AHMV_PHONE_DEMO_ENABLED=false`
- `AHMV_PHONE_OPS_ENABLED=false`
- `AHMV_PHONE_RETENTION_ENABLED=false`
- `AHMV_PHONE_LIFECYCLE_ENABLED=false`
- `AHMV_PHONE_REMINDERS_ENABLED=false`
- `AHMV_CALENDAR_LINKS_ENABLED=false`
- `AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED=false`
- `TAKATAK_AHMV_CONTROL_PLANE_ENABLED=false`
- `AHMV_PHONE_CAMPAIGNS_ENABLED=false`
- `AHMV_TAKATAK_MARKETING_CONSENT_SYNC_ENABLED=false`

Related server secrets / protected values include:

- `AHMV_PHONE_DEMO_TOKEN`
- `AHMV_CALENDAR_LINK_SECRET`
- `AHMV_DEPARTURE_LINK_SECRET`
- `TAKATAK_ROUTE_SERVICE_TOKEN`

## Website-side Voice bridge

These belong to the AHMV website server environment, not the standalone Voice host file:

- `AHMV_VOICE_BRIDGE_TOKEN` — server secret; must match the Voice service bridge token
- `AHMV_VOICE_SESSION_RETENTION_DAYS`
- `TAKATAK_AHMV_SCHEDULE_URL`
- `AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES`

Do not route the public phone number to Voice until TLS/WSS, bridge readiness, signed Twilio requests, FR/EN/ES call behavior and rollback are verified.

## Separate Voice host

Use `services/ahmv-voice-ai/.env.example` as the exact contract for `voice.ahmverdun.ca`. Important secret classes include:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `OPENAI_API_KEY`
- `AHM_VOICE_BRIDGE_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not copy Voice host secrets into the AHMV website environment unless the website contract explicitly uses the same named secret.

## cPanel verification procedure

For each production variable:

1. verify the variable **name exists** where its subsystem requires it;
2. report only `present`, `missing`, `enabled` or `disabled`;
3. never print the raw value;
4. verify all gated flags stay OFF before migrations/provider smoke;
5. after changing environment configuration, restart the approved Passenger/application process once;
6. run the exact live smoke for that subsystem;
7. enable only the single gate whose acceptance has passed;
8. record the deployed GitHub SHA and rollback release.

## GitHub deployment secrets are separate

SSH/cPanel deployment secrets such as hosts, users, private keys, known-host pins and approved restart commands belong in protected GitHub environments. They are not application runtime variables and must not be copied into the cPanel application `.env`.
