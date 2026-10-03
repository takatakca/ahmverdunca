import { calendarIcs, findCalendarEvent, googleCalendarUrl } from "./event.ts";
import { validateCalendarLink } from "./link.server.ts";
import { navigationLinksForVenue } from "../arenas/navigation.ts";

type Settings = Record<string, string | undefined>;

const BASE_HEADERS = {
  "cache-control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

function htmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unavailable(status: number, code: string) {
  return new Response(JSON.stringify({ error: code }), {
    status,
    headers: {
      ...BASE_HEADERS,
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export function handleAhmvCalendarLink(
  request: Request,
  settings: Settings = process.env,
): Response | null {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/calendar/add") return null;

  if (settings["AHMV_CALENDAR_LINKS_ENABLED"] !== "true") {
    return unavailable(404, "calendar_disabled");
  }

  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: {
        ...BASE_HEADERS,
        Allow: "GET",
        "content-type": "application/json; charset=utf-8",
      },
    });
  }

  const eventId = url.searchParams.get("event") ?? "";
  const expires = url.searchParams.get("exp") ?? "";
  const signature = url.searchParams.get("sig") ?? "";

  if (!validateCalendarLink({ eventId, expires, signature }, settings)) {
    return unavailable(403, "invalid_or_expired_calendar_link");
  }

  const event = findCalendarEvent(eventId);
  if (!event) return unavailable(404, "event_not_found");

  if (url.searchParams.get("format") === "ics") {
    const ics = calendarIcs(eventId);
    if (!ics) return unavailable(404, "event_not_found");
    return new Response(ics, {
      status: 200,
      headers: {
        ...BASE_HEADERS,
        "content-type": "text/calendar; charset=utf-8",
        "content-disposition": 'attachment; filename="ahmv-event.ics"',
      },
    });
  }

  const google = googleCalendarUrl(eventId);
  const directions = navigationLinksForVenue(event.venue);
  const icsUrl = new URL(url.toString());
  icsUrl.searchParams.set("format", "ics");

  const statusNotice =
    event.status === "cancelled"
      ? '<p class="alert">Cet événement est indiqué ANNULÉ dans la source AHMV actuelle.</p>'
      : "";

  const googleButton = google
    ? '<a href="' +
      htmlEscape(google) +
      '" rel="noopener noreferrer">Google Calendar</a>'
    : "";

  const body = [
    "<!doctype html>",
    '<html lang="fr">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="robots" content="noindex,nofollow">',
    "<title>Ajouter au calendrier — AHMV</title>",
    "<style>",
    "body{font-family:system-ui,-apple-system,sans-serif;background:#0b1320;color:#fff;margin:0;padding:24px}",
    "main{max-width:620px;margin:40px auto;background:#142238;border:1px solid #29405f;border-radius:18px;padding:24px}",
    "h1{font-size:1.55rem;margin:0 0 8px}.meta{color:#c8d5e6;line-height:1.55}.alert{background:#5b1d1d;padding:12px;border-radius:10px}",
    ".actions{display:grid;gap:12px;margin-top:22px}a{display:block;text-decoration:none;text-align:center;background:#fff;color:#0b1320;padding:13px 16px;border-radius:10px;font-weight:700}",
    ".secondary{background:#d8e6f7}.foot{font-size:.85rem;color:#9fb2c9;margin-top:20px}",
    "</style>",
    "</head>",
    "<body>",
    "<main>",
    "<h1>" +
      htmlEscape(event.activity) +
      " — " +
      htmlEscape(event.group) +
      "</h1>",
    '<p class="meta">' +
      htmlEscape(event.date) +
      " " +
      htmlEscape(event.start) +
      "–" +
      htmlEscape(event.end) +
      "<br>" +
      htmlEscape(event.venue) +
      "<br>" +
      htmlEscape(directions.destination) +
      "</p>",
    statusNotice,
    '<div class="actions">',
    googleButton,
    '<a class="secondary" href="' +
      htmlEscape(icsUrl.toString()) +
      '">Apple / Outlook / .ics</a>',
    '<a class="secondary" href="' +
      htmlEscape(directions.googleMaps) +
      '" rel="noopener noreferrer">Directions</a>',
    "</div>",
    '<p class="foot">Service AHMV propulsé par GROUPE TAKATAK. Ce lien temporaire contient uniquement des données publiques d’horaire.</p>',
    "</main>",
    "</body>",
    "</html>",
  ].join("");

  return new Response(body, {
    status: 200,
    headers: {
      ...BASE_HEADERS,
      "content-type": "text/html; charset=utf-8",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    },
  });
}
