export type RunwayAdPlacement =
  "home" | "schedule" | "team" | "gallery" | "news" | "arena" | "partners";

export interface RunwayAdCreative {
  id: string;
  sheet: number;
  tile: number;
  path: string;
  ratio: "16:9";
  placement: RunwayAdPlacement;
  reviewStatus: "needs-brand-classification";
  /** Printed title checked against the supplied artwork; not an affiliation claim. */
  advertiser: string;
  /** Verified display window; original JPEG bytes remain unchanged. */
  displayCrop?: { width: number; height: number; top: number };
}

const PRINTED_TITLES = [
  "Taco Mexicain",
  "Mythos 2 Go",
  "Place Afrique",
  "Bolon Café",
  "O’Oeufs Express",
  "Gâteaux Montréal",
  "Déjeuner 24/7",
  "Pita Libanais",
  "Poulet 24/7",
  "Pi Pita",
  "O’Crêpe",
  "Pizza Intime",
  "PO Poulet",
  "Bin Molle & Bin Dure",
  "Nutri Shake",
  "Restaurant Montréal Hub",
  "ON2GO",
  "PPP Pizzeria",
] as const;

const PLACEMENTS: RunwayAdPlacement[] = [
  "home",
  "schedule",
  "team",
  "gallery",
  "news",
  "arena",
  "partners",
];

export const RUNWAY_AD_CREATIVES: RunwayAdCreative[] = Array.from({ length: 54 }, (_, index) => {
  const sheet = Math.floor(index / 9) + 1;
  const tile = (index % 9) + 1;
  return {
    id: `runway-s${sheet}-t${String(tile).padStart(2, "0")}`,
    sheet,
    tile,
    path: `/sponsor-creatives/runway/runway-sheet-${sheet}-tile-${String(tile).padStart(2, "0")}.jpg`,
    ratio: "16:9",
    placement: PLACEMENTS[index % PLACEMENTS.length]!,
    reviewStatus: "needs-brand-classification",
    advertiser: PRINTED_TITLES[Math.floor(index / 3)]!,
    ...(sheet === 5 && tile >= 4 && tile <= 6
      ? { displayCrop: { width: tile === 5 ? 854 : 853, height: 480, top: 20 } }
      : {}),
  };
});

export function runwayCreativesForPlacement(placement: RunwayAdPlacement, count = 6) {
  return RUNWAY_AD_CREATIVES.filter((creative) => creative.placement === placement).slice(
    0,
    Math.max(0, count),
  );
}
