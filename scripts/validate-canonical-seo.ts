import { readFile } from "node:fs/promises";
import { canonicalUrl } from "../src/lib/seo";

const routeFiles = [
  "src/routes/index.tsx",
  "src/routes/horaires.tsx",
  "src/routes/equipes.index.tsx",
  "src/routes/equipes.$slug.tsx",
  "src/routes/inscriptions.tsx",
  "src/routes/tournois.tsx",
  "src/routes/nouvelles.index.tsx",
  "src/routes/nouvelles.$slug.tsx",
  "src/routes/galerie.index.tsx",
  "src/routes/galerie.$slug.tsx",
  "src/routes/wllv.tsx",
  "src/routes/entraineurs.tsx",
  "src/routes/arenas.index.tsx",
  "src/routes/arenas.$slug.tsx",
  "src/routes/faq.tsx",
  "src/routes/ressources.tsx",
  "src/routes/partenaires.tsx",
  "src/routes/contact.tsx",
  "src/routes/connexion.tsx",
  "src/routes/confidentialite.tsx",
] as const;

const errors: string[] = [];

for (const file of routeFiles) {
  const source = await readFile(file, "utf8");
  if (!source.includes("canonicalLink(")) {
    errors.push(`${file} does not declare a canonical link.`);
  }
}

const sitemap = await readFile("public/sitemap.xml", "utf8");
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

for (const location of locations) {
  const path = new URL(location).pathname;
  const expected = canonicalUrl(path);
  if (location !== expected) {
    errors.push(`Sitemap/canonical mismatch for ${path}: ${location} !== ${expected}`);
  }
}

if (errors.length) {
  console.error("Canonical SEO validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Canonical SEO validation passed for ${routeFiles.length} route files and ${locations.length} sitemap URLs.`);
