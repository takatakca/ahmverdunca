import type { PhoneLanguage } from "../../../lib/ahmv-phone.ts";
import { navigationLinksForVenue } from "../arenas/navigation.ts";
import type {
  AuthoritativeEventSnapshot,
  EventChange,
} from "./change-detector.ts";

function localEventTime(value: string, lang: PhoneLanguage) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
    timeZone: "America/Toronto",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function eventChangeAlertText(
  changes: readonly EventChange[],
  lang: PhoneLanguage,
) {
  if (!changes.length) return "";

  const current: AuthoritativeEventSnapshot = changes[0]!.current;
  const kinds = new Set(changes.map((change) => change.kind));
  const directions = navigationLinksForVenue(current.venue);

  if (lang === "fr") {
    const lines = ["AHMV — Mise à jour importante."];
    if (kinds.has("cancelled")) {
      lines.push("L'événement a été ANNULÉ.");
    } else if (kinds.has("restored")) {
      lines.push("L'événement est de nouveau confirmé.");
    }
    if (kinds.has("time_changed")) {
      lines.push("Nouvelle heure: " + localEventTime(current.startsAt, lang) + ".");
    }
    if (kinds.has("venue_changed")) {
      lines.push("Nouvel aréna: " + current.venue + ".");
      lines.push("Itinéraire: " + directions.googleMaps);
    }
    return lines.join("\n");
  }

  const lines = ["AHMV — Important update."];
  if (kinds.has("cancelled")) {
    lines.push("The event has been CANCELLED.");
  } else if (kinds.has("restored")) {
    lines.push("The event is confirmed again.");
  }
  if (kinds.has("time_changed")) {
    lines.push("New time: " + localEventTime(current.startsAt, lang) + ".");
  }
  if (kinds.has("venue_changed")) {
    lines.push("New arena: " + current.venue + ".");
    lines.push("Directions: " + directions.googleMaps);
  }
  return lines.join("\n");
}
