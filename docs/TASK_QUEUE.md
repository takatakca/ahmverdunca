# AHM Verdun — task queue

Updated 2026-10-16. Consult `AGENTS.md`, top of `WORKLOG.md` and open PRs before claiming a task. Green CI is not release approval.

| Priority | Task | Owner/state | Next action |
| --- | --- | --- | --- |
| Done | Critical TanStack Start XSS dependency remediation + Family session failure safety | PR #411; CI #38950476979, MochaHost deploy #38950582023 SUCCESS | Runtime `039111a8c723ffbfbf85f8a364f3132a2be0d447`, 0 audit vulnerabilities, exact /healthz and noindex verified; keep audit blocking CI |
| Done | Automatic production indexing defaults and approval | PR #408 deployed | Compiled SHA and homepage noindex certified; keep protected opt-in approval gate |
| Done | Manual production release fail-closed controls | PR #409; main CI #38622825907 and production #38622947479 success | Manual default noindex, canonical host and pre-upload restart guard verified |
| Done | Production smoke HTTP 403 WAF challenge fallback | PR #410; main CI #38623287164 and production #38623392436 success | Real compiled SHA `de96f2e65d403b398209f5ba5042ee0ca7a61903`, noindex and public route smoke verified |
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
