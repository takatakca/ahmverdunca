import type { Arena } from "../data/arenas";
import { EXTERNAL_LINKS, SITE, mapsDirectionsUrl } from "./site";

export const DEFAULT_SEO = {
  title: "AHM Verdun — Hockey mineur à Verdun, Montréal",
  description:
    "Horaires, équipes, inscriptions, nouvelles et arénas de l’Association du hockey mineur de Verdun, à Montréal. Retrouvez les liens officiels et les ressources pour votre famille.",
  image: `${SITE.domain}/branding/ahmv-logo-gallery-2026.png`,
} as const;

export function canonicalUrl(pathname: string) {
  const input = pathname.trim();
  const url = /^https?:\/\//i.test(input)
    ? new URL(input)
    : new URL(`/${input.replace(/^[\\/]+/, "")}`, SITE.domain);
  if (url.origin !== SITE.domain || url.username || url.password) {
    throw new Error("A canonical URL must belong to the public AHMV domain.");
  }
  // Tracking parameters and fragments identify a visit, not a separate page.
  const path = url.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
  return `${SITE.domain}${path}`;
}

export function canonicalLink(pathname: string) {
  return [{ rel: "canonical", href: canonicalUrl(pathname) }];
}

/** Keep JSON-LD data inert even when an approved title contains HTML characters. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

/** Ownership tokens are public metadata; blank or malformed configuration emits nothing. */
export function siteVerificationMeta(google: string | undefined, bing: string | undefined) {
  return [
    { name: "google-site-verification", token: google },
    { name: "msvalidate.01", token: bing },
  ].flatMap(({ name, token }) =>
    typeof token === "string" && /^[A-Za-z0-9_-]{1,256}$/.test(token)
      ? [{ name, content: token }]
      : [],
  );
}

const organizationId = `${SITE.domain}/#organization`;
const websiteId = `${SITE.domain}/#website`;

export function siteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsOrganization",
        "@id": organizationId,
        name: SITE.name.fr,
        alternateName: ["AHM Verdun", "AHMV", SITE.name.en],
        url: canonicalUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_SEO.image,
          contentUrl: DEFAULT_SEO.image,
          caption: "AHM Verdun",
        },
        ...(SITE.phonePublic ? { telephone: SITE.phoneE164 } : {}),
        sport: "Ice Hockey",
        areaServed: {
          "@type": "Place",
          name: "Verdun",
          containedInPlace: {
            "@type": "City",
            name: "Montréal",
            containedInPlace: {
              "@type": "AdministrativeArea",
              name: "Québec",
              containedInPlace: { "@type": "Country", name: "Canada" },
            },
          },
        },
        sameAs: [EXTERNAL_LINKS.facebook, EXTERNAL_LINKS.instagram],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: canonicalUrl("/"),
        name: "AHM Verdun",
        alternateName: [SITE.name.fr, SITE.name.en],
        publisher: { "@id": organizationId },
        inLanguage: ["fr-CA", "en-CA"],
      },
    ],
  };
}

function publicHttpsUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** Describe the listed arena, without treating its address as the association's office. */
export function arenaStructuredData(arena: Arena) {
  const url = canonicalUrl(`/arenas/${arena.slug}`);
  const placeId = `${url}#place`;
  const breadcrumbId = `${url}#breadcrumb`;
  const officialUrl = publicHttpsUrl(arena.website);
  const image = publicHttpsUrl(arena.photoUrl);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": placeId,
        name: arena.name,
        url,
        ...(arena.description?.fr ? { description: arena.description.fr } : {}),
        ...(arena.addressVerified
          ? {
              address: arena.address,
              hasMap: mapsDirectionsUrl(arena.address),
            }
          : {}),
        ...(arena.phone ? { telephone: arena.phone } : {}),
        ...(image ? { image } : {}),
        ...(officialUrl ? { sameAs: [officialUrl] } : {}),
        containedInPlace: { "@type": "Place", name: arena.borough.fr },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${arena.name} — AHM Verdun`,
        inLanguage: "fr-CA",
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": placeId },
        breadcrumb: { "@id": breadcrumbId },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "Arénas", item: canonicalUrl("/arenas") },
          { "@type": "ListItem", position: 3, name: arena.name, item: url },
        ],
      },
    ],
  };
}

interface SeoMatch {
  meta?: readonly unknown[] | undefined;
  links?: readonly unknown[] | undefined;
}

/** Mirror the router's deepest-route precedence for sharing metadata. */
export function resolvePageSeo(pathname: string, matches: readonly SeoMatch[]) {
  const value = (...attributes: string[]) => {
    for (const match of [...matches].reverse()) {
      for (const attribute of attributes) {
        for (const meta of [...(match.meta ?? [])].reverse()) {
          if (typeof meta !== "object" || meta === null) continue;
          const tag = meta as Record<string, unknown>;
          const content = attribute === "title" ? tag["title"] : tag["content"];
          if (
            (attribute === "title" || tag["name"] === attribute || tag["property"] === attribute) &&
            typeof content === "string" &&
            content.trim()
          )
            return content;
        }
      }
    }
    return undefined;
  };
  let url = canonicalUrl(pathname);
  for (const link of matches.flatMap((match) => match.links ?? []).reverse()) {
    if (typeof link !== "object" || link === null) continue;
    const tag = link as Record<string, unknown>;
    if (tag["rel"] !== "canonical" || typeof tag["href"] !== "string") continue;
    try {
      url = canonicalUrl(tag["href"]);
      break;
    } catch {
      // An unrelated host must never become the public page's sharing URL.
    }
  }
  return {
    url,
    title: value("og:title", "title") ?? DEFAULT_SEO.title,
    description: value("og:description", "description") ?? DEFAULT_SEO.description,
    image: publicHttpsUrl(value("og:image")) ?? DEFAULT_SEO.image,
  };
}
