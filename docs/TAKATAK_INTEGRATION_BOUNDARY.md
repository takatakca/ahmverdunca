# AHM Verdun — TAKATAK Integration Boundary

This project keeps the public AHM Verdun experience separate from the central GROUPE TAKATAK backend.

## Public AHM Verdun site

Owns the parent-facing experience:

- schedules and team discovery
- team pages
- news, arenas, galleries and resources
- registration and login gateway screens
- links to the official hockey registration platform

The public site must not invent or duplicate authoritative hockey-registration data.

## GROUPE TAKATAK

Will become the shared control plane for approved services such as:

- parent/lead identity and communication preferences
- newsletter consent and follow-up
- social account management by organization/team scope
- Google/Meta/SEO/analytics operations
- future schedule-ingestion automation
- audit and synchronization events

Any TAKATAK integration must be explicit, authenticated and fail closed.

## Spordle

Remains the official hockey-registration destination for registration-specific records, required documents and payment unless the association formally changes that process.

## Schedule ingestion

The current frontend schedule contract is intentionally independent from the future source. A later ingestion service may parse approved email/PDF/CSV sources and publish validated structured events without rebuilding the parent-facing schedule UI.

## Privacy boundary

Marketing/communication data must remain separated from sensitive child/player information. No child health, payment or registration record should be copied into marketing workflows merely because the public site and TAKATAK are connected.
