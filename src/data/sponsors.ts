export interface Sponsor {
  name: string;
  website?: string;
  websiteVerified: boolean;
  logoApproved: boolean;
}

export const SPONSORS: Sponsor[] = [
  {
    name: "Desjardins — Caisse de L'Île-des-Sœurs–Verdun",
    website: "https://www.desjardins.com/en/find-us/caisse-desjardins/ile-des-soeurs-verdun.html",
    websiteVerified: true,
    logoApproved: false,
  },
  {
    name: "Explore Verdun / IDS",
    website: "https://exploreverdunids.com/",
    websiteVerified: true,
    logoApproved: false,
  },
  {
    name: "Lait au chocolat",
    website: "https://www.lafamilledulait.com/fr/produits-laitiers/produits/lait-au-chocolat",
    websiteVerified: true,
    logoApproved: false,
  },
  {
    name: "Maxi Verdun",
    website: "https://www.facebook.com/MaxiVerdun8662/",
    websiteVerified: true,
    logoApproved: false,
  },
  { name: "McDonald's", websiteVerified: false, logoApproved: false },
  {
    name: "RONA — Promenade Wellington",
    website: "https://www.rona.ca/en/store/quebec/verdun/rona-quincaillerie-de-la-promenade-verdun-05203",
    websiteVerified: true,
    logoApproved: false,
  },
  {
    name: "St-Hubert",
    website: "https://www.st-hubert.com/en/restaurants/qc/montr%C3%A9al/4120-boulevard-lasalle",
    websiteVerified: true,
    logoApproved: false,
  },
  {
    name: "Arrondissement de Verdun",
    website: "https://montreal.ca/verdun",
    websiteVerified: true,
    logoApproved: false,
  },
  { name: "Député du Québec", websiteVerified: false, logoApproved: false },
  {
    name: "Bagel St-Lo",
    website: "https://www.bagelstlo.com/",
    websiteVerified: true,
    logoApproved: false,
  },
  {
    name: "Club Richelieu",
    website: "https://clubrichelieuverdun.org/",
    websiteVerified: true,
    logoApproved: false,
  },
  {
    name: "Librairie de Verdun",
    website: "https://lalibrairiedeverdun.com/",
    websiteVerified: true,
    logoApproved: false,
  },
  { name: "Sport Campus", websiteVerified: false, logoApproved: false },
];
