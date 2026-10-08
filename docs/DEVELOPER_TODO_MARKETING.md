# TODO développeur — SEO et écosystème marketing AHM Verdun

Demande du propriétaire, 8 octobre 2026 : préparer les adaptateurs maintenant;
les identifiants des comptes seront fournis ensuite. Ne pas substituer des
identifiants de démonstration aux vrais comptes.

## Livrables dans cette version

- [x] Adaptateurs GA4, Google Ads, Meta Pixel, TikTok Pixel, Microsoft UET,
  LinkedIn Insight et Pinterest Tag, inactifs sans identifiant valide.
- [x] Choix distincts mesure d’audience/publicité, refus aussi accessible que
  l’acceptation, préférences rouvrables dans le footer, retrait et expiration.
- [x] Respect de DNT/GPC. Les événements du site n’acceptent pas les noms,
  coordonnées, valeurs de formulaire, équipes choisies ou paramètres libres.
- [x] Mesure des clics vers Spordle, préparation de commandite et copie de lien;
  aucune de ces actions n’est présentée comme une inscription ou vente terminée.
- [x] Consentement requis pour le SDK AdSense et la mesure TAKATAK ADS.
  Les emplacements locaux contextuels conservent leur fonctionnement.
- [x] Kit partenaire sur `/partenaires#partager` : liens publics, campagnes
  prédéfinies et export JSON. Un lien préparé n’est pas un backlink déjà publié.
- [x] RSS `/actualites.xml` et JSON Feed `/actualites.json`, issus des articles
  publics réels; aucune heure de publication inventée pour une date seule.
- [x] Identité structurée SportsOrganization/WebSite, zone Verdun/Montréal,
  fiches d’aréna et fil d’Ariane factuels, métadonnées de partage par page.
- [x] Balises de vérification Search Console/Bing facultatives.
- [x] Indexation publique activée par défaut dans le déploiement officiel;
  un réglage explicite `AHMV_PUBLIC_INDEXING=false` conserve la pause opérateur.
  Préproduction, recherches internes, erreurs et espace privé restent exclus.

## À recevoir du propriétaire

Les identifiants ci-dessous sont publics. Les variables GitHub sont à définir
sur l’environnement `production` avant une nouvelle compilation. Les scripts
de déploiement transmettent ces valeurs au build; une modification après build
ne change pas les bundles déjà publiés.

| Adaptateur | Variable GitHub production | Variable de build | Valeur à fournir |
| --- | --- | --- | --- |
| Google Analytics 4 | `AHMV_GA4_MEASUREMENT_ID` | `VITE_GA4_MEASUREMENT_ID` | `G-…` |
| Google Ads | `AHMV_GOOGLE_ADS_ID` | `VITE_GOOGLE_ADS_ID` | `AW-…` |
| Meta Pixel | `AHMV_META_PIXEL_ID` | `VITE_META_PIXEL_ID` | ID numérique du pixel |
| TikTok Pixel | `AHMV_TIKTOK_PIXEL_ID` | `VITE_TIKTOK_PIXEL_ID` | ID public du pixel |
| Microsoft Ads UET | `AHMV_MICROSOFT_UET_ID` | `VITE_MICROSOFT_UET_ID` | ID numérique UET |
| LinkedIn Insight | `AHMV_LINKEDIN_PARTNER_ID` | `VITE_LINKEDIN_PARTNER_ID` | Partner ID numérique |
| Pinterest Tag | `AHMV_PINTEREST_TAG_ID` | `VITE_PINTEREST_TAG_ID` | Tag ID numérique |
| Search Console | `AHMV_GOOGLE_SITE_VERIFICATION` | `VITE_GOOGLE_SITE_VERIFICATION` | Jeton public de validation |
| Bing Webmaster | `AHMV_BING_SITE_VERIFICATION` | `VITE_BING_SITE_VERIFICATION` | Jeton public `msvalidate.01` |
| AdSense | `AHMV_ADSENSE_CLIENT`, `AHMV_ADSENSE_SLOT`, `AHMV_ADSENSE_ENABLED` | `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_SLOT`, `VITE_ADSENSE_ENABLED` | Publisher approuvé `ca-pub-…`, slot éventuel, activation explicite |
| Infolettre | `AHMV_NEWSLETTER_URL` | `VITE_TAKATAK_NEWSLETTER_URL` | Centre d’abonnement HTTPS réel |
| TAKATAK ADS | `AHMV_TAKATAK_ADS_ENABLED`, `AHMV_TAKATAK_ADS_ORIGIN`, `AHMV_TAKATAK_ADS_PUBLISHER` | Variables `VITE_TAKATAK_ADS_*` correspondantes | Backend et inventaire autorisés opérationnels |

- [ ] Fournir les identifiants et invitations aux comptes utilisés.
- [ ] Configurer les événements clés/conversions dans chaque compte. Un label
  de conversion Google Ads ou un ID de conversion LinkedIn ne se déduit pas
  du seul ID du compte. LinkedIn mesure seulement sa vue initiale documentée
  dans cet adaptateur; aucune conversion ni vue SPA fictive n’est envoyée.
- [ ] Désactiver dans les consoles la capture automatique des formulaires,
  les événements automatiques et le matching avancé avant activation. Les
  événements explicites de notre code sont filtrés; un SDK tiers peut aussi
  installer ses propres observateurs. Ses réglages exigent une vérification.
- [ ] Vérifier avec les vrais comptes : avant choix/refus aucun SDK, choix
  analytics seul, publicité seule, DNT/GPC, navigation, retrait/rechargement.
  Les cookies de domaines tiers restent sous le contrôle de ces plateformes.
- [ ] Soumettre `https://ahmverdun.ca/sitemap.xml` à Search Console et Bing;
  vérifier les pages réellement indexables, sans promettre un classement.
- [ ] Publier dans `ads.txt` uniquement la ligne exacte fournie par le compte
  AdSense approuvé. Aucun publisher fictif ni réseau non autorisé.

## Connexions serveur et diffusion à finaliser

- [ ] Facebook/Instagram : autorisation OAuth des actifs approuvés, service
  d’ingestion TAKATAK et abonnement réel, puis test d’une publication réelle.
  Au dernier audit, le relais AHMV rendait correctement un état indisponible
  et son fournisseur répondait 404. La page Facebook publique reste accessible.
- [ ] Team Feed : service et souscription actifs, mapping exact des équipes,
  `TAKATAK_TEAM_FEED_ORIGIN` et `TAKATAK_TEAM_FEED_TOKEN` côté serveur.
  Team Games utilise son propre service et ses autorisations.
- [ ] Meta Conversions API / TikTok Events API : préparer le contrat serveur
  après fourniture des accès, avec consentement, événements réels et
  déduplication. Jetons serveur uniquement, jamais une variable `VITE_…`.
- [ ] Infolettre : fournisseur opérationnel, inscription consentie et
  désabonnement vérifiés. Le flux RSS peut alimenter un outil compatible
  (Make, Zapier, Buffer ou un fournisseur d’infolettre) après configuration.
- [ ] Google Business Profile : accès gestionnaire, établissement vérifié
  et coordonnées approuvées; ne pas utiliser un aréna comme siège de l’AHMV.
- [ ] Adopter la politique de confidentialité finale de l’association.

## Backlinks, ciblage et géociblage

- [ ] Fournir les sites partenaires autorisés et leurs accès ou gestionnaires.
  Partenaires déjà répertoriés : Explore Verdun/IDS, Ville de Montréal/Verdun,
  Club Richelieu, Bagel St-Lo et Librairie de Verdun. Leur présence dans nos
  données ne prouve pas qu’ils ont publié un lien vers `ahmverdun.ca`.
- [ ] Utiliser le kit `/partenaires#partager` pour les pages pertinentes :
  inscriptions, équipes et commandites. Un placement rémunéré doit être
  identifié, avec `rel="sponsored"` sur son lien HTML.
- [ ] Vérifier après publication : page externe publique, lien final correct,
  destination 200, canonical sans paramètres de campagne et source attestée.
- [ ] Configurer dans les comptes les zones approuvées Verdun/Montréal et
  les campagnes destinées aux adultes responsables; le site ne demande pas
  la position GPS des visiteurs et ne constitue pas d’audience d’enfants.
- [ ] Faire approuver budgets, contenus, audiences et dates avant lancement
  des campagnes payantes. Les adaptateurs ne créent ni dépense ni campagne.

## Vérification développeur

`bun run check:seo`, `bun run test:assistant`, TypeScript, ESLint, audit des
dépendances, build et contrôles complets CI précèdent chaque publication.
Après publication : release exacte dans `/healthz`, accueil avec HTTP et HTML
`index, follow`, `/recherche`/espace privé exclus, RSS et JSON lisibles, kit
partenaire utilisable sur mobile, aucun SDK optionnel avec IDs absents.

Références officielles : [GA4](https://developers.google.com/tag-platform/gtagjs),
[Consent Mode](https://developers.google.com/tag-platform/security/guides/consent),
[Meta Pixel](https://developers.facebook.com/docs/meta-pixel/get-started/),
[Meta CAPI](https://developers.facebook.com/docs/marketing-api/conversions-api/),
[TikTok Pixel](https://ads.tiktok.com/help/article/tiktok-pixel?lang=en),
[Microsoft UET](https://learn.microsoft.com/en-us/advertising/guides/universal-event-tracking),
[LinkedIn Insight](https://www.linkedin.com/help/lms/answer/a418880),
[Pinterest](https://developers.pinterest.com/docs/conversions/conversion-management/).
