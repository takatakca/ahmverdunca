# CURRENT STATUS — 2026-10-01

The original project brief is retained below for history, but the implementation has progressed far beyond the initial visual-prototype stage.

The current public-site code is feature-complete for the approved information/gateway scope, with CI-enforced data, SEO, security and build checks. Public indexing remains deliberately disabled until the association and production-launch requirements are approved. GitHub `main` is the release source of truth; do not publish an editor/preview build unless its commit SHA matches the approved green `main` release.

- Final release dossier: `docs/FINAL_RELEASE_STATUS.md`
- Go-live checklist: `docs/GO_LIVE_CHECKLIST.md`
- Production cutover/rollback runbook: `docs/PRODUCTION_RUNBOOK.md`
- MochaHost preproduction setup: `docs/MOCHAHOST_PREPRODUCTION.md`
- GROUPE TAKATAK / hockey-operation boundary: `docs/TAKATAK_INTEGRATION_BOUNDARY.md`

Do not treat the historical Phase 1 language below as the current implementation status.

---

# Verdun Hockey Hub

# GROUPE TAKATAK — PROJET AHM VERDUN

## RECONSTRUCTION COMPLÈTE DU SITE WEB | SAISON 2026–2027



### 1. MISSION ET DIRECTIVE PRINCIPALE



Tu agis comme une équipe senior réunissant un directeur artistique, un expert UX/UI, un architecte logiciel, un développeur full-stack, un spécialiste SEO, un expert en accessibilité et un concepteur d'expériences numériques sportives.



Client : Association du hockey mineur de Verdun (AHMV).

Agence responsable de la conception : GROUPE TAKATAK.

Domaine cible : https://ahmverdun.com.

Saison : 2026–2027.



Notre objectif est de reconstruire intégralement l'expérience numérique de l'AHM Verdun.



Le nouveau site doit offrir une expérience de niveau professionnel inspirée de la qualité éditoriale et de la fluidité des grands sites de hockey, notamment NHL.com, sans reproduire leur marque, leur design exact, leurs logos ou leurs éléments protégés.



Nous voulons un véritable portail sportif communautaire, pas un thème WordPress générique et pas un site qui donne l'impression d'avoir été généré automatiquement.



Le site doit être :

- Spectaculaire visuellement, mais sobre et crédible.

- Mobile-first.

- Très rapide.

- Facile à comprendre pour les parents.

- Agréable à consulter pour les joueurs et entraîneurs.

- Simple à administrer par les bénévoles.

- Accessible en français et en anglais.

- Extensible pour une intégration future avec l'écosystème GROUPE TAKATAK.



IMPORTANT : réaliser d'abord une maquette fonctionnelle de la façade visuelle, dans un environnement de préproduction. Ne pas publier sur le domaine officiel, modifier les DNS, toucher au WordPress existant, acheter de service, provisionner de fonctionnalité payante ou activer d'intégration externe sans autorisation explicite.



Ne pas générer une seconde phase automatiquement. Attendre notre validation après la livraison de la première phase.



---



### 2. IDENTITÉ VISUELLE ET DIRECTION ARTISTIQUE



Créer une identité de site premium centrée sur le hockey mineur.



Direction visuelle :

- Bleu marine profond.

- Blanc.

- Rouge sportif.

- Gris très clair pour les sections secondaires.

- Titres sportifs puissants et lisibles.

- Typographie contemporaine pour les textes.

- Photographies authentiques, grand format.

- Cartes éditoriales propres.

- Transitions discrètes.

- Excellente lisibilité mobile.

- Aucune décoration futuriste gratuite.

- Aucun effet artificiel excessif.



Utiliser une grille cohérente, de grandes images, une hiérarchie typographique claire et des composants réutilisables.



Ne pas recréer le logo de l'association avec de l'IA.



Prévoir un emplacement pour le véritable logo officiel AHM Verdun, qui sera fourni ou validé ultérieurement.



Ne pas utiliser de faux logos de commanditaires.



Ne pas inventer des photographies présentées comme étant celles des équipes réelles.



Si les médias officiels sont indisponibles, utiliser des placeholders clairement identifiés et faciles à remplacer.



Le résultat doit ressembler à un véritable site sportif produit par une agence professionnelle.



---



### 3. ARCHITECTURE GÉNÉRALE ET NAVIGATION



Réorganiser les nombreuses sections du site existant dans une navigation simple.



MENU PRINCIPAL :



Accueil

Horaires

Équipes

Inscriptions

Nouvelles

Plus



SOUS-MENU PLUS :



WLLV AA/BB

Photos et vidéos

Zone entraîneurs

Arénas

FAQ

Ressources hockey

Contact



Éléments permanents :

- Logo AHMV.

- Sélecteur FR / EN.

- Bouton Connexion / Spordle.

- Recherche.

- Navigation mobile compacte.

- Pied de page complet.



Sur mobile, les parents doivent pouvoir accéder rapidement à leur équipe, leur horaire et aux inscriptions.



Les pages doivent posséder des routes propres et permanentes.



Exemples :



/

/horaires

/equipes

/equipes/m11

/inscriptions

/wllv

/galerie

/entraineurs

/arenas

/faq

/ressources

/nouvelles

/contact



Ne jamais créer de liens morts ou de boutons qui simulent une action inexistante.



Si une fonctionnalité n'est pas prête, afficher clairement son état.



---



### 4. PAGE D'ACCUEIL — EXPÉRIENCE PREMIUM



Créer une page d'accueil éditoriale de haut niveau.



HERO :



Grande photographie authentique de hockey, si disponible et autorisée.



Titre :

LE HOCKEY COMMENCE ICI.



Sous-titre :

Association du hockey mineur de Verdun

Saison 2026–2027



Deux CTA :

VOIR MON HORAIRE

INSCRIRE MON ENFANT



Ajouter un accès rapide permettant aux parents de trouver leur équipe.



SECTION INFORMATIONS IMPORTANTES



Créer une zone d'alertes administratives pour les annulations, modifications d'horaires et événements urgents.



Exemple de contenu fourni :



Annulations d'activités les 22 et 26 septembre 2026.



Les dates doivent être affichées clairement. Les avis expirés doivent pouvoir être archivés par l'administration.



SECTION MES ÉQUIPES



Cartes visuelles :



M5

M7

M9

M11

M13

M15

M18

Junior

Hockey féminin



Chaque carte ouvre une page dédiée.



SECTION PROCHAINS RENDEZ-VOUS



Afficher les prochains entraînements, matchs et événements issus de la base d'horaires lorsqu'elle sera connectée.



Ne pas inventer des rencontres présentées comme officielles.



SECTION NOUVELLES



Reprendre les nouvelles fournies :



- Annulations d'activités les 22 et 26 septembre.

- Début de saison pour les groupes M5 et M7.

- Académie AHMV — Remise des bourses.



Afficher une photographie, une date de publication, un titre, un extrait et un bouton Lire la nouvelle.



Importer les articles complets uniquement à partir du contenu officiel disponible.



SECTION GALERIE



Albums :



Fête de fin d'année des équipes 2025/2026.

Journée porte ouverte hockey féminin.

Tournoi M11 2025.



SECTION COMMANDITAIRES



Prévoir une présentation élégante des partenaires et commanditaires existants.



Ne publier les logos qu'après obtention ou validation des fichiers officiels.



---



### 5. PAGE HORAIRES — LE CŒUR DU SITE



C'est une priorité absolue.



L'ancien système présente les horaires dans des PDF difficilement consultables sur téléphone.



Nous voulons remplacer cette expérience par un calendrier HTML entièrement interactif.



INTERFACE :



Sélecteur de semaine.

Semaine précédente.

Semaine suivante.

Retour à la semaine courante.

Recherche par équipe.

Filtre par catégorie.

Filtre par aréna.

Filtre par type d'activité.

Filtre par statut.



Affichage ordinateur :

Calendrier hebdomadaire à sept colonnes.



Affichage mobile :

Liste chronologique par journée avec cartes tactiles lisibles.



Chaque entrée affiche :



Date.

Heure de début.

Heure de fin.

Équipe.

Catégorie.

Type d'activité.

Aréna.

Patinoire, lorsque connue.

Statut.



Statuts possibles :

Confirmé.

Modifié.

Annulé.

À confirmer.



L'utilisateur qui clique sur une activité ouvre une fiche détaillée.



Cette fiche doit comporter :

- Informations de l'événement.

- Bouton Voir mon équipe.

- Bouton Voir l'aréna.

- Bouton Itinéraire Google Maps.

- Possibilité future d'ajout au calendrier personnel.



EXEMPLE DE PARCOURS :



Accueil

→ Horaires

→ Semaine du 21 septembre

→ Équipe M11

→ Activité sélectionnée

→ Fiche M11

→ Aréna et itinéraire.



IMPORTANT :



Ne jamais présenter des horaires fictifs comme des horaires officiels.



Les deux calendriers fournis en référence concernent les semaines du 14 au 20 septembre et du 21 au 27 septembre 2026.



Ils servent de références visuelles et documentaires, mais aucune information incertaine ne doit être inventée.



Les données devront pouvoir être importées ultérieurement au moyen de CSV, XLSX ou saisie manuelle.



Prévoir une architecture qui permettra de connecter une source officielle autorisée si une API adéquate est disponible.



Conserver la notion de versions, de dates de publication et de dernière modification des horaires.



---



### 6. PAGES INDIVIDUELLES DES ÉQUIPES



Chaque catégorie possède une véritable page sur ahmverdun.com.



Structure :



/equipes/m5

/equipes/m7

/equipes/m9

/equipes/m11

/equipes/m13

/equipes/m15

/equipes/m18

/equipes/junior



Ajouter les divisions et sous-équipes réelles après validation de la structure officielle.



Exemple : PAGE M11



En-tête avec identité de l'équipe.

Catégorie et saison.

Prochaines activités.

Calendrier filtré automatiquement.

Dernières nouvelles de l'équipe.

Albums photos associés.

Arénas utilisés.

Documents publics.

Accès vers les services externes autorisés.



Prévoir les pages du hockey féminin et leurs catégories réelles.



Ne jamais publier automatiquement les noms, coordonnées, renseignements médicaux ou autres données personnelles des enfants.



Les renseignements publics doivent être limités aux contenus approuvés par l'association.



---



### 7. INSCRIPTIONS ET CONNEXION — SPORDLE



La plateforme officielle d'inscription demeure Spordle.



Lien fourni :



https://page.spordle.com/fr/ahm-de-verdun/register



Le site AHMV ne doit pas reproduire le processus d'inscription, les paiements ou l'authentification de Spordle.



Créer une page d'inscription élégante expliquant les étapes aux parents.



Présenter clairement les catégories d'inscription dont la disponibilité est confirmée sur Spordle.



CTA principal :



S'INSCRIRE SUR SPORDLE.



Le bouton mène vers la plateforme officielle.



La page Connexion doit également expliquer que les comptes parents sont gérés sur Spordle.



Ne jamais créer de fausse synchronisation de comptes.



Prévoir un emplacement technique pour une intégration officielle future, uniquement si Spordle fournit des accès, autorisations et méthodes compatibles.



---



### 8. WLLV AA/BB — LES CHACALS



Créer une page de transition premium dédiée au hockey AA/BB.



Conserver la distinction entre AHM Verdun et WLLV.



Lien :

https://wllv.org/



Présenter :

- Le programme AA/BB.

- Les camps de sélection.

- Les nouvelles pertinentes.

- Les inscriptions.

- Les documents.

- Les accès au site officiel WLLV.



Le contenu devra être tiré de sources autorisées.



Ne pas mélanger les nouvelles WLLV avec les nouvelles AHMV sans identification claire.



Ne pas recopier automatiquement des articles ou des images sans permission.



---



### 9. CONTACT ET ASSISTANT INTELLIGENT



Créer une page Contact premium.



FORMULAIRE :



Nom.

Courriel.

Sujet.

Équipe ou catégorie, facultatif.

Message.

Consentement pertinent.



Afficher les états de validation, envoi, erreur et confirmation.



La véritable adresse officielle de l'association doit être validée avant publication.



Ne pas considérer info@hockeycms.ca comme une adresse confirmée de l'association.



ASSISTANT AHMV :



Prévoir une interface de chatbot permettant de répondre aux questions fréquentes à partir d'une base de connaissances officielle.



Catégories de connaissances :

Inscriptions.

Horaires.

Annulations.

Équipement.

Arénas.

Catégories.

Hockey féminin.

Entraîneurs.

Financement.

Bénévolat.



Le chatbot devra plus tard :

- Répondre uniquement à partir de contenus approuvés.

- Citer ou relier ses réponses aux pages sources.

- Reconnaître les informations manquantes.

- Ne pas inventer des horaires ou des politiques.

- Proposer un transfert à un responsable humain lorsque nécessaire.



Prévoir une boîte de demandes administratives avec statuts :

Nouvelle.

En traitement.

Répondue.

Fermée.



Le transfert vers un agent humain doit être réel avant d'afficher un statut de disponibilité.



Pour cette première phase, construire uniquement l'interface de démonstration sans prétendre que l'intelligence artificielle ou la messagerie fonctionne déjà.



---



### 10. GALERIE PHOTOS ET VIDÉOS



Créer une véritable médiathèque sportive.



Albums par :

Saison.

Équipe.

Catégorie.

Événement.

Date.



Fonctionnalités :

- Grille responsive.

- Visionneuse plein écran.

- Navigation entre photos.

- Albums liés aux pages d'équipes.

- Titres et descriptions.

- Chargement optimisé.

- Images adaptées au mobile.



Prévoir une future intégration des publications Facebook et Instagram officielles.



Afficher les contenus sociaux seulement lorsque les permissions, API et droits de réutilisation le permettent.



Chaque publication intégrée doit pouvoir rediriger vers sa publication d'origine.



Ne pas inventer des publications sociales.



Prévoir une modération et une gestion des consentements pour les photos de mineurs.



---



### 11. ZONE ENTRAÎNEURS



Créer un espace de ressources clair et structuré.



Sections :



Formulaire Médaille ESSO.

Devenir entraîneur.

Fiche médicale.

Respect et sport.

Formation M7–M9 — Entraîneur 1.

Formation M11–Junior — Entraîneur 2.

Soigneur — entraîneur-chef.



Les ressources doivent pouvoir être classées et mises à jour par un responsable autorisé.



Chaque ressource contient :



Titre.

Description.

Catégorie.

Lien officiel ou document.

Date de mise à jour.



Ne pas rendre les fiches médicales publiquement accessibles.



Les documents sensibles doivent rester dans un environnement sécurisé distinct, avec les autorisations appropriées.



---



### 12. ARÉNAS — ANNUAIRE ET CARTOGRAPHIE



Créer un répertoire interactif des arénas.



Chaque aréna possède une page individuelle.



Liste initiale fournie :



Auditorium de Verdun.

Samuel Moskovitch — Côte Saint-Luc / Montréal-Ouest.

Legion Memorial Rink — Côte Saint-Luc / Montréal-Ouest.

Pete Morin — Lachine.

Martin Lapointe — Lachine.

Jacques Lemaire — LaSalle.

Dollard Saint-Laurent — LaSalle.

Outremont.

Mont-Royal.

Raymond Bourque — Saint-Laurent.

Cégep Saint-Laurent.

Westmount.



Pour chaque établissement :



Nom officiel vérifié.

Adresse vérifiée.

Localisation sur une carte.

Bouton Itinéraire.

Lien du site officiel.

Informations sur les installations, si disponibles.

Activités AHMV liées à cet aréna.



Le bouton Itinéraire doit utiliser Google Maps.



Ne pas inventer des adresses ou des coordonnées géographiques.



Prévoir une vue carte et une vue liste, avec filtres géographiques.



La connexion Google Maps complète sera activée seulement lorsque les accès nécessaires seront fournis.



---



### 13. NOUVELLES ET COMMUNICATIONS



Créer un centre de nouvelles de style média sportif.



Catégories :



Association.

Équipes.

Matchs.

Tournois.

Camps.

Inscriptions.

Annulations.

Communiqués.

Hockey féminin.



Chaque article possède :



Titre.

Image principale.

Auteur.

Date.

Catégorie.

Contenu.

Articles associés.

Lien vers les équipes concernées.



Possibilité de publier une nouvelle globale ou de l'associer à une ou plusieurs équipes.



Les actualités importantes doivent pouvoir apparaître automatiquement dans les sections appropriées du site une fois le CMS opérationnel.



Prévoir l'archivage par saison.



Préparer des métadonnées SEO individuelles pour chaque article.



---



### 14. FAQ ET BASE DE CONNAISSANCES



Créer une page FAQ moderne avec recherche et filtres.



Organiser les questions par thématique.



Exemples :



Comment inscrire mon enfant ?

Comment trouver son horaire ?

Que faire lorsqu'une activité est annulée ?

Où trouver l'aréna ?

Quel équipement est nécessaire ?

Comment devenir bénévole ?

Existe-t-il des aides financières ?



Les réponses doivent provenir de sources validées et non de suppositions.



Cette base de connaissances doit être réutilisable ultérieurement par l'assistant IA, sans maintenir deux copies distinctes des mêmes réponses.



---



### 15. RESSOURCES ET LIENS EXTERNES



Créer un répertoire hockey complet et organisé.



Catégories :



Hockey mineur.

Hockey féminin.

Hockey junior.

Hockey senior.

Hockey professionnel.

Formation.

Équipement.

Développement des jeunes.

Aides financières.



Intégrer en priorité les organismes et plateformes pertinents, notamment :



Hockey Québec.

Hockey Canada.

LNH.

Spordle.

WLLV.

Programmes d'initiation au hockey Tim Hortons.

KidSport.

Bon départ / Jumpstart Canadian Tire.



Vérifier chaque URL avant de publier le lien.



Pour les aides financières, expliquer leur existence sans garantir l'admissibilité ou l'obtention d'une subvention.



Créer des cartes avec :

Nom.

Description.

Catégorie.

Logo officiel autorisé, si disponible.

Lien externe.



---



### 16. PANNEAU D'ADMINISTRATION AHMV



Préparer un système de gestion simple, pensé pour des bénévoles qui ne sont pas développeurs.



L'association doit pouvoir gérer son contenu quotidien sans modifier le code.



MODULES :



Vue d'ensemble.

Horaires.

Équipes.

Nouvelles.

Galerie.

Arénas.

FAQ.

Documents.

Commanditaires.

Messages.

Utilisateurs.

Paramètres.



RÔLES PRÉVUS :



Administrateur principal.

Responsable des communications.

Responsable des horaires.

Responsable des photos.

Bénévole avec permissions limitées.



Chaque rôle ne doit accéder qu'aux fonctions nécessaires.



INTERFACE HORAIRES :



Choisir une semaine.

Ajouter une activité.

Modifier une activité.

Annuler une activité.

Associer une équipe.

Associer un aréna.

Publier une modification.



Prévoir import CSV/XLSX avec vérification des colonnes, détection des doublons, aperçu et validation avant publication.



INTERFACE GALERIE :



Créer un album.

Téléverser plusieurs photos.

Associer des équipes.

Ajouter des légendes.

Publier.



INTERFACE NOUVELLES :



Créer un article.

Enregistrer un brouillon.

Prévisualiser.

Publier.

Archiver.



Prévoir des journaux de modification, l'historique des publications et une possibilité de retour à une version précédente.



Ne pas implémenter un faux système de permissions donnant l'impression de sécuriser réellement les données.



Pour la phase visuelle, présenter un prototype administratif explicitement identifié comme tel.



---



### 17. ARCHITECTURE FUTURE — GROUPE TAKATAK



POINT STRATÉGIQUE IMPORTANT.



Le site AHMV sera conçu pour pouvoir être intégré ultérieurement à l'écosystème numérique de GROUPE TAKATAK.



TAKATAK interviendra comme plateforme de services professionnels, notamment pour :



- Gestion du site et des services techniques.

- Marketing numérique.

- Google Ads.

- Campagnes publicitaires Meta.

- Référencement naturel.

- Analyse du trafic.

- Google Search Console.

- Rapports de performance.

- Automatisation des publications autorisées.

- Suivi des campagnes.

- Suivi des demandes de contact, avec les consentements requis.

- Gestion des médias et des contenus.

- Maintenance et surveillance technique.



IMPORTANT : TAKATAK ET AHMV DOIVENT RESTER DEUX ENVIRONNEMENTS DISTINCTS.



L'association conserve son propre espace d'administration et ses données.



GROUPE TAKATAK disposera ultérieurement d'un accès de prestataire explicitement autorisé et limité à ses responsabilités.



Ne jamais transférer automatiquement les renseignements personnels des enfants, les données d'inscription Spordle ou les informations médicales vers TAKATAK.



Ne pas fusionner automatiquement les comptes parents AHMV avec les identités TAKATAK.



Ne pas présumer de l'existence d'une API TAKATAK déjà configurée pour ce site.



PRÉPARATION TECHNIQUE :



Prévoir une architecture modulaire capable de recevoir ultérieurement :



Un connecteur TAKATAK.

Des API authentifiées.

Des événements webhook sécurisés.

Un mécanisme d'idempotence.

Un journal de synchronisation.

Une gestion des autorisations.

Des consentements distincts selon les usages.

Des événements analytiques respectueux de la vie privée.



Exemples de futurs événements non sensibles :



consultation_horaire

consultation_equipe

clic_inscription_spordle

clic_itineraire

consultation_nouvelle

demande_contact_autorisee



Les événements marketing doivent respecter les paramètres de consentement.



Ne pas connecter de système externe ni envoyer de données avant autorisation.



Le site doit fonctionner indépendamment de TAKATAK si celui-ci est temporairement indisponible.



La connexion future ne doit pas ralentir l'expérience des parents.



---



### 18. SEO, PERFORMANCE ET ACCESSIBILITÉ



Construire une base technique sérieuse.



SEO :



Routes lisibles.

Titres uniques.

Métadescriptions.

Hiérarchie H1/H2 cohérente.

Sitemap.

Robots.txt.

Métadonnées sociales.

Données structurées appropriées lorsque les informations sont vérifiées.

Gestion des redirections de l'ancien site lors de la migration future.

Préparation FR/EN et hreflang lorsqu'une véritable traduction existe.



PERFORMANCE :



Images optimisées.

Chargement différé.

Composants légers.

Bonne performance mobile.

Réduction des dépendances inutiles.



ACCESSIBILITÉ :



Contrastes lisibles.

Navigation clavier.

Libellés accessibles.

Formulaires compréhensibles.

Boutons tactiles adaptés.

États d'erreur explicites.



Ne pas sacrifier les performances pour des animations décoratives.



---



### 19. GESTION DES LANGUES



Français par défaut.



Préparer une interface anglaise complète et cohérente.



L'utilisateur doit pouvoir changer de langue sans perdre inutilement sa position.



Ne pas afficher une traduction fictive des articles officiels.



Si un article anglais n'existe pas encore, prévoir un comportement clair et transparent.



---



### 20. SÉCURITÉ ET CONFIDENTIALITÉ



Le site concerne notamment des enfants et leurs parents.



Appliquer une séparation stricte entre les contenus publics, les contenus administratifs et les données personnelles.



Aucun dossier médical public.

Aucune liste privée de joueurs accessible publiquement.

Aucune clé API dans le navigateur.

Aucune donnée sensible dans les événements analytiques.



Préparer une architecture permettant de respecter les obligations applicables en matière de confidentialité au Québec, avec validation juridique et organisationnelle avant la mise en production.



Ne pas activer de suivi publicitaire sans les mécanismes appropriés.



---



### 21. RÈGLES DE DÉVELOPPEMENT



Utiliser une architecture propre, modulaire et maintenable.



Centraliser :

- Les données de démonstration.

- Les constantes de navigation.

- Les équipes.

- Les arénas.

- Les nouvelles.

- Les liens externes.

- Les contenus FAQ.

- Les paramètres de marque.



Éviter de dupliquer les informations dans plusieurs composants.



Prévoir la transition future vers une véritable base de données et un CMS.



Ne pas mettre en place d'intégrations payantes ou de services inutiles pendant la phase de conception.



---



### 22. PHASE 1 — LIVRABLE EXIGÉ MAINTENANT



Construire uniquement la première version visuelle complète du site.



Priorités :



1. Direction artistique professionnelle.

2. Accueil.

3. Navigation mobile et ordinateur.

4. Calendrier interactif de démonstration.

5. Pages dédiées aux équipes.

6. Inscriptions avec redirection Spordle.

7. Galerie.

8. Nouvelles.

9. Arénas.

10. Contact et FAQ.

11. Zone entraîneurs et ressources.

12. Prototype du panneau d'administration.



Tous les modules non connectés doivent être clairement identifiés comme des démonstrations.



Ne pas prétendre que :

- Les horaires sont synchronisés.

- L'IA répond réellement.

- Les messages sont envoyés.

- Les réseaux sociaux sont connectés.

- Le système administratif sauvegarde les modifications.

- TAKATAK est déjà intégré.



L'objectif est de présenter une véritable maquette navigable à l'association.



Une maquette que le client peut consulter sur téléphone et ordinateur pour approuver l'identité visuelle, les pages et l'expérience utilisateur.



---



### 23. CONTRÔLE QUALITÉ ET VALIDATION



Avant de considérer la phase visuelle comme terminée :



Vérifier tous les liens internes.

Vérifier toutes les routes.

Vérifier le menu mobile.

Vérifier les filtres du calendrier.

Vérifier les liens vers les équipes.

Vérifier les redirections externes.

Vérifier les états des formulaires.

Vérifier les affichages mobile et ordinateur.

Vérifier que les données fictives sont identifiées.

Vérifier la cohérence FR/EN.

Vérifier que les informations privées ne sont pas exposées.



Fournir un récapitulatif distinguant :



FONCTIONNEL DANS LA MAQUETTE.

DÉMONSTRATION UNIQUEMENT.

À CONNECTER PLUS TARD.

INFORMATIONS À OBTENIR DU CLIENT.



Ne jamais déclarer qu'une intégration fonctionne sans l'avoir réellement configurée et vérifiée.



---



### 24. INSTRUCTION FINALE



Notre objectif n'est pas simplement de moderniser quelques pages.



Nous voulons transformer ahmverdun.com en un portail de hockey mineur professionnel, visuellement remarquable, intuitif pour les familles, simple pour les bénévoles et techniquement préparé pour les futurs services de GROUPE TAKATAK.



Construis la PHASE 1 : MAQUETTE VISUELLE NAVIGABLE.



Ne lance pas de phase supplémentaire, de migration, de connexion payante ou de publication en production.



Présente le résultat pour validation et attends les prochaines instructions de GROUPE TAKATAK.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ahmverdunca.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/67f0798f-f909-4285-a360-a1a4ee95b41b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
