import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applyPublicResponsePolicy } from "./lib/response-policy";
import { handleAhmvTwilio } from "./lib/ahmv-twilio.server";
import { handleTakatakTeamFeed } from "./lib/takatak-team-feed.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const PUBLIC_INDEXING_ENABLED = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";

const LEGACY_REDIRECTS: Record<string, string> = {
  "/index": "/",
  "/schedules": "/horaires",
  "/pages/2": "/horaires",
  "/photos": "/galerie",
  "/news": "/nouvelles",
  "/news/26": "/inscriptions",
  "/news/27": "/ressources",
  "/news/29": "/contact",
  "/news/33": "/equipes/feminin",
  "/news/34": "/wllv",
  "/news/35": "/tournois",
  "/news/37": "/nouvelles/academie-ahmv-remise-des-bourses",
  "/news/38": "/nouvelles/debut-de-saison-m5-m7",
  "/news/39": "/nouvelles/annulations-22-26-septembre-2026",
  "/albums": "/galerie",
  "/albums/1": "/galerie/tournoi-m11-2025",
  "/albums/2": "/galerie/journee-benevoles-2024",
  "/albums/3": "/galerie/porte-ouverte-hockey-feminin",
  "/albums/4": "/galerie/fete-fin-annee-2025-2026",
  "/storage/5pW35UlsUj1CAOp9lljaN4JAnw5ayAEH70vcajXy.pdf": "/horaires",
};

function legacyRedirect(request: Request) {
  const url = new URL(request.url);
  const target =
    LEGACY_REDIRECTS[url.pathname] ??
    (/^\/news\/\d+$/.test(url.pathname)
      ? "/nouvelles"
      : /^\/albums\/\d+$/.test(url.pathname)
        ? "/galerie"
        : undefined);
  if (!target) return null;
  return Response.redirect(new URL(target, url.origin), 308);
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    const phoneResponse = await handleAhmvTwilio(request);
    if (phoneResponse) return phoneResponse;
    const teamFeedResponse = await handleTakatakTeamFeed(request);
    if (teamFeedResponse) return teamFeedResponse;
    if (url.pathname === "/healthz") {
      return new Response(JSON.stringify({ ok: true, service: "ahmverdun-web" }), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }

    const redirectResponse = legacyRedirect(request);
    if (redirectResponse) return applyPublicResponsePolicy(redirectResponse, request, PUBLIC_INDEXING_ENABLED);

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return applyPublicResponsePolicy(await normalizeCatastrophicSsrResponse(response), request, PUBLIC_INDEXING_ENABLED);
    } catch (error) {
      console.error(error);
      return applyPublicResponsePolicy(new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }), request, PUBLIC_INDEXING_ENABLED);
    }
  },
};
