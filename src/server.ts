import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applyPublicResponsePolicy } from "./lib/response-policy";
import { handleAhmvTwilio } from "./lib/ahmv-twilio.server";
import { handleAhmvPhoneStatus } from "./lib/ahmv-phone-status.server";
import { handleAhmvPhoneDemo } from "./features/ahmv-phone/demo/handler.server";
import { handleAhmvPhoneOpsSummary } from "./features/ahmv-phone/ops/handler.server";
import { handleAhmvPhoneOpsFunnel } from "./features/ahmv-phone/ops/funnel-handler.server";
import { handleAhmvPhoneOpsHealth } from "./features/ahmv-phone/ops/health-handler.server";
import { handleAhmvPhoneRetention } from "./features/ahmv-phone/privacy/handler.server";
import { handleAhmvPhoneLifecycleCron } from "./features/ahmv-phone/messaging/lifecycle-handler.server";
import { handleAhmvPhoneReminderCron } from "./features/ahmv-phone/reminders/handler.server";
import { handleAhmvCalendarLink } from "./features/ahmv-phone/calendar/handler.server";
import { handleAhmvDeparture } from "./features/ahmv-phone/departure/handler.server";
import { handleTakatakMembershipSync } from "./features/ahmv-phone/takatak/membership-handler.server";
import { handleTakatakMarketingCampaign } from "./features/ahmv-phone/marketing/handler.server";
import { handleTakatakMarketingConsentSync } from "./features/ahmv-phone/marketing/consent-handler.server";
import { handleAhmvMarketingCampaignCron } from "./features/ahmv-phone/marketing/cron-handler.server";
import { handleTakatakTeamFeed } from "./lib/takatak-team-feed.server";
import { handleAhmvVoiceBridge } from "./lib/ahmv-voice-bridge.server";

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
    const phoneStatusResponse = handleAhmvPhoneStatus(request);
    if (phoneStatusResponse) return phoneStatusResponse;
    const calendarResponse = handleAhmvCalendarLink(request);
    if (calendarResponse) return calendarResponse;
    const departureResponse = await handleAhmvDeparture(request);
    if (departureResponse) return departureResponse;
    const membershipSyncResponse = await handleTakatakMembershipSync(request);
    if (membershipSyncResponse) return membershipSyncResponse;
    const marketingCampaignResponse = await handleTakatakMarketingCampaign(request);
    if (marketingCampaignResponse) return marketingCampaignResponse;
    const marketingConsentResponse = await handleTakatakMarketingConsentSync(request);
    if (marketingConsentResponse) return marketingConsentResponse;
    const phoneDemoResponse = await handleAhmvPhoneDemo(request);
    if (phoneDemoResponse) return phoneDemoResponse;
    const phoneOpsResponse = await handleAhmvPhoneOpsSummary(request);
    if (phoneOpsResponse) return phoneOpsResponse;
    const phoneOpsFunnelResponse = await handleAhmvPhoneOpsFunnel(request);
    if (phoneOpsFunnelResponse) return phoneOpsFunnelResponse;
    const phoneOpsHealthResponse = await handleAhmvPhoneOpsHealth(request);
    if (phoneOpsHealthResponse) return phoneOpsHealthResponse;
    const phoneRetentionResponse = await handleAhmvPhoneRetention(request);
    if (phoneRetentionResponse) return phoneRetentionResponse;
    const phoneLifecycleResponse = await handleAhmvPhoneLifecycleCron(request);
    if (phoneLifecycleResponse) return phoneLifecycleResponse;
    const phoneReminderResponse = await handleAhmvPhoneReminderCron(request);
    if (phoneReminderResponse) return phoneReminderResponse;
    const phoneCampaignResponse = await handleAhmvMarketingCampaignCron(request);
    if (phoneCampaignResponse) return phoneCampaignResponse;
    const voiceBridgeResponse = await handleAhmvVoiceBridge(request);
    if (voiceBridgeResponse) return voiceBridgeResponse;
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
