# Work log

- 2026-10-14 | chatgpt | fix/ahmv-indexing-release-gate-20261014 → PR pending | done; PR #408, main CI #38613657967 and production #38614134421 green | Default-deny indexing and explicit approval guard; five handoff docs, tests and AGENTS rule; compiled release c614dc9be786ce04710d2e9463c9c576f85369ce with homepage noindex verified | Continue independent queue; Louves #401/#400 and schedule #403 require visual owner review; Supabase access denied

- 2026-10-14 | chatgpt | fix/assistant-nudge-mobile-overlap-20261014 → PR #406 | done; CI #38609477969 and production #38609816080 green | Prevent opt-in Assistant nudge from covering mobile page content now that Assistant has a sixth bottom dock action | CI; merge and verify exact production release


- 2026-10-14 | chatgpt | fix/mobile-assistant-dock-rebased-20261014 → PR #405 | done; CI #38608226675 and production #38608519994 green | Port original Assistant/mobile-nav fix from blocked PR #391 onto current main without conflicts; desktop-only floating launcher, sixth mobile destination, focus return, keyboard and viewport guards | CI / merge / deployment proof; close superseded #391 after success

- 2026-10-14 | chatgpt | fix/mobile-menu-keyboard-dialog-20261014 → PR #404 | done; CI #38607569927 and production #38607964690 green | Mobile menu accessibility: move focus into modal portal, trap Tab, visible close button, return focus on Escape/close; static regression gate | PR CI / controlled merge, production SHA verification (Louves visual issue #400 remains independent)

- 2026-10-11 | chatgpt | fix/gallery-always-visible-exit → PR #402 | CI #1242 and real gallery Chromium QA #10 green; 390/1440 and full viewport placement verified | Added 48px always-visible Retour à l’album, larger X, Escape, phone safe-area; fixed QA selector accidentally clicking welcome panel; tested photo open/exit/reopen/Escape | safe corrective merge/release gate, live MochaHost verification separately, screenshot uploads require future user consent and secure backend

- 2026-10-11 | chatgpt | feat/louves-secure-share-page → PR #399 | CI #1221 green + real Chromium QA #21 green; visual reviewed | Bilingual public-only native sharing with clipboard/manual fallback and SSR hydration guard; tests at 320/390/768/1440, no overflow, no private data, no general site edits | final PR CI, controlled merge, production SHA verification; PR #391 still owns global mobile assistant

- 2026-10-10 | chatgpt | feat/louves-parent-ice-checklist → PR #398 | CI #1215 + real Chromium QA #16 green; review complete | Added bilingual on-device parent gear checklist, optional six-item progress/reset and persistence, stable reset placement on mobile, privacy tests, screenshots 320/390/768/1440 | safe merge after gates; verify MochaHost deployment and /healthz SHA; monitor global Assistant overlap PR #391

- 2026-10-10 | chatgpt | feat/louves-rendered-browser-qa → PR #397 | CI #1202 green + real browser QA #4 green; screenshots reviewed | Repaired nested main landmark; tested actual React M12B at 320/390/768/1440 with HTTP 200, crest, 0 horizontal overflow, 7 private modules, expected links and capture artifacts | visual overlap from global Assistant referred to existing PR #391; monitor production deployment and revisit screenshots after #391

- 2026-10-10 | chatgpt | feat/louves-mobile-visual-polish → PR #396 | CI #1196 green, offline visual inspection only | Simplified M12B mobile first fold, prioritised 2 working public actions, grouped 7 future/private tools in accessible accordion, reduced repetitive hero content; no main site changes | CI, real compiled browser viewport review, then controlled release

- 2026-10-10 | chatgpt | feat/louves-m12b-premium-microsite → PR #395 | CI #1192 green, awaiting mobile visual review | Dedicated bilingual M12B pilot microsite, authentic supplied crest, nine public/private module states, responsive premium reusable layout, separate M12A ID and security tests; existing homepage untouched | screenshot/mobile review, then approve controlled merge and deployment

- 2026-10-10 | chatgpt | feat/ahmv-gmail-pdf-intake-readonly → PR #394 | CI #1186 green, awaiting review | Read-only Gmail mailbox-verified PDF transport, sender/attachment quarantine, SHA-256 verification, synthetic tests and premium team visual guardrails | owner OAuth + sender approval required for live intake; then private worker and review queue

- 2026-10-10 | chatgpt | feat/ahmv-mail-schedule-provider-integration-plan → PR #393 | CI #1177 green / PR review | AHMV PDF revision planner, all 38 week-6 slots as unapproved review data, TeamLinkt public-widget guard, integrated CI tests and Gmail/TeamLinkt access handoff (no UI changes) | inspect CI, correct failures, get AHMV review and provider access before publication

Newest first, one line per piece of work. Rule: `AGENTS.md` › Work log rule.
Format: `YYYY-MM-DD | agent | branch → PR | status | what | next step`

- 2026-10-10 | chatgpt | feat/home-ice-experience-20261010 → PR #392 | PR #392 | Accueil glace + sélecteur multiéquipes, installation PWA, splash hockey, nouvelles regroupées, cartes d’arénas et pointages | attendre CI, revue mobile et fusion contrôlée

- 2026-10-08 | codex | feat/visual-sponsors-20261008 → PR #390 | PR #390 | Audit visuel/OCR, annonces agrandissables et expérience commanditaires | contrôles du build, fusion et déploiement
- 2026-10-08 | codex/dependency_review | feat/visual-sponsors-20261008 → PR #390 | done | Rotation, focus du zoom et cadrage vérifiés ; aucun blocage | CI et déploiement par agent principal
- 2026-10-08 | codex/integration_inventory | feat/visual-sponsors-20261008 → PR #390 | done | 16 écrans publics revus ; 4 défauts visuels repérés et corrigés | contrôle du build corrigé puis production
- 2026-10-08 | codex/public_audit | feat/visual-sponsors-20261008 → PR #390 | done | 54 visuels revus, OCR et 6 captures production ; 3 bandes parasites mesurées | contrôle après déploiement par agent principal
- 2026-10-08 | codex/seo_growth | feat/visual-sponsors-20261008 → PR #390 | done | Partenaires visuels et 13 cartes conservées ; contrôles 360/390/768/1440 réussis | CI et déploiement par agent principal
- 2026-10-08 | codex/marketing_extensions | feat/visual-sponsors-20261008 → PR #390 | done | Formulaire mobile regroupé ; validations FR/EN et téléchargement réussis | CI et déploiement par agent principal
- 2026-10-08 | codex marketing_extensions | feat/seo-marketing-20261008 → PR #389 | done | Adaptateurs LinkedIn et Pinterest sans données personnelles ; 8 tests réussis | intégration CI et déploiement par agent principal
- 2026-10-08 | codex/seo_growth | feat/seo-marketing-20261008 → PR #389 | done | Métadonnées sociales, données structurées locales et URL canoniques; 7 tests réussis | intégrer et vérifier les balises rendues avant déploiement
- 2026-10-08 | codex marketing_adapters | feat/seo-marketing-20261008 → PR #389 | done | GA4, Meta, TikTok, Google Ads et UET avec consentement granulaire ; 12 tests réussis | intégrer CI, vérifier l’interface et activer seulement après ajout des identifiants publics

- 2026-10-08 | codex | feat/seo-marketing-20261008 → PR #389 | done | SEO local, 7 adaptateurs marketing consentis, kit partenaire et TODO développeur ; release 3b8c6e6 déployée et vérifiée | identifiants et validations d’activation du propriétaire
- 2026-10-08 | claude (owner setup) | default branch | done | Added the work log rule, this log and the stop reminder | every agent follows AGENTS.md › Work log rule
