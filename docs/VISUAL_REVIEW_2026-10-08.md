# Revue visuelle — 8 octobre 2026

Version préparée dans la PR #390. Captures Chromium, lecture visuelle et OCR
Tesseract ont servi à contrôler le rendu et les textes imprimés.

## Corrections

| Surface | Constat | Modification |
| --- | --- | --- |
| Annonces | Compteur de 23 entreprises pour 8 visuels d’accueil | Rotation et compteur calculés sur les créations effectivement disponibles |
| Annonces | Libellés de 7–8 px et commandes de 32 px | Texte lisible, commandes de 44 px et pause manuelle |
| Annonces | Bandeau et menu superposés aux coordonnées imprimées | Commandes placées sous l’image, consultation et zoom en dialogue |
| Accessibilité des annonces | Libellés d’image identiques | 18 noms transcrits depuis les 54 visuels ; fermeture avec retour au bouton utilisé |
| Trois créations | Fragment de la rangée précédente en haut | Fenêtre CSS retirant exactement 20 px, sans modifier les JPEG |
| Partenaires | Texte répété et titres sombres sur fond sombre | Photo AHMV approuvée, liens directs, 13 cartes lisibles et 10 sites existants conservés |
| Commandite | Longue liste peu structurée sur mobile | 16 emplacements regroupés, compteur de sélection et champs mobiles de 16 px |
| Horaire | Commandes d’archive trop sombres | Couleur lisible et hauteur minimale de 44 px |
| Horaire | Ancien calendrier du 28 septembre au 4 octobre dans l’en-tête | Photo d’entraînement approuvée ; les dates actives restent dans l’horaire officiel |
| Nouvelles | Gouttières blanches autour des annonces | Fond navy continu |
| Fiches d’aréna | Trois titres presque invisibles | Variante sombre des titres de section |

Les trois fenêtres de cadrage concernent les fichiers
`runway-sheet-5-tile-04.jpg`, `-05.jpg` et `-06.jpg` : sources de 853/854 × 480 px,
affiche utile dès y=20, soit 460 px conservés. Le même cadrage est utilisé dans
la carte et le dialogue agrandi. Les autres créations restent intégrales.

## Contrôles réalisés

- Les 54 originaux ont été lus par OCR et examinés sur six planches de neuf
  images. Les accents, logos stylisés et confusions O/0 ont été relus
  visuellement ; l’OCR installé utilise le modèle anglais.
- Annonces : navigation, compteur, agrandissement, zoom, fermeture au clavier
  et retour du focus à 320, 360, 390, 768 et 1440 px.
- Partenaires : 13 cartes, 10 liens existants, 13 menus de correction et ancres
  formulaire/partage à 360, 390, 768 et 1440 px.
- Formulaire : champs obligatoires, dates invalides puis corrigées, sélections
  multiples, 7 budgets et 4 contributions, téléchargement et destinataire
  `ahmverdun.ca@gmail.com`. Français à 360/390/1440 px ; anglais à 390 px.
- Huit autres routes publiques à 390 et 1440 px : horaires, équipes,
  inscriptions, nouvelles, galerie, arénas, fiche Auditorium de Verdun et
  contact. Les quatre défauts de cette revue figurent dans le tableau ci-dessus.
- Contrôles CI requis, TypeScript, dépendances, média, liens, compilation et
  artefact de publication. La version finale et les pages corrigées sont
  recontrôlées avant et après déploiement.

La préparation du dossier n’envoie pas de courriel : l’utilisateur ouvre son
application de messagerie ou télécharge le dossier. Les titres publicitaires
reprennent les images fournies ; les domaines et affiliations imprimés
nécessitent leur propre validation et ne sont pas déduits automatiquement de
l’OCR.
