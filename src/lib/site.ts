/**
 * Brand settings, navigation constants and external links.
 * Single source of truth — do not duplicate elsewhere.
 */

export const SITE = {
  shortName: "AHMV",
  name: { fr: "Association du hockey mineur de Verdun", en: "Verdun Minor Hockey Association" },
  season: "2026–2027",
  domain: "https://ahmverdun.com",
  city: "Verdun (Montréal), Québec",
  // Official email NOT confirmed — do not display a specific address as official.
  officialEmailConfirmed: false,
  phoneDisplay: "1 (581) 666-6AHM",
  phoneE164: "+15816666246",
  voiceAssistantStatus: "planned",
} as const;

export const EXTERNAL_LINKS = {
  spordleRegister: "https://page.spordle.com/fr/ahm-de-verdun/register",
  spordleLogin: "https://page.spordle.com/fr/ahm-de-verdun/register",
  wllv: "https://wllv.org/",
  hockeyQuebec: "https://www.hockey.qc.ca/",
  hockeyCanada: "https://www.hockeycanada.ca/",
  nhl: "https://www.nhl.com/fr/",
  spordle: "https://www.spordle.com/",
  timbits: "https://www.timhortons.ca/timbits-minor-sports",
  kidsport: "https://kidsportcanada.ca/quebec/fr/provincial-fund/",
  jumpstart: "https://jumpstart.canadiantire.ca/fr/pages/individual-child-grants",
  bonDepartQuebec: "https://www.fondationbondepart.ca/",
  hockeyCanadaAssistFund: "https://fondsaide.fondationhockeycanada.ca/fr/page/demande.html",
  verdunM11Tournament: "https://tournoihockeyverdun.ca/",
  facebook: "https://www.facebook.com/AHMVerdun",
  instagram: "https://www.instagram.com/ahm_verdun/",
} as const;

export type NavKey =
  | "home" | "schedule" | "teams" | "registration" | "tournaments" | "news" | "more"
  | "wllv" | "gallery" | "coaches" | "arenas" | "faq" | "resources" | "partners" | "contact";

export interface NavItem {
  key: NavKey;
  to: string;
}

export const MAIN_NAV: NavItem[] = [
  { key: "home", to: "/" },
  { key: "schedule", to: "/horaires" },
  { key: "teams", to: "/equipes" },
  { key: "registration", to: "/inscriptions" },
  { key: "tournaments", to: "/tournois" },
  { key: "news", to: "/nouvelles" },
];

export const MORE_NAV: NavItem[] = [
  { key: "wllv", to: "/wllv" },
  { key: "gallery", to: "/galerie" },
  { key: "coaches", to: "/entraineurs" },
  { key: "arenas", to: "/arenas" },
  { key: "faq", to: "/faq" },
  { key: "resources", to: "/ressources" },
  { key: "partners", to: "/partenaires" },
  { key: "contact", to: "/contact" },
];

/** Builds a Google Maps directions URL from a free-text destination. No API key needed. */
export function mapsDirectionsUrl(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
