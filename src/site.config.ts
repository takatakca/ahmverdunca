/**
 * SEO + consent kit: the ONE settings file per site.
 *
 * Rules:
 * - Only facts already present in this repo. Never invent an address, hours, phone, rating or review.
 * - Unknown values stay `undefined` with a `TODO(owner)` comment; the JSON-LD builder skips them.
 * - `url` is the real production domain (see foodhubca/private/hosting/MOCHAHOST_DOMAINS.md), never *.lovable.app.
 */
import { EXTERNAL_LINKS, SITE as BRAND } from "@/lib/site";

export type SchemaType =
  "Organization" | "LocalBusiness" | "Restaurant" | "NGO" | "SportsOrganization" | "Event";

export type PostalAddress = {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode?: string | undefined;
  addressCountry: string;
};

export type SiteConfig = {
  /** Public business name. */
  name: string;
  /** Legal name if different (TODO(owner) when unknown). */
  legalName?: string | undefined;
  /** Real production origin, no trailing slash. */
  url: string;
  /** <html lang>. French first (Québec). */
  lang: "fr-CA";
  /** Open Graph locale. */
  locale: "fr_CA";
  defaultTitle: string;
  defaultDescription: string;
  /** Default share image: path under /public or absolute URL. undefined = no og:image. */
  ogImage?: string | undefined;
  /** Logo: path under /public or absolute URL. */
  logo?: string | undefined;
  schemaType: SchemaType;
  email?: string | undefined;
  /** E.164, e.g. "+15145550000". */
  phone?: string | undefined;
  address?: PostalAddress | undefined;
  /** Real social profile URLs only (no "#", no generic facebook.com). */
  sameAs: string[];
  /** Privacy policy route, used by the cookie banner. undefined = no page yet (TODO(owner)). */
  privacyPath?: string | undefined;
  /** Law 25 privacy officer. */
  privacyOfficer: { name?: string | undefined; email?: string | undefined };
};

// AHM Verdun keeps its brand facts in src/lib/site.ts: reuse them, do not duplicate.
// Page SEO (titles, canonicals, sitemap, SportsOrganization + NewsArticle schema) is already handled
// by src/lib/seo.ts, src/routes/__root.tsx and scripts/generate-sitemap.ts.
export const SITE: SiteConfig = {
  name: "AHM Verdun",
  // Full association name already used in the SportsOrganization schema.
  // TODO(owner): confirm the registered legal name.
  legalName: BRAND.name.fr,
  url: BRAND.domain,
  lang: "fr-CA",
  locale: "fr_CA",
  // Same as the home page head() in src/routes/index.tsx.
  defaultTitle: "AHM Verdun — Le hockey commence ici | Saison 2026–2027",
  defaultDescription:
    "Horaires, équipes, inscriptions, nouvelles, arénas et ressources de l'Association du hockey mineur de Verdun.",
  ogImage: undefined,
  logo: "/branding/ahmv-logo-gallery-2026.png",
  schemaType: "SportsOrganization",
  // TODO(owner): official general email (src/lib/site.ts: officialEmailConfirmed = false).
  email: undefined,
  // Public phone stays hidden until AHMV_PHONE_PUBLIC (src/lib/site.ts: phonePublic = false).
  phone: undefined,
  address: undefined,
  sameAs: [EXTERNAL_LINKS.facebook, EXTERNAL_LINKS.instagram],
  privacyPath: "/confidentialite",
  // TODO(owner): name + email of the person responsible for personal information (Law 25).
  // The privacy page is still a draft and names no one.
  privacyOfficer: { name: undefined, email: undefined },
};
