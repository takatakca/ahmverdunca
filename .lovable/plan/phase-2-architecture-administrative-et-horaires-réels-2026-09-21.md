# Phase 2 — Architecture administrative et horaires réels

## 1. Audit de l'existant (vérifié maintenant)

**Vérifications automatisées que je viens d'exécuter :** les 17 adresses du site répondent correctement (accueil, horaires, équipes, fiche M11, inscriptions, nouvelles, galerie, WLLV, entraîneurs, arénas, FAQ, ressources, contact, recherche, connexion, confidentialité, admin), la compilation du code ne produit aucune erreur, et aucune erreur n'apparaît dans la console du navigateur.

**Distinction demandée :**
- Automatisé et confirmé aujourd'hui : chargement des pages, compilation, absence d'erreur console.
- Vérifié visuellement lors de la phase 1 (téléphone + ordinateur) : menu mobile, filtres du calendrier, changement FR/EN, états du formulaire. Ces points reposent sur une observation, pas sur des tests automatisés permanents.
- Non couvert : tests automatisés de non-régression (aucun n'existe encore).

**Ce qui fonctionne réellement et sera conservé sans modification :** identité visuelle, en-tête et pied de page, menu mobile, bilinguisme FR/EN, mise en page de toutes les pages publiques, redirections Spordle et WLLV, fiches arénas, recherche, page confidentialité.

**Données de démonstration à remplacer :** horaires (semaines de septembre 2026), alertes d'annulation, 3 nouvelles, 3 albums photos, réponses FAQ non validées, adresses d'arénas non vérifiées, logos de commanditaires (absents), images d'illustration marquées DÉMO.

**Ce qui exige une base de données :** horaires et annulations, équipes et divisions, nouvelles, albums et photos, arénas, FAQ, documents entraîneurs, comptes et rôles des bénévoles, messages de contact, journal des modifications.

**Sécurité — état actuel :** aucune faille exploitable, parce qu'il n'existe aucun compte, aucune donnée réelle et aucun serveur. Deux points à corriger dès la phase 2 : la page `/admin` est aujourd'hui accessible à tous (prototype visuel, rien n'est enregistré), et le site est volontairement non indexable. Aucune donnée personnelle n'est présente dans le code.

## 2. Architecture proposée

Base de données PostgreSQL gérée par Lovable Cloud, avec règles d'accès appliquées côté serveur (pas seulement dans l'interface). Trois zones strictement séparées : contenus publics, espace d'administration, documents sensibles.

Rôles, stockés dans une table dédiée (jamais dans le profil, pour éviter toute élévation de privilèges) :

| Rôle | Peut modifier |
|---|---|
| Administrateur principal | tout, plus les comptes et rôles |
| Responsable des horaires | horaires, annulations, équipes, arénas |
| Responsable des communications | nouvelles, FAQ, page d'accueil |
| Responsable des photos | albums et photos |
| Bénévole | lecture seule + brouillons |

Chaque écriture est vérifiée par le serveur en fonction du rôle. Toute modification est enregistrée dans un journal (qui, quand, quoi, valeur précédente) permettant de revenir en arrière.

## 3. Modèle de données

- **saisons** : saison, dates, saison courante
- **categories** : M5 … M18, Junior, Hockey féminin
- **equipes** : nom, catégorie, division, saison, visibilité
- **arenas** : nom officiel, adresse, coordonnées, adresse vérifiée (oui/non), installations, site officiel
- **activites** (horaires) : date, début, fin, équipe, type (match, pratique, tournoi…), aréna, patinoire, statut (confirmé, modifié, annulé, à confirmer), note, version, publié
- **nouvelles** : titre, image, auteur, date, catégorie, contenu, équipes liées, brouillon/publié/archivé, métadonnées de partage
- **albums** et **photos** : saison, équipe, événement, légendes, consentement obtenu
- **faq** : thème, question, réponse, source, validé (oui/non) — la même base sert plus tard à l'assistant
- **documents** : ressources entraîneurs, avec niveau d'accès (public ou restreint)
- **commanditaires** : nom, logo autorisé, lien
- **messages** : demandes du formulaire de contact, statuts Nouvelle / En traitement / Répondue / Fermée
- **imports** : fichier, aperçu, lignes acceptées et refusées, publication, annulation
- **journal_modifications** : traçabilité complète

Une seule source de données pour le calendrier : la page Horaires, la fiche d'équipe et la fiche d'aréna liront la même table, donc une correction se reflète partout automatiquement.

## 4. Importation CSV / XLSX

Téléversement → vérification des colonnes attendues → correspondance des équipes et des arénas (proposition en cas de nom approchant) → détection des doublons (même équipe, même date, même heure, même aréna) → aperçu ligne par ligne avec erreurs signalées → publication volontaire → annulation possible du lot entier. Aucun fichier de démonstration ne sera publié comme horaire officiel : tout reste marqué « non officiel » jusqu'à validation par l'association.

## 5. Préparation GROUPE TAKATAK

Points de connexion prévus mais **désactivés** : événements anonymes (consultation d'horaire, consultation d'équipe, clic d'inscription Spordle, clic d'itinéraire, consultation de nouvelle, demande de contact autorisée), interface de sortie authentifiée, journal de synchronisation, consentements distincts. Aucun service externe connecté, aucune donnée d'enfant, d'inscription ou médicale transmise. L'administration de l'association reste un environnement indépendant du tableau de bord TAKATAK, et le site fonctionne sans lui.

## 6. Plan d'implémentation par étapes

0. **Logo officiel** — vous venez de fournir le logo AHM Verdun ; il remplace l'emplacement réservé (changement visuel isolé, immédiat, sur demande).
1. Activation de la base de données et création du modèle, sans donnée réelle.
2. Comptes et rôles des bénévoles, avec vérification côté serveur ; `/admin` réellement protégé.
3. Module Horaires : ajout, modification, annulation, publication par semaine + journal.
4. Branchement des pages publiques sur la base (horaires, équipes, arénas) en conservant l'apparence actuelle.
5. Importation CSV/XLSX avec aperçu, doublons et annulation.
6. Modules Nouvelles, Galerie, FAQ, Arénas, Documents, Commanditaires.
7. Formulaire de contact réellement enregistré, suivi des demandes.
8. Points de connexion TAKATAK, désactivés par défaut.
9. Vérification complète et tests automatisés de non-régression.

**Aucune modification de code, aucune base de données et aucun service payant ne seront activés avant votre validation.** La maquette actuelle reste intacte.
