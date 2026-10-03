import type { PhoneLanguage } from "../../../lib/ahmv-phone.ts";
import { navigationLinksForVenue } from "../arenas/navigation.ts";
import type { AuthoritativeEventSnapshot } from "./change-detector.ts";

function localEventTime(value: string, lang: PhoneLanguage) {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
    timeZone: "America/Toronto",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function gameReminderText(
  event: AuthoritativeEventSnapshot,
  lang: PhoneLanguage,
) {
  const directions = navigationLinksForVenue(event.venue);
  const time = localEventTime(event.startsAt, lang);

  if (lang === "fr") {
    return [
      "AHMV — Rappel de votre événement.",
      time + " — " + event.venue + ".",
      "Itinéraire: " + directions.googleMaps,
    ].join("\n");
  }

  return [
    "AHMV — Event reminder.",
    time + " — " + event.venue + ".",
    "Directions: " + directions.googleMaps,
  ].join("\n");
}
