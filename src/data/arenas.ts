import type { Localized } from "@/lib/i18n";

export type ArenaParkingType = "free" | "paid" | "mixed" | "not-published";
export type ArenaPublicStatusCode = "open" | "temporarily_closed" | "unknown";

export interface ArenaParking {
  type: ArenaParkingType;
  accessible?: boolean;
  evCharging?: boolean;
  details?: Localized;
}

export interface ArenaPublicStatus {
  code: ArenaPublicStatusCode;
  label: Localized;
  note?: Localized;
}

export interface Arena {
  slug: string;
  name: string;
  borough: Localized;
  address: string;
  addressVerified: boolean;
  website?: string;
  officialPhotoPage?: string;
  phone?: string;
  phoneExtension?: string;
  description?: Localized;
  facilities?: Localized;
  activities?: Localized[];
  amenities?: Localized[];
  accessibility?: Localized[];
  parking?: ArenaParking;
  publicStatus?: ArenaPublicStatus;
  sourceVerifiedAt?: string;
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
    officialPhotoPage: "https://montreal.ca/lieux/auditorium-de-verdun",
    phone: "514-765-7130",
    description: {
      fr: "Bâtiment historique restauré comprenant les espaces de glace Denis-Savard et Scotty-Bowman, au bord du fleuve à Verdun.",
      en: "Restored historic venue with the Denis Savard and Scotty Bowman ice spaces on the Verdun waterfront.",
    },
    facilities: {
      fr: "Deux glaces : espace Denis-Savard et espace Scotty-Bowman.",
      en: "Two rinks: Denis Savard space and Scotty Bowman space.",
    },
    activities: [
      { fr: "Hockey et hockey libre", en: "Hockey and open hockey" },
      { fr: "Patinage libre", en: "Open skating" },
      { fr: "Bâton-rondelle", en: "Stick and puck" },
      { fr: "Patinage artistique", en: "Figure skating" },
      { fr: "Basketball et pickleball selon la programmation", en: "Basketball and pickleball when programmed" },
    ],
    amenities: [
      { fr: "Wi-Fi gratuit", en: "Free Wi-Fi" },
      { fr: "Vestiaires", en: "Changing rooms" },
      { fr: "Fontaine d’eau potable", en: "Drinking fountain" },
      { fr: "Salle d’allaitement et table à langer", en: "Nursing room and changing table" },
      { fr: "Support à vélo", en: "Bike stand" },
    ],
    accessibility: [
      { fr: "Accessible en fauteuil roulant", en: "Wheelchair accessible" },
      { fr: "Ascenseur et portes automatiques", en: "Elevator and automatic doors" },
      { fr: "Stationnement et débarcadère accessibles", en: "Accessible parking and drop-off" },
      { fr: "Toilettes accessibles", en: "Accessible washrooms" },
    ],
    parking: {
      type: "paid",
      accessible: true,
      details: { fr: "Stationnement payant sur le site; places accessibles indiquées par la Ville.", en: "Paid on-site parking; accessible parking is listed by the City." },
    },
    publicStatus: {
      code: "open",
      label: { fr: "Ouvert selon la programmation", en: "Open according to programming" },
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "verdun",
  },
  {
    slug: "saint-charles",
    name: "Aréna Saint-Charles",
    borough: { fr: "Le Sud-Ouest", en: "Le Sud-Ouest" },
    address: "1055, rue d'Hibernia, Montréal (Québec) H3K 2V3",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-saint-charles",
    officialPhotoPage: "https://montreal.ca/lieux/arena-saint-charles",
    phone: "514-872-3300",
    description: {
      fr: "Aréna municipal de Pointe-Saint-Charles utilisé pour le hockey, le patinage artistique et le patinage libre.",
      en: "Municipal Pointe-Saint-Charles arena used for hockey, figure skating and open skating.",
    },
    facilities: {
      fr: "Aréna du Centre Saint-Charles à Pointe-Saint-Charles.",
      en: "Arena inside Centre Saint-Charles in Pointe-Saint-Charles.",
    },
    activities: [
      { fr: "Hockey", en: "Hockey" },
      { fr: "Patinage artistique", en: "Figure skating" },
      { fr: "Patinage libre", en: "Open skating" },
    ],
    amenities: [
      { fr: "Wi-Fi gratuit", en: "Free Wi-Fi" },
      { fr: "Vestiaires et douches", en: "Changing rooms and showers" },
      { fr: "Fontaine d’eau potable", en: "Drinking fountain" },
      { fr: "Support à vélo", en: "Bike stand" },
      { fr: "Table à langer", en: "Changing table" },
    ],
    accessibility: [
      { fr: "Entrée de plain-pied", en: "Ground-level entrance" },
      { fr: "Bouton-poussoir à l’entrée", en: "Push-button entrance" },
      { fr: "Toilette accessible individuelle", en: "Individual accessible washroom" },
    ],
    sourceVerifiedAt: "2026-10-04",
    zone: "sud-ouest",
  },
  {
    slug: "samuel-moskovitch",
    name: "Aréna Samuel Moskovitch",
    borough: { fr: "Côte Saint-Luc", en: "Côte Saint-Luc" },
    address: "6985, chemin Mackle, Côte Saint-Luc (Québec) H4W 1A5",
    addressVerified: true,
    website: "https://cotesaintluc.org/fr/lieu/arena-samuel-moskovitch/",
    officialPhotoPage: "https://cotesaintluc.org/fr/lieu/arena-samuel-moskovitch/",
    phone: "514-485-6806",
    phoneExtension: "2101",
    description: {
      fr: "Patinoire communautaire de Côte Saint-Luc accueillant hockey mineur, patinage artistique, écoles de hockey et ligues jeunesse et adultes.",
      en: "Côte Saint-Luc community rink hosting minor hockey, figure skating, hockey schools and youth/adult leagues.",
    },
    activities: [
      { fr: "Hockey mineur et ligues", en: "Minor hockey and leagues" },
      { fr: "Patinage artistique", en: "Figure skating" },
      { fr: "Patinage libre", en: "Recreational skating" },
    ],
    amenities: [
      { fr: "Boutique Pro Shop : location, aiguisage et accessoires", en: "Pro Shop: rentals, sharpening and essentials" },
      { fr: "Cantine et machines distributrices", en: "Canteen and vending machines" },
    ],
    accessibility: [
      { fr: "Accès à la glace adapté avec rampe", en: "Accessible ice entry with ramp" },
      { fr: "Équipement de luge adapté disponible selon la programmation", en: "Adaptive sled equipment available according to programming" },
    ],
    publicStatus: {
      code: "open",
      label: { fr: "Ouvert selon la programmation", en: "Open according to programming" },
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "ouest",
  },
  {
    slug: "legion-memorial",
    name: "Centre sports et loisirs de Montréal-Ouest",
    borough: { fr: "Montréal-Ouest", en: "Montreal West" },
    address: "220, avenue Bedbrook, Montréal-Ouest (Québec) H4X 1S2",
    addressVerified: true,
    website: "https://montreal-ouest.ca/en/recreation/sports-recreation-center/",
    officialPhotoPage: "https://montreal-ouest.ca/en/recreation/sports-recreation-center/",
    phone: "514-484-6186",
    description: {
      fr: "Nouveau centre municipal multigénérationnel comprenant une patinoire, un gymnase, des salles polyvalentes, un pro-shop et un café.",
      en: "New multigenerational municipal centre with a rink, gymnasium, multipurpose rooms, pro shop and café.",
    },
    facilities: {
      fr: "Nouveau centre municipal construit sur le site de l'ancien Legion Memorial Rink.",
      en: "New municipal sports centre built on the former Legion Memorial Rink site.",
    },
    activities: [
      { fr: "Hockey et activités sur glace", en: "Hockey and ice activities" },
      { fr: "Activités de gymnase", en: "Gymnasium activities" },
      { fr: "Programmation communautaire", en: "Community programming" },
    ],
    amenities: [
      { fr: "Pro-shop", en: "Pro shop" },
      { fr: "Café", en: "Café" },
      { fr: "Salles polyvalentes", en: "Multipurpose rooms" },
      { fr: "Gymnase", en: "Gymnasium" },
    ],
    accessibility: [
      { fr: "Bâtiment conçu pour l’accessibilité universelle", en: "Designed for universal accessibility" },
      { fr: "Deux vestiaires universellement accessibles", en: "Two universally accessible player locker rooms" },
      { fr: "Ascenseur et entrée sans obstacle", en: "Elevator and barrier-free entrance" },
      { fr: "Places de stationnement réservées aux personnes à mobilité réduite", en: "Parking spaces reserved for people with limited mobility" },
    ],
    parking: {
      type: "not-published",
      accessible: true,
      details: { fr: "Des places adaptées sont confirmées; le nombre total de places n’est pas publié sur la fiche consultée.", en: "Accessible spaces are confirmed; the total number of parking spaces is not published on the reviewed page." },
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "ouest",
  },
  {
    slug: "pete-morin",
    name: "Aréna Pierre « Pete » Morin",
    borough: { fr: "Lachine", en: "Lachine" },
    address: "1925, rue Saint-Antoine, Montréal (Québec) H8S 1V5",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-pierre-pete-morin",
    officialPhotoPage: "https://montreal.ca/lieux/arena-pierre-pete-morin",
    phone: "514-639-2247",
    description: {
      fr: "Aréna de Lachine avec patinage libre, services de pro-shop selon les heures et salle Salon rouge disponible à la location.",
      en: "Lachine arena with open skating, pro-shop services at selected times and the Salon Rouge room available for rental.",
    },
    activities: [
      { fr: "Hockey et sports de glace", en: "Hockey and ice sports" },
      { fr: "Patinage libre", en: "Open skating" },
      { fr: "Location de salle", en: "Room rental" },
    ],
    amenities: [
      { fr: "Wi-Fi gratuit", en: "Free Wi-Fi" },
      { fr: "Vestiaires et douches", en: "Changing rooms and showers" },
      { fr: "Borne de recharge", en: "EV charging station" },
      { fr: "Machine distributrice", en: "Vending machine" },
      { fr: "Location de patins à certaines périodes", en: "Skate rental at selected times" },
    ],
    accessibility: [
      { fr: "Accessible en fauteuil roulant", en: "Wheelchair accessible" },
      { fr: "Stationnement accessible", en: "Accessible parking" },
      { fr: "Zone de débarcadère et transport adapté", en: "Drop-off and paratransit zones" },
    ],
    parking: {
      type: "free",
      accessible: true,
      evCharging: true,
      details: { fr: "Stationnement gratuit; borne de recharge et places accessibles indiquées.", en: "Free parking; EV charging and accessible parking are listed." },
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "sud-ouest",
  },
  {
    slug: "martin-lapointe",
    name: "Aréna Martin-Lapointe",
    borough: { fr: "Lachine", en: "Lachine" },
    address: "183, rue des Érables, Montréal (Québec) H8R 1B1",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-martin-lapointe",
    officialPhotoPage: "https://montreal.ca/lieux/arena-martin-lapointe",
    phone: "514-639-2247",
    description: {
      fr: "Installation du quartier Saint-Pierre conçue pour différents sports de glace.",
      en: "Saint-Pierre neighbourhood facility designed for a variety of ice sports.",
    },
    activities: [{ fr: "Sports de glace", en: "Ice sports" }],
    amenities: [
      { fr: "Casse-croûte", en: "Snack bar" },
      { fr: "Vestiaires et douches", en: "Changing rooms and showers" },
      { fr: "Fontaine d’eau potable", en: "Drinking fountain" },
    ],
    parking: {
      type: "free",
      details: { fr: "Stationnement gratuit indiqué par la Ville.", en: "Free parking is listed by the City." },
    },
    publicStatus: {
      code: "temporarily_closed",
      label: { fr: "Fermeture temporaire indiquée", en: "Temporary closure listed" },
      note: {
        fr: "La fiche municipale consultée indique des travaux de mise aux normes et une réouverture prévue pour la saison 2026-2027. Vérifiez la source officielle avant de vous déplacer.",
        en: "The reviewed municipal page lists renovation work and a planned reopening for the 2026-2027 season. Check the official source before travelling.",
      },
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "sud-ouest",
  },
  {
    slug: "jacques-lemaire",
    name: "Aréna Jacques-Lemaire",
    borough: { fr: "LaSalle", en: "LaSalle" },
    address: "8681, boulevard Champlain, Montréal (Québec) H8P 1B8",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-jacques-lemaire",
    officialPhotoPage: "https://montreal.ca/lieux/arena-jacques-lemaire",
    phone: "514-367-6363",
    description: {
      fr: "Aréna de LaSalle utilisé pour une variété de sports de glace et doté d’un service d’aiguisage au pro-shop.",
      en: "LaSalle arena used for a variety of ice sports with skate sharpening available at the pro shop.",
    },
    activities: [
      { fr: "Hockey et sports de glace", en: "Hockey and ice sports" },
      { fr: "Patinage", en: "Skating" },
    ],
    amenities: [
      { fr: "Wi-Fi gratuit", en: "Free Wi-Fi" },
      { fr: "Vestiaires et douches", en: "Changing rooms and showers" },
      { fr: "Pro-shop et aiguisage de patins", en: "Pro shop and skate sharpening" },
      { fr: "Machine distributrice", en: "Vending machine" },
    ],
    accessibility: [
      { fr: "Accessible en fauteuil roulant", en: "Wheelchair accessible" },
      { fr: "Stationnement accessible", en: "Accessible parking" },
      { fr: "Rampe et portes automatiques", en: "Ramp and automatic doors" },
      { fr: "Toilettes accessibles", en: "Accessible washrooms" },
    ],
    parking: {
      type: "free",
      accessible: true,
      details: { fr: "Stationnement gratuit et stationnement accessible indiqués par la Ville.", en: "Free and accessible parking are listed by the City." },
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "sud-ouest",
  },
  {
    slug: "dollard-saint-laurent",
    name: "Centre sportif Dollard-St-Laurent",
    borough: { fr: "LaSalle", en: "LaSalle" },
    address: "707, 75e Avenue, Montréal (Québec) H8R 3Y7",
    addressVerified: true,
    website: "https://montreal.ca/lieux/centre-sportif-dollard-st-laurent",
    officialPhotoPage: "https://montreal.ca/lieux/centre-sportif-dollard-st-laurent",
    phone: "514-367-6362",
    description: {
      fr: "Centre sportif de LaSalle comprenant une patinoire intérieure et d’autres installations récréatives.",
      en: "LaSalle sports centre with an indoor rink and other recreation facilities.",
    },
    activities: [
      { fr: "Patinoire intérieure", en: "Indoor skating rink" },
      { fr: "Jeux d’eau L’Aquaciel", en: "L’Aquaciel splash pad" },
    ],
    amenities: [
      { fr: "Wi-Fi gratuit", en: "Free Wi-Fi" },
      { fr: "Vestiaires et douches", en: "Changing rooms and showers" },
      { fr: "Borne de recharge", en: "EV charging station" },
      { fr: "Fontaine d’eau potable", en: "Drinking fountain" },
    ],
    accessibility: [
      { fr: "Accessible en fauteuil roulant", en: "Wheelchair accessible" },
      { fr: "Ascenseur", en: "Elevator" },
      { fr: "Stationnement accessible", en: "Accessible parking" },
      { fr: "Toilettes accessibles", en: "Accessible washrooms" },
    ],
    parking: {
      type: "free",
      accessible: true,
      evCharging: true,
      details: { fr: "Stationnement gratuit avec borne de recharge et places accessibles.", en: "Free parking with EV charging and accessible spaces." },
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "sud-ouest",
  },
  {
    slug: "outremont",
    name: "Aréna André-Laperrière",
    borough: { fr: "Outremont", en: "Outremont" },
    address: "999, avenue McEachran, Montréal (Québec) H2V 3E6",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-andre-laperriere",
    officialPhotoPage: "https://montreal.ca/lieux/arena-andre-laperriere",
    phone: "514-495-6211",
    description: {
      fr: "Aréna du Centre communautaire intergénérationnel d’Outremont utilisé pour le hockey et le patinage.",
      en: "Arena inside Outremont's Intergenerational Community Centre used for hockey and skating.",
    },
    facilities: {
      fr: "Aréna du Centre communautaire intergénérationnel d'Outremont.",
      en: "Arena inside Outremont's Intergenerational Community Centre.",
    },
    activities: [
      { fr: "Hockey", en: "Hockey" },
      { fr: "Patinage artistique", en: "Figure skating" },
      { fr: "Activités libres selon la programmation", en: "Drop-in activities according to programming" },
    ],
    amenities: [
      { fr: "Wi-Fi gratuit", en: "Free Wi-Fi" },
      { fr: "Vestiaires et douches", en: "Changing rooms and showers" },
      { fr: "Fontaine d’eau potable", en: "Drinking fountain" },
      { fr: "Support à vélo", en: "Bike stand" },
    ],
    accessibility: [
      { fr: "Accessible en fauteuil roulant", en: "Wheelchair accessible" },
      { fr: "Rampe d’accès", en: "Access ramp" },
      { fr: "Ascenseur", en: "Elevator" },
      { fr: "Toilettes accessibles", en: "Accessible washrooms" },
    ],
    parking: {
      type: "paid",
      details: { fr: "Stationnement payant indiqué sur la fiche officielle.", en: "Paid parking is listed on the official page." },
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "centre",
  },
  {
    slug: "mont-royal",
    name: "Aréna municipal de Mont-Royal",
    borough: { fr: "Ville de Mont-Royal", en: "Town of Mount Royal" },
    address: "1050, chemin Dunkirk, Mont-Royal (Québec) H3R 3J8",
    addressVerified: true,
    website: "https://www.ville.mont-royal.qc.ca/fr/loisirs-installations-et-bibliotheque/loisirs-et-culture/location-de-salles",
    officialPhotoPage: "https://www.ville.mont-royal.qc.ca/",
    phone: "514-734-2925",
    description: {
      fr: "Aréna municipal de la Ville de Mont-Royal situé sur le chemin Dunkirk.",
      en: "Town of Mount Royal municipal arena on Dunkirk Road.",
    },
    accessibility: [
      { fr: "Portes automatiques", en: "Automatic doors" },
      { fr: "Toilettes accessibles", en: "Accessible washrooms" },
    ],
    sourceVerifiedAt: "2026-10-04",
    zone: "centre",
  },
  {
    slug: "raymond-bourque",
    name: "Aréna Raymond-Bourque",
    borough: { fr: "Saint-Laurent", en: "Saint-Laurent" },
    address: "2345, boulevard Thimens, Montréal (Québec) H4R 1T4",
    addressVerified: true,
    website: "https://montreal.ca/lieux/arena-raymond-bourque",
    officialPhotoPage: "https://montreal.ca/lieux/arena-raymond-bourque",
    phone: "514-956-2580",
    phoneExtension: "4700",
    description: {
      fr: "Grand aréna de Saint-Laurent avec deux glaces de format LNH, activités libres, pro-shop et salle de location.",
      en: "Large Saint-Laurent arena with two NHL-sized rinks, drop-in activities, a pro shop and rental room.",
    },
    activities: [
      { fr: "Hockey et hockey libre", en: "Hockey and open hockey" },
      { fr: "Patinage libre", en: "Open skating" },
      { fr: "Ringuette et patinage artistique", en: "Ringette and figure skating" },
      { fr: "Location de glace et fêtes d’enfants", en: "Ice rental and children's parties" },
    ],
    amenities: [
      { fr: "Wi-Fi gratuit", en: "Free Wi-Fi" },
      { fr: "Casse-croûte", en: "Snack bar" },
      { fr: "Vestiaires", en: "Changing rooms" },
      { fr: "Pro-shop : location et aiguisage", en: "Pro shop: rental and sharpening" },
      { fr: "Deux glaces de format LNH", en: "Two NHL-sized rinks" },
    ],
    accessibility: [
      { fr: "Stationnement accessible", en: "Accessible parking" },
      { fr: "Toilettes accessibles", en: "Accessible washrooms" },
      { fr: "Portes automatiques et ascenseur", en: "Automatic doors and elevator" },
    ],
    parking: {
      type: "free",
      accessible: true,
      details: { fr: "Stationnement gratuit pour les usagers; places accessibles indiquées.", en: "Free parking for users; accessible spaces are listed." },
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "nord",
  },
  {
    slug: "cegep-saint-laurent",
    name: "Aréna Ronald-Caron — Cégep de Saint-Laurent",
    borough: { fr: "Saint-Laurent", en: "Saint-Laurent" },
    address: "625, avenue Sainte-Croix, Saint-Laurent (Québec) H4L 3X7",
    addressVerified: true,
    website: "https://www.cegepsl-qc.ca/le-campus/arena-ronald-caron/index.html",
    officialPhotoPage: "https://www.cegepsl-qc.ca/le-campus/arena-ronald-caron/index.html",
    description: {
      fr: "Patinoire intérieure située sur le campus du Cégep de Saint-Laurent.",
      en: "Indoor rink located on the Cégep de Saint-Laurent campus.",
    },
    sourceVerifiedAt: "2026-10-04",
    zone: "nord",
  },
  {
    slug: "westmount",
    name: "Centre des loisirs de Westmount",
    borough: { fr: "Westmount", en: "Westmount" },
    address: "4675, rue Sainte-Catherine Ouest, Westmount (Québec) H3Z 1S4",
    addressVerified: true,
    website: "https://westmount.org/en/leisure-and-community/sports-activities-and-facilities/westmount-recreation-centre",
    officialPhotoPage: "https://westmount.org/en/leisure-and-community/sports-activities-and-facilities/westmount-recreation-centre",
    phone: "514-989-5353",
    description: {
      fr: "Centre sportif moderne de Westmount avec glaces, piscine, salles polyvalentes et café.",
      en: "Modern Westmount sports centre with ice surfaces, pool, multipurpose rooms and café.",
    },
    activities: [
      { fr: "Sports de glace", en: "Ice sports" },
      { fr: "Activités aquatiques", en: "Aquatic activities" },
      { fr: "Programmation sportive et communautaire", en: "Sports and community programming" },
    ],
    amenities: [
      { fr: "Café", en: "Café" },
      { fr: "Salles polyvalentes", en: "Multipurpose rooms" },
      { fr: "Piscine", en: "Pool" },
      { fr: "Bornes de recharge", en: "EV charging stations" },
    ],
    accessibility: [
      { fr: "Rampe d’accessibilité universelle", en: "Universal accessibility ramp" },
    ],
    parking: {
      type: "free",
      evCharging: true,
      details: { fr: "Deux heures de stationnement gratuit pour les participants et usagers; deux bornes de recharge sont indiquées.", en: "Two hours of free parking for participants and users; two EV charging stations are listed." },
    },
    sourceVerifiedAt: "2026-10-04",
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

const VENUE_ALIASES: Record<string, string> = {
  "a denis": "auditorium-de-verdun",
  "denis savard": "auditorium-de-verdun",
  "espace denis savard": "auditorium-de-verdun",
  "auditorium verdun": "auditorium-de-verdun",
  "arena st charles": "saint-charles",
  "arena saint charles": "saint-charles",
  "st charles": "saint-charles",
};

export function getArenaForVenue(venue: string) {
  const normalizedVenue = normalizeVenueName(venue);
  const alias = VENUE_ALIASES[normalizedVenue];
  if (alias) return getArena(alias);

  return ARENAS.find((item) => {
    const normalizedName = normalizeVenueName(item.name);
    return normalizedName === normalizedVenue
      || normalizedName.includes(normalizedVenue)
      || normalizedVenue.includes(normalizedName);
  });
}

export function arenaDirectionsTargetForVenue(venue: string) {
  return getArenaForVenue(venue)?.address ?? venue;
}
