# Louves M12B — premium microsite pilot and cloning standard

**Scope:** dedicated AHM Verdun team microsite at `/equipes/louves-m12b`, based on the owner-provided official Louves graphic, without modifying AHMV homepage/navigation or TAKATAK V1.

**Initial lifecycle:** `CODE COMPLETE` on a feature branch, **not a connected TeamLinkt account**. The microsite is intentionally `noindex, follow` until team approval and public-data review.

## Product design — Louves first, then clone safely

The microsite is a polished, responsive public hub:
- a custom hockey editorial hero in the Louves wolf colours (violet, turquoise, navy), optimized source crest and existing AHMV programme imagery;
- clearly distinguished public schedule and gallery access;
- nine team action modules in a modular registry: schedule, photo/video, documents, messages, roster, polls, challenges, fundraising, budget;
- truthful access states: reviewed **public** links only; **private-provider** sections carry no public href; **awaiting-approval** sections remain non-interactive with human-readable explanations;
- a prominent safe TeamLinkt privacy section, which makes no false claims about a chat API or logged-in user;
- bilingual FR/EN copy, mobile-first cards, touch targets, focus-visible outlines, semantic landmarks and descriptive links;
- a clear contact address for the existing girls hockey programme, without pretending this is the team's private chat.

### Source provenance and team identity

The wolf crest used in `public/images/teams/louves-m12b-crest.webp` is a faithful small crop of the official user-supplied TeamLinkt screenshot; this is **not a synthetic generated logo**. The original uploaded screenshot remains the owner's source. The display crop is 136 × 136 WebP, exact Git blob SHA `4f6318065a9e9b63d73db300a4e7651b5a1fc5bd`. If a high-resolution transparent original is supplied later, replace only this logo asset after approval and update regression proof.

**Important:** AHMV's legacy public team directory currently lists **M12 A féminin — LOUVES VERDUN**, identifier `2025191400035012`. The TeamLinkt screenshots supplied by the owner show **Louves M12B**. This is not evidence that M12B has the same ID. Do not copy or guess M12B's actual provider ID, official team roster, scores, attendance or schedule.

The uploaded Week 6 PDF contains `M12 B Louves (697955)` for Saturday October 17, 15:00–16:00, as a **review-only practice**. It is **not published as a verified future event** by this microsite; likewise ambiguous `M12 Louves` rows are not assigned to M12B.

## Architecture

- Reusable model: `src/data/team-microsites.ts`.
- Presentation: `src/components/team-premium-microsite.tsx`.
- Pilot route: `src/routes/equipes.louves-m12b.tsx`.
- The established feminine category page adds a narrow link to the pilot, leaving other categories and the overall site presentation intact.
- The public AHMV weekly schedule and existing hockey systems remain authoritative. The pilot links only to the general girls-hockey published schedule, with an explicit disclaimer about team-specific routing.
- TeamLinkt private chat, attendance, player list, polls and budgets remain in TeamLinkt. No iframe of private information, API scraping or parallel login is introduced.

## UX release checklist

Before site-wide replication or publicly indexing this pilot:

1. On a browser, verify routes and no 404: `/equipes/louves-m12b`, `/equipes/feminin`, `/horaires?team=feminin`, `/galerie/hockey-feminin-2026-2027` and `/arenas`.
2. Check viewport widths 320, 360, 390, 768, 1024 and 1440 pixels for no horizontal overflow, readable crest/heading and touch-friendly cards.
3. Test keyboard tab order, visible focus, reduced motion, FR/EN text wrapping, landmark labels and contrast in both dark surfaces.
4. Confirm source crest loads and is not misidentified as the association-wide AHMV logo.
5. Ensure no TeamLinkt data are presented as connected and no private-team button is linked to an unverified destination.
6. Check the micro-site does not confuse the old M12A public ID with this M12B pilot, and that no fabricated game, practice or result is shown.
7. Require green Bun 1.4.2 CI gates including `check:data`, TypeScript, lint, production build, release artifact; obtain a mobile screenshot review before any production promotion.
8. Verify the production release SHA via `/healthz` and real route response after authorized deployment. Do not call it live based only on a merged commit.

## Replicate without duplicate systems

Create each future micro-site by adding a **new exact team config**, a new pilot route only when the exact team identity is known, and only approved public links. The same component, module registry, privacy rules and visual treatment can be reused with that team's real brand colours and approved assets. Never duplicate TAKATAK Auth, build a new team roster database, or mount unrestricted services merely because an example tile exists.

## Data the Louves manager can provide later (securely)

- Written confirmation of the approved team title and season
- Original high-resolution logo asset / publication consent
- Exact TeamLinkt team ID and read-only iCal calendar subscription URL, delivered by an approved secret vault or authenticated administrator workspace
- Official public schedule/league ID for M12B (distinct from M12A)
- Explicitly public/approved photos, forms and team announcements
- Official TeamLinkt public widget URL (if any), with permission to embed
- Verification and privacy/consent policy before considering private messages, roster or attendance

**Gmail intake remains deferred at owner request.** This microsite pilot does not depend on Gmail OAuth or TeamLinkt private API access.
