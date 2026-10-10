# Louves M12B — Mobile-first presentation and visual QA (2026-10-10)

Status: **CODE REVIEW / CI PENDING**. Owner requested executive-grade visual polish on Louves first, then reuse across exact-team microsites. This release does not change the main AHMV homepage, menu, master TAKATAK site or private TeamLinkt data.

## Main design correction

The initial Louves pilot displayed nine equally large module cards although only two modules had verified public links. On mobile, this increased page length and visually gave inactive tools the same importance as working ones.

The updated `PremiumTeamMicrosite` now:

- Places **Calendrier** and **Photos et vidéos** first as two prominent, fully clickable links to existing verified public destinations.
- Moves seven private/not-yet-connected team modules into one semantic, keyboard-operable native `details/summary` section (collapsed initially).
- Makes private TeamLinkt modules clearly informational and non-clickable; does not fake roster, chat, budget, attendance or fundraiser data.
- Compresses the introductory paragraph and spacing, while keeping the real owner-supplied Louves crest.
- Removes a **duplicative status panel from the mobile hero** (desktop retains it), so the useful actions become visible earlier. The public schedule caveat and private TeamLinkt section remain.
- Keeps FR/EN translations, focus indicators, reduced-motion handling, soft contrast and generous touch targets.
- Requires no runtime integration flags, no new paid UI dependencies, no new parent account or SaaS services.

## Offline visual inspection: what it does and does not prove

The implementation environment cannot resolve `ahmverdun.ca` or fetch the GitHub repository through its local browser. An offline **HTML/CSS composition reconstruction** mirroring the new text, real crest, structure, colours and breakpoints was rendered through headless Chromium/Playwright at 320, 390, 768 and 1440px. This is **not a screenshot of the compiled React/Tailwind website** or proof that production displays this design.

Representative reconstruction findings:
- all four measured viewport widths had `document.documentElement.scrollWidth === window.innerWidth` (no horizontal overflow in the reconstruction);
- crest loaded, collapsed `details` opened on click at all four widths;
- compressing the mobile status panel reduced reconstructed hero height from ~922px to ~620px at 320px and from ~871px to ~581px at 390px;
- the two real public action cards appeared immediately after the hero rather than following duplicated informational panels and seven unavailable large cards.

These are **design-review observations only**. They do not substitute for the following actual code/app rendering gates.

## Actual rendered-site acceptance still required

Before marking production verified or cloning to every team:

1. Use the compiled app preview with the exact `src/components/team-premium-microsite.tsx` and current Tailwind generated CSS; take and inspect 320/360/390/768/1024/1440 screenshots.
2. Check portrait/landscape, long French and English text, native `details` expanded/collapsed state, tap areas, focus via keyboard, reduced motion, contrast and no horizontal scroll.
3. Click actual schedule, gallery, back, contact and arena links and verify all routes.
4. Verify crest asset `/images/teams/louves-m12b-crest.webp` loads and is not mistaken for the association-wide emblem.
5. Confirm accurate identity: M12B is not matched to legacy M12A; TeamLinkt private functions are not exposed.
6. Run the full CI, build/release gate, deploy only after owner/required review, then verify `/healthz`, deployed SHA and mobile screenshot of the actual production page.

## Next increments after review

- Improve the **real browser** result from screenshots, not from taste alone: typography balance, card heights, logo alignment and any overflow/contrast defect.
- Obtain reviewed M12B TeamLinkt iCal/widget links and exact team identifier before adding any live team data.
- Clone the same re-usable experience to another team only after its exact identity, approved crest and accessible public schedule links are known.
