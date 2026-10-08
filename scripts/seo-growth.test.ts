import { describe, expect, test } from "bun:test";
import { ARENAS } from "../src/data/arenas";
import {
  arenaStructuredData,
  canonicalUrl,
  DEFAULT_SEO,
  resolvePageSeo,
  serializeJsonLd,
  siteStructuredData,
  siteVerificationMeta,
} from "../src/lib/seo";
import { SITE } from "../src/lib/site";

describe("public SEO identity and sharing", () => {
  test("campaign visits and fragments keep the clean canonical page URL", () => {
    for (const input of [
      "partenaires?utm_source=facebook&utm_campaign=verdun#commandite",
      "/partenaires/?fbclid=public-click-id",
      "https://ahmverdun.ca/partenaires?ttclid=public-click-id",
      "//partenaires///#commandite",
    ]) {
      expect(canonicalUrl(input)).toBe("https://ahmverdun.ca/partenaires");
    }
    expect(canonicalUrl("/?utm_source=instagram")).toBe("https://ahmverdun.ca/");
    expect(() => canonicalUrl("https://another-site.example/partenaires")).toThrow();
    expect(() => canonicalUrl("https://user:password@ahmverdun.ca/partenaires")).toThrow();
  });

  test("sharing follows the active child title, image and intentional canonical alias", () => {
    const matches = [
      {
        meta: [
          { property: "og:title", content: DEFAULT_SEO.title },
          { property: "og:description", content: DEFAULT_SEO.description },
          { property: "og:image", content: DEFAULT_SEO.image },
        ],
      },
      {
        meta: [
          { title: "Match M11 — AHM Verdun" },
          { name: "description", content: "Horaire de votre équipe." },
          { property: "og:image", content: "https://ahmverdun.ca/team-photo.jpg" },
        ],
        links: [{ rel: "canonical", href: "https://ahmverdun.ca/equipes" }],
      },
    ];
    expect(resolvePageSeo("/equipe-event/123", matches)).toEqual({
      title: "Match M11 — AHM Verdun",
      description: "Horaire de votre équipe.",
      image: "https://ahmverdun.ca/team-photo.jpg",
      url: "https://ahmverdun.ca/equipes",
    });
    const nextPage = resolvePageSeo("/contact", [{ meta: [{ title: "Contact — AHM Verdun" }] }]);
    expect(nextPage.title).toBe("Contact — AHM Verdun");
    expect(nextPage.image).toBe(DEFAULT_SEO.image);
    expect(nextPage.url).toBe("https://ahmverdun.ca/contact");
  });

  test("unrelated canonical hosts and unsafe sharing images cannot escape the public identity", () => {
    const resolved = resolvePageSeo("/arenas?fbclid=click", [
      {
        links: [{ rel: "canonical", href: "https://another-site.example/arenas" }],
        meta: [{ property: "og:image", content: "javascript:alert(1)" }],
      },
    ]);
    expect(resolved.url).toBe("https://ahmverdun.ca/arenas");
    expect(resolved.image).toBe(DEFAULT_SEO.image);
  });

  test("organization and website share one identity without assigning an arena as an office", () => {
    const graph = siteStructuredData()["@graph"];
    const organization = graph.find((node) => node["@type"] === "SportsOrganization")!;
    const website = graph.find((node) => node["@type"] === "WebSite")!;
    expect(organization["@id"]).toBe("https://ahmverdun.ca/#organization");
    expect(website.publisher?.["@id"]).toBe(organization["@id"]);
    expect(organization.logo?.url).toBe(DEFAULT_SEO.image);
    expect(organization.areaServed?.containedInPlace.name).toBe("Montréal");
    expect(organization).not.toHaveProperty("address");
    if (!SITE.phonePublic) expect(organization).not.toHaveProperty("telephone");
    expect(organization).not.toHaveProperty("aggregateRating");
  });

  test("arena schema uses the verified address and exact source, without guessing coordinates or hours", () => {
    for (const arena of ARENAS) {
      const graph = arenaStructuredData(arena)["@graph"];
      const place = graph.find((node) => node["@type"] === "Place")!;
      const page = graph.find((node) => node["@type"] === "WebPage")!;
      const breadcrumbs = graph.find((node) => node["@type"] === "BreadcrumbList")!;
      expect(place.name).toBe(arena.name);
      expect(place.address).toBe(arena.addressVerified ? arena.address : undefined);
      expect(place.sameAs).toEqual(arena.website ? [arena.website] : undefined);
      expect(page.mainEntity?.["@id"]).toBe(place["@id"]);
      expect(breadcrumbs.itemListElement?.map((item) => item.item)).toEqual([
        "https://ahmverdun.ca/",
        "https://ahmverdun.ca/arenas",
        canonicalUrl(`/arenas/${arena.slug}`),
      ]);
      expect(place.image).toBe(arena.photoUrl);
      expect(place).not.toHaveProperty("geo");
      expect(place).not.toHaveProperty("openingHours");
      expect(place).not.toHaveProperty("aggregateRating");
    }
    const arena = ARENAS[0]!;
    const unverified = arenaStructuredData({ ...arena, addressVerified: false })["@graph"][0]!;
    expect(unverified).not.toHaveProperty("address");
    expect(unverified).not.toHaveProperty("hasMap");
  });

  test("schema text cannot terminate its script while JSON data stays intact", () => {
    const value = { name: "</script><script>alert('x')</script>&\u2028\u2029" };
    const serialized = serializeJsonLd(value);
    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(value);
  });

  test("ownership verification requires actual configured provider tokens", () => {
    expect(siteVerificationMeta(undefined, undefined)).toEqual([]);
    expect(siteVerificationMeta("", '<script>"bad"</script>')).toEqual([]);
    expect(siteVerificationMeta("token-with space", "x".repeat(257))).toEqual([]);
    expect(siteVerificationMeta("Google_ABC-123", "A1B2C3")).toEqual([
      { name: "google-site-verification", content: "Google_ABC-123" },
      { name: "msvalidate.01", content: "A1B2C3" },
    ]);
  });
});
