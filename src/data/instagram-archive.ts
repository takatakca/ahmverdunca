import type { NewsArticle } from "./news";

export interface InstagramArchiveSource {
  shortcode: string;
  url: string;
  date: string;
  /** Verified publication footer timestamp, not a caption edit time; absent if only the day is known. */
  observedTimestamp?: string;
  articleSlug: string;
  season: string;
  image: string;
}

/** Public ahm_verdun posts verified on October 6, 2026; signed CDN URLs stay out of the app. */
export const INSTAGRAM_ARCHIVE_SOURCES: InstagramArchiveSource[] = [
  {
    shortcode: "DTX_IuSgOS4",
    url: "https://www.instagram.com/ahm_verdun/p/DTX_IuSgOS4/",
    date: "2026-01-11",
    observedTimestamp: "2026-01-11T15:05:25.000Z",
    articleSlug: "joueurs-semaine-11-janvier-2026-instagram",
    season: "2025-2026",
    image: "/news-media/instagram/DTX_IuSgOS4.jpg",
  },
  {
    shortcode: "DOmyjvrjRVq",
    url: "https://www.instagram.com/ahm_verdun/p/DOmyjvrjRVq/",
    date: "2025-09-14",
    observedTimestamp: "2025-09-15T02:27:08.000Z",
    articleSlug: "photo-ahmv-14-septembre-2025-instagram",
    season: "2025-2026",
    image: "/news-media/instagram/DOmyjvrjRVq.jpg",
  },
  {
    shortcode: "DNEyPOQurr3",
    url: "https://www.instagram.com/ahm_verdun/p/DNEyPOQurr3/",
    date: "2025-08-07",
    observedTimestamp: "2025-08-08T00:58:46.000Z",
    articleSlug: "portes-ouvertes-feminin-annonce-2025-instagram",
    season: "2025-2026",
    image: "/news-media/instagram/DNEyPOQurr3.jpg",
  },
  {
    shortcode: "DH1CQIMuAkV",
    url: "https://www.instagram.com/ahm_verdun/p/DH1CQIMuAkV/",
    date: "2025-03-30",
    observedTimestamp: "2025-03-30T15:33:53.000Z",
    articleSlug: "joueur-semaine-30-mars-2025-instagram",
    season: "2024-2025",
    image: "/news-media/instagram/DH1CQIMuAkV.jpg",
  },
  {
    shortcode: "DHQczPRu72Q",
    url: "https://www.instagram.com/ahm_verdun/p/DHQczPRu72Q/",
    date: "2025-03-16",
    observedTimestamp: "2025-03-16T10:33:58.000Z",
    articleSlug: "joueur-semaine-16-mars-2025-instagram",
    season: "2024-2025",
    image: "/news-media/instagram/DHQczPRu72Q.jpg",
  },
  {
    shortcode: "DG_EyKnO9nr",
    url: "https://www.instagram.com/ahm_verdun/p/DG_EyKnO9nr/",
    date: "2025-03-09",
    observedTimestamp: "2025-03-09T16:37:01.000Z",
    articleSlug: "joueur-semaine-9-mars-2025-instagram",
    season: "2024-2025",
    image: "/news-media/instagram/DG_EyKnO9nr.jpg",
  },
  {
    shortcode: "DGlRABouR45",
    url: "https://www.instagram.com/ahm_verdun/p/DGlRABouR45/",
    date: "2025-02-27",
    observedTimestamp: "2025-02-27T16:03:31.000Z",
    articleSlug: "classique-hivernale-concours-2025-instagram",
    season: "2024-2025",
    image: "/news-media/instagram/DGlRABouR45.jpg",
  },
  {
    shortcode: "DFle-7BSLNi",
    url: "https://www.instagram.com/ahm_verdun/p/DFle-7BSLNi/",
    date: "2025-02-02",
    observedTimestamp: "2025-02-02T21:34:18.000Z",
    articleSlug: "portrait-ahmv-2-fevrier-2025-instagram",
    season: "2024-2025",
    image: "/news-media/instagram/DFle-7BSLNi.jpg",
  },
  {
    shortcode: "DEvHhffyz4d",
    url: "https://www.instagram.com/ahm_verdun/p/DEvHhffyz4d/",
    date: "2025-01-12",
    observedTimestamp: "2025-01-12T18:50:19.000Z",
    articleSlug: "portrait-ahmv-12-janvier-2025-instagram",
    season: "2024-2025",
    image: "/news-media/instagram/DEvHhffyz4d.jpg",
  },
  {
    shortcode: "DDod0fCRIm2",
    url: "https://www.instagram.com/ahm_verdun/p/DDod0fCRIm2/",
    date: "2024-12-16",
    observedTimestamp: "2024-12-16T08:19:04.000Z",
    articleSlug: "journee-benevoles-decembre-2024-instagram",
    season: "2024-2025",
    image: "/news-media/instagram/DDod0fCRIm2.jpg",
  },
  {
    shortcode: "DDodwwhxVM1",
    url: "https://www.instagram.com/ahm_verdun/p/DDodwwhxVM1/",
    date: "2024-12-16",
    observedTimestamp: "2024-12-16T08:18:34.000Z",
    articleSlug: "journee-benevoles-decembre-2024-instagram",
    season: "2024-2025",
    image: "/news-media/instagram/DDodwwhxVM1.jpg",
  },
  {
    shortcode: "DDodmmNxkfL",
    url: "https://www.instagram.com/ahm_verdun/p/DDodmmNxkfL/",
    date: "2024-12-16",
    observedTimestamp: "2024-12-16T08:17:10.000Z",
    articleSlug: "journee-benevoles-decembre-2024-instagram",
    season: "2024-2025",
    image: "/news-media/instagram/DDodmmNxkfL.jpg",
  },
];

/** Historical publications stay explicit archives; no current registration or player identity is inferred. */
const instagramArchiveArticles: NewsArticle[] = [
  {
    slug: "joueurs-semaine-11-janvier-2026-instagram",
    title: {
      fr: "Les trois joueurs de la semaine — 11 janvier 2026",
      en: "Three players of the week — January 11, 2026",
    },
    excerpt: {
      fr: "Archive de la publication Instagram « Les 3 joueurs de la semaine » de la saison 2025-2026.",
      en: "Archive of the Instagram post “The 3 players of the week” from the 2025-2026 season.",
    },
    body: {
      fr: [
        "Les 3 joueurs de la semaine.",
        "Cette publication du 11 janvier 2026 et son visuel original sont conservés dans les archives de la saison 2025-2026.",
      ],
      en: [
        "The 3 players of the week.",
        "This January 11, 2026 post and its original image are preserved in the 2025-2026 season archives.",
      ],
    },
    category: "teams",
    teamSlugs: ["m13"],
    date: "2026-01-11",
    author: "AHM Verdun",
    image: "/news-media/instagram/DTX_IuSgOS4.jpg",
    season: "2025-2026",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DTX_IuSgOS4/",
    archived: true,
    contentPending: false,
  },
  {
    slug: "photo-ahmv-14-septembre-2025-instagram",
    title: {
      fr: "Photo AHMV sur la glace — 14 septembre 2025",
      en: "AHMV on-ice photo — September 14, 2025",
    },
    excerpt: {
      fr: "Archive photo publiée sur le compte Instagram officiel de l’AHM Verdun le 14 septembre 2025.",
      en: "Photo archive published on AHM Verdun’s official Instagram account on September 14, 2025.",
    },
    body: {
      fr: [
        "Photo d’archive publiée sur le compte Instagram officiel de l’AHM Verdun le 14 septembre 2025.",
        "Retrouvez la photo originale et la publication de l’association dans les archives de la saison 2025-2026.",
      ],
      en: [
        "Archive photo published on AHM Verdun’s official Instagram account on September 14, 2025.",
        "Find the original photo and the association’s post in the 2025-2026 season archives.",
      ],
    },
    category: "association",
    teamSlugs: [],
    date: "2025-09-14",
    author: "AHM Verdun",
    image: "/news-media/instagram/DOmyjvrjRVq.jpg",
    season: "2025-2026",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DOmyjvrjRVq/",
    archived: true,
    contentPending: false,
  },
  {
    slug: "portes-ouvertes-feminin-annonce-2025-instagram",
    title: {
      fr: "Portes ouvertes de hockey féminin — annonce 2025",
      en: "Girls’ hockey open house — 2025 announcement",
    },
    excerpt: {
      fr: "Archive de l’annonce publiée le 7 août 2025 pour la deuxième édition de la journée portes ouvertes de hockey féminin.",
      en: "Archive of the August 7, 2025 announcement for the second girls’ hockey open house.",
    },
    body: {
      fr: [
        "L’AHM Verdun annonçait le retour de sa journée portes ouvertes dédiée aux filles, le 14 septembre 2025 à l’Auditorium de Verdun.",
        "La publication invitait les filles de 7 à 17 ans, nées entre 2008 et 2018, résidentes de Verdun ou de l’Île-des-Sœurs, à découvrir le sport, faire des essais sur glace et rencontrer les entraîneurs.",
        "Les renseignements sur l’inscription, l’horaire et le prêt d’équipement devaient être publiés ultérieurement. Cette annonce est conservée comme archive de 2025.",
      ],
      en: [
        "AHM Verdun announced the return of its girls’ open house on September 14, 2025 at the Verdun Auditorium.",
        "The post invited girls aged 7 to 17, born between 2008 and 2018 and living in Verdun or Île-des-Sœurs, to discover the sport, try it on the ice and meet coaches.",
        "Registration, schedule and equipment-loan details were to be published later. This announcement is preserved as a 2025 archive.",
      ],
    },
    category: "feminine",
    teamSlugs: ["feminin"],
    date: "2025-08-07",
    author: "AHM Verdun",
    image: "/news-media/instagram/DNEyPOQurr3.jpg",
    season: "2025-2026",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DNEyPOQurr3/",
    archived: true,
    contentPending: false,
  },
  {
    slug: "joueur-semaine-30-mars-2025-instagram",
    title: {
      fr: "Joueur de la semaine — 30 mars 2025",
      en: "Player of the week — March 30, 2025",
    },
    excerpt: {
      fr: "Archive du visuel « Joueur de la semaine » publié sur Instagram le 30 mars 2025.",
      en: "Archive of the “Player of the week” image published on Instagram on March 30, 2025.",
    },
    body: {
      fr: [
        "Le compte Instagram officiel de l’AHM Verdun partageait ce visuel du joueur de la semaine le 30 mars 2025.",
        "La publication renvoyait vers la nouvelle « joueur_de_la_semaine-10 » de l’ancien site de l’association. Le visuel original est conservé dans les archives 2024-2025.",
      ],
      en: [
        "AHM Verdun’s official Instagram account shared this player-of-the-week image on March 30, 2025.",
        "The post linked to the “joueur_de_la_semaine-10” update on the association’s former website. The original image is preserved in the 2024-2025 archives.",
      ],
    },
    category: "teams",
    teamSlugs: [],
    links: [
      {
        label: {
          fr: "Lien cité dans la publication d’archive",
          en: "Link cited in the archive post",
        },
        url: "https://www.ahmverdun.com/fr/publication/nouvelle/joueur_de_la_semaine-10.html",
      },
    ],
    date: "2025-03-30",
    author: "AHM Verdun",
    image: "/news-media/instagram/DH1CQIMuAkV.jpg",
    season: "2024-2025",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DH1CQIMuAkV/",
    archived: true,
    contentPending: false,
  },
  {
    slug: "joueur-semaine-16-mars-2025-instagram",
    title: {
      fr: "Joueur de la semaine — 16 mars 2025",
      en: "Player of the week — March 16, 2025",
    },
    excerpt: {
      fr: "Archive de la publication « Joueur de la semaine » du 16 mars 2025.",
      en: "Archive of the “Player of the week” post from March 16, 2025.",
    },
    body: {
      fr: [
        "Joueur de la semaine.",
        "La publication Instagram du 16 mars 2025 renvoyait vers la nouvelle « joueur_de_la_semaine-8 » de l’ancien site de l’association. Ce visuel appartient aux archives de la saison 2024-2025.",
      ],
      en: [
        "Player of the week.",
        "The March 16, 2025 Instagram post linked to the “joueur_de_la_semaine-8” update on the association’s former website. This image belongs to the 2024-2025 season archives.",
      ],
    },
    category: "teams",
    teamSlugs: [],
    links: [
      {
        label: {
          fr: "Lien cité dans la publication d’archive",
          en: "Link cited in the archive post",
        },
        url: "https://www.ahmverdun.com/fr/publication/nouvelle/joueur_de_la_semaine-8.html",
      },
    ],
    date: "2025-03-16",
    author: "AHM Verdun",
    image: "/news-media/instagram/DHQczPRu72Q.jpg",
    season: "2024-2025",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DHQczPRu72Q/",
    archived: true,
    contentPending: false,
  },
  {
    slug: "joueur-semaine-9-mars-2025-instagram",
    title: {
      fr: "Joueur de la semaine — 9 mars 2025",
      en: "Player of the week — March 9, 2025",
    },
    excerpt: {
      fr: "Archive du visuel du joueur de la semaine publié le 9 mars 2025 sur Instagram.",
      en: "Archive of the player-of-the-week image published on Instagram on March 9, 2025.",
    },
    body: {
      fr: [
        "Le compte Instagram officiel de l’AHM Verdun partageait ce visuel du joueur de la semaine le 9 mars 2025.",
        "La publication renvoyait vers la nouvelle « joueur_de_la_semaine-7 » de l’ancien site de l’association. Le visuel est conservé comme archive 2024-2025.",
      ],
      en: [
        "AHM Verdun’s official Instagram account shared this player-of-the-week image on March 9, 2025.",
        "The post linked to the “joueur_de_la_semaine-7” update on the association’s former website. The image is preserved as a 2024-2025 archive.",
      ],
    },
    category: "teams",
    teamSlugs: [],
    date: "2025-03-09",
    author: "AHM Verdun",
    image: "/news-media/instagram/DG_EyKnO9nr.jpg",
    season: "2024-2025",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DG_EyKnO9nr/",
    archived: true,
    contentPending: false,
  },
  {
    slug: "classique-hivernale-concours-2025-instagram",
    title: {
      fr: "Classique hivernale — concours d’habiletés 2025",
      en: "Winter classic — 2025 skills competition",
    },
    excerpt: {
      fr: "Archive de l’annonce du concours d’habiletés ÉNERGIE au parc Willibrord, prévu le 1er mars 2025.",
      en: "Archive of the ÉNERGIE skills competition announcement at Willibrord Park, scheduled for March 1, 2025.",
    },
    body: {
      fr: [
        "CLASSIQUE HIVERNALE : concours d’habiletés pour tout le monde et pour tous les âges.",
        "L’affiche publiée le 27 février 2025 annonçait un concours à la patinoire Bleu Blanc Bouge du parc Willibrord le samedi 1er mars 2025, de 12 h à 15 h, avec lancer frappé, tirs de précision et échappée.",
        "La publication renvoyait vers campenergie.com. L’annonce et l’affiche sont conservées dans les archives de la saison 2024-2025.",
      ],
      en: [
        "WINTER CLASSIC: a skills competition for everyone and for all ages.",
        "The poster published on February 27, 2025 announced a competition at the Bleu Blanc Bouge rink in Willibrord Park on Saturday, March 1, 2025, from noon to 3 p.m., with slap shot, accuracy and breakaway events.",
        "The post linked to campenergie.com. The announcement and poster are preserved in the 2024-2025 season archives.",
      ],
    },
    category: "association",
    teamSlugs: [],
    links: [
      {
        label: {
          fr: "Site cité dans la publication d’archive",
          en: "Website cited in the archive post",
        },
        url: "https://campenergie.com",
      },
    ],
    date: "2025-02-27",
    author: "AHM Verdun",
    image: "/news-media/instagram/DGlRABouR45.jpg",
    season: "2024-2025",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DGlRABouR45/",
    archived: true,
    contentPending: false,
  },
  {
    slug: "portrait-ahmv-2-fevrier-2025-instagram",
    title: {
      fr: "Portrait AHMV — 2 février 2025",
      en: "AHMV portrait — February 2, 2025",
    },
    excerpt: {
      fr: "Archive du portrait « Joueur de la semaine » partagé sur Instagram le 2 février 2025.",
      en: "Archive of the “Player of the week” portrait shared on Instagram on February 2, 2025.",
    },
    body: {
      fr: [
        "Ce portrait portant la mention « Joueur de la semaine » a été publié sur le compte Instagram officiel de l’AHM Verdun le 2 février 2025.",
        "Le visuel original est conservé dans les archives de la saison 2024-2025.",
      ],
      en: [
        "This portrait labelled “Player of the week” was published on AHM Verdun’s official Instagram account on February 2, 2025.",
        "The original image is preserved in the 2024-2025 season archives.",
      ],
    },
    category: "teams",
    teamSlugs: [],
    date: "2025-02-02",
    author: "AHM Verdun",
    image: "/news-media/instagram/DFle-7BSLNi.jpg",
    season: "2024-2025",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DFle-7BSLNi/",
    archived: true,
    contentPending: false,
  },
  {
    slug: "portrait-ahmv-12-janvier-2025-instagram",
    title: {
      fr: "Portrait AHMV — 12 janvier 2025",
      en: "AHMV portrait — January 12, 2025",
    },
    excerpt: {
      fr: "Archive du visuel du joueur de la semaine publié sur Instagram le 12 janvier 2025.",
      en: "Archive of the player-of-the-week image published on Instagram on January 12, 2025.",
    },
    body: {
      fr: [
        "Le visuel partagé le 12 janvier 2025 présente le joueur de la semaine de l’AHMV et porte la mention de la saison 2024-2025.",
        "La légende renvoyait vers la page d’accueil de l’ancien site de l’association. Le visuel original est conservé dans les archives de la saison 2024-2025.",
      ],
      en: [
        "The image shared on January 12, 2025 presents AHMV’s player of the week and is labelled with the 2024-2025 season.",
        "The caption linked to the association’s former website homepage. The original image is preserved in the 2024-2025 season archives.",
      ],
    },
    category: "teams",
    teamSlugs: [],
    date: "2025-01-12",
    author: "AHM Verdun",
    image: "/news-media/instagram/DEvHhffyz4d.jpg",
    season: "2024-2025",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DEvHhffyz4d/",
    archived: true,
    contentPending: false,
  },
  {
    slug: "journee-benevoles-decembre-2024-instagram",
    title: {
      fr: "Journée des bénévoles — publications de décembre 2024",
      en: "Volunteer day — December 2024 posts",
    },
    excerpt: {
      fr: "Trois publications Instagram du 16 décembre 2024 réunies dans une même archive de la Journée des bénévoles.",
      en: "Three Instagram posts from December 16, 2024 brought together in one Volunteer Day archive.",
    },
    body: {
      fr: [
        "Journée des bénévoles ahm_Verdun.",
        "Le compte Instagram officiel de l’association a publié trois séries de photos portant cette même légende le 16 décembre 2024.",
        "Ces publications sont regroupées ici pour conserver les souvenirs d’un même événement. Les trois publications originales sont accessibles ci-dessous; cette archive appartient à la saison 2024-2025.",
      ],
      en: [
        "Volunteer day ahm_Verdun.",
        "The association’s official Instagram account published three photo series with this same caption on December 16, 2024.",
        "These posts are grouped here to preserve memories of the same event. The three original posts are linked below; this archive belongs to the 2024-2025 season.",
      ],
    },
    category: "association",
    teamSlugs: [],
    links: [
      {
        label: {
          fr: "Publication Instagram 1 — archive",
          en: "Instagram post 1 — archive",
        },
        url: "https://www.instagram.com/ahm_verdun/p/DDod0fCRIm2/",
      },
      {
        label: {
          fr: "Publication Instagram 2 — archive",
          en: "Instagram post 2 — archive",
        },
        url: "https://www.instagram.com/ahm_verdun/p/DDodwwhxVM1/",
      },
      {
        label: {
          fr: "Publication Instagram 3 — archive",
          en: "Instagram post 3 — archive",
        },
        url: "https://www.instagram.com/ahm_verdun/p/DDodmmNxkfL/",
      },
    ],
    date: "2024-12-16",
    author: "AHM Verdun",
    image: "/news-media/instagram/DDod0fCRIm2.jpg",
    season: "2024-2025",
    sourceUrl: "https://www.instagram.com/ahm_verdun/p/DDod0fCRIm2/",
    archived: true,
    contentPending: false,
  },
];

export const INSTAGRAM_ARCHIVE_NEWS: NewsArticle[] = instagramArchiveArticles.map((article) => {
  const source = INSTAGRAM_ARCHIVE_SOURCES.find((entry) => entry.url === article.sourceUrl);
  return source?.observedTimestamp
    ? { ...article, publishedAt: source.observedTimestamp }
    : article;
});
