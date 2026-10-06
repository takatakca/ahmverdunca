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
    slug: "division-equipes-m11-m13-2026-2027",
    title: {
      fr: "Plus d’inscriptions en M11 et M13 : division des équipes 2026-2027",
      en: "More U11 and U13 registrations: 2026-2027 team split",
    },
    excerpt: {
      fr: "Avec plus d’inscriptions que l’an dernier, le M11 et le M13 comptent chacun 4 équipes : Leafs (A), Broncos et Bulldogs (B), Coyotes (C).",
      en: "With more registrations than last year, U11 and U13 each have 4 teams: Leafs (A), Broncos and Bulldogs (B), Coyotes (C).",
    },
    body: {
      fr: [
        "À titre d'information, cette année nous avons reçu plus d'inscription que l'an dernier dans les catégories M11 et M13.",
        "Nous allons alors, selon les recommandation de Hockey Québec diviser les catégories de la façon suivante :",
        "Pour le M11 il y aura 4 équipes :",
        "1 équipe de M11A = Les Leafs",
        "2 équipes de M11B = Les Broncos et Les Bulldogs",
        "1 équipe de M11C = Les Coyotes",
        "Il y aura un gardien de but par équipes.",
        "Pour le M13 il y aura 4 équipes :",
        "1 équipe de M13A = Les Leafs (1 gardien de but)",
        "2 équipes de M13B = Les Broncos et Les Bulldogs (2 gardiens de but par équipe)",
        "1 équipe de M13C = Les Coyotes (1 gardien de but)",
        "Merci.",
      ],
      en: [
        "For your information, this year we received more registrations than last year in the U11 and U13 categories.",
        "Following Hockey Québec’s recommendations, the categories will be divided as follows:",
        "U11 will have 4 teams:",
        "1 U11A team = Leafs",
        "2 U11B teams = Broncos and Bulldogs",
        "1 U11C team = Coyotes",
        "There will be one goaltender per team.",
        "U13 will have 4 teams:",
        "1 U13A team = Leafs (1 goaltender)",
        "2 U13B teams = Broncos and Bulldogs (2 goaltenders per team)",
        "1 U13C team = Coyotes (1 goaltender)",
        "Thank you.",
      ],
    },
    date: "2026-10-03",
    author: "AHM Verdun",
    category: "teams",
    teamSlugs: ["m11", "m13"],
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid0Ny8TEeVWW7A8oaNiQVptfqYCeskpx4BxeCkruS8nwoguYTg1dLqKd3XMA4kxVHSUl",
    contentPending: false,
  },
  {
    slug: "mise-a-jour-horaire-semaine-29-septembre-2026",
    title: {
      fr: "Mise à jour de l’horaire de la semaine",
      en: "This week’s schedule update",
    },
    excerpt: {
      fr: "L’horaire de cette semaine a été mis à jour.",
      en: "This week’s schedule has been updated.",
    },
    body: {
      fr: ["Voici la mise à jour de l’horaire pour cette semaine."],
      en: ["Here is the updated schedule for this week."],
    },
    date: "2026-09-29",
    author: "AHM Verdun",
    category: "association",
    teamSlugs: [],
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid0MUrSpYFZ5zqLs4HuEkjJgwqy5S16LoQhNEvWnoU3gGs17LuT2Epq1JtNTTMK9yehl",
    links: [{ label: { fr: "Voir les horaires", en: "View schedules" }, url: "https://ahmverdun.ca/horaires" }],
    contentPending: false,
  },
  {
    slug: "horaire-week-end-ajuste-greve-25-septembre-2026",
    title: {
      fr: "Horaire du week-end mis à jour après la grève",
      en: "Weekend schedule updated after the strike",
    },
    excerpt: {
      fr: "L’horaire du week-end a été ajusté : la grève prévue n’a plus lieu. Merci aux bénévoles.",
      en: "The weekend schedule has been adjusted: the planned strike is no longer happening. Thanks to the volunteers.",
    },
    body: {
      fr: [
        "Avis à tous, l’horaire vient d’être mis à jour pour ce week-end sur notre site web. Merci de votre compréhension.",
        "Nous avons essayé de nous ajuster en fonction de la grève qui n’a plus lieu demain.",
        "Merci aux bénévoles d’avoir mis à jour l’horaire.",
        "Bon week-end de hockey!",
      ],
      en: [
        "Notice to all: the schedule has just been updated for this weekend on our website. Thank you for your understanding.",
        "We tried to adjust to the strike, which is no longer taking place tomorrow.",
        "Thanks to the volunteers for updating the schedule.",
        "Have a great hockey weekend!",
      ],
    },
    date: "2026-09-25",
    author: "AHM Verdun",
    category: "cancellations",
    teamSlugs: [],
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid02kPPnc1Lq7RW12JtWKUqVQB6YFhiTmummCqd7GHYvz9xJ75NVTzuAEsTSSRXF2CW3l",
    links: [{ label: { fr: "Voir les horaires", en: "View schedules" }, url: "https://ahmverdun.ca/horaires" }],
    contentPending: false,
  },
  {
    slug: "pratiques-arena-denis-savard-annulees-septembre-2026",
    title: {
      fr: "Pratiques à l’aréna Denis-Savard : toujours annulées",
      en: "Practices at Denis-Savard arena remain cancelled",
    },
    excerpt: {
      fr: "Les pratiques prévues à l’aréna Denis-Savard restent annulées; celles déplacées à Westmount ont lieu à Westmount.",
      en: "Practices scheduled at Denis-Savard arena remain cancelled; practices moved to Westmount take place in Westmount.",
    },
    body: {
      fr: [
        "Avis à tous!",
        "Les pratiques qui avaient lieu ce soir (mardi) à l’aréna Denis Savard restent annulées.",
        "Si votre pratique a été déplacée vers Westmount vous pratiquerez à Westmount.",
        "Pour le 26 septembre, un autre message suivra plus tard cette semaine. Merci.",
      ],
      en: [
        "Notice to all!",
        "Tonight’s (Tuesday) practices at Denis Savard arena remain cancelled.",
        "If your practice was moved to Westmount, you will practice in Westmount.",
        "For September 26, another message will follow later this week. Thank you.",
      ],
    },
    date: "2026-09-25",
    author: "AHM Verdun",
    category: "cancellations",
    teamSlugs: [],
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid0RVabaRbHSoEeuGVHW78hWr6XqCiTwW2geBvGTnCXXxPU8mh9LwQHVs351JyDE6Gwl",
    contentPending: false,
  },
  {
    slug: "125-ans-histoire-hockey-verdun-souvenirs",
    title: {
      fr: "125 ans d’histoire du hockey à Verdun — vos souvenirs font partie de notre histoire!",
      en: "125 years of Verdun hockey history — your memories are part of our history!",
    },
    excerpt: {
      fr: "Exposition historique à l’église Notre-Dame-des-Sept-Douleurs à l’été 2027, revue souvenir, conventum des anciens : l’AHMV recherche vos photos, chandails, trophées et souvenirs.",
      en: "A historical exhibition at Notre-Dame-des-Sept-Douleurs church in summer 2027, a souvenir magazine and an alumni reunion: AHMV is looking for your photos, jerseys, trophies and memories.",
    },
    body: {
      fr: [
        "Un grand projet visant à célébrer 125 ans d’histoire du hockey à Verdun est présentement en préparation!",
        "Cette page sera notamment un lieu de rassemblement où vous pourrez partager vos photos, vos souvenirs, vos anecdotes et vos histoires liés au hockey verdunois à travers les générations.",
        "Plusieurs activités sont prévues pour 2027 : une grande exposition historique réunissant photos, vidéos, objets et artefacts, une revue souvenir, un grand conventum des anciens en juin 2027, ainsi qu’une possible classique hivernale en février.",
        "NOUS SOMMES À LA RECHERCHE DE VOS ARCHIVES!",
        "Vous avez conservé de vieilles photos d’équipes, des chandails, des trophées, des programmes, des articles de journaux, des vidéos, des billets, des rondelles ou tout autre souvenir lié au hockey à Verdun? Nous voulons les découvrir!",
        "N’hésitez pas à communiquer avec moi afin de partager vos photos, vidéos, histoires ou artefacts. Ils pourraient faire partie de la grande exposition qui sera présentée du début juin à la fin août 2027 à l’église Notre-Dame-des-Sept-Douleurs.",
        "Pour l’espace d’un été, ce lieu emblématique de Verdun se transformera en un véritable panthéon du hockey verdunois, où nous raconterons plus d’un siècle de joueurs, d’équipes, de bénévoles, de familles, de rivalités, de victoires et surtout… de souvenirs.",
        "Parce que l’histoire du hockey à Verdun ne se trouve pas seulement dans les archives. Elle se trouve aussi dans vos albums photos, vos sous-sols, vos vieilles boîtes… et dans vos souvenirs.",
        "125 ans de hockey. Une fierté qui traverse les générations.",
        "Jean-François Guay, président AHMV, concepteur 125 ans d’histoire du hockey à Verdun",
      ],
      en: [
        "A major project celebrating 125 years of hockey history in Verdun is now in preparation!",
        "This page will be a gathering place where you can share your photos, memories, anecdotes and stories about Verdun hockey across generations.",
        "Several activities are planned for 2027: a large historical exhibition of photos, videos, objects and artifacts, a souvenir magazine, a big alumni reunion in June 2027, and a possible winter classic in February.",
        "WE ARE LOOKING FOR YOUR ARCHIVES!",
        "Have you kept old team photos, jerseys, trophies, programs, newspaper articles, videos, tickets, pucks or any other memento of hockey in Verdun? We want to discover them!",
        "Don’t hesitate to contact me to share your photos, videos, stories or artifacts. They could become part of the large exhibition presented from early June to late August 2027 at Notre-Dame-des-Sept-Douleurs church.",
        "For one summer, this iconic Verdun landmark will become a true hall of fame of Verdun hockey, telling more than a century of players, teams, volunteers, families, rivalries, victories and above all… memories.",
        "Because the history of hockey in Verdun isn’t only found in archives. It’s also in your photo albums, your basements, your old boxes… and your memories.",
        "125 years of hockey. A pride shared across generations.",
        "Jean-François Guay, AHMV President, creator of 125 years of Verdun hockey history",
      ],
    },
    date: "2026-09-20",
    author: "Jean-François Guay",
    category: "association",
    teamSlugs: [],
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid03JeYcBo5Y1QsVdeVCib1Sv3wmsY2RawTwUoSJ2sRsje6NcmtJRo8KpchnBcbDPe3l",
    contentPending: false,
  },
  {
    slug: "derniere-chance-equipes-feminines-m12-septembre-2026",
    title: {
      fr: "Dernière chance — équipes féminines M12",
      en: "Last call — U12 girls teams",
    },
    excerpt: {
      fr: "Archive de l’appel lancé pour compléter les équipes féminines M12A et M12B avec des joueuses et gardiennes nées en 2015, 2016 ou 2017.",
      en: "Archive of the call to complete the U12A and U12B girls teams with players and goaltenders born in 2015, 2016 or 2017.",
    },
    body: {
      fr: [
        "DERNIÈRE CHANCE – ÉQUIPES FÉMININES M12!",
        "Nous recherchons encore des joueuses et gardiennes de but pour compléter nos deux équipes féminines M12A et M12B!",
        "Filles nées en 2015, 2016 ou 2017.",
        "Date limite : mercredi 23 septembre 2026.",
        "Inscription : lien Spordle ci-dessous.",
        "Pour plus d’informations : hockeyfeminin@ahmverdun.com",
      ],
      en: [
        "LAST CHANCE – U12 GIRLS TEAMS!",
        "We are still looking for players and goaltenders to complete our two U12A and U12B girls teams!",
        "Girls born in 2015, 2016 or 2017.",
        "Deadline: Wednesday, September 23, 2026.",
        "Registration: Spordle link below.",
        "For more information: hockeyfeminin@ahmverdun.com",
      ],
    },
    date: "2026-09-21",
    author: "AHM Verdun",
    category: "feminine",
    teamSlugs: ["feminin"],
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/photo/?fbid=1696451942490735&set=a.493518682784073",
    links: [
      {
        label: { fr: "Inscription Spordle — archive", en: "Spordle registration — archive" },
        url: "https://page.spordle.com/fr/ahm-de-verdun/register/1f174f6f-0db7-6bea-81df-0670a2751aa1",
      },
    ],
    contentPending: false,
  },
  {
    slug: "scotty-bowman-93-ans",
    title: { fr: "Joyeux 93e anniversaire, Scotty Bowman!", en: "Happy 93rd birthday, Scotty Bowman!" },
    excerpt: {
      fr: "L’AHMV souhaite un joyeux anniversaire à Scotty Bowman, un des grands bâtisseurs du hockey à Verdun et à l’international.",
      en: "AHMV wishes a happy birthday to Scotty Bowman, one of the great builders of hockey in Verdun and around the world.",
    },
    body: {
      fr: [
        "Aujourd’hui, nous désirons souhaiter un joyeux anniversaire à un des grands bâtisseurs du hockey à Verdun et à l’international.",
        "Scotty Bowman, 93 ans! Merci Scotty!",
      ],
      en: [
        "Today we want to wish a happy birthday to one of the great builders of hockey in Verdun and internationally.",
        "Scotty Bowman, 93 years old! Thank you, Scotty!",
      ],
    },
    date: "2026-09-18",
    author: "AHM Verdun",
    category: "association",
    teamSlugs: [],
    image: "/news-media/facebook/scotty-bowman-93-ans.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/photo/?fbid=1693042152831714&set=a.493518679450740",
    contentPending: false,
  },
  {
    slug: "benevoles-portes-ouvertes-hockey-feminin-septembre-2026",
    title: { fr: "Bénévoles recherchés pour la journée portes ouvertes", en: "Volunteers needed for the open house" },
    excerpt: {
      fr: "Quatre bénévoles demandés dimanche : 2 à l’accueil et 2 pour distribuer l’équipement.",
      en: "Four volunteers needed on Sunday: 2 at the welcome desk and 2 to hand out equipment.",
    },
    body: {
      fr: [
        "Nous avons besoins de quelques bénévoles ce dimanche pour que l’activité se déroule plus facilement.",
        "Soit 2 personnes à l’accueil et 2 personnes pour aider à distribuer les équipements.",
        "Si vous voulez nous aider, envoyer nous votre nom. Merci!",
      ],
      en: [
        "We need a few volunteers this Sunday so the activity runs more smoothly.",
        "Either 2 people at the welcome desk and 2 people to help hand out equipment.",
        "If you would like to help, send us your name. Thank you!",
      ],
    },
    date: "2026-09-11",
    author: "AHM Verdun",
    category: "feminine",
    teamSlugs: ["feminin"],
    image: "/news-media/facebook/portes-ouvertes-feminin-affiche.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid0RxSokHFqpj7p97suUB68G1PRewjvhbqMXpB8zusEKubstqEsT7PYCYJ4yqX2sWW2l",
    contentPending: false,
  },
  {
    slug: "rencontre-anthony-lapointe-arbitre-lnh",
    title: { fr: "Rencontre avec Anthony Lapointe, arbitre dans la LNH", en: "Meeting Anthony Lapointe, NHL official" },
    excerpt: {
      fr: "Le président de l’AHMV a rencontré Anthony Lapointe, un petit gars de chez nous maintenant arbitre dans la LNH.",
      en: "The AHMV president met Anthony Lapointe, a local kid who is now an NHL official.",
    },
    body: {
      fr: [
        "C’est un privilège en tant qu’arbitre pour la région du Lac St-Louis et Président de l’AMHV, de rencontrer ce matin Anthony Lapointe qui est maintenant rendu arbitre dans la LNH.",
        "Un petit gars de chez nous avec un parcours inspirant. Bonne chance Anthony!",
      ],
      en: [
        "As a referee for the Lac St-Louis region and President of AHMV, it was a privilege to meet Anthony Lapointe this morning, who is now an official in the NHL.",
        "A local kid with an inspiring journey. Good luck, Anthony!",
      ],
    },
    date: "2026-09-04",
    author: "Jean-François Guay",
    category: "association",
    teamSlugs: [],
    image: "/news-media/facebook/rencontre-anthony-lapointe.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid02LjAjfV6e9dCVkJTPPe9Vchx7wsr5JurKmdF8KgA5K5zV81czrxQKUeUbxJAH8ZPkl",
    contentPending: false,
  },
  {
    slug: "horaire-semaine-7-13-septembre-2026",
    title: { fr: "Horaire de la semaine du 7 au 13 septembre publié", en: "Schedule for September 7–13 published" },
    excerpt: {
      fr: "L’horaire de la semaine du 7 au 13 septembre est publié.",
      en: "The schedule for the week of September 7 to 13 is published.",
    },
    body: {
      fr: ["L’horaire de la semaine du 7 au 13 septembre est publié. Rendez-vous sur la page des horaires pour les détails."],
      en: ["The schedule for the week of September 7 to 13 is published. See the schedules page for details."],
    },
    date: "2026-08-27",
    author: "AHM Verdun",
    category: "association",
    teamSlugs: [],
    image: "/news-media/facebook/horaire-7-13-septembre.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/photo/?fbid=1670545451748051&set=a.493518682784073",
    links: [{ label: { fr: "Voir les horaires", en: "View schedules" }, url: "https://ahmverdun.ca/horaires" }],
    contentPending: false,
  },
  {
    slug: "saison-debute-8-septembre-horaire-hebdomadaire",
    title: { fr: "La saison devrait débuter le 8 septembre", en: "The season should start on September 8" },
    excerpt: {
      fr: "Consultez le site web pour l’horaire hebdomadaire; il sera mis à jour et publié dans les prochains jours.",
      en: "Check the website for the weekly schedule; it will be updated and published in the coming days.",
    },
    body: {
      fr: [
        "Chers parents, à titre d'information, vous devez consulter notre site web pour l'horaire hebdomadaire.",
        "La saison devrait débuter le 8 septembre.",
        "Nous serons en mesure d'ici les prochains jours de mettre à jour l'horaire et de le publier. Merci.",
      ],
      en: [
        "Dear parents, for your information, please check our website for the weekly schedule.",
        "The season should start on September 8.",
        "Within the next few days we will update and publish the schedule. Thank you.",
      ],
    },
    date: "2026-08-26",
    author: "AHM Verdun",
    category: "association",
    teamSlugs: [],
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid0UhZiVZuUTRrzSXBTRNKzz7opCLXncn5spWbkPkY2URK1QkeTKwUK6is6bod332bzl",
    links: [{ label: { fr: "Voir les horaires", en: "View schedules" }, url: "https://ahmverdun.ca/horaires" }],
    contentPending: false,
  },
  {
    slug: "hockey-feminin-affiche-svp-partagez",
    title: { fr: "Hockey féminin : joueuses de tout niveau bienvenues — partagez!", en: "Girls hockey: players of all levels welcome — please share!" },
    excerpt: {
      fr: "M9F, M12F et M15F : équipement prêté, journée portes ouvertes gratuite le 13 septembre. SVP partagez dans votre réseau!",
      en: "U9F, U12F and U15F: equipment can be lent, free open house on September 13. Please share with your network!",
    },
    body: {
      fr: [
        "SVP partagez dans votre réseau!",
        "Sur l’affiche : joueuses de tout niveau bienvenues — M9F (2018-2019), M12F (2015-2016-2017) et M15F (2012-2013-2014). L’équipement peut être prêté.",
        "Viens essayer! Journée portes ouvertes le 13 septembre de 10 h à 12 h, gratuite, inscription requise.",
        "Pour toute information : hockeyfeminin@ahmverdun.com",
      ],
      en: [
        "Please share with your network!",
        "On the poster: players of all levels welcome — U9F (2018-2019), U12F (2015-2016-2017) and U15F (2012-2013-2014). Equipment can be lent.",
        "Come try it! Open house on September 13 from 10 a.m. to noon, free, registration required.",
        "For any information: hockeyfeminin@ahmverdun.com",
      ],
    },
    date: "2026-08-26",
    author: "AHM Verdun",
    category: "feminine",
    teamSlugs: ["feminin"],
    image: "/news-media/facebook/feminin-affiche-partage.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/photo/?fbid=1670185541784042&set=a.493518679450740",
    contentPending: false,
  },
  {
    slug: "offre-emploi-prepose-equipement-partenaire",
    title: { fr: "Offre d’emploi : préposé à l’équipement", en: "Job offer: equipment attendant" },
    excerpt: {
      fr: "Un partenaire de l’AHMV cherche un préposé à l’équipement.",
      en: "An AHMV partner is looking for an equipment attendant.",
    },
    body: {
      fr: [
        "Un de nos partenaires cherche un préposé à l'équipement. Voici l'offre d'emploi.",
        "Les détails du poste figurent sur l’affiche.",
      ],
      en: [
        "One of our partners is looking for an equipment attendant. Here is the job offer.",
        "The job details are on the poster.",
      ],
    },
    date: "2026-08-26",
    author: "AHM Verdun",
    category: "association",
    teamSlugs: [],
    image: "/news-media/facebook/offre-emploi-prepose-equipement.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid02Bc9wMmAM8EXh1CuKjEPSNBjBo1728C1yZSCfo1fw25nDPCXWUV9XEWbKr62612sul",
    contentPending: false,
  },
  {
    slug: "sheldon-hills-lefebvre-grenadiers-m17-aaa",
    title: { fr: "Félicitations à Sheldon Hills Lefebvre!", en: "Congratulations to Sheldon Hills Lefebvre!" },
    excerpt: {
      fr: "Ancien gardien de but de l’AHMV, Sheldon Hills Lefebvre garde maintenant les buts des Grenadiers du Lac St-Louis M17-AAA.",
      en: "Former AHMV goaltender Sheldon Hills Lefebvre now plays goal for the Lac St-Louis Grenadiers U17 AAA.",
    },
    body: {
      fr: [
        "Félicitations à Sheldon Hills Lefebvre, ancien gardien de but à l’AMHV, pour son poste de gardien de but au sein de l’équipe M17-AAA, Midget espoirs, chez les Grenadiers du Lac St-Louis.",
        "Bonne saison!",
      ],
      en: [
        "Congratulations to Sheldon Hills Lefebvre, a former AHMV goaltender, on earning a goaltender spot with the U17 AAA Midget Espoirs team of the Lac St-Louis Grenadiers.",
        "Have a great season!",
      ],
    },
    date: "2026-08-25",
    author: "AHM Verdun",
    category: "association",
    teamSlugs: [],
    image: "/news-media/facebook/sheldon-hills-lefebvre.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid0tckaK6BtSwtG5iu1di1J3zcki8d2cU6ThQmRnJwQ2hRMSzxfkc8qb1R2SbJ8paZcl",
    contentPending: false,
  },
  {
    slug: "saison-hockey-feminin-recrutement-m7-m18",
    title: { fr: "La saison de hockey féminin arrive à grands pas!", en: "Girls hockey season is just around the corner!" },
    excerpt: {
      fr: "Recrutement de joueuses de M7 à M18 : objectif de former des équipes féminines M9, M12 et M15.",
      en: "Recruiting players from U7 to U18, with the goal of forming U9, U12 and U15 girls teams.",
    },
    body: {
      fr: [
        "Hey les filles, venez en grand nombre! C’est le moment idéal de joindre une équipe, de développer vos habiletés, de créer des amitiés et surtout d’avoir du plaisir sur la glace!",
        "Les inscriptions sont ouvertes et nous sommes en plein recrutement de joueuses de M7 à M18 pour la prochaine saison de hockey féminin à Verdun!",
        "Notre grand objectif cette année : rassembler suffisamment de joueuses pour former des équipes féminines, avec de grands espoirs de créer des équipes M9, M12 et M15!",
        "Détails pour les inscriptions : pour les joueuses M9F et M12F, l’inscription se fait directement dans la catégorie féminine.",
        "Pour les joueuses des autres catégories, inscrivez-vous d’abord dans le hockey mixte selon votre année de naissance. Des équipes féminines seront ensuite formées selon le nombre d’inscriptions reçues.",
        "Au plaisir de vous retrouver sur la glace très bientôt!",
      ],
      en: [
        "Hey girls, come out in large numbers! It’s the perfect time to join a team, develop your skills, make friends and above all have fun on the ice!",
        "Registration is open and we are recruiting players from U7 to U18 for the next girls hockey season in Verdun!",
        "Our big goal this year: bring together enough players to form girls teams, with high hopes of creating U9, U12 and U15 teams!",
        "Registration details: U9F and U12F players register directly in the girls category.",
        "Players in other categories should first register in mixed hockey by birth year. Girls teams will then be formed based on the number of registrations.",
        "Looking forward to seeing you on the ice very soon!",
      ],
    },
    date: "2026-08-24",
    author: "AHM Verdun",
    category: "feminine",
    teamSlugs: ["feminin"],
    image: "/news-media/facebook/saison-hockey-feminin-recrutement.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid0fRBuR9rejkcvkEcYJ4hDp2VD7YLZRLmUZv5CsAXCbHzgCEgovhKnKzmifvwCK98al",
    links: [{ label: { fr: "S’inscrire sur Spordle", en: "Register on Spordle" }, url: "https://page.spordle.com/fr/ahm-de-verdun/register" }],
    contentPending: false,
  },
  {
    slug: "horaire-camp-entrainement-chacals-2026",
    title: { fr: "Horaire du camp d’entraînement des Chacals", en: "Chacals training camp schedule" },
    excerpt: {
      fr: "L’horaire du camp d’entraînement des Chacals, par catégorie. Début le 29 août.",
      en: "The Chacals training camp schedule by category. Starts August 29.",
    },
    body: {
      fr: ["Voici l'horaire pour les différentes catégories du camp d'entraînement pour les Chacals. Ça débute le 29 août."],
      en: ["Here is the schedule for the different categories of the Chacals training camp. It starts on August 29."],
    },
    date: "2026-08-23",
    author: "AHM Verdun",
    category: "teams",
    teamSlugs: [],
    image: "/news-media/facebook/camp-chacals-horaire.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/photo/?fbid=1666841035451826&set=a.493518682784073",
    contentPending: false,
  },
  {
    slug: "inscriptions-vont-bien-2026-2027",
    title: { fr: "Nos inscriptions vont bien pour 2026-2027!", en: "Registration for 2026-27 is going well!" },
    excerpt: {
      fr: "Les inscriptions avancent bien; certains programmes de subventions peuvent aider les familles.",
      en: "Registration is going well; some subsidy programs can help families.",
    },
    body: {
      fr: [
        "Nos inscriptions vont bien pour la prochaine saison! N’hésitez pas! Certains programmes de subventions peuvent également aider. Visitez notre site web.",
        "ALERTE INSCRIPTION 2026-27 — La prochaine saison approche à grands pas! Les inscriptions pour la saison 2026-2027 débuteront le 1er juillet.",
        "Ne manquez pas votre chance d’assurer la place de votre enfant pour une autre saison de hockey, de plaisir et de développement!",
        "Visitez notre site Web dès le 1er juillet et inscrivez-vous rapidement — les places sont limitées!",
      ],
      en: [
        "Registration for next season is going well! Don’t hesitate! Some subsidy programs can also help. Visit our website.",
        "REGISTRATION ALERT 2026–27 — A new season is just around the corner! Registration for the 2026–27 season opens on July 1st.",
        "Don’t miss your chance to secure your child’s spot for another exciting season of hockey, fun, and development!",
        "Visit our website on July 1st and register right away — spots are limited!",
      ],
    },
    date: "2026-07-31",
    author: "AHM Verdun",
    category: "registration",
    teamSlugs: [],
    image: "/news-media/facebook/inscriptions-2026-2027-alerte.jpg",
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun/posts/pfbid02RbFv1jwQHXvE5v5RquF8PvNkmgatfNWU7RuMhztWhaFrhGJanLngfJvzjT7EB346l",
    links: [{ label: { fr: "Inscription", en: "Registration" }, url: "https://ahmverdun.ca/inscriptions" }],
    contentPending: false,
  },
  {
    slug: "pratique-junior-annulee-dollard-saint-laurent",
    title: { fr: "Dernière minute : pratique Junior annulée", en: "Last minute: Junior practice cancelled" },
    excerpt: {
      fr: "La pratique Junior prévue de 20 h 30 à 22 h à Dollard-Saint-Laurent a été annulée.",
      en: "The Junior practice scheduled from 8:30 to 10 p.m. at Dollard-Saint-Laurent was cancelled.",
    },
    body: {
      fr: ["DERNIÈRE MINUTE : la pratique Junior de ce soir prévue de 20 h 30 à 22 h à Dollard Saint-Laurent est annulée."],
      en: ["LAST MINUTE: tonight’s Junior practice scheduled from 8:30 to 10 p.m. at Dollard Saint-Laurent is cancelled."],
    },
    publishedLabel: { fr: "Septembre 2026", en: "September 2026" },
    author: "AHM Verdun",
    category: "cancellations",
    teamSlugs: ["junior"],
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun",
    contentPending: false,
  },
  {
    slug: "attribution-groupes-camp-chacals-wllv",
    title: { fr: "Camp des Chacals : attribution des groupes", en: "Chacals camp: group assignments" },
    excerpt: {
      fr: "L’attribution des groupes du camp d’entraînement des Chacals de la WLLV est publiée, par catégorie.",
      en: "Group assignments for the WLLV Chacals training camp are published, by category.",
    },
    body: {
      fr: ["Voici le lien pour consulter, par catégories (onglet en bas de page), l'attribution des groupes pour le camp d'entraînement des Chacals de WLLV."],
      en: ["Here is the link to view, by category (tab at the bottom of the page), the group assignments for the WLLV Chacals training camp."],
    },
    publishedLabel: { fr: "Fin août 2026", en: "Late August 2026" },
    author: "AHM Verdun",
    category: "teams",
    teamSlugs: [],
    season: "2026-2027",
    sourceUrl: "https://www.facebook.com/AHMVerdun",
    links: [{ label: { fr: "Site de la WLLV", en: "WLLV website" }, url: "https://www.wllv.org/" }],
    contentPending: false,
  },
  {
    "legacyId": 39,
    "slug": "annulations-22-26-septembre-2026",
    "image": "/news-media/facebook/annulations-greve-22-26-septembre.jpg",
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
    "image": "/news-media/facebook/debut-de-saison-m5-m7.jpg",
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
    "image": "/news-media/facebook/academie-ahmv-bourses-2026.jpg",
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
    "image": "/news-media/facebook/petition-heures-de-glace.jpg",
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
    "image": "/news-media/facebook/feminin-affiche-partage.jpg",
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
  },
{
  "legacyId": 20,
  "slug": "aga-2026-archive",
  "title": {
    "fr": "AGA 2026",
    "en": "2026 Annual General Meeting"
  },
  "excerpt": {
    "fr": "Archive de l’avis d’assemblée générale annuelle du 8 mai 2026 à l’Auditorium de Verdun.",
    "en": "Archive of the May 8, 2026 Annual General Meeting notice at the Verdun Auditorium."
  },
  "body": {
    "fr": [
      "L’AHM Verdun annonçait son assemblée générale annuelle le 8 mai 2026 à 19 h, à l’Auditorium de Verdun.",
      "Les postes de président et de directeur des opérations étaient annoncés en élection. La date limite de dépôt des candidatures était le 24 avril à minuit.",
      "Selon l’avis publié, les candidats à ces postes devaient être des membres individuels âgés d’au moins 18 ans et avoir été membre, entraîneur, gérant d’équipe ou membre associé de l’AHMV pendant au moins trois ans au cours des six années précédentes."
    ],
    "en": [
      "AHM Verdun announced its Annual General Meeting for May 8, 2026 at 7 p.m. at the Verdun Auditorium.",
      "The president and director of operations positions were announced for election. The nomination deadline was April 24 at midnight.",
      "According to the published notice, candidates had to be individual members at least 18 years old and have served as a member, coach, team manager or associate member of AHMV for at least three of the previous six years."
    ]
  },
  "publishedLabel": {
    "fr": "Printemps 2026",
    "en": "Spring 2026"
  },
  "author": "AHM Verdun Communication",
  "category": "association",
  "teamSlugs": [],
  "season": "2025-2026",
  "sourceUrl": "https://www.ahmverdun.com/news/20",
  "contentPending": false
},
{
  "legacyId": 18,
  "slug": "3-contre-3-archive",
  "title": {
    "fr": "3 contre 3 — archive",
    "en": "3-on-3 — archive"
  },
  "excerpt": {
    "fr": "Archive de l’annonce de hockey 3 contre 3 avec plages M11, M13 et M15/M18.",
    "en": "Archive of the 3-on-3 hockey announcement for U11, U13 and U15/U18."
  },
  "body": {
    "fr": [
      "Cette publication d’archive annonçait un début le mardi 5 mai.",
      "Les plages indiquées étaient 18 h à 19 h pour M11, 19 h à 20 h pour M13 et 20 h à 21 h pour M15/M18."
    ],
    "en": [
      "This archive post announced a start on Tuesday, May 5.",
      "Published times were 6–7 p.m. for U11, 7–8 p.m. for U13 and 8–9 p.m. for U15/U18."
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
  "sourceUrl": "https://www.ahmverdun.com/news/18",
  "contentPending": false
},
{
  "legacyId": 16,
  "slug": "camp-hockey-a3-ete-2026-archive",
  "title": {
    "fr": "Camp de Hockey A3 — été 2026",
    "en": "A3 Hockey Camp — summer 2026"
  },
  "excerpt": {
    "fr": "Archive proposant les camps A3 Hockey à Westmount et au Lower Canada College pendant l’absence du camp d’été à Verdun.",
    "en": "Archive pointing families to A3 Hockey camps in Westmount and at Lower Canada College while Verdun’s summer camp was unavailable."
  },
  "body": {
    "fr": [
      "L’AHM Verdun indiquait que son camp de hockey à Verdun ne serait pas offert durant l’été 2026 et proposait comme solution de remplacement les programmes d’A3 Hockey.",
      "Les camps annoncés devaient se tenir au Centre des loisirs de Westmount et au Lower Canada College, sous la supervision d’Alexandre Dandenault, copropriétaire d’A3 Hockey.",
      "Les dates publiées étaient : du 29 juin au 3 juillet 2026 pour un groupe féminin seulement, puis du 6 au 10 juillet, du 13 au 17 juillet, du 20 au 24 juillet et du 27 au 31 juillet 2026."
    ],
    "en": [
      "AHM Verdun stated that its Verdun hockey camp would not be offered in summer 2026 and suggested A3 Hockey programs as a nearby alternative.",
      "The announced camps were to run at the Westmount Recreation Centre and Lower Canada College under the supervision of A3 Hockey co-owner Alexandre Dandenault.",
      "Published dates were June 29–July 3, 2026 for a girls-only group, then July 6–10, July 13–17, July 20–24 and July 27–31, 2026."
    ]
  },
  "publishedLabel": {
    "fr": "Printemps 2026",
    "en": "Spring 2026"
  },
  "author": "AHM Verdun Communication",
  "category": "camps",
  "teamSlugs": [],
  "season": "2025-2026",
  "sourceUrl": "https://www.ahmverdun.com/news/16",
  "contentPending": false
},
{
  "legacyId": 15,
  "slug": "cabane-panache-2026-archive",
  "title": {
    "fr": "Cabane Panache 2026 — appel aux bénévoles",
    "en": "Cabane Panache 2026 — volunteer call"
  },
  "excerpt": {
    "fr": "Archive d’un appel aux bénévoles pour Cabane Panache, du 19 au 22 mars 2026 sur la rue Wellington.",
    "en": "Archive of a volunteer call for Cabane Panache, March 19–22, 2026 on Wellington Street."
  },
  "body": {
    "fr": [
      "L’AHM Verdun avait relayé un appel de Cabane Panache pour recruter des bénévoles à l’occasion de la 14e édition du festival, du jeudi 19 au dimanche 22 mars 2026 sur la rue Wellington à Verdun.",
      "L’annonce décrivait un événement gratuit accessible par le métro De l’Église, avec concerts, restauration, tire d’érable, jeux et animations.",
      "Les postes mentionnés comprenaient notamment l’accueil et l’information, l’animation de jeux, l’entretien du site, l’escouade écoresponsable, le soutien à la programmation, la photographie et le soutien au quartier général.",
      "L’annonce indiquait aussi des avantages pour les bénévoles et renvoyait vers le site de Promenade Wellington et un formulaire de candidature."
    ],
    "en": [
      "AHM Verdun relayed a Cabane Panache volunteer call for the festival’s 14th edition, March 19–22, 2026 on Wellington Street in Verdun.",
      "The notice described a free event accessible from De l’Église metro, with concerts, food, maple taffy, games and activities.",
      "Volunteer roles included welcome and information, games, site maintenance, an eco team, programming assistance, photography and headquarters support.",
      "The notice also described volunteer benefits and linked to Promenade Wellington and an application form."
    ]
  },
  "publishedLabel": {
    "fr": "Mars 2026",
    "en": "March 2026"
  },
  "author": "AHM Verdun Communication",
  "category": "association",
  "teamSlugs": [],
  "season": "2025-2026",
  "sourceUrl": "https://www.ahmverdun.com/news/15",
  "links": [
    {
      "label": {
        "fr": "Cabane Panache — bénévolat",
        "en": "Cabane Panache — volunteering"
      },
      "url": "https://www.promenadewellington.com/fr/evenement/cabane-panache-14e-edition/#benevolat"
    },
    {
      "label": {
        "fr": "Formulaire de candidature",
        "en": "Volunteer application form"
      },
      "url": "https://forms.gle/jBotUaVdLMvjN6Ka7"
    },
    {
      "label": {
        "fr": "Aperçu vidéo",
        "en": "Video preview"
      },
      "url": "https://www.youtube.com/watch?v=jCLHmK9C5Dw"
    }
  ],
  "contentPending": false
},
{
  "legacyId": 9,
  "slug": "festival-magh-archive",
  "title": {
    "fr": "Festival MAGH — archive",
    "en": "MAGH Festival — archive"
  },
  "excerpt": {
    "fr": "Archive d’un appel à une équipe MAGH 2 pour participer au Festival MAGH.",
    "en": "Archive of a call for a MAGH 2 team to participate in the MAGH Festival."
  },
  "body": {
    "fr": [
      "L’association recherchait une équipe MAGH 2 pour son Festival MAGH annoncé les 10 et 11 janvier.",
      "La publication consultée ne précisait pas l’année dans son texte; cette archive conserve donc l’information telle qu’elle était publiée sans en déduire une date complète."
    ],
    "en": [
      "The association was looking for a MAGH 2 team for its MAGH Festival announced for January 10 and 11.",
      "The archived post did not specify the year in its text, so this record preserves the published information without inferring a complete date."
    ]
  },
  "publishedLabel": {
    "fr": "Archive",
    "en": "Archive"
  },
  "author": "AHM Verdun Communication",
  "category": "tournaments",
  "teamSlugs": [
    "m7"
  ],
  "season": "archive",
  "sourceUrl": "https://www.ahmverdun.com/news/9",
  "contentPending": false
},
{
  "legacyId": 3,
  "slug": "journee-portes-ouvertes-hockey-feminin-archive",
  "title": {
    "fr": "Journée porte ouverte hockey féminin — archive",
    "en": "Girls’ hockey open house — archive"
  },
  "excerpt": {
    "fr": "Archive remerciant les participantes, familles, entraîneurs et joueuses des Stingers de Concordia après une deuxième journée portes ouvertes.",
    "en": "Archive thanking participants, families, coaches and Concordia Stingers players after a second girls’ hockey open house."
  },
  "body": {
    "fr": [
      "Cette publication remerciait les joueuses, les parents, les entraîneurs ainsi que les joueuses des Stingers de Concordia pour leur participation à la deuxième journée portes ouvertes de hockey féminin.",
      "Pour obtenir de l’information sur le programme de hockey féminin, l’AHMV dirigeait les familles vers hockeyfeminin@ahmverdun.com."
    ],
    "en": [
      "This post thanked players, parents, coaches and Concordia Stingers players for participating in the second girls’ hockey open house.",
      "For information about the girls’ hockey program, AHMV directed families to hockeyfeminin@ahmverdun.com."
    ]
  },
  "publishedLabel": {
    "fr": "Archive 2026",
    "en": "2026 archive"
  },
  "author": "Jean-Francois Auger",
  "category": "feminine",
  "teamSlugs": [
    "feminin"
  ],
  "season": "2025-2026",
  "sourceUrl": "https://www.ahmverdun.com/news/3",
  "contentPending": false
}
,
{
  "slug": "30e-tournoi-atome-m11-verdun-2027",
  "title": {
    "fr": "30e édition du Tournoi Atome de Verdun — M11",
    "en": "30th Verdun Atom Tournament — U11"
  },
  "excerpt": {
    "fr": "La 30e édition du Tournoi Atome de Verdun est annoncée du 18 au 31 janvier 2027 à l’Auditorium de Verdun.",
    "en": "The 30th Verdun Atom Tournament is announced for January 18–31, 2027 at the Verdun Auditorium."
  },
  "body": {
    "fr": [
      "L’Association du hockey mineur de Verdun prépare la 30e édition de son Tournoi Atome M11, un rendez-vous historique du hockey mineur verdunois.",
      "L’événement est annoncé du 18 au 31 janvier 2027 à l’Auditorium de Verdun. Les informations sportives, inscriptions et mises à jour officielles demeurent accessibles par les liens du tournoi.",
      "Cette édition s’inscrit dans une volonté de mettre en valeur l’histoire du hockey à Verdun et de rassembler les familles, bénévoles, partenaires et anciennes générations autour du hockey mineur."
    ],
    "en": [
      "Verdun Minor Hockey Association is preparing the 30th edition of its U11 Atom Tournament, a historic Verdun minor-hockey event.",
      "The event is announced for January 18–31, 2027 at the Verdun Auditorium. Official sport information, registration and updates remain available through the tournament links.",
      "This edition is part of an effort to celebrate Verdun hockey history and bring together families, volunteers, partners and past generations."
    ]
  },
  "publishedLabel": { "fr": "Saison 2026-2027", "en": "2026-2027 season" },
  "author": "AHM Verdun Communication",
  "category": "tournaments",
  "teamSlugs": ["m11"],
  "season": "2026-2027",
  "contentPending": false
},
{
  "slug": "hockey-feminin-m9f-m12f-m15f-2026-2027",
  "title": {
    "fr": "Hockey féminin — joueuses de tout niveau bienvenues",
    "en": "Girls hockey — players of all levels welcome"
  },
  "excerpt": {
    "fr": "L’AHMV présente ses catégories M9F, M12F et M15F et invite les jeunes joueuses à découvrir le hockey féminin à Verdun.",
    "en": "AHMV presents its U9F, U12F and U15F categories and invites young players to discover girls hockey in Verdun."
  },
  "body": {
    "fr": [
      "Le programme féminin de l’AHM Verdun accueille des joueuses de tous les niveaux dans les catégories M9F, M12F et M15F pour la saison 2026-2027.",
      "L’association indique que de l’équipement peut être prêté et met l’accent sur une première expérience simple et accueillante pour les nouvelles joueuses.",
      "Une journée portes ouvertes a été annoncée le 13 septembre 2026. Cette date est maintenant conservée comme archive; les inscriptions de saison demeurent accessibles par les canaux officiels."
    ],
    "en": [
      "AHM Verdun’s girls program welcomes players of all levels in U9F, U12F and U15F for the 2026-2027 season.",
      "The association indicates that equipment may be available to borrow and emphasizes an easy, welcoming first experience for new players.",
      "An open house was announced for September 13, 2026. That date is now preserved as an archive; season registration remains available through official channels."
    ]
  },
  "publishedLabel": { "fr": "Septembre 2026 — archive", "en": "September 2026 — archive" },
  "author": "AHM Verdun Communication",
  "category": "feminine",
  "teamSlugs": ["feminin"],
  "season": "2026-2027",
  "contentPending": false
},
{
  "slug": "relance-ahmv-enjeu-couts-glace-2026",
  "title": {
    "fr": "Relance de l’AHMV et enjeu des coûts de glace",
    "en": "AHMV relaunch and the challenge of ice-time costs"
  },
  "excerpt": {
    "fr": "L’AHMV présente ses projets 2026-2027 tout en attirant l’attention sur un modèle de facturation des installations qu’elle juge difficilement soutenable.",
    "en": "AHMV presents its 2026-2027 projects while drawing attention to a facility-cost model it considers difficult to sustain."
  },
  "body": {
    "fr": [
      "Avec près de 300 joueurs et joueuses, l’AHMV amorce la saison 2026-2027 avec plusieurs projets visant à redonner au hockey mineur une place forte dans la vie sportive de Verdun.",
      "Parmi les projets présentés figurent la nouvelle structure de catégories, la 30e édition du Tournoi Atome M11 et le développement de collaborations de formation et d’accompagnement.",
      "L’association affirme toutefois que les coûts de location des patinoires représentent un enjeu majeur. Les montants cités dans le communiqué sont ceux avancés par l’AHMV et sont présentés comme tels.",
      "L’AHMV souhaite ouvrir une discussion collective sur la place accordée au sport amateur, aux organismes bénévoles et aux infrastructures sportives à Verdun."
    ],
    "en": [
      "With nearly 300 players, AHMV begins the 2026-2027 season with several projects intended to strengthen minor hockey’s role in Verdun.",
      "Projects presented include the new category structure, the 30th U11 Atom Tournament and development of training and support partnerships.",
      "The association also says rink-rental costs are a major challenge. Any amounts cited in the release are AHMV’s published figures and are presented as such.",
      "AHMV wants a broader community discussion about amateur sport, volunteer organizations and sport infrastructure in Verdun."
    ]
  },
  "publishedLabel": { "fr": "Automne 2026", "en": "Fall 2026" },
  "author": "AHM Verdun Communication",
  "category": "releases",
  "teamSlugs": [],
  "season": "2026-2027",
  "contentPending": false
}

];

export const CURRENT_LEGACY_NEWS_IDS = [39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 14] as const;
export const DISCOVERED_ARCHIVE_NEWS_IDS = [20, 19, 18, 16, 15, 9, 4, 3, 2] as const;

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
