import { describe, expect, test } from "bun:test";
import {
  buildCampaignUrl,
  CAMPAIGN_DESTINATIONS,
  CAMPAIGN_SOURCES,
  isSafeCampaignSearch,
  partnerBacklinkMarkup,
  publicCampaignKit,
  type CampaignDestination,
  type CampaignSource,
} from "../src/lib/campaign-links";

describe("public campaign and partner links", () => {
  test("all preset channels retain the real canonical destination and a safe query", () => {
    for (const key of Object.keys(CAMPAIGN_DESTINATIONS))
      for (const source of Object.keys(CAMPAIGN_SOURCES)) {
        const url = new URL(buildCampaignUrl(key as CampaignDestination, source as CampaignSource));
        expect(url.origin).toBe("https://ahmverdun.ca");
        expect(url.pathname).toBe(CAMPAIGN_DESTINATIONS[key as CampaignDestination].path);
        expect(isSafeCampaignSearch(url.search)).toBe(true);
      }
  });
  test("unknown IDs, personal values, duplicated parameters and query substitution cannot become approved campaign URLs", () => {
    for (const search of [
      "?email=someone@example.com",
      "?utm_source=someone@example.com&utm_medium=email&utm_campaign=inscriptions-2026-2027",
      "?utm_source=facebook&utm_medium=social&utm_campaign=inscriptions-2026-2027&teamId=123",
      "?utm_source=facebook&utm_medium=social&utm_campaign=inscriptions-2026-2027&utm_source=tiktok",
      "?utm_source=facebook&utm_medium=email&utm_campaign=inscriptions-2026-2027",
    ])
      expect(isSafeCampaignSearch(search)).toBe(false);
    expect(() =>
      buildCampaignUrl("registration", "javascript:alert(1)" as CampaignSource),
    ).toThrow();
    expect(isSafeCampaignSearch("")).toBe(true);
  });
  test("editorial backlinks remain canonical and the downloadable kit uses only known public data", () => {
    expect(partnerBacklinkMarkup("registration")).toContain(
      'href="https://ahmverdun.ca/inscriptions"',
    );
    expect(partnerBacklinkMarkup("registration")).not.toContain("utm_");
    expect(partnerBacklinkMarkup("registration", "fr", true)).toContain('rel="sponsored"');
    const kit = publicCampaignKit();
    expect(kit.links).toHaveLength(3);
    expect(Object.keys(kit.links[0].campaigns)).toHaveLength(6);
    expect(JSON.stringify(kit)).not.toContain("email=");
  });
});
