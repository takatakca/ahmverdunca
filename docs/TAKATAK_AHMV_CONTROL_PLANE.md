# TAKATAK ↔ AHMV backend control plane

## Purpose

AHMV remains a standalone application. GROUPE TAKATAK may manage subscribed hockey associations through a server-to-server control plane, but the AHMV application must remain detachable and must not require TAKATAK Dashboard UI to run its public hockey experience.

This module is backend-only. It is not mounted in the AHMV frontend and it does not automatically register anything inside the normal TAKATAK Dashboard.

## Product boundary

TAKATAK owns managed-service orchestration:

- website operations;
- domain/DNS;
- hosting/deployment;
- SEO;
- social publishing;
- local listings;
- blog/content workflows;
- reviews;
- lead calls;
- notifications;
- SMS;
- voice/VOIP;
- email;
- calendar;
- analytics;
- automations.

AHMV / official hockey providers remain authoritative for hockey facts.

TAKATAK remains authoritative for commercial subscription/entitlement decisions.

## Backend lifecycle

Configuration/content objects use versioned records:

```text
draft -> queued -> active -> archived
                     ^          |
                     |          v
                     +------ draft
```

The current backend implements safe draft save, archive and restore persistence. External side effects are represented as jobs rather than inline provider calls.

Operational jobs use:

```text
queued -> running -> succeeded
             |
             +----> failed -> retry
                      |
                      +----> terminal after max attempts
```

Workers claim work through a PostgreSQL `FOR UPDATE SKIP LOCKED` RPC so parallel workers cannot claim the same job concurrently.

## Idempotency

Every mutating external command receives an idempotency key and a canonical SHA-256 request fingerprint.

Reusing the same key with the same command returns the existing job.

Reusing the same key for a different command is rejected.

## Optimistic concurrency

Updates to existing control records require the caller's last observed revision.

If the stored revision changed in the meantime, the operation fails with a revision conflict instead of silently overwriting another administrator's work.

This is the backend basis for future Save/Back/Forward/Undo conflict-safe dashboard behavior.

## Authorization

Authorization is the intersection of:

1. valid TAKATAK server identity;
2. exact tenant/product;
3. exact organization;
4. exact actor;
5. subscribed/enabled services;
6. role permission for the requested action.

Roles:

- owner — full service actions including destructive actions;
- admin — edit/publish/operate but no hard delete;
- manager — read/draft/publish/archive/restore;
- operator — read/draft/execute;
- viewer — read only.

The dashboard must never infer access merely because the module exists.

## Payload safety

Control-plane payloads are size/depth bounded and reject common credential fields such as passwords, API keys, auth tokens, private keys and provider secrets.

Provider credentials belong in a dedicated TAKATAK connector vault, never in AHMV control records or jobs.

## Audit

Audit rows deliberately store metadata and a payload fingerprint rather than a copy of the full payload.

Recorded metadata includes:

- organization;
- actor;
- request;
- idempotency key;
- service/action;
- resource;
- outcome;
- previous/next revision;
- previous/next status;
- payload fingerprint;
- timestamp.

## Current activation state

No public or dashboard route is mounted.

The control plane must remain disabled unless a future server integration explicitly enables:

```text
TAKATAK_AHMV_CONTROL_PLANE_ENABLED=true
```

That flag alone is not authorization. Server identity, subscription/entitlement, organization/service scope and action permission must still be validated before a route is ever activated.
