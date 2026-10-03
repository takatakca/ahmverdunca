import { authorizeTakatakOpsRequest } from "../ops/auth.server.ts";
import {
  cancelMarketingCampaign,
  marketingCampaignStatus,
  queueMarketingCampaign,
} from "./campaign.server.ts";
import { validateMarketingCampaignInput } from "./campaign.ts";

type Settings = Record<string, string | undefined>;

const HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

function json(value: unknown, status = 200, extra: Record<string,string> = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...HEADERS, ...extra },
  });
}

function campaignIdFromUrl(url: URL) {
  const value = url.searchParams.get("campaignId")?.trim() ?? "";
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(value)
    ? value
    : null;
}

export async function handleTakatakMarketingCampaign(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/ahmv/takatak/campaigns") return null;

  if (settings["AHMV_PHONE_CAMPAIGNS_ENABLED"] !== "true") {
    return json({ error: "campaigns_disabled" }, 404);
  }

  if (!["GET", "POST", "DELETE"].includes(request.method)) {
    return json(
      { error: "method_not_allowed" },
      405,
      { Allow: "GET, POST, DELETE" },
    );
  }

  if (!authorizeTakatakOpsRequest(request, settings)) {
    return json({ error: "forbidden" }, 403);
  }

  try {
    if (request.method === "GET") {
      const campaignId = campaignIdFromUrl(url);
      if (!campaignId) return json({ error: "invalid_campaign_id" }, 400);
      const status = await marketingCampaignStatus(campaignId);
      return status
        ? json(status)
        : json({ error: "campaign_not_found" }, 404);
    }

    if (request.method === "DELETE") {
      const campaignId = campaignIdFromUrl(url);
      if (!campaignId) return json({ error: "invalid_campaign_id" }, 400);
      const result = await cancelMarketingCampaign(campaignId);
      return result.found
        ? json({ ok: true, ...result })
        : json({ error: "campaign_not_found" }, 404);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return json({ error: "unsupported_media_type" }, 415);
    }

    const length = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(length) && length > 16_384) {
      return json({ error: "payload_too_large" }, 413);
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const input = validateMarketingCampaignInput(payload);
    if (!input) return json({ error: "invalid_campaign" }, 400);

    const result = await queueMarketingCampaign(input, settings);
    return json({ ok: true, ...result }, 202);
  } catch (error) {
    console.error("[AHMV TAKATAK marketing campaign]", error);
    const message =
      error instanceof Error ? error.message : "campaign unavailable";
    if (/not configured/i.test(message)) {
      return json({ error: "campaign_configuration_unavailable" }, 503);
    }
    if (/already exists|cannot be re-queued|conflict/i.test(message)) {
      return json({ error: "campaign_conflict" }, 409);
    }
    return json({ error: "campaign_unavailable" }, 503);
  }
}
