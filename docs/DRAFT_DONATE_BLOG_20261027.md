# DRAFT ONLY — Donate and Blog section structure for AHM Verdun
Status: DRAFT, branch only. NOT live, NOT a payment link, NOT published to main.
Date: 2026-10-27
Branch: draft/ahmverdun-modernization-20261027
Base: main, commit f00f6074260b66d0cb03f54ad6c738f0ef129ce7

## 1. Donate — structure only, no payment link
- Page/section name (FR/EN): Faire un don / Make a donation
- Proposed copy direction (Wikipedia-style thank-you, to be approved by AHM Verdun, not invented as a legal claim):
  - FR: “Merci de soutenir le hockey mineur à Verdun.”
  - EN: “Thank you for supporting minor hockey in Verdun.”
- Fields to confirm BEFORE any live link:
  - Stripe account / recipient for AHM Verdun donations
  - Apple Pay and fast-checkout availability on that Stripe account
  - Any amount policy, tax receipt handling, refund handling
  - Privacy / legal / public-contact approval (still pending in GO_LIVE_CHECKLIST)
- Do NOT publish until: Stripe configuration verified, recipient confirmed, legal approval recorded.
- No amount, no link, no account number is included in this draft on purpose.

## 2. Blog — structure only, no auto-publishing
- Section name (FR/EN): Blogue / Blog, on ahmverdun.ca
- Proposed categories, to be approved:
  - Conseils hockey / Hockey tips
  - Sécurité / Safety (Hockey Canada Safety Program, Hockey Québec child-protection resources — link only, do not copy text verbatim)
  - Équipes / Teams (one post per team, weekly, only with verified schedule/team data)
  - Aide financière / Financial help (Jumpstart, Hockey Canada Assist Fund, KidSport Québec / Sport Jeunesse Québec — amounts only after live re-check)
  - Tournois / Tournaments (30e Tournoi Provincial M11, 18–31 janvier 2027, Auditorium de Verdun; registrations until 15 novembre 2026 — verify live)
- Workflow (required, not optional):
  1. Draft in branch
  2. Human approval, especially for any content involving minors
  3. Photo consent check — imported youth media fail closed while consent is pending
  4. Publish only after approval; do NOT auto-generate 5–10 posts/day to production
- Language: every post prepared in French AND English, or marked as single-language draft pending translation.

## 3. Partners — diagnostic note (not a fix)
- Live QA text-fetch reported “13 partenaires répertoriés” with no names shown, plus a “Product Variants” block.
- Repo check 2026-10-27:
  - src/routes/partenaires.tsx renders SPONSORS.length and OfficialSponsorShowcase.
  - src/data/sponsors.ts lists exactly 13 sponsors, all with logoApproved: false.
  - src/components/official-sponsor-showcase.tsx renders sponsor.name as a heading, with a logo only if logoApproved or an approved overlay logo URL is present.
  - Scoped code search for exact phrase “Product Variants” in takatakca/ahmverdunca returned 0 hits. “Variants” hits were unrelated UI components.
- Conclusion: code path for a Product Variants leak was NOT clear in main. Do NOT edit partners code blindly in this branch.
- Required next step: live-browser visual verification of /partenaires, then fix only the confirmed component / deployed build difference, with approved partner assets only.

## 4. Teams — no alignment edit in this branch
- Conflict, unresolved:
  - Docs: 24-team mapping
  - Live Équipes: 20 teams (M7 4, M9 5, M11 5, M13 3, M15 2, F 1)
  - News 3 oct. 2026: M11 4 / M13 4
  - M17, M19, M22: no official team IDs yet; M5: no team count in first list; women's program announced M9F/M12F/M15F, only 1 F team listed.
- No team count was changed in this branch. Alignment requires association / official hockey source confirmation only.

## 5. Blocked items (must be resolved before merging to main / going live)
- Meta Business portfolio invitation: accept before 2 novembre 2026 if still pending; acceptance still unverified. Facebook account confirmed by user 2026-10-27 12:53 EDT: 'Ahm Verdun' is the one to connect.
- Louves M12B: issue #400, owner visual signoff required at 320/390/768/1440 px FR+EN, draft PR only.
- Official schedule for week of Oct 27: not integrated on .ca; last integrated schedule is archive Oct 5–11, 2026, updated Oct 2. Ingest only a verified official weekly document/snapshot with provenance.
- Association launch / public indexing approval: required before VITE_PUBLIC_INDEXING=true and PUBLIC-INDEXING-APPROVED deploy. Until then, keep noindex.
- Phone/SMS: repo number is reserved, not confirmed public; issue #127 open; carrier/forwarding verification required.
- Donations, Google Ads, social publishing: explicit authorization + verified configuration required; do not enable live.
