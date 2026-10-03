# AHMV — Parent Experience platform

## Product boundary

AHMV is an independent product experience. It is not a hockey mode inside the native TAKATAK Dashboard.

**GROUPE TAKATAK** owns the shared engine:

- TAKATAK Auth / identity
- Product Catalog
- subscriptions and Stripe billing
- entitlements
- notification, SMS/Voice and email services
- Social Connect, reviews, CMS/blog, lead calls
- AI/automation, analytics, webhooks and connector vault

**AHMV** owns its hockey-family experience and AHMV-specific functional data.

A normal TAKATAK account must not see an AHMV navigation item. A direct AHMV URL must not enter the experience unless TAKATAK confirms an active `ahmv_access` entitlement.

## Catalog contract

Stable product code:

`ahmv`

Canonical plans:

- `parent_essential`
- `parent_premium`

Legacy aliases may remain temporarily for existing records:

- `hockey_member_weekly_10` -> `parent_essential`
- `hockey_vip_weekly_30` -> `parent_premium`

Prices and billing cadence are database configuration, never browser or application constants. The initial commercial configuration is CAD 10/month for Parent Essential and CAD 30/month for the future Parent Premium plan, but those values may be changed or versioned in the TAKATAK Product Catalog without redeploying AHMV.

The browser must not contain a price constant such as `VITE_PARENT_PREMIUM_WEEKLY_PRICE_CAD`.

## Entitlement contract

Base experience entitlement:

`ahmv_access`

Feature entitlements are catalog data. Initial capabilities include:

- `ad_free`
- `ai_assistant`
- `game_reminders`
- `calendar_sync`
- `team_community`
- `parent_messaging`
- `parent_rideshare`
- future premium capabilities such as `tournament_travel` and `family_live_coordination`

An entitlement record does not allow the UI to pretend an unfinished operational module is live.

## Access flow

```text
TAKATAK Auth
  -> verified TAKATAK identity
  -> active subscription status
  -> Product Catalog plan
  -> ahmv_access entitlement
  -> one-time launch code
  -> AHMV server exchanges code with TAKATAK
  -> signed HttpOnly AHMV session
  -> AHMV revalidates ahmv_access live with TAKATAK
  -> independent /experience UI
```

Launch codes are single use, short lived and stored hashed at rest by TAKATAK. AHMV never trusts localStorage, CSS visibility, a query parameter, Stripe metadata or a checkout-success URL as proof of access.

If TAKATAK reports the entitlement inactive, AHMV fails closed.

## Cancellation and return

Cancellation or suspension removes premium access without deleting the family workflow record. Returning subscribers can restore their permitted family configuration and history according to retention rules.

## Parent experience

The home experience is intentionally task-first:

> Bonjour. Voici votre journée hockey.

The four primary actions are:

1. Itinéraire
2. Présence
3. Transport
4. Calendrier

The complete AHMV navigation belongs only to AHMV:

- Accueil
- Ma famille
- Calendrier
- Équipes
- Présences
- Transport
- Messages
- Documents
- Photos
- Bénévolat
- Paiements
- Alertes
- Support
- Profil

AHMV must never invent a game, time, arena, roster or other hockey fact. Official-source linkage is required before those facts appear.

## Family Hub

AHMV owns family workflow data such as:

- family container
- caregivers
- children display identities
- links to official team IDs
- RSVP state
- Auto-Pilot preferences

Identity credentials, subscription records, Stripe objects and provider secrets remain TAKATAK-owned.

Because the product involves minors, the Family Hub should collect the minimum information needed for the family workflow and should not ask for medical or other sensitive child data unless a separately reviewed feature genuinely requires it.

## Auto-Pilot AHMV

Initial preference controls:

- add games to calendar automatically
- remind incomplete RSVP
- alert on time/arena changes
- recalculate recommended departure
- notify another caregiver when driving changes
- remind required documents
- group activities for multiple children

Auto-Pilot actions use TAKATAK shared services rather than duplicating provider integrations inside AHMV.

## Stripe authority

Stripe checkout and webhooks run through TAKATAK.

A Stripe subscription may grant AHMV only when its Stripe `price_id` maps to an active TAKATAK ProductPrice row. Stripe metadata alone is not an authority for a plan.

Self-serve checkout remains disabled until:

- the ProductPrice has a verified Stripe `providerPriceId`
- webhook secret is configured
- production QA passes
- the feature flag is deliberately enabled

## Contributions

Use **contribution / soutien au développement**, not “tax-deductible donation”, unless legal charitable status and receipt rules are separately established.

Contributions must be distinct from membership subscription records.

## Admin boundary

TAKATAK administration may manage AHMV operationally under a product back office such as:

```text
Products
  -> AHMV
     -> Customers
     -> Subscriptions
     -> Usage
     -> Revenue
     -> Automations
     -> Connectors
     -> Support
     -> Analytics
```

That back office is not the parent-facing AHMV experience.

## Environment gates

Browser-safe presentation flags:

- `VITE_PARENT_PREMIUM_VISIBLE`
- `VITE_PARENT_PREMIUM_LAUNCH_ENABLED`
- `VITE_TAKATAK_AUTH_START_URL`

Server-only experience settings:

- `AHMV_EXPERIENCE_ENABLED`
- `TAKATAK_AHMV_LAUNCH_URL`
- `TAKATAK_AHMV_EXCHANGE_URL`
- `TAKATAK_AHMV_INTROSPECT_URL`
- `TAKATAK_AHMV_SERVICE_TOKEN`
- `AHMV_EXPERIENCE_SESSION_SECRET`

The shared service token and session secret must never be exposed with a `VITE_` prefix.

## Standing product test

Every AHMV feature must pass four questions:

1. Is it simpler for the parent?
2. Can TAKATAK automate the work?
3. Is the value strong enough to justify the subscription?
4. Is it completely isolated from unrelated TAKATAK products?
