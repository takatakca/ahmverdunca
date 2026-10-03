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

Initial capabilities:

1. Calendar sync after explicit consent.
2. SMS reminders before games and for meaningful schedule changes.
3. Smart departure reminders using arena destination and live traffic once a route provider is connected.
4. Family synchronization so two or more authorized caregivers can share the same team reminders.

## Supporter thank-you credit

A voluntary contribution may later trigger a thank-you entitlement such as four free weeks.

That rule belongs in TAKATAK Dashboard, not in AHMV browser code. Keep the contribution and the premium subscription as distinct records. Do not represent a contribution as a charitable donation or promise tax treatment unless the organization and receipt rules are separately verified.

Recommended event contract:

```text
supporter.credit.granted
identityId
sourceProject = ahmverdun
productCode = ahmv-parent-premium
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

A likely progression is:

- free public AHMV team hub;
- Parent Premium — reminders, calendar, departure intelligence and family sync;
- future Family/Community tier — chat, rides, tracking and richer coordination.

TAKATAK Dashboard owns plan names, prices, promotions, trials, credits and entitlements so the AHMV frontend does not become a billing source of truth.

## Current implementation state

The team microsite now has a feature-gated Parent Premium presentation component.

Environment gates:

- `VITE_PARENT_PREMIUM_VISIBLE`
- `VITE_PARENT_PREMIUM_LAUNCH_ENABLED`
- `VITE_PARENT_PREMIUM_WEEKLY_PRICE_CAD`
- `VITE_TAKATAK_AUTH_START_URL`

Keep `VITE_PARENT_PREMIUM_LAUNCH_ENABLED=false` until the real TAKATAK Auth start URL, account handoff, Stripe product and entitlement callbacks have passed end-to-end tests.
