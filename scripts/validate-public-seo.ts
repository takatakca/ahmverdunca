import { readFile } from "node:fs/promises";
import { SITE } from "../src/lib/site";

const [robots, sitemap, articleRoute] = await Promise.all([
  readFile("public/robots.txt", "utf8"),
  readFile("public/sitemap.xml", "utf8"),
  readFile("src/routes/nouvelles.$slug.tsx", "utf8"),
]);

const errors: string[] = [];
const sitemapUrl = `${SITE.domain}/sitemap.xml`;
const requiredPublicRoutes = [
  "/",
  "/horaires",
  "/equipes",
  "/inscriptions",
  "/tournois",
  "/nouvelles",
  "/galerie",
  "/wllv",
  "/entraineurs",
  "/arenas",
  "/faq",
  "/ressources",
  "/partenaires",
  "/contact",
  "/connexion",
  "/confidentialite",
] as const;
const noindexRoutes = ["/recherche"] as const;

if (!robots.includes(`Sitemap: ${sitemapUrl}`)) {
  errors.push(`robots.txt must reference ${sitemapUrl}`);
}

if (!robots.includes("User-agent: *")) {
  errors.push("robots.txt must include a default user-agent rule");
}

const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (locations.length === 0) errors.push("sitemap.xml contains no URLs");

const duplicates = locations.filter((url, index) => locations.indexOf(url) !== index);
if (duplicates.length > 0) errors.push(`sitemap.xml contains duplicate URLs: ${[...new Set(duplicates)].join(", ")}`);

for (const url of locations) {
  if (!url.startsWith(`${SITE.domain}/`) && url !== SITE.domain) {
    errors.push(`sitemap URL is outside the canonical domain: ${url}`);
  }
  if (url.includes("ahmverdun.com")) {
    errors.push(`sitemap URL uses the retired .com production domain: ${url}`);
  }
}

for (const route of requiredPublicRoutes) {
  const expected = SITE.domain + route;
  if (!locations.includes(expected)) {
    errors.push(`sitemap.xml is missing required public route: ${route}`);
  }
}

for (const route of noindexRoutes) {
  const excluded = SITE.domain + route;
  if (locations.includes(excluded)) {
    errors.push(`sitemap.xml must not include noindex route: ${route}`);
  }
}

if (!articleRoute.includes('"@type": "NewsArticle"')) {
  errors.push("news article route must emit NewsArticle structured data");
}
if (!articleRoute.includes("canonicalUrl(`/nouvelles/${slug}`)")) {
  errors.push("NewsArticle structured data must use the canonical article URL");
}
if (!articleRoute.includes('"@type": "SportsOrganization"')) {
  errors.push("NewsArticle structured data must identify AHMV as the publisher");
}
if (/newsJsonLd[\s\S]{0,1200}\bauthor\s*:/.test(articleRoute)) {
  errors.push("NewsArticle structured data must not synthesize an author");
}
if (/newsJsonLd[\s\S]{0,1200}\bimage\s*:/.test(articleRoute)) {
  errors.push("NewsArticle structured data must not synthesize an image");
}

if (errors.length > 0) {
  console.error("Public SEO validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Public SEO validation passed for ${locations.length} sitemap URLs.`);
