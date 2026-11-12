# AHM Verdun — Playbook robot / IA : réponses préformatées, commandes, communications
Date : 2026-10-27. Version brouillon, branch only. Aucun envoi automatique activé.
Gmail : ahmverdun.ca@gmail.com. Libellés créés 2026-10-27 : AHM-Inscription, AHM-Horaire, AHM-Equipe, AHM-Tournoi, AHM-Question, AHM-Aide, AHM-Benevolat, AHM-Partenaires, AHM-Securite, AHM-Urgent.
GitHub : takatakca/ahmverdunca, branche draft/ahmverdun-modernization-20261027, PR #412 brouillon.
Google Drive : ce fichier doit être synchronisé dans Drive (même contenu que GitHub, pas OneDrive).

## Coordonnées complètes — seulement ce qui est vérifié
- Association : Association du Hockey Mineur de Verdun (AHMV / AHM Verdun), Verdun, QC.
- Site principal : https://ahmverdun.ca
- Site source : https://ahmverdun.com/
- Aréna principal : Auditorium de Verdun, 4110 boul. LaSalle, Montréal QC H4G 2A5, espaces Denis-Savard et Scotty-Bowman.
- Inscriptions : https://page.spordle.com/fr/ahm-de-verdun/register
- Tournoi : 30e Tournoi Provincial M11, 18–31 janvier 2027, Auditorium de Verdun, https://tournoihockeyverdun.ca/
- Horaires .com : https://ahmverdun.com/pages/horaires-hebdomadaires — Semaine 8, 26 oct–1 nov 2026, semaine courante au 27 oct, contenu PDF à ingérer avec provenance.
- Facebook lié .com : https://www.facebook.com/AHMVerdun
- Instagram lié .com : https://www.instagram.com/ahm_verdun/
- Courriel opérations affiché sur .ca : operation@ahmverdun.com — à confirmer avant envoi de masse.
- Courriel contact .com : info@hockeycms.ca.
- Urgent seulement : takatak.ca@gmail.com (TAKATAK, affaires principales).
- À CONFIRMER, ne pas publier : téléphone IA (numéro réservé dans le repo, non confirmé public), adresse courriel du président, adresses operations@ / operation@ahhverdun.com (variantes non confirmées).
- Arénas (13, .ca) : voir web-info-sections.md. Rénovation / chantier Auditorium : vérifier le statut courant avant de répondre, ne pas reprendre un ancien avis comme actuel.

## Commandes robot — le parent écrit, le robot répond
- /inscription → réponse Inscription ci-dessous, libellé AHM-Inscription.
- /horaire [équipe] → réponse Horaire, libellé AHM-Horaire. Jamais inventer une pratique / partie.
- /equipe [catégorie] → réponse Équipe, libellé AHM-Equipe.
- /arena [nom] → réponse Aréna, 13 arénas, itinéraire Google / Waze / Apple sur .ca.
- /tournoi → réponse Tournoi, libellé AHM-Tournoi.
- /aide → réponse Aide financière, libellé AHM-Aide. Montants seulement après vérification en direct.
- /benevolat → réponse Bénévolat, libellé AHM-Benevolat.
- /question → réponse Question générale, libellé AHM-Question.
- /urgent → escalade takatak.ca@gmail.com, libellé AHM-Urgent. Routine : jamais escalader un horaire normal.
- /securite → libellé AHM-Securite, ressources Hockey Canada / Hockey Québec en lien seulement.

## Réponses préformatées (FR, avec version EN courte en brouillon)
### Inscription
« Bonjour, les inscriptions 2026–2027 se font ici : https://page.spordle.com/fr/ahm-de-verdun/register — dites-moi la catégorie de votre enfant (M5 à M22, ou féminin M9F / M12F / M15F) et je vous guide. »

### Horaire
« Pour l'horaire officiel de votre équipe, voici les sources officielles : ahmverdun.ca/horaires et, pour .com, la semaine courante. Dites-moi votre équipe et je vérifie la semaine en cours, sans inventer de pratique ou de partie. »

### Équipe
« Voici les catégories AHM Verdun : M7, M9, M11, M13, M15, M17, M19, M22 et féminin. Sur ahmverdun.ca/equipes, trouvez votre équipe. Dites-moi la catégorie et je vous donne les liens officiels. »

### Aréna
« Aréna principal : Auditorium de Verdun, 4110 boul. LaSalle. Les 13 arénas avec itinéraires sont sur ahmverdun.ca/arenas. Attention : Aréna Martin-Lapointe est marqué fermeture temporaire — je vérifie avant de vous y diriger. »

### Tournoi
« 30e Tournoi Provincial M11 de Verdun, 18–31 janvier 2027, Auditorium de Verdun. Inscriptions sur https://tournoihockeyverdun.ca/ — délai affiché 15 novembre 2026, à vérifier en direct avant promotion. »

### Question générale
« Bonjour, je peux vous aider pour inscriptions, horaires, équipes, arénas, tournois, bénévolat et aide financière. Dites-moi votre catégorie et votre question, je vous réponds avec une source officielle. »

### Aide financière
« Pour les frais d'inscription, les routes à vérifier sont Jumpstart (Canadian Tire), le Fonds d'aide de Hockey Canada et KidSport Québec / Sport Jeunesse Québec. Je ne vous donne un montant que si je l'ai vérifié en direct sur la page officielle. »

### Bénévolat
« Merci de vouloir aider l'AHMV ! Dites-moi vos disponibilités et si vous préférez accueil, équipement, entraîneur ou organisation, je transmets à l'association. »

### Urgent
« Ceci semble urgent. Je transmets immédiatement à l'équipe TAKATAK / AHM Verdun et je vous confirme la transmission. Pour une urgence sur la glace, contactez d'abord les responsables sur place. »

## Comment les IA se parlent — communications simplifiées
1. IA téléphone : prend l'appel, note équipe / catégorie / question, crée un brouillon courriel avec libellé AHM-*, ne promet aucun horaire non vérifié.
2. IA site web : vérifie .ca / .com / Spordle / Scoresheets, met à jour la branche GitHub avec provenance et date, jamais en direct sur main sans approbation.
3. Muse (IA centrale) : lit Gmail toutes les 5 minutes (cron existant, brouillons seulement, pas d'envoi), classe par libellé, prépare la réponse préformatée, logue dans Drive et GitHub.
4. Jobs par courriel : objet commençant par [AHM-JOB] + catégorie, ex. [AHM-JOB] Horaire — Semaine 8 à ingérer. Chaque job a un responsable (téléphone / site / Muse), un statut (à faire / en cours / fait / bloqué) et une note dans GitHub + Drive.
5. Règle d'or : une IA ne publie jamais seule vers familles, Facebook, site live ou paiement. Elle prépare, une autre vérifie, un humain approuve les contenus sensibles, surtout avec des mineurs.

## Ménage Gmail — fait le 2026-10-27
- Avant : seulement les libellés système Gmail, aucun libellé AHM.
- Après : 10 libellés AHM créés sur ahmverdun.ca@gmail.com (liste ci-dessus).
- Pas de courriel archivé / supprimé / envoyé dans cette étape. Le classement des courriels entrants par libellé reste à activer, brouillon d'abord.
