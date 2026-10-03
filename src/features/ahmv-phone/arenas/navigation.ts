import type { PhoneLanguage } from "../../../lib/ahmv-phone";
import { ARENAS, arenaDirectionsTargetForVenue } from "@/data/arenas";

export interface ArenaNavigationLinks {
  destination: string;
  googleMaps: string;
  appleMaps: string;
  waze: string;
  arenaSlug?: string | undefined;
}

export function navigationLinksForVenue(venue: string): ArenaNavigationLinks {
  const destination = arenaDirectionsTargetForVenue(venue);
  const encoded = encodeURIComponent(destination);
  const arena = ARENAS.find((item) => item.address === destination);
  return {
    destination,
    arenaSlug: arena?.slug,
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
    appleMaps: `https://maps.apple.com/?daddr=${encoded}`,
    waze: `https://www.waze.com/ul?q=${encoded}&navigate=yes`,
  };
}

export function compactDirectionsSms(
  venue: string,
  lang: PhoneLanguage,
  siteOrigin = "https://ahmverdun.ca",
) {
  const links = navigationLinksForVenue(venue);
  const arenaPath = links.arenaSlug ? `/arenas/${links.arenaSlug}` : "/arenas";
  return lang === "fr"
    ? `AHMV — ${venue}: ${links.destination}\nItinéraire: ${links.googleMaps}\nAréna: ${siteOrigin}${arenaPath}`
    : lang === "es"
      ? `AHMV — ${venue}: ${links.destination}\nCómo llegar: ${links.googleMaps}\nArena: ${siteOrigin}${arenaPath}`
      : `AHMV — ${venue}: ${links.destination}\nDirections: ${links.googleMaps}\nArena: ${siteOrigin}${arenaPath}`;
}
