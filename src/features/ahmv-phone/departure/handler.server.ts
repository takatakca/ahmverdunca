import { calendarEventTimes } from "../calendar/event.ts";
import { navigationLinksForVenue } from "../arenas/navigation.ts";
import {
  arrivalBufferMinutes,
  recommendedDepartureAt,
  resolveRouteEstimate,
} from "./route-provider.server.ts";
import { validateDepartureLink } from "./link.server.ts";

type Settings = Record<string, string | undefined>;

const BASE_HEADERS = {
  "cache-control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(self)",
};

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      ...BASE_HEADERS,
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function htmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function signedInput(url: URL) {
  return {
    eventId: url.searchParams.get("event") ?? "",
    expires: url.searchParams.get("exp") ?? "",
    signature: url.searchParams.get("sig") ?? "",
  };
}

function validOrigin(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const latitude = row["latitude"];
  const longitude = row["longitude"];
  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}

export async function handleAhmvDeparture(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (
    url.pathname !== "/api/ahmv/departure" &&
    url.pathname !== "/api/ahmv/departure/estimate"
  ) {
    return null;
  }

  if (settings["AHMV_SMART_DEPARTURE_ENABLED"] !== "true") {
    return json({ error: "departure_disabled" }, 404);
  }

  if (url.pathname === "/api/ahmv/departure/estimate") {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "method_not_allowed" }), {
        status: 405,
        headers: {
          ...BASE_HEADERS,
          Allow: "POST",
          "content-type": "application/json; charset=utf-8",
        },
      });
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return json({ error: "unsupported_media_type" }, 415);
    }

    const length = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(length) && length > 4096) {
      return json({ error: "payload_too_large" }, 413);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "invalid_request" }, 400);
    }

    const value = body as Record<string, unknown>;
    const eventId = typeof value["event"] === "string" ? value["event"] : "";
    const expires = typeof value["exp"] === "string" ? value["exp"] : "";
    const signature = typeof value["sig"] === "string" ? value["sig"] : "";
    const origin = validOrigin(value["origin"]);

    if (
      !origin ||
      !validateDepartureLink(
        { eventId, expires, signature },
        settings,
      )
    ) {
      return json({ error: "invalid_or_expired_departure_link" }, 403);
    }

    const valueEvent = calendarEventTimes(eventId);
    if (!valueEvent) return json({ error: "event_not_found" }, 404);
    if (
      valueEvent.event.status !== "scheduled" ||
      Date.parse(valueEvent.startIso) <= Date.now()
    ) {
      return json({ error: "event_not_active" }, 409);
    }

    const directions = navigationLinksForVenue(valueEvent.event.venue);
    const result = await resolveRouteEstimate(
      {
        origin,
        destination: directions.destination,
        eventStartsAt: valueEvent.startIso,
      },
      settings,
    );

    if (!result.available) {
      return json({
        available: false,
        reason: result.reason,
        eventStartsAt: valueEvent.startIso,
        destination: directions.destination,
        navigation: {
          googleMaps: directions.googleMaps,
          appleMaps: directions.appleMaps,
          waze: directions.waze,
        },
        privacy: {
          locationStored: false,
        },
      });
    }

    const bufferMinutes = arrivalBufferMinutes(settings);
    const departureAt = recommendedDepartureAt({
      eventStartsAt: valueEvent.startIso,
      trafficDurationMinutes: result.estimate.trafficDurationMinutes,
      arrivalBufferMinutes: bufferMinutes,
    });

    return json({
      available: true,
      eventStartsAt: valueEvent.startIso,
      departureAt,
      arrivalBufferMinutes: bufferMinutes,
      durationMinutes: result.estimate.durationMinutes,
      trafficDurationMinutes: result.estimate.trafficDurationMinutes,
      distanceKm: result.estimate.distanceKm,
      provider: result.estimate.provider,
      destination: directions.destination,
      navigation: {
        googleMaps: directions.googleMaps,
        appleMaps: directions.appleMaps,
        waze: directions.waze,
      },
      privacy: {
        locationStored: false,
      },
    });
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

  const signed = signedInput(url);
  if (!validateDepartureLink(signed, settings)) {
    return json({ error: "invalid_or_expired_departure_link" }, 403);
  }

  const eventValue = calendarEventTimes(signed.eventId);
  if (!eventValue) return json({ error: "event_not_found" }, 404);

  const { event, startIso } = eventValue;
  const directions = navigationLinksForVenue(event.venue);
  const estimateEndpoint = "/api/ahmv/departure/estimate";
  const payload = JSON.stringify({
    event: signed.eventId,
    exp: signed.expires,
    sig: signed.signature,
  }).replace(/</g, "\\u003c");

  const cancelled =
    event.status === "cancelled"
      ? '<div class="alert">Cet événement est actuellement indiqué ANNULÉ. Le calcul de départ est désactivé.</div>'
      : "";

  const disabled = event.status === "cancelled" ? " disabled" : "";

  const script =
    "(function(){" +
    "const base=" + payload + ";" +
    "const b=document.getElementById('locate');" +
    "const out=document.getElementById('result');" +
    "if(!b||!out)return;" +
    "function show(t){out.textContent=t;}" +
    "b.addEventListener('click',function(){" +
    "if(!navigator.geolocation){show('La localisation n’est pas disponible sur cet appareil. Utilisez un bouton d’itinéraire.');return;}" +
    "b.disabled=true;show('Calcul en cours…');" +
    "navigator.geolocation.getCurrentPosition(async function(p){" +
    "try{" +
    "const r=await fetch('" + estimateEndpoint + "',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...base,origin:{latitude:p.coords.latitude,longitude:p.coords.longitude}})});" +
    "const d=await r.json();" +
    "if(!r.ok){show('Impossible de calculer le départ pour le moment.');return;}" +
    "if(!d.available){show('Le trafic en direct n’est pas encore connecté. Utilisez Waze, Google Maps ou Apple Maps ci-dessous.');return;}" +
    "const leave=new Date(d.departureAt);" +
    "show('Départ recommandé: '+leave.toLocaleString('fr-CA')+' · trajet avec trafic: '+d.trafficDurationMinutes+' min · marge arrivée: '+d.arrivalBufferMinutes+' min.');" +
    "}catch(e){show('Impossible de calculer le départ pour le moment.');}" +
    "finally{b.disabled=false;}" +
    "},function(){b.disabled=false;show('Localisation refusée ou indisponible. Aucune position n’a été enregistrée.');},{enableHighAccuracy:false,timeout:8000,maximumAge:300000});" +
    "});" +
    "})();";

  const body = [
    "<!doctype html>",
    '<html lang="fr"><head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="robots" content="noindex,nofollow">',
    "<title>Départ intelligent — AHMV</title>",
    "<style>",
    "body{font-family:system-ui,-apple-system,sans-serif;background:#0b1320;color:#fff;margin:0;padding:24px}",
    "main{max-width:680px;margin:36px auto;background:#142238;border:1px solid #29405f;border-radius:18px;padding:24px}",
    "h1{margin:0 0 8px;font-size:1.55rem}.meta,.privacy{color:#c8d5e6;line-height:1.55}",
    ".alert{background:#5b1d1d;padding:12px;border-radius:10px;margin:16px 0}",
    "button,a{box-sizing:border-box;width:100%;display:block;border:0;border-radius:10px;padding:13px 16px;margin-top:12px;font-weight:700;text-align:center;text-decoration:none}",
    "button{background:#fff;color:#0b1320;cursor:pointer}button:disabled{opacity:.55}.nav{background:#d8e6f7;color:#0b1320}",
    "#result{min-height:48px;margin-top:16px;padding:12px;background:#0b1320;border-radius:10px;white-space:pre-wrap}",
    "</style></head><body><main>",
    "<h1>Départ intelligent — " + htmlEscape(event.group) + "</h1>",
    '<p class="meta">' +
      htmlEscape(event.date) +
      " " +
      htmlEscape(event.start) +
      " · " +
      htmlEscape(event.venue) +
      "<br>" +
      htmlEscape(directions.destination) +
      "</p>",
    cancelled,
    '<button id="locate"' + disabled + ">Utiliser ma position pour calculer mon départ</button>",
    '<div id="result" aria-live="polite">La position n’est demandée qu’après votre clic.</div>',
    '<a class="nav" href="' + htmlEscape(directions.waze) + '" rel="noopener noreferrer">Ouvrir Waze</a>',
    '<a class="nav" href="' + htmlEscape(directions.googleMaps) + '" rel="noopener noreferrer">Ouvrir Google Maps</a>',
    '<a class="nav" href="' + htmlEscape(directions.appleMaps) + '" rel="noopener noreferrer">Ouvrir Apple Maps</a>',
    '<p class="privacy">Votre position sert uniquement au calcul demandé et n’est pas enregistrée par cette page. Aucun GPS n’est déduit de votre numéro de téléphone.</p>',
    "<script>" + script + "</script>",
    "</main></body></html>",
  ].join("");

  return new Response(body, {
    status: 200,
    headers: {
      ...BASE_HEADERS,
      "content-type": "text/html; charset=utf-8",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    },
  });
}
