import type { Localized } from "@/lib/i18n";

export type NewsCategory =
  | "association"
  | "teams"
  | "games"
  | "tournaments"
  | "camps"
  | "registration"
  | "cancellations"
  | "releases"
  | "feminine";

export const NEWS_CATEGORIES: { id: NewsCategory; label: Localized }[] = [
  { id: "association", label: { fr: "Association", en: "Association" } },
  { id: "teams", label: { fr: "Équipes", en: "Teams" } },
  { id: "games", label: { fr: "Matchs", en: "Games" } },
  { id: "tournaments", label: { fr: "Tournois", en: "Tournaments" } },
  { id: "camps", label: { fr: "Camps", en: "Camps" } },
  { id: "registration", label: { fr: "Inscriptions", en: "Registration" } },
  { id: "cancellations", label: { fr: "Annulations", en: "Cancellations" } },
  { id: "releases", label: { fr: "Communiqués", en: "Releases" } },
  { id: "feminine", label: { fr: "Hockey féminin", en: "Girls' hockey" } },
];

export interface NewsLink {
  label: Localized;
  url: string;
}

export interface NewsArticle {
  legacyId?: number;
  slug: string;
  title: Localized;
  excerpt: Localized;
  body: { fr: string[]; en?: string[] };
  /** Exact publication date only when verified. Never infer a date from "x weeks ago". */
  date?: string;
  /** Used when the legacy site exposes only a relative/seasonal date. */
  publishedLabel?: Localized;
  author: string;
  category: NewsCategory;
  teamSlugs: string[];
  image?: string;
  season: string;
  sourceUrl?: string;
  links?: NewsLink[];
  contentPending: boolean;
}

export const NEWS: NewsArticle[] = [
  {
    "legacyId": 39,
    "slug": "annulations-22-26-septembre-2026",
    "title": {
      "fr": "Annulations d’activités les 22 et 26 septembre 2026",
      "en": "Activity cancellations on September 22 and 26, 2026"
    },
    "excerpt": {
      "fr": "Toutes les activités prévues les 22 et 26 septembre ont été annulées en raison d’une grève.",
      "en": "All activities scheduled for September 22 and 26 were cancelled because of a strike."
    },
    "body": {
      "fr": [
        "L’AHM Verdun a annoncé l’annulation de toutes les activités prévues les 22 et 26 septembre 2026 en raison d’une grève.",
        "Les familles sont invitées à consulter l’horaire hebdomadaire publié par l’association pour obtenir la version la plus récente."
      ],
      "en": [
        "AHM Verdun announced the cancellation of all activities scheduled for September 22 and 26, 2026 because of a strike.",
        "Families are directed to the association’s weekly schedule for the most recent version."
      ]
    },
    "date": "2026-09-18",
    "author": "AHM Verdun Communication",
    "category": "cancellations",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/39",
    "contentPending": false
  },
  {
    "legacyId": 38,
    "slug": "debut-de-saison-m5-m7",
    "title": {
      "fr": "Début de saison pour les groupes M5 et M7",
      "en": "Season kickoff for U5 and U7 groups"
    },
    "excerpt": {
      "fr": "Les groupes M5 et M7 amorcent leur saison; le hockey sur mesure suit la semaine suivante.",
      "en": "U5 and U7 begin their season, with customized hockey following the next week."
    },
    "body": {
      "fr": [
        "L’association a annoncé le début de saison pour les groupes M5 et M7 et a souhaité une bonne saison aux jeunes et aux familles.",
        "Le hockey sur mesure devait commencer la semaine suivante. Les détails pratiques restent à confirmer dans l’horaire hebdomadaire."
      ],
      "en": [
        "The association announced the season start for U5 and U7 and wished players and families a great season.",
        "Customized hockey was expected to begin the following week. Practical details remain available in the weekly schedule."
      ]
    },
    "date": "2026-09-15",
    "author": "AHM Verdun Communication",
    "category": "teams",
    "teamSlugs": [
      "m5",
      "m7"
    ],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/38",
    "contentPending": false
  },
  {
    "legacyId": 37,
    "slug": "academie-ahmv-remise-des-bourses",
    "title": {
      "fr": "Académie AHMV — Remise des bourses",
      "en": "AHMV Academy — Scholarship ceremony"
    },
    "excerpt": {
      "fr": "L’Académie AHMV a souligné les efforts scolaires de jeunes de l’association avec l’appui de partenaires locaux.",
      "en": "The AHMV Academy recognized young members’ academic efforts with support from local partners."
    },
    "body": {
      "fr": [
        "L’Académie AHMV a tenu une remise de bourses pour reconnaître l’effort, la persévérance et la réussite scolaire de jeunes hockeyeurs et hockeyeuses.",
        "Desjardins a remis trois bourses de 500 $ pour les meilleurs résultats scolaires globaux. Le Club Richelieu Verdun a remis six bourses de 250 $ pour les meilleurs résultats en français.",
        "L’AHMV a aussi accordé trois crédits applicables aux frais d’inscription afin de reconnaître le maintien ou l’amélioration des résultats scolaires; d’autres jeunes ont reçu des sacs à dos.",
        "L’association a annoncé le retour de l’Académie pour la nouvelle saison et a remercié Desjardins et le Club Richelieu Verdun pour leur soutien."
      ],
      "en": [
        "The AHMV Academy held a scholarship presentation recognizing effort, perseverance and academic success.",
        "Desjardins awarded three $500 scholarships for overall academic results, while Club Richelieu Verdun awarded six $250 scholarships for French-language results.",
        "AHMV also awarded three registration credits recognizing maintained or improved academic results, and other participants received backpacks.",
        "The association announced the Academy’s return for the new season and thanked its local partners."
      ]
    },
    "date": "2026-09-10",
    "author": "AHM Verdun Communication",
    "category": "association",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/37",
    "contentPending": false
  },
  {
    "legacyId": 36,
    "slug": "petition-facturation-heures-glace-verdun",
    "title": {
      "fr": "Pétition sur la facturation des heures de glace à l’AHMV par l’arrondissement de Verdun",
      "en": "Petition concerning ice-time fees charged to AHMV by the Verdun borough"
    },
    "excerpt": {
      "fr": "Le président Jean-François Guay a publié un appel à signer une pétition municipale sur les tarifs des plateaux sportifs.",
      "en": "President Jean-François Guay published a call to sign a municipal petition concerning sport-facility fees."
    },
    "body": {
      "fr": [
        "Dans un message signé par le président Jean-François Guay, l’AHMV demande l’appui des parents, membres et citoyens à une pétition portant sur les tarifs de location des installations sportives à Verdun.",
        "Le message de l’association indique qu’elle aurait reçu, l’année précédente, environ 80 000 $ de facturation pour ses heures de glace et terminé l’année avec un déficit de 45 000 $. Il indique également qu’environ 25 000 $ auraient été retournés par le programme PAF. Ces chiffres sont ceux avancés par l’AHMV dans sa publication.",
        "Le président soutient que cette situation pourrait entraîner une hausse importante des frais d’inscription et affirme vouloir maintenir le sport accessible aux familles. Il souligne que d’autres organismes sportifs de l’arrondissement seraient aussi touchés.",
        "La publication renvoie vers une pétition de la Ville de Montréal intitulée « Révision des tarifs facturés aux associations sportives de l’arrondissement de Verdun »."
      ],
      "en": [
        "In a message signed by president Jean-François Guay, AHMV asks parents, members and residents to support a petition concerning sport-facility rental fees in Verdun.",
        "The association’s post states that it received approximately $80,000 in ice-time charges the previous year and ended the year with a $45,000 deficit, while approximately $25,000 was returned through the PAF program. These figures are claims published by AHMV.",
        "The president says the situation could lead to substantially higher registration fees and argues that sport should remain accessible to families. He also says other local sport organizations are affected.",
        "The post links to a City of Montréal petition concerning fees charged to sport associations in Verdun."
      ]
    },
    "publishedLabel": {
      "fr": "Septembre 2026",
      "en": "September 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "association",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/36",
    "links": [
      {
        "label": {
          "fr": "Pétition — Ville de Montréal",
          "en": "Petition — City of Montréal"
        },
        "url": "https://montreal.ca/petitions/signer/6a8f46e39bba30590c42a0cd"
      }
    ],
    "contentPending": false
  },
  {
    "legacyId": 35,
    "slug": "inscriptions-30e-tournoi-m11-verdun",
    "title": {
      "fr": "Inscriptions ouvertes pour le 30e Tournoi Atome M11 de Verdun",
      "en": "Registration open for the 30th Verdun U11 Tournament"
    },
    "excerpt": {
      "fr": "Le tournoi est annoncé du 18 au 31 janvier 2027 à l’Auditorium de Verdun pour les catégories C, B, A, BB, AA et M12A féminin.",
      "en": "The tournament is announced for January 18–31, 2027 at the Verdun Auditorium for C, B, A, BB, AA and girls’ U12A categories."
    },
    "body": {
      "fr": [
        "L’AHM Verdun a ouvert les inscriptions pour la 30e édition du Tournoi Atome M11 de Verdun.",
        "L’événement doit se dérouler du 18 au 31 janvier 2027 à l’Auditorium de Verdun. Les catégories annoncées sont C, B, A, BB, AA et M12A féminin.",
        "Les équipes doivent utiliser le formulaire d’inscription officiel publié par l’association."
      ],
      "en": [
        "AHM Verdun opened registration for the 30th Verdun U11 Tournament.",
        "The event is scheduled for January 18–31, 2027 at the Verdun Auditorium. Announced categories are C, B, A, BB, AA and girls’ U12A.",
        "Teams should use the official registration form published by the association."
      ]
    },
    "publishedLabel": {
      "fr": "Septembre 2026",
      "en": "September 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "tournaments",
    "teamSlugs": [
      "m11",
      "feminin"
    ],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/35",
    "links": [
      {
        "label": {
          "fr": "Formulaire d’inscription",
          "en": "Registration form"
        },
        "url": "https://forms.gle/wtHx6gmjmMY4VS6u6"
      }
    ],
    "contentPending": false
  },
  {
    "legacyId": 34,
    "slug": "renseignements-camp-chacals-aa-bb",
    "title": {
      "fr": "Renseignements pour les joueurs AA et BB : camp d’essais des Chacals",
      "en": "Information for AA and BB players: Chacals tryout camp"
    },
    "excerpt": {
      "fr": "L’AHMV dirige les familles inscrites en double lettre vers le document de groupes du camp d’essais des Chacals.",
      "en": "AHMV directs AA/BB families to the Chacals tryout-group document."
    },
    "body": {
      "fr": [
        "Les parents de patineurs inscrits en double lettre (AA ou BB) sont dirigés vers le document officiel du camp d’essais des Chacals.",
        "Le document externe est géré par l’organisation concernée; il doit être consulté directement pour les groupes, horaires et mises à jour."
      ],
      "en": [
        "Parents of AA or BB players are directed to the official Chacals tryout-camp document.",
        "The external document is maintained by the responsible organization and should be consulted directly for groups, schedules and updates."
      ]
    },
    "publishedLabel": {
      "fr": "Septembre 2026",
      "en": "September 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "teams",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/34",
    "links": [
      {
        "label": {
          "fr": "Groupes du camp d’essais des Chacals",
          "en": "Chacals tryout groups"
        },
        "url": "https://docs.google.com/spreadsheets/d/1v40LHKGKuFFnUuGgouHULOmC_eD7IGLQ7t2kUncWtAI/edit?usp=sharing"
      }
    ],
    "contentPending": false
  },
  {
    "legacyId": 33,
    "slug": "hockey-feminin-portes-ouvertes-2026",
    "title": {
      "fr": "Hockey féminin : journée portes ouvertes le 13 septembre et inscriptions ouvertes",
      "en": "Girls’ hockey: September 13 open house and registration"
    },
    "excerpt": {
      "fr": "Journée portes ouvertes M7 à M18, prêt d’équipement et informations d’inscription pour la saison 2026-2027.",
      "en": "U7–U18 open house, equipment loans and registration information for the 2026–2027 season."
    },
    "body": {
      "fr": [
        "Une journée portes ouvertes de hockey féminin est annoncée le dimanche 13 septembre 2026, de 10 h à midi, à l’Auditorium de Verdun, pour les filles M7 à M18, débutantes ou expérimentées.",
        "L’équipement doit être prêté gratuitement; les participantes qui en ont besoin sont invitées à arriver à 9 h pour la récupération et la préparation.",
        "Pour 2026-2027, l’article annonce les catégories M9 féminin (2018-2019) et M12 féminin (2015-2017). À la demande de Hockey Québec, les équipes féminines sont regroupées sous Franchise Warriors.",
        "Pour M9F et M12F, les parents doivent communiquer avec Marie-Josée Bélair à Mjbelair@hockeylsl.ca avec le nom complet et la date de naissance afin de permettre l’inscription Spordle. Pour M7, M15 et M18, l’inscription se fait d’abord dans la catégorie mixte correspondante; la création d’équipes féminines dépend du nombre d’inscriptions.",
        "Les questions sur le développement du hockey féminin peuvent être adressées à hockeyfeminin@ahmverdun.com."
      ],
      "en": [
        "A girls’ hockey open house is announced for Sunday, September 13, 2026, from 10 a.m. to noon at the Verdun Auditorium for U7 through U18 players of all experience levels.",
        "Equipment is to be loaned free of charge; participants needing equipment are asked to arrive at 9 a.m.",
        "For 2026–2027, the post announces girls’ U9 (2018–2019) and girls’ U12 (2015–2017). The post says Hockey Québec requested that girls’ teams be grouped under Franchise Warriors.",
        "Parents of U9F and U12F players should contact Marie-Josée Bélair at Mjbelair@hockeylsl.ca with the player’s full name and date of birth so Spordle registration can be enabled. U7, U15 and U18 players should initially register in the corresponding mixed category; girls’ teams depend on registration volume.",
        "Girls’ hockey development questions can be sent to hockeyfeminin@ahmverdun.com."
      ]
    },
    "publishedLabel": {
      "fr": "Septembre 2026",
      "en": "September 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "feminine",
    "teamSlugs": [
      "feminin"
    ],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/33",
    "contentPending": false
  },
  {
    "legacyId": 32,
    "slug": "chacals-acces-pratiques-simple-lettre",
    "title": {
      "fr": "Rappel aux joueurs inscrits aux Chacals : accès aux pratiques simple lettre",
      "en": "Reminder for Chacals camp players: single-letter practices"
    },
    "excerpt": {
      "fr": "Les joueurs encore inscrits au camp AA/BB des Chacals ne peuvent pas participer simultanément aux pratiques simple lettre AHMV.",
      "en": "Players still attending the Chacals AA/BB camp cannot simultaneously attend AHMV single-letter practices."
    },
    "body": {
      "fr": [
        "L’AHM Verdun rappelle que les joueurs inscrits au camp des Chacals (AA/BB, regroupement WLLV) ne peuvent pas participer aux pratiques simple lettre de l’AHMV pendant qu’ils sont toujours au camp.",
        "Lorsqu’un joueur est retranché des Chacals, il peut se joindre aux pratiques simple lettre de l’AHMV."
      ],
      "en": [
        "AHM Verdun reminds families that players registered in the Chacals AA/BB camp (WLLV) cannot attend AHMV single-letter practices while they remain in that camp.",
        "Once a player is released from the Chacals camp, the player may join AHMV single-letter practices."
      ]
    },
    "publishedLabel": {
      "fr": "Août–septembre 2026",
      "en": "August–September 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "teams",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/32",
    "contentPending": false
  },
  {
    "legacyId": 31,
    "slug": "directeurs-niveau-m11-m13-m15",
    "title": {
      "fr": "L’AHMV a besoin de vous ! Devenez directeur de niveau (M11, M13, M15)",
      "en": "AHMV needs you: level directors wanted for U11, U13 and U15"
    },
    "excerpt": {
      "fr": "L’association recrute des bénévoles pour les postes de directeur ou directrice M11, M13 et M15.",
      "en": "The association is recruiting volunteer U11, U13 and U15 level directors."
    },
    "body": {
      "fr": [
        "L’AHM Verdun recherche des bénévoles pour occuper les postes de direction de niveau M11, M13 et M15.",
        "Le rôle sert de lien entre le conseil d’administration, les entraîneurs et les parents et contribue au bon déroulement de la saison.",
        "Les personnes intéressées peuvent écrire à operation@ahmverdun.com."
      ],
      "en": [
        "AHM Verdun is recruiting volunteers for U11, U13 and U15 level-director positions.",
        "The role connects the board, coaches and parents and supports smooth season operations.",
        "Interested volunteers can write to operation@ahmverdun.com."
      ]
    },
    "publishedLabel": {
      "fr": "Août 2026",
      "en": "August 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "association",
    "teamSlugs": [
      "m11",
      "m13",
      "m15"
    ],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/31",
    "contentPending": false
  },
  {
    "legacyId": 30,
    "slug": "anthony-lapointe-lnh",
    "title": {
      "fr": "De Verdun à la LNH : Anthony Lapointe réalise un grand rêve !",
      "en": "From Verdun to the NHL: Anthony Lapointe reaches a major milestone"
    },
    "excerpt": {
      "fr": "L’AHMV souligne le parcours de l’arbitre Anthony Lapointe, originaire de Verdun, annoncé comme juge de lignes à temps plein dans la LNH.",
      "en": "AHMV highlights Verdun-born official Anthony Lapointe, announced as a full-time NHL linesman."
    },
    "body": {
      "fr": [
        "L’AHM Verdun a publié un hommage à Anthony Lapointe, originaire de Verdun, à la suite de l’annonce d’un contrat à temps plein comme juge de lignes dans la LNH pour la saison 2026-2027.",
        "Selon la publication, il s’est consacré pleinement à l’arbitrage à partir de 2021 avec Hockey Québec et a ensuite travaillé dans plusieurs circuits, notamment le M18 AAA, le Junior AAA, la LHJMQ, l’ECHL, la LPHF et la LAH.",
        "L’article indique également qu’il a officié la finale pour la médaille d’or du Championnat mondial junior 2026 et mentionne qu’il est diplômé en éducation physique de l’Université McGill.",
        "L’association le félicite et présente son parcours comme une source d’inspiration pour les jeunes de Verdun."
      ],
      "en": [
        "AHM Verdun published a tribute to Verdun-born official Anthony Lapointe after the announcement of a full-time NHL linesman contract for the 2026–2027 season.",
        "According to the association’s post, he focused fully on officiating beginning in 2021 with Hockey Québec and subsequently worked in leagues including U18 AAA, Junior AAA, the QMJHL, ECHL, PWHL and AHL.",
        "The post also says he worked the 2026 World Junior Championship gold-medal game and notes that he graduated in physical education from McGill University.",
        "The association congratulates him and presents his path as an inspiration for young people in Verdun."
      ]
    },
    "publishedLabel": {
      "fr": "Août 2026",
      "en": "August 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "association",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/30",
    "contentPending": false
  },
  {
    "legacyId": 29,
    "slug": "arbitres-marqueurs-recherches",
    "title": {
      "fr": "Arbitres et marqueurs recherchés !",
      "en": "Referees and scorekeepers wanted"
    },
    "excerpt": {
      "fr": "L’AHMV recrute des arbitres ainsi que des marqueurs-chronométreurs pour la saison à l’Auditorium de Verdun.",
      "en": "AHMV is recruiting referees and scorekeeper-timekeepers for the season at the Verdun Auditorium."
    },
    "body": {
      "fr": [
        "L’association recrute de nouveaux officiels pour la prochaine saison à l’Auditorium de Verdun.",
        "Le rôle d’arbitre permet de rester au cœur du jeu, de développer son leadership et d’être rémunéré. Le rôle de marqueur-chronométreur consiste notamment à gérer le pointage et le chronomètre depuis la table de marque.",
        "Les personnes intéressées peuvent communiquer avec operation@ahmverdun.com."
      ],
      "en": [
        "The association is recruiting new officials for the coming season at the Verdun Auditorium.",
        "The referee role offers on-ice experience, leadership development and paid work. Scorekeeper-timekeepers manage scoring and game time from the officials’ table.",
        "Interested applicants can contact operation@ahmverdun.com."
      ]
    },
    "publishedLabel": {
      "fr": "Été 2026",
      "en": "Summer 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "association",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/29",
    "contentPending": false
  },
  {
    "legacyId": 28,
    "slug": "inscriptions-camp-wllv-aa-bb",
    "title": {
      "fr": "Inscriptions au camp WLLV (AA/BB)",
      "en": "WLLV AA/BB camp registration"
    },
    "excerpt": {
      "fr": "Les joueurs intéressés sont dirigés vers WLLV pour l’inscription aux camps de sélection double lettre.",
      "en": "Interested players are directed to WLLV for AA/BB selection-camp registration."
    },
    "body": {
      "fr": [
        "L’AHM Verdun annonce l’ouverture des inscriptions aux camps de sélection WLLV pour le hockey double lettre AA/BB.",
        "Les familles sont dirigées vers le site WLLV et la publication Facebook associée pour les renseignements à jour."
      ],
      "en": [
        "AHM Verdun announces registration for WLLV AA/BB selection camps.",
        "Families are directed to WLLV and the associated Facebook post for current information."
      ]
    },
    "publishedLabel": {
      "fr": "Été 2026",
      "en": "Summer 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "teams",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/28",
    "links": [
      {
        "label": {
          "fr": "WLLV",
          "en": "WLLV"
        },
        "url": "https://www.wllv.org/"
      },
      {
        "label": {
          "fr": "Publication Facebook",
          "en": "Facebook post"
        },
        "url": "https://www.facebook.com/share/1K2ncNuA97/?mibextid=wwXIfr"
      }
    ],
    "contentPending": false
  },
  {
    "legacyId": 27,
    "slug": "aide-financiere-frais-inscription",
    "title": {
      "fr": "Aide financière pour les frais d’inscription",
      "en": "Financial assistance for registration fees"
    },
    "excerpt": {
      "fr": "L’AHMV rappelle l’existence de programmes d’aide aux familles pour les frais de hockey mineur.",
      "en": "AHMV highlights financial-assistance programs available to families for minor-hockey fees."
    },
    "body": {
      "fr": [
        "L’association rappelle que certaines fondations offrent des programmes pouvant aider les familles à couvrir une partie des frais liés au hockey mineur.",
        "La publication renvoie vers la Fondation Bon départ de Canadian Tire du Québec et le Fonds d’aide de la Fondation Hockey Canada. Les critères, montants et périodes de disponibilité doivent toujours être vérifiés directement auprès de ces organismes."
      ],
      "en": [
        "The association highlights foundations that may help families with minor-hockey participation costs.",
        "The post links to the Canadian Tire Jumpstart Foundation in Québec and the Hockey Canada Foundation Assist Fund. Eligibility, amounts and availability should always be checked directly with those organizations."
      ]
    },
    "publishedLabel": {
      "fr": "Été 2026",
      "en": "Summer 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "registration",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/27",
    "links": [
      {
        "label": {
          "fr": "Fondation Bon départ",
          "en": "Jumpstart Foundation"
        },
        "url": "https://www.fondationbondepart.ca/"
      },
      {
        "label": {
          "fr": "Fonds d’aide — Fondation Hockey Canada",
          "en": "Hockey Canada Foundation Assist Fund"
        },
        "url": "https://fondsaide.fondationhockeycanada.ca/fr/page/demande.html"
      }
    ],
    "contentPending": false
  },
  {
    "legacyId": 26,
    "slug": "inscriptions-2026-2027",
    "title": {
      "fr": "Inscriptions 2026/27",
      "en": "2026/27 registration"
    },
    "excerpt": {
      "fr": "Les inscriptions pour la saison 2026-2027 sont ouvertes sur la page Spordle de l’AHM Verdun.",
      "en": "Registration for the 2026–2027 season is open on AHM Verdun’s Spordle page."
    },
    "body": {
      "fr": [
        "L’AHM Verdun annonce l’ouverture des inscriptions pour la saison 2026-2027.",
        "L’inscription officielle s’effectue dans Spordle à partir du lien publié par l’association."
      ],
      "en": [
        "AHM Verdun announces that registration is open for the 2026–2027 season.",
        "Official registration is completed through Spordle using the association’s published link."
      ]
    },
    "publishedLabel": {
      "fr": "Été 2026",
      "en": "Summer 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "registration",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/26",
    "links": [
      {
        "label": {
          "fr": "Inscription Spordle",
          "en": "Spordle registration"
        },
        "url": "https://page.spordle.com/fr/ahm-de-verdun/register"
      }
    ],
    "contentPending": false
  },
  {
    "legacyId": 25,
    "slug": "jean-francois-guay-president-ahmv",
    "title": {
      "fr": "Nouveau président de l’AHMV — Jean-François Guay",
      "en": "New AHMV president — Jean-François Guay"
    },
    "excerpt": {
      "fr": "L’AHMV a annoncé la nomination de Jean-François Guay à la présidence de l’association.",
      "en": "AHMV announced the appointment of Jean-François Guay as association president."
    },
    "body": {
      "fr": [
        "Le 11 mai 2026, l’AHM Verdun a annoncé la nomination de Jean-François Guay comme président de l’organisation.",
        "La publication présente M. Guay comme un Verdunois de longue date, ancien joueur de l’AHMV et entrepreneur impliqué dans la communauté. Elle mentionne notamment son passage avec les Leafs de Verdun et les Cobras Verdun–LaSalle, son engagement au Club Richelieu Verdun et son expérience comme arbitre.",
        "Dans le portrait publié par l’association, il met l’accent sur les valeurs humaines, la persévérance scolaire, le respect, l’inclusion et le plaisir de jouer. L’article souligne aussi son lien familial avec le hockey mineur par son fils Émile."
      ],
      "en": [
        "On May 11, 2026, AHM Verdun announced the appointment of Jean-François Guay as president of the organization.",
        "The association’s profile presents Mr. Guay as a long-time Verdun resident, former AHMV player and community-involved entrepreneur. It mentions his time with the Verdun Leafs and Verdun–LaSalle Cobras, his involvement with Club Richelieu Verdun and his officiating experience.",
        "The profile says his priorities include human values, academic perseverance, respect, inclusion and enjoyment of the game, and also notes his family connection to minor hockey through his son Émile."
      ]
    },
    "date": "2026-05-11",
    "author": "AHM Verdun Communication",
    "category": "association",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/25",
    "contentPending": false
  },
  {
    "legacyId": 24,
    "slug": "mise-au-point-chantier-auditorium-verdun",
    "title": {
      "fr": "Mise au point sur le chantier de l’Auditorium de Verdun",
      "en": "Update on construction work at the Verdun Auditorium"
    },
    "excerpt": {
      "fr": "L’AHMV a relayé une mise au point municipale concernant les travaux, la décontamination et les impacts prévus sur les activités.",
      "en": "AHMV relayed a municipal update on construction, remediation work and expected activity impacts."
    },
    "body": {
      "fr": [
        "L’AHM Verdun a publié un document de l’Arrondissement de Verdun concernant le chantier de l’Auditorium de Verdun.",
        "Le document municipal indique que des matériaux anciens dans l’espace Scotty-Bowman contenaient des traces de plomb et qu’une intervention de la CNESST a entraîné une pause des travaux pour analyses et interventions. Il précise que les zones publiques n’étaient pas touchées et que les activités offertes demeuraient sécuritaires.",
        "Les travaux annoncés comprennent notamment des opérations de décontamination et de nettoyage, l’installation d’une climatisation permanente dans l’espace Scotty-Bowman et des interventions de ventilation.",
        "Le calendrier municipal prévoit une reprise du chantier à l’automne 2026 après la saison de basketball, avec fermeture de l’espace Scotty-Bowman jusqu’en décembre. Le document évoque ensuite une reprise des activités en 2027 selon les capacités techniques du bâtiment."
      ],
      "en": [
        "AHM Verdun published a Verdun borough document about construction at the Verdun Auditorium.",
        "The municipal document says older materials in the Scotty Bowman space contained traces of lead and that a CNESST intervention paused work for analysis and remediation. It states that public areas were not affected and offered activities remained safe.",
        "Planned work includes remediation and cleaning, permanent air conditioning in the Scotty Bowman space and ventilation work.",
        "The municipal timeline calls for work to resume in fall 2026 after the basketball season, with the Scotty Bowman space closed until December, followed by a return to activities in 2027 according to the building’s technical capacity."
      ]
    },
    "publishedLabel": {
      "fr": "Printemps 2026",
      "en": "Spring 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "association",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/24",
    "links": [
      {
        "label": {
          "fr": "Document officiel — Arrondissement de Verdun",
          "en": "Official document — Verdun borough"
        },
        "url": "https://www.ahmverdun.com/storage/documents/01KPK076XRVVBNQN512C6J1MB9.pdf"
      }
    ],
    "contentPending": false
  },
  {
    "legacyId": 23,
    "slug": "hockey-3-contre-3-printemps-2026",
    "title": {
      "fr": "Hockey 3 contre 3",
      "en": "3-on-3 hockey"
    },
    "excerpt": {
      "fr": "Début annoncé le mardi 5 mai avec des plages M11, M13 et M15/M18.",
      "en": "Start announced for Tuesday, May 5 with U11, U13 and U15/U18 sessions."
    },
    "body": {
      "fr": [
        "L’AHM Verdun annonce le début du hockey 3 contre 3 le mardi 5 mai.",
        "Les plages publiées sont : 18 h à 19 h pour M11, 19 h à 20 h pour M13 et 20 h à 21 h pour M15/M18."
      ],
      "en": [
        "AHM Verdun announces the start of 3-on-3 hockey on Tuesday, May 5.",
        "Published times are 6–7 p.m. for U11, 7–8 p.m. for U13 and 8–9 p.m. for U15/U18."
      ]
    },
    "publishedLabel": {
      "fr": "Printemps 2026",
      "en": "Spring 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "camps",
    "teamSlugs": [
      "m11",
      "m13",
      "m15",
      "m18"
    ],
    "season": "2025-2026",
    "sourceUrl": "https://www.ahmverdun.com/news/23",
    "contentPending": false
  },
  {
    "legacyId": 22,
    "slug": "m11-c-champions-series",
    "title": {
      "fr": "M11 C — Champions des séries",
      "en": "U11 C — Playoff champions"
    },
    "excerpt": {
      "fr": "L’AHMV félicite les Coyotes de Verdun M11 C pour leur championnat.",
      "en": "AHMV congratulates the Verdun Coyotes U11 C on their championship."
    },
    "body": {
      "fr": [
        "L’association a félicité les Coyotes de Verdun de la division M11 C pour leur championnat."
      ],
      "en": [
        "The association congratulated the Verdun Coyotes U11 C on their championship."
      ]
    },
    "publishedLabel": {
      "fr": "Printemps 2026",
      "en": "Spring 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "games",
    "teamSlugs": [
      "m11"
    ],
    "season": "2025-2026",
    "sourceUrl": "https://www.ahmverdun.com/news/22",
    "contentPending": false
  },
  {
    "legacyId": 21,
    "slug": "m13-c-champions-series",
    "title": {
      "fr": "M13 C — Champions des séries",
      "en": "U13 C — Playoff champions"
    },
    "excerpt": {
      "fr": "L’AHMV félicite les Coyotes de Verdun M13 C pour leur championnat.",
      "en": "AHMV congratulates the Verdun Coyotes U13 C on their championship."
    },
    "body": {
      "fr": [
        "L’association a félicité l’équipe des Coyotes de Verdun de la division M13 C pour son championnat."
      ],
      "en": [
        "The association congratulated the Verdun Coyotes U13 C on their championship."
      ]
    },
    "publishedLabel": {
      "fr": "Printemps 2026",
      "en": "Spring 2026"
    },
    "author": "AHM Verdun Communication",
    "category": "games",
    "teamSlugs": [
      "m13"
    ],
    "season": "2025-2026",
    "sourceUrl": "https://www.ahmverdun.com/news/21",
    "contentPending": false
  },
  {
    "legacyId": 14,
    "slug": "revision-classification-hockey-mixte-2026-2027",
    "title": {
      "fr": "Révision de la classification de hockey mixte",
      "en": "Mixed-hockey classification revision"
    },
    "excerpt": {
      "fr": "L’AHMV a relayé une annonce de Hockey Québec concernant la classification du hockey mixte à compter de 2026-2027.",
      "en": "AHMV shared a Hockey Québec announcement concerning mixed-hockey classification beginning in 2026–2027."
    },
    "body": {
      "fr": [
        "La publication de l’AHM Verdun renvoie directement à l’annonce de Hockey Québec concernant la révision de la classification du hockey mixte pour la saison 2026-2027.",
        "Pour les détails réglementaires et les catégories concernées, la source Hockey Québec demeure la référence."
      ],
      "en": [
        "AHM Verdun’s post links directly to Hockey Québec’s announcement about revised mixed-hockey classification for the 2026–2027 season.",
        "For regulatory details and affected categories, Hockey Québec remains the authoritative source."
      ]
    },
    "publishedLabel": {
      "fr": "2026",
      "en": "2026"
    },
    "author": "AHM Verdun Communication",
    "category": "releases",
    "teamSlugs": [],
    "season": "2026-2027",
    "sourceUrl": "https://www.ahmverdun.com/news/14",
    "links": [
      {
        "label": {
          "fr": "Annonce Hockey Québec",
          "en": "Hockey Québec announcement"
        },
        "url": "https://www.hockey.qc.ca/fr/publication/nouvelle/hockey_quebec_annonce_une_revision_de_la_classification_en_hockey_mixte_des_la_saison_2026-2027.html"
      }
    ],
    "contentPending": false
  },
  {
    "legacyId": 19,
    "slug": "inscriptions-evenements-printemps",
    "title": {
      "fr": "Lien d’inscription pour les événements du printemps",
      "en": "Spring-event registration links"
    },
    "excerpt": {
      "fr": "Liens d’inscription publiés pour le M9 plein-glace, le 3 contre 3 et une activité d’initiation pour les filles.",
      "en": "Published registration links for U9 full-ice, 3-on-3 and a girls’ introductory event."
    },
    "body": {
      "fr": [
        "Une publication antérieure de l’AHM Verdun regroupait les liens d’inscription pour plusieurs activités du printemps : M9 cinq contre cinq sur pleine glace, hockey trois contre trois pour plusieurs catégories et une activité « Amène une amie » destinée aux filles.",
        "Ces liens sont conservés comme archive et peuvent ne plus accepter d’inscriptions."
      ],
      "en": [
        "An earlier AHM Verdun post grouped registration links for several spring activities: U9 full-ice five-on-five, three-on-three for several categories and a girls’ “Bring a friend” activity.",
        "These links are preserved as archive references and may no longer accept registrations."
      ]
    },
    "publishedLabel": {
      "fr": "Archive 2026",
      "en": "2026 archive"
    },
    "author": "AHM Verdun Communication",
    "category": "registration",
    "teamSlugs": [
      "m9",
      "m11",
      "m13",
      "m15",
      "m18",
      "feminin"
    ],
    "season": "2025-2026",
    "sourceUrl": "https://www.ahmverdun.com/news/19",
    "links": [
      {
        "label": {
          "fr": "M9 — 5 contre 5",
          "en": "U9 — 5-on-5"
        },
        "url": "https://page.spordle.com/fr/ahm-de-verdun/register/1f118069-2a00-6926-876f-06b18f5f402f"
      },
      {
        "label": {
          "fr": "M11/M13-M15/M18 — 3 contre 3",
          "en": "U11/U13-U15/U18 — 3-on-3"
        },
        "url": "https://page.spordle.com/fr/ahm-de-verdun/register/1f11808b-81b4-66c8-8676-061589d6f331"
      },
      {
        "label": {
          "fr": "Amène une amie",
          "en": "Bring a friend"
        },
        "url": "https://page.spordle.com/ahm-de-verdun/register/1f118c4e-e91d-6534-b01c-0233802c013f"
      }
    ],
    "contentPending": false
  },
  {
    "legacyId": 4,
    "slug": "equipes-simple-lettre-archive",
    "title": {
      "fr": "Équipes simple lettre",
      "en": "Single-letter teams"
    },
    "excerpt": {
      "fr": "Archive annonçant la formation des équipes simple lettre sous la supervision de l’organisation AHMV.",
      "en": "Archive announcing the formation of AHMV single-letter teams."
    },
    "body": {
      "fr": [
        "Cette publication d’archive annonçait que les équipes simple lettre avaient été formées sous la supervision de Michel Georges et de son équipe.",
        "Elle indiquait que deux ou trois mini-matchs devaient être planifiés par la suite et remerciait les participants pour leur collaboration."
      ],
      "en": [
        "This archive post announced that single-letter teams had been formed under the supervision of Michel Georges and his team.",
        "It said two or three mini-games would be scheduled afterward and thanked participants for their cooperation."
      ]
    },
    "publishedLabel": {
      "fr": "Archive",
      "en": "Archive"
    },
    "author": "AHM Verdun Communication",
    "category": "teams",
    "teamSlugs": [],
    "season": "archive",
    "sourceUrl": "https://www.ahmverdun.com/news/4",
    "contentPending": false
  },
  {
    "legacyId": 2,
    "slug": "inscriptions-2025-2026-archive",
    "title": {
      "fr": "Inscriptions 2025/26",
      "en": "2025/26 registration"
    },
    "excerpt": {
      "fr": "Archive des informations d’inscription 2025-2026 via le système HCR de Hockey Canada.",
      "en": "Archive of 2025–2026 registration information through Hockey Canada’s HCR system."
    },
    "body": {
      "fr": [
        "La publication indiquait que les inscriptions devaient être faites en ligne dans le système d’inscription Hockey Canada (HCR).",
        "Elle visait le groupe M5 pour les joueurs nés en 2021 et 2022, ainsi que les groupes M7 à Junior pour les joueurs nés de 2004 à 2020."
      ],
      "en": [
        "The post said registration was completed online through Hockey Canada’s HCR system.",
        "It covered U5 players born in 2021–2022 and U7 through Junior players born from 2004 through 2020."
      ]
    },
    "publishedLabel": {
      "fr": "Archive 2025",
      "en": "2025 archive"
    },
    "author": "Christian Sigouin",
    "category": "registration",
    "teamSlugs": [
      "m5",
      "m7",
      "m9",
      "m11",
      "m13",
      "m15",
      "m18",
      "junior"
    ],
    "season": "2025-2026",
    "sourceUrl": "https://www.ahmverdun.com/news/2",
    "contentPending": false
  }
];

export const CURRENT_LEGACY_NEWS_IDS = [39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 14] as const;

export function newsDateLabel(article: NewsArticle, lang: "fr" | "en") {
  if (article.date) {
    return new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "America/Toronto",
    }).format(new Date(`${article.date}T12:00:00-04:00`));
  }
  return article.publishedLabel?.[lang] ?? (lang === "fr" ? "Archive AHMV" : "AHMV archive");
}

export const getArticle = (slug: string) => NEWS.find((article) => article.slug === slug);
