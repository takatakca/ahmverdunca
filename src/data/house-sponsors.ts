export type HouseSponsor = {
  id: string;
  name: string;
  short: string;
  tagline: { fr: string; en: string };
  href?: string;
  creative?: string;
  group: "takatak" | "hospitality" | "food" | "local";
};

export const HOUSE_SPONSORS: HouseSponsor[] = [
  { id: "qmaps", name: "QMAPS", short: "QM", tagline: { fr: "Découvrir les entreprises locales.", en: "Discover local businesses." }, href: "https://qmaps.ca", creative: "/sponsor-creatives/qmaps.svg", group: "takatak" },
  { id: "flexs", name: "FLEXS", short: "FX", tagline: { fr: "Demandes locales et génération de leads.", en: "Local requests and lead generation." }, creative: "/sponsor-creatives/flexs.svg", group: "takatak" },
  { id: "r2nette", name: "R2NETTE", short: "R2", tagline: { fr: "Réservation simple de services.", en: "Simple service booking." }, creative: "/sponsor-creatives/r2nette.svg", group: "takatak" },
  { id: "havana", name: "Havana Resort", short: "HR", tagline: { fr: "Escapades, événements et plein air.", en: "Getaways, events and outdoor fun." }, href: "https://havanaresort.ca", creative: "/sponsor-creatives/havana.svg", group: "hospitality" },
  { id: "destination-camping", name: "Destination Camping", short: "DC", tagline: { fr: "Idées et destinations plein air.", en: "Outdoor ideas and destinations." }, creative: "/sponsor-creatives/destination-camping.svg", group: "hospitality" },
  { id: "ooeuf", name: "OOEUF", short: "OO", tagline: { fr: "Déjeuners et brunchs montréalais.", en: "Montreal breakfast and brunch." }, href: "https://ooeuf.ca", creative: "/sponsor-creatives/ooeuf.svg", group: "food" },
  { id: "viennoise", name: "La Viennoise", short: "LV", tagline: { fr: "Boulangerie, café et gourmandises.", en: "Bakery, coffee and treats." }, href: "https://viennoise.ca", creative: "/sponsor-creatives/viennoise.svg", group: "food" },
  { id: "ppp", name: "PPP Pizzeria", short: "PPP", tagline: { fr: "Pizza montréalaise.", en: "Montreal pizza." }, href: "https://pppmtl.com", creative: "/sponsor-creatives/ppp.svg", group: "food" },
  { id: "bolon", name: "Bolon Café", short: "BC", tagline: { fr: "Café de quartier.", en: "Neighbourhood café." }, href: "https://bolon.ca", creative: "/sponsor-creatives/bolon.svg", group: "food" },
  { id: "po-poulet", name: "PO Poulet", short: "PO", tagline: { fr: "Poulet et repas généreux.", en: "Chicken and generous meals." }, href: "https://popoulet.ca", creative: "/sponsor-creatives/po-poulet.svg", group: "food" },
  { id: "nutrishake", name: "Nutri Shake", short: "NS", tagline: { fr: "Boissons et options protéinées.", en: "Protein drinks and options." }, href: "https://nutrishake.ca", creative: "/sponsor-creatives/nutrishake.svg", group: "food" },
  { id: "pi-pita", name: "Pi Pita", short: "PI", tagline: { fr: "Pitas et repas rapides.", en: "Pitas and quick meals." }, href: "https://pipita.ca", creative: "/sponsor-creatives/pi-pita.svg", group: "food" },
] as const;

export function houseSponsorsForPlacement(seed: string, count = 2) {
  if (seed === "home-main") {
    return HOUSE_SPONSORS.slice(0, Math.min(count, HOUSE_SPONSORS.length));
  }

  const score = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  return Array.from({ length: Math.min(count, HOUSE_SPONSORS.length) }, (_, index) =>
    HOUSE_SPONSORS[(score + index * 3) % HOUSE_SPONSORS.length]!,
  );
}
