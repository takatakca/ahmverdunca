# Louves M12B — team-app visual reset and TeamLinkt official integration

**Status: DESIGN REVIEW ONLY; NOT APPROVED FOR PRODUCTION.** This increment directly responds to the owner's rejection of screenshots for the earlier #395–399 microsite. Passing CI is insufficient. The *actual rendered desktop and mobile screenshots* are mandatory release criteria.

## Repository scope

- Team: exact **Louves M12B** (not legacy M12 A).
- Route: `/equipes/louves-m12b`.
- Separate presentation only for this route: `src/routes/__root.tsx` creates its own semantic `main` around the route and does not mount `SiteLayout`, the bulky association footer, the generic Assistant, the mobile general nav, correction pen or welcome dialog. **Every other AHMV route remains unchanged.**
- Main TAKATAK repository/site is not modified. TeamLinkt is not the shared identity authority.

## Design goals grounded in the user's TeamLinkt phone screenshots

The app should be readable at first glance, without requiring users to open many drawers or inspect tiny card labels.

1. Fast, restrained brand bar + FR/EN switch and *real supplied wolf crest*.
2. Full-width hockey photograph as atmosphere, with clear labeling that the archive image is from the AHMV girls hockey programme, **not proof of the M12B roster**.
3. Actual **HORAIRE** and **POINTAGES** editorial panels immediately following the short team hero. When team-specific data is not approved, a clear explanation and link to the verified AHMV published category/association source; never invent dates or scores.
4. An official approved TeamLinkt widget takes the place of its corresponding AHMV fallback when added by an administrator. Scores/standings become visible as embedded content rather than locked fake tiles.
5. Full-width photographic story section leading to the existing public girls hockey gallery, an AHMV news block and a contained TeamLinkt privacy block.
6. Retain the helpful working parent packing checklist and native public share. Put private/future TeamLinkt modules in one optional accessible disclosure.
7. Use four large, persistent bottom navigation destinations on mobile (Équipe, Horaire, Pointages, Photos), larger type, generous contrast, fewer repetitive sentences, soft rounded editorial surfaces and subtle motion.
8. No broad generic association footer on this microsite, no assistant overlay covering content, no global popup during team journey.

**The redesign is a genuine change to the rendered app, not a styled external image.**

## Verified TeamLinkt public embed facts

The official TeamLinkt documentation states:

- [Embed TeamLinkt Widgets on an External Website](https://help.teamlinkt.com/en/articles/4938768-embed-teamlinkt-widgets-on-an-external-website): league administrators may embed **Schedule, Scores, Standings, Locations** widgets on external websites, via `Website → Builder → Widgets → Copy iframe code`.
- [Set Scores](https://help.teamlinkt.com/en/articles/4938713-set-scores): scores saved by authorized league admins update the team's app, league website, scores and standings.
- [Adding and Syncing Events with iCal](https://help.teamlinkt.com/en/articles/4938620-adding-and-syncing-events-with-an-ical): documented iCal integration is an **import into TeamLinkt**, with a possible 12–24 h update delay. **Do not misrepresent it as a documented external TeamLinkt API or instant outbound push.**
- [Manage Add-Ons for your Website](https://help.teamlinkt.com/en/articles/10470415-manage-add-ons-for-your-website): TeamLinkt provides native News and Photo add-ons within its own website. The documents reviewed do **not** establish a public outbound API, RSS endpoint or webhook for news sent automatically to a different domain.

## Safe public-widget adapter

- `src/lib/teamlinkt-public-widgets.ts` validates URLs: HTTPS, exact `teamlinkt.com` or true subdomain, no credentials, fragments, non-default ports or lookalike domains.
- `src/components/teamlinkt-public-widget.tsx` embeds only vetted public widget sources in isolated, lazy-loaded, no-referrer iframe with a direct source fallback link.
- `src/data/team-microsites.ts` defines optional `teamLinktPublicWidgets`. Louves M12B has **none** configured; no fake iframe or invented ID is activated.
- Team administrators must obtain the actual **public** iframe code and verify that publishing it does not expose youth roster, team-only event or contact data. No private TeamLinkt views may be inserted.
- The component is reusable when future teams have exact validated identifiers and permissions.

## News auto-sync — access required, not fabricated

The user wants any authorized TeamLinkt news post to appear automatically on AHMV. The team should request from TeamLinkt support or its administrator:
1. Official developer access / documented read-only news/events API, RSS or webhook contract, if one exists.
2. Written identification of league + season + exact team IDs and a public/private visibility flag for each content item.
3. Credentials provisioned into a secret manager, never source code or browser.
4. Rate limits, webhook signing / replay protection / source pagination, delete/update handling and ETag or timestamps.
5. Permission for AHMV to display published text/images; privacy and consent rules when minors appear.
6. If no provider-supported outbound feed exists, use the official embeds for schedule/scores and rely on AHMV's approved publication queue for news, **not app scraping or mirroring private chat**.

Owner's Gmail intake is deferred as requested and is not part of this PR.

## Acceptance criteria — no more CI-only "wow" approval

- Reviewer inspects first viewport and full-page *actual React screenshots* at **320, 390, 768, 1440 px**, separately in FR and EN when available.
- H1 readable (>=42px), informative schedule and scores clearly visible, image/crest large and legible, navigation clear and touch-friendly, no horizontally clipped text.
- Real links still work; share/copy, parent checklist and seven private module disclosure still pass interactive QA.
- No fictional schedules, scores, dates, team identities, league metrics, athlete names, social feeds, roster or claims of live connectivity.
- Parent/association homepage, general menus and TAKATAK V1 remain unchanged. Open PR #391 owns global assistant overlay and is not edited.
- Only after explicit human **visual acceptance** may this major redesigned microsite leave draft; then run full CI / QA and normal production approval gates.
- Prove MochaHost /healthz deployed SHA and actual public route separately before claiming LIVE.

## Agent handoff

Inspect this branch and any overlapping PR before editing. Maintain owner-provided emblem unchanged. If screenshots still look visually poor, **redesign again before merge** rather than adding decorative cards. Prioritize functionality and information hierarchy over superficial counts of components.
