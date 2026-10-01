import { readFile } from "node:fs/promises";
import { SITE } from "../src/lib/site";

const [robots, sitemap] = await Promise.all([
  readFile("public/robots.txt", "utf8"),
  readFile("public/sitemap.xml", "utf8"),
]);

const errors: string[] = [];
const sitemapUrl = `${SITE.domain}/sitemap.xml`;

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
}

if (!locations.includes(SITE.domain + "/")) {
  errors.push("sitemap.xml must include the homepage");
}

if (errors.length > 0) {
  console.error("Public SEO validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Public SEO validation passed for ${locations.length} sitemap URLs.`);
