export type RunwayAdPlacement =
  | "home"
  | "schedule"
  | "team"
  | "gallery"
  | "news"
  | "arena"
  | "partners";

export interface RunwayAdCreative {
  id: string;
  sheet: number;
  tile: number;
  path: string;
  ratio: "16:9";
  placement: RunwayAdPlacement;
  reviewStatus: "needs-brand-classification";
}

const PLACEMENTS: RunwayAdPlacement[] = [
  "home",
  "schedule",
  "team",
  "gallery",
  "news",
  "arena",
  "partners",
];

export const RUNWAY_AD_CREATIVES: RunwayAdCreative[] = Array.from(
  { length: 54 },
  (_, index) => {
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
    };
  },
);

export function runwayCreativesForPlacement(
  placement: RunwayAdPlacement,
  count = 6,
) {
  return RUNWAY_AD_CREATIVES.filter((creative) => creative.placement === placement).slice(
    0,
    Math.max(0, count),
  );
}
