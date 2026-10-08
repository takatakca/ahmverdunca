import { SITE } from "./site";

export const CAMPAIGN_DESTINATIONS = {
  registration: {
    path: "/inscriptions",
    campaign: "inscriptions-2026-2027",
    label: {
      fr: "Inscriptions au hockey mineur de Verdun",
      en: "Verdun minor hockey registration",
    },
  },
  teams: {
    path: "/equipes",
    campaign: "equipes-2026-2027",
    label: { fr: "Les équipes de hockey d’AHM Verdun", en: "AHM Verdun hockey teams" },
  },
  sponsorship: {
    path: "/partenaires",
    campaign: "commandites-2026-2027",
    label: { fr: "Soutenir le hockey mineur à Verdun", en: "Support minor hockey in Verdun" },
  },
} as const;

export const CAMPAIGN_SOURCES = {
  facebook: "social",
  instagram: "social",
  tiktok: "social",
  google: "cpc",
  newsletter: "email",
  partenaire: "referral",
} as const;

export type CampaignDestination = keyof typeof CAMPAIGN_DESTINATIONS;
export type CampaignSource = keyof typeof CAMPAIGN_SOURCES;

export function buildCampaignUrl(destination: CampaignDestination, source: CampaignSource) {
  if (
    !Object.hasOwn(CAMPAIGN_DESTINATIONS, destination) ||
    !Object.hasOwn(CAMPAIGN_SOURCES, source)
  ) {
    throw new Error("Unknown campaign destination or source");
  }
  const record = CAMPAIGN_DESTINATIONS[destination];
  const url = new URL(record.path, SITE.domain);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", CAMPAIGN_SOURCES[source]);
  url.searchParams.set("utm_campaign", record.campaign);
  return url.href;
}

/** Only public presets may reach marketing SDKs; arbitrary query values are never approved. */
export function isSafeCampaignSearch(search: string) {
  if (!search || search === "?") return true;
  const params = new URLSearchParams(search);
  const keys = [...params.keys()];
  if (
    keys.length !== 3 ||
    new Set(keys).size !== 3 ||
    keys.some((key) => !["utm_source", "utm_medium", "utm_campaign"].includes(key))
  )
    return false;
  const source = params.get("utm_source") ?? "";
  if (!Object.hasOwn(CAMPAIGN_SOURCES, source)) return false;
  return (
    params.get("utm_medium") === CAMPAIGN_SOURCES[source as CampaignSource] &&
    Object.values(CAMPAIGN_DESTINATIONS).some(
      (record) => record.campaign === params.get("utm_campaign"),
    )
  );
}

export function partnerBacklinkMarkup(
  destination: CampaignDestination,
  language: "fr" | "en" = "fr",
  sponsored = false,
) {
  const record = CAMPAIGN_DESTINATIONS[destination];
  if (!record) throw new Error("Unknown destination");
  return `<a href="${SITE.domain}${record.path}"${sponsored ? ' rel="sponsored"' : ""}>${record.label[language]}</a>`;
}

export function publicCampaignKit(language: "fr" | "en" = "fr") {
  return {
    association: SITE.name[language],
    website: SITE.domain,
    logo: `${SITE.domain}/branding/ahmv-logo-gallery-2026.png`,
    newsFeed: `${SITE.domain}/actualites.xml`,
    jsonFeed: `${SITE.domain}/actualites.json`,
    area: "Verdun, Montréal, Québec, Canada",
    season: SITE.season,
    links: Object.entries(CAMPAIGN_DESTINATIONS).map(([key, record]) => ({
      label: record.label[language],
      canonical: `${SITE.domain}${record.path}`,
      backlink: partnerBacklinkMarkup(key as CampaignDestination, language),
      campaigns: Object.fromEntries(
        Object.keys(CAMPAIGN_SOURCES).map((source) => [
          source,
          buildCampaignUrl(key as CampaignDestination, source as CampaignSource),
        ]),
      ),
    })),
  };
}
