# AHM Verdun — task queue

Updated 2026-10-14. Consult `AGENTS.md`, top of `WORKLOG.md` and open PRs before claiming a task. Green CI is not release approval.

| Priority | Task | Owner/state | Next action |
| --- | --- | --- | --- |
| P0 | Automatic production indexing defaults and approval | This corrective branch; active | CI, merge, verify /healthz compiled SHA and homepage X-Robots-Tag=noindex; reject unapproved indexing |
| P0 | Louves M12B real mobile-first team app | DRAFT #401; issue #400 | Obtain owner FR/EN visual approval of real rendered 320/390/768/1440 screens before merge; public exact TeamLinkt widget only if authorized |
| P1 | Official team-photo-first schedule | DRAFT #403 | Review real visual QA and permissions; do not auto-merge |
| P1 | Weekly official schedule/data freshness | Awaiting source authority | Verify exact source publication time and approved recurrent provider; do not invent games |
| P1 | Phone, SMS, Voice | Issue #127, gated | Twilio carrier proof, production RLS/migration, signed callbacks, TLS/WSS and FR/EN/ES call QA |
| P1 | Parent Premium and Family | Issue #120, gated | Live TAKATAK Auth/entitlement/billing handoff, revoke/restore acceptance |
| P1 | Meta Facebook/Instagram Team Feed | Provider planned, gated | OAuth access, approved syndication, consent/moderation, tenant isolation, accurate attribution |
| P1 | Youth photo publication | Consent pending | Obtain explicit approved privacy/legal/media rights; fail closed |
| P2 | TAKATAK staging migration certification | Protected config missing | Supply environment-secret database URL, rerun guarded reconciliation |
| P2 | ADS serving / payments | Inventory absent | Real authorized campaigns/creatives/subscription and live event QA |
| P2 | Public SEO indexing | Association release decision required | Keep noindex until privacy/contact/legal and source approvals, set approval marker only then |

Do not mark tasks complete based on a demonstration, local code or preview alone. Separate code, CI, approved source/provider, release and observed production state.
