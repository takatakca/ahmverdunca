import { PUBLIC_TEAM_DIRECTORY } from "../../../data/team-directory.ts";

export type MarketingAudience =
  | { kind: "all_opted_in" }
  | { kind: "teams"; teamIds: string[] };

export interface MarketingCampaignInput {
  campaignId: string;
  campaignName: string;
  bodyFr: string;
  bodyEn: string;
  bodyEs: string;
  audience: MarketingAudience;
  scheduledAt: string;
}

function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned && cleaned.length <= max ? cleaned : null;
}

function knownTeamIds() {
  return new Set(PUBLIC_TEAM_DIRECTORY.map((team) => team.legacyScheduleTeamId));
}

export function validateMarketingCampaignInput(
  value: unknown,
  now = new Date(),
): MarketingCampaignInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;

  const campaignId = cleanText(row["campaignId"], 128);
  const campaignName = cleanText(row["campaignName"], 160);
  const bodyFr = cleanText(row["bodyFr"], 800);
  const bodyEn = cleanText(row["bodyEn"], 800);
  const bodyEs = cleanText(row["bodyEs"], 800);
  const scheduledAtRaw =
    typeof row["scheduledAt"] === "string" ? row["scheduledAt"] : "";
  const scheduledTimestamp = Date.parse(scheduledAtRaw);

  if (
    !campaignId ||
    !/^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(campaignId) ||
    !campaignName ||
    !bodyFr ||
    !bodyEn ||
    !bodyEs ||
    !Number.isFinite(scheduledTimestamp) ||
    scheduledTimestamp < now.getTime() - 5 * 60_000 ||
    scheduledTimestamp > now.getTime() + 90 * 86_400_000
  ) {
    return null;
  }

  const rawAudience = row["audience"];
  if (
    !rawAudience ||
    typeof rawAudience !== "object" ||
    Array.isArray(rawAudience)
  ) {
    return null;
  }

  const audienceRow = rawAudience as Record<string, unknown>;
  const kind = audienceRow["kind"];

  if (kind === "all_opted_in") {
    return {
      campaignId,
      campaignName,
      bodyFr,
      bodyEn,
      bodyEs,
      audience: { kind: "all_opted_in" },
      scheduledAt: new Date(scheduledTimestamp).toISOString(),
    };
  }

  if (kind === "teams") {
    const rawTeamIds = audienceRow["teamIds"];
    if (!Array.isArray(rawTeamIds) || rawTeamIds.length < 1 || rawTeamIds.length > 50) {
      return null;
    }

    const allowed = knownTeamIds();
    const teamIds = [
      ...new Set(
        rawTeamIds.filter(
          (teamId): teamId is string =>
            typeof teamId === "string" && allowed.has(teamId),
        ),
      ),
    ];

    if (teamIds.length !== rawTeamIds.length) return null;

    return {
      campaignId,
      campaignName,
      bodyFr,
      bodyEn,
      bodyEs,
      audience: { kind: "teams", teamIds },
      scheduledAt: new Date(scheduledTimestamp).toISOString(),
    };
  }

  return null;
}

export function marketingLegalInfoUrl(
  settings: Record<string, string | undefined> = process.env,
) {
  const value = settings["TAKATAK_SMS_CEM_INFO_URL"]?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function marketingMessageBody(
  body: string,
  infoUrl: string,
) {
  const suffix = `GROUPE TAKATAK / AHMV • Infos: ${infoUrl} • STOP`;
  return `${body.trim()}\n${suffix}`.slice(0, 1500);
}
