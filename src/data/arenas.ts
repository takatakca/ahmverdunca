import type { Localized } from "@/lib/i18n";

export interface Arena {
  slug: string;
  name: string;
  borough: Localized;
  address: string;
  addressVerified: boolean;
  website?: string;
  facilities?: Localized;
  zone: "verdun" | "sud-ouest" | "ouest" | "centre" | "nord";
}

export const ARENAS: Arena[] = [
  {
    slug: "auditorium-de-verdun",
    name: "Auditorium de Verdun",
    borough: { fr: "Verdun", en: "Verdun" },
    address: "4110, boulevard LaSalle, Montréal (Québec) H4G 2A5",
    addressVerified: true,
    website: "https://montreal.ca/lieux/auditorium-de-verdun",
    facilities: {
      fr: "Deux glaces : espace Denis-Savard et espace Scotty-Bowman.",
      en: "Two rinks: Denis Savard space and Scotty Bowman space.",
    },
    zone: "verdun",
  },
  {
    slug: "saint-charles",
    name: "Aréna Saint-Charles",
    borough: { fr: "Le Sud-Ouest", en: "Le Sud-Ouest" },
    address: "1055, rue d'Hibernia, Montréal (Québec) H3K 2V3",
    addressVerified: true,
    website: "https://montreal.ca/lieux/centre-saint-charles",
    facilities: {
      fr: "Aréna du Centre Saint-Charles à Pointe-Saint-Charles.",
      en: "Arena inside Centre Saint-Charles in Pointe-Saint-Charles.",
    },
    zone: "sud-ouest",
  },
  {
    slug: "samuel-moskovitch",
    name: "Aréna Samuel Moskovitch",
    borough: { fr: "Côte Saint-Luc", en: "Côte Saint-Luc" },
    address: "6985, chemin Mackle, Côte Saint-Luc (Québec) H4W 1A5",
    addressVerified: true,
    website: "https://cotesaintluc.org/fr/lieu/arena-samuel-moskovitch/",
    zone: "ouest",
  },
  {
    slug: "legion-memorial",
    name: "Centre sports et loisirs de Montréal-Ouest",
    borough: { fr: "Montréal-Ouest", en: "Montreal West" },
    address: "220, avenue Bedbrook, Montréal-Ouest (Québec) H4X 1S2",
    addressVerified: true,
    website: "https://montreal-ouest.ca/en/recreation/sports-recreation-center/",
    facilities: {
      fr: "Nouveau centre municipal construit sur le site de l'ancien Legion Memorial Rink.",
      en: "New municipal sports centre built on the former Legion Memorial Rink site.",
    },
    zone: "ouest",
  },
  {
    slug: "pete-morin",
    name: "Aréna Pierre « Pete » Morin",
    borough: { fr: "Lachine", en: "Lachine" },
    address: "1925, rue Saint-Antoine, Montréal (Québec) H8S 1V5",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-pierre-pete-morin",
    zone: "sud-ouest",
  },
  {
    slug: "martin-lapointe",
    name: "Aréna Martin-Lapointe",
    borough: { fr: "Lachine", en: "Lachine" },
    address: "183, rue des Érables, Montréal (Québec) H8R 1B1",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-martin-lapointe",
    zone: "sud-ouest",
  },
  {
    slug: "jacques-lemaire",
    name: "Aréna Jacques-Lemaire",
    borough: { fr: "LaSalle", en: "LaSalle" },
    address: "8681, boulevard Champlain, Montréal (Québec) H8P 1B8",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-jacques-lemaire",
    zone: "sud-ouest",
  },
  {
    slug: "dollard-saint-laurent",
    name: "Centre sportif Dollard-St-Laurent",
    borough: { fr: "LaSalle", en: "LaSalle" },
    address: "707, 75e Avenue, Montréal (Québec) H8R 3Y7",
    addressVerified: true,
    website: "https://montreal.ca/lieux/centre-sportif-dollard-st-laurent",
    zone: "sud-ouest",
  },
  {
    slug: "outremont",
    name: "Aréna André-Laperrière",
    borough: { fr: "Outremont", en: "Outremont" },
    address: "999, avenue McEachran, Montréal (Québec) H2V 3E6",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-andre-laperriere",
    facilities: {
      fr: "Aréna du Centre communautaire intergénérationnel d'Outremont.",
      en: "Arena inside Outremont's Intergenerational Community Centre.",
    },
    zone: "centre",
  },
  {
    slug: "mont-royal",
    name: "Aréna municipal de Mont-Royal",
    borough: { fr: "Ville de Mont-Royal", en: "Town of Mount Royal" },
    address: "1050, chemin Dunkirk, Mont-Royal (Québec) H3R 3J8",
    addressVerified: true,
    website: "https://www.ville.mont-royal.qc.ca/fr/loisirs-installations-et-bibliotheque/loisirs-et-culture/location-de-salles",
    zone: "centre",
  },
  {
    slug: "raymond-bourque",
    name: "Aréna Raymond-Bourque",
    borough: { fr: "Saint-Laurent", en: "Saint-Laurent" },
    address: "2345, boulevard Thimens, Montréal (Québec) H4R 1T4",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-raymond-bourque",
    zone: "nord",
  },
  {
    slug: "cegep-saint-laurent",
    name: "Aréna Ronald-Caron — Cégep de Saint-Laurent",
    borough: { fr: "Saint-Laurent", en: "Saint-Laurent" },
    address: "625, avenue Sainte-Croix, Saint-Laurent (Québec) H4L 3X7",
    addressVerified: true,
    website: "https://www.cegepsl-qc.ca/le-campus/arena-ronald-caron/index.html",
    zone: "nord",
  },
  {
    slug: "westmount",
    name: "Centre des loisirs de Westmount",
    borough: { fr: "Westmount", en: "Westmount" },
    address: "4675, rue Sainte-Catherine Ouest, Westmount (Québec) H3Z 1S4",
    addressVerified: true,
    website: "https://westmount.org/fr/loisirs-et-communaute/activites-installations-sportives/centre-des-loisirs-de-westmount",
    zone: "centre",
  },
];

export const ARENA_ZONES: { id: Arena["zone"]; label: Localized }[] = [
  { id: "verdun", label: { fr: "Verdun", en: "Verdun" } },
  {
    id: "sud-ouest",
    label: { fr: "Sud-Ouest / LaSalle / Lachine", en: "South-West / LaSalle / Lachine" },
  },
  { id: "ouest", label: { fr: "Ouest de Montréal", en: "West Montreal" } },
  { id: "centre", label: { fr: "Centre", en: "Central" } },
  { id: "nord", label: { fr: "Saint-Laurent", en: "Saint-Laurent" } },
];

export const getArena = (slug: string) => ARENAS.find((a) => a.slug === slug);

function normalizeVenueName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-CA")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function arenaDirectionsTargetForVenue(venue: string) {
  const normalizedVenue = normalizeVenueName(venue);

  if (normalizedVenue.includes("denis savard")) {
    return getArena("auditorium-de-verdun")?.address ?? venue;
  }

  if (normalizedVenue.includes("st charles") || normalizedVenue.includes("saint charles")) {
    return getArena("saint-charles")?.address ?? venue;
  }

  const arena = ARENAS.find((item) => {
    const normalizedName = normalizeVenueName(item.name);
    return normalizedName === normalizedVenue
      || normalizedName.includes(normalizedVenue)
      || normalizedVenue.includes(normalizedName);
  });

  return arena?.address ?? venue;
}
