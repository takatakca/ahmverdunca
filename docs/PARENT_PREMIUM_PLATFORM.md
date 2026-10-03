# AHM Verdun — Parent Premium platform

## Product mission

Reduce the amount of coordination a hockey parent has to do before every practice, game and tournament.

AHM Verdun remains the hockey information experience. GROUPE TAKATAK is the company/agency grouping the ecosystem. **TAKATAK Auth** owns shared identity and consent. **TAKATAK Dashboard** owns subscriptions, Stripe billing, communication preferences, premium entitlements, integrations and service operations.

The first product is a mini-application attached to an exact public AHMV team ID. It must never become a second official hockey record system.

## Naming rule

Use these names exactly:

- **GROUPE TAKATAK** — company / agency / ecosystem owner.
- **TAKATAK Dashboard** — central operational dashboard and service back office.
- **TAKATAK Auth** — shared identity, login and authorization layer.
- **AHM Verdun** — public hockey site and team microsite experience.

Do not call the software "GROUPE TAKATAK Dashboard".

## First paid experience

Initial planned offer: **CAD 10.00/week** for the season, configurable before launch.

The public site may describe the offer, but checkout and entitlement activation must not become active until TAKATAK Auth and TAKATAK Dashboard are connected and tested.

TAKATAK plan code: `hockey_member_weekly_10`.

Entitlements for the CAD 10/week member plan:

1. `ad_free` — suppress approved AdSense placements on verified member surfaces.
2. `ai_assistant` — unlock the full AHMV assistant experience.
3. `game_reminders` — member reminder entitlement for official team events.
4. `calendar_sync` — calendar synchronization after explicit consent.
5. `team_community` — private, moderated team-community entitlement.
6. `parent_messaging` — private parent communication without exposing contact details publicly.
7. `parent_rideshare` — opt-in parent rideshare entitlement once the module is launched.

An entitlement in the billing catalog is not permission to claim an unfinished module is live. The AHMV interface must distinguish the paid right from the operational availability of each service.

## Supporter thank-you credit

A voluntary contribution may later trigger a thank-you entitlement such as four free weeks.

That rule belongs in TAKATAK Dashboard, not in AHMV browser code. Keep the contribution and the premium subscription as distinct records. Do not represent a contribution as a charitable donation or promise tax treatment unless the organization and receipt rules are separately verified.

Recommended event contract:

```text
supporter.credit.granted
identityId
sourceProject = ahmverdun
productCode = hockey_member_weekly_10
creditType = premium_weeks
quantity = 4
reason = supporter_thank_you
sourcePaymentId
grantedAt
```

The credit operation must be idempotent.

## Integration flow

```text
AHM team microsite
  -> TAKATAK Auth
      -> identity + consent
      -> returns authorized session
  -> TAKATAK Dashboard
      -> Stripe subscription / credits
      -> communication preferences
      -> calendar connector
      -> SMS notification service
      -> route/traffic service
      -> future family/community services
```

AHMV must not receive raw Google OAuth refresh tokens, Stripe secret keys or provider secrets in browser code.

## Calendar design

Calendar authorization belongs to TAKATAK Auth / the TAKATAK integration layer.

The parent chooses which exact AHMV teams to follow. TAKATAK Dashboard stores the relationship between the authorized identity and public team IDs. Events should preserve their official source/provenance and support updates/cancellations without creating duplicate calendar entries.

Minimum event metadata:

- external official event ID when available
- exact public AHMV team ID
- source URL/provider
- start/end time and timezone
- arena identity/address
- event status
- source revision timestamp

## Notification engine

Notifications should be event-driven rather than a collection of one-off cron scripts.

Suggested events:

- `team.game.created`
- `team.game.changed`
- `team.game.cancelled`
- `team.game.reminder_due`
- `travel.departure_window_changed`
- `team.announcement.published`

Each caregiver controls channel preferences independently: push/web, SMS, email and calendar.

## Smart departure alert

Once a live route provider is connected:

1. read the event arena and arrival target;
2. calculate route duration from the parent-approved starting location;
3. add configurable preparation/parking buffer;
4. notify only when the departure recommendation materially changes;
5. never persist continuous location history just to provide a game-day reminder.

Example: "Traffic is heavier than usual. Leave by 17:42 to arrive 25 minutes before puck drop."

## Family layer

The family object should be separate from player records.

Future capabilities:

- multiple caregivers;
- multiple children / multiple teams without exposing rosters;
- shared RSVP / who is driving;
- hand-off notes;
- pickup/drop-off coordination;
- temporary ride tracking;
- emergency contact rules;
- child-safe read-only view.

Precise location sharing must be explicit, time-limited and off by default.

## Team community roadmap

Later paid tiers can add:

- moderated parent chat;
- game-specific chat rooms;
- ride requests and carpool matching;
- meetup planning;
- polls / availability;
- temporary live trip tracking;
- voice/video calls;
- shared media with consent controls.

Because the ecosystem involves minors, moderation, reporting, blocking, retention and parental/guardian controls are launch requirements for community features, not optional cleanup work.

## Experience escalation loop

Before adding every new feature, run this loop:

1. **Friction:** What parent task does this remove?
2. **Trust:** Which verified source owns the underlying hockey fact?
3. **Consent:** What permission or personal data is actually required?
4. **Action:** Can the parent complete the task in fewer taps?
5. **Fallback:** What happens if TAKATAK, SMS, calendar or traffic is unavailable?
6. **Adjacent value:** Is there one nearby capability that materially improves the same moment without adding confusion?
7. **Re-review:** Before starting the next feature, re-check the previous six questions against the whole experience.

This is the standing product rule for the Parent Premium roadmap.

## Tier direction

Do not hard-code future prices until approved.

Approved direction:

- free public AHMV team hub;
- **AHMV Member — CAD 10/week** (`hockey_member_weekly_10`) — ad-free entitlement, premium assistant, reminders, calendar, community, messaging and rideshare entitlement;
- **AHMV VIP — CAD 30/week** (`hockey_vip_weekly_30`) — planned only, not for sale until the travel/tournament and advanced family-live capabilities are actually delivered.

TAKATAK Dashboard owns plan names, prices, promotions, billing state and entitlements so the AHMV frontend never becomes a billing source of truth.

## Current implementation state

The team microsite now has a feature-gated Parent Premium presentation component.

Environment gates:

- `VITE_PARENT_PREMIUM_VISIBLE`
- `VITE_PARENT_PREMIUM_LAUNCH_ENABLED`
- `VITE_PARENT_PREMIUM_WEEKLY_PRICE_CAD`
- `VITE_TAKATAK_AUTH_START_URL`

Recommended authenticated handoff once the backend is deployed:

`https://takatak.ca/login?next=%2Fdashboard%2Fhockey`

Keep `VITE_PARENT_PREMIUM_LAUNCH_ENABLED=false` until the TAKATAK Hockey Membership migration, Stripe CAD 10/week Price, dedicated webhook, account handoff and entitlement verification have passed end-to-end tests. AHMV must never unlock premium from localStorage, a query parameter or a Stripe success redirect.
