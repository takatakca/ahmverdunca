# TAKATAK Dashboard ↔ AHMV backend adapter

This folder is deliberately backend-only.

## Boundary

AHMV remains a standalone application. It must be operable without embedding TAKATAK Dashboard UI and must never become structurally dependent on the dashboard.

GROUPE TAKATAK is the managed-services control plane for:

- website operations;
- domain/DNS;
- hosting/deployments;
- SEO;
- social publishing;
- local listings;
- blog/content operations;
- reviews;
- lead calls;
- notifications;
- SMS;
- voice/VOIP;
- email;
- calendar;
- analytics;
- automations.

## Non-negotiable rules

1. No frontend import from this folder.
2. No automatic TAKATAK Dashboard menu registration.
3. No route is mounted merely because this folder exists.
4. Access requires an explicit subscription/entitlement decision owned by TAKATAK.
5. AHMV never becomes a billing authority.
6. Provider secrets stay server-side.
7. AHMV hockey facts remain sourced from AHMV/official providers, not TAKATAK billing/admin records.
8. The adapter must remain detachable so AHMV can later be consolidated, licensed or transferred without rewriting its application core.

## Control records

Administrative objects should support explicit lifecycle states instead of destructive UI assumptions:

- draft
- queued
- active
- archived

This enables Save, Draft, Publish/Execute, Archive and Restore semantics later in the dashboard without forcing those concerns into the AHMV frontend.

## Security contract

When a server route is eventually mounted, require:

- `TAKATAK_AHMV_CONTROL_PLANE_ENABLED=true`;
- server-only `TAKATAK_AHMV_SERVICE_TOKEN`;
- exact tenant `ahmverdun`;
- exact product `ahmv`;
- organization, actor and request IDs;
- audit logging for mutations;
- idempotency for write/execute actions;
- optimistic concurrency/revision checks on updates;
- explicit authorization per service/action.

The existence of this adapter does not grant access and does not make AHMV visible in TAKATAK Dashboard.
