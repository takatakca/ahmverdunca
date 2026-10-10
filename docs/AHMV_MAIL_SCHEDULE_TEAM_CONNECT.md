# AHMV — Gmail PDF Intake / Schedule Sync / TeamLinkt Bridge

**Engineering status (2026-10-10):** backend draft/revision guardrails and week-six PDF transcription added on feature branch. **No mailbox OAuth, background worker, TeamLinkt subscription, public widget or automatic publication is active.** The public AHMV visual layout is deliberately untouched.

## Ownership and binding
- Association publication mailbox (owner supplied): **ahmverdun.ca@gmail.com**. Do not confuse with an earlier spelling.
- Master platform: **takatakca/takatak-v1** (TAKATAK identity, permitted services and approved APIs only).
- AHMV application: **takatakca/ahmverdunca**, independently deployed and responsible for approved public presentation.
- Provider: **TeamLinkt** (official team mobile app).
- Existing architecture: [TEAM_CONTENT_INGESTION.md](TEAM_CONTENT_INGESTION.md), [TAKATAK_INTEGRATION_BOUNDARY.md](TAKATAK_INTEGRATION_BOUNDARY.md).
- No TAKATAK master dashboard, public website redesign, billing change or live roster/chat cross-post is authorized by this work.

## Working components in this branch
1. `src/lib/schedule-revision-plan.ts`: validates SHA-256 and week boundaries, compares successive PDF extracts by source row ID, distinguishes additions/modifications/unchanged/absence **without turning omission into cancellation**, and isolates ambiguous M12 vs explicit M12A/M12B.
2. `src/data/ahmv-week6-review.ts`: **38 source slots** transcribed from **AHMV 2026–27 Semaine 6 (12–18 Oct)**, PDF page 1, SHA-256 `e443691035483254c23e4880ff5e5716e7c72f19b9184200e6e0b758bd238466`. This is a **review candidate, not the live authoritative dataset**.
3. `src/lib/teamlinkt-public-connector.ts`: accepts only owner-approved HTTPS provider-hosted **public schedule/scores/standings/locations widgets** for further review. Denies secret-bearing URL parameters and arbitrary iframe providers; does not expose TeamLinkt chat.
4. `scripts/schedule-revision-plan.test.ts` and `scripts/teamlinkt-public-connector.test.ts`: provider and schedule regression tests.

**Source ambiguity requiring reviewer:** week-six Friday Oct 16 18–19 says simply "M12 Louves"; Saturday Oct 17 15–16 says "M12 B Louves (697955)" and explicitly **Pratique**; Sunday Oct 18 10–11 says "M12 Fille Louves". Do not attribute all three to M12B or reclassify practice as match without source confirmation. The Sunday Oct 18 13–14:30 source appears to say "M15 lefs"; keep the original wording until reviewed. Other Sunday AA Chacals rows combine "Pratique" and "partie" in the label; verify with the association.

Week-five previously integrated data have some differences versus the newly uploaded PDF. They require a reviewed comparison; do not silently overwrite already-published activity IDs or source dates.

## Event pipeline — planned, not connected
`Gmail OAuth read -> allowlisted mailbox + attachment intake -> immutable SHA-256 and source metadata -> native PDF text extraction (OCR only when needed) -> validated rows -> exact-team routing -> version diff -> review queue -> owner approval -> canonical public weekly schedule -> team/category views -> optional notifications`.

### Gmail adapter contract for the developer
- Confirm account ownership and configure OAuth restricted to `ahmverdun.ca@gmail.com` in an approved secrets vault. Gmail connector access to another mailbox is not sufficient.
- Prefer Gmail history IDs / incremental sync, attachment MIME and size restrictions, exponential backoff, and per-message+attachment idempotency keys. Do not poll so aggressively that provider quotas are exceeded.
- Store original PDFs privately and immutably with MIME, size, checksum, email reference, sender policy, sent and received timestamps, processor version and audit history.
- Confirm sender origin (approved association sender) before permitting automated *draft creation*. Unknown sources become quarantined candidates.
- Restrict public output to hockey schedule fields; no player/parent contact details or medical/roster information.
- A revised full-week PDF supersedes earlier revision **only after approval**. Partial update never implicitly cancels absent events. Keep rollback and correction notices.
- Backend publishes through the existing reviewed AHMV mechanism; avoid introducing direct unauthenticated writes to live site or direct writes to TAKATAK identity DB.
- Approved content only can reach SMS/Voice/public feeds. Outlook/Teams and other sources are not enabled automatically.

## TeamLinkt connector — official provider possibilities
- Official [Subscribe to your TeamLinkt Calendar](https://help.teamlinkt.com/en/articles/4938653-subscribe-to-your-teamlinkt-calendar) supports a team iCal/Webcal subscription link. Obtain this **from the Louves M12B administrator**; do not guess it. Treat non-public URLs like access tokens.
- Official [Embed TeamLinkt Widgets on an External Website](https://help.teamlinkt.com/en/articles/4938768-embed-teamlinkt-widgets-on-an-external-website) documents *Schedule, Scores, Standings and Locations* iframe widgets from **Website > Builder > Widgets**.
- Official [Import from an iCal](https://help.teamlinkt.com/en/articles/4938620-adding-and-syncing-events-with-an-ical) exists, but third-party sync timing may take **12–24 hours**; never promise instant two-way updates.
- **No documented chat embed or official unrestricted API has yet been verified.** Chat, roster, attendance, budget and poll data remain in TeamLinkt until supported scoped access and parental/privacy reviews exist.
- A fallback **authorized link to TeamLinkt** is preferable to scraping or copying private chat. An embedded private space must require verified membership and not leak data via public caching.

## Access requests (no keys in chat or GitHub)
1. AHMV: approve mailbox OAuth and confirm who can review and approve schedule publications.
2. Team manager: provide exact Louves M12B TeamLinkt team/season ID, iCal URL via secure vault and any generated official public widget code for review.
3. TeamLinkt support: developer/API options, read-only team scopes, webhooks, widget domain requirements, rate limits, chat embeddability, privacy/data retention and test environment.
4. TAKATAK developer: confirm the real, versioned Auth/entitlement and audit API contracts; do not invent endpoints.
5. Release owner: approve publishing the 38 reviewed week-six slots after discrepancies are resolved.

## Required production gates
- Bun frozen install; test TypeScript, normalization, official-week snapshot, provider guard, data policy, security, lint, production build and release artifact.
- Test corrected PDFs, duplicate attachments, missing rows, cross-week isolation, unapproved sender, invalid dates, exact-team routing, and mailbox outage.
- Do not merge/deploy until checks are green and required owner approvals are met. Following deploy, verify `https://ahmverdun.ca/healthz`, release SHA, homepage and schedule content before marking **PRODUCTION VERIFIED**.
