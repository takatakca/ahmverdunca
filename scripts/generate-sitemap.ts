import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { TEAMS } from "../src/data/teams";
import { ARENAS } from "../src/data/arenas";
import { NEWS } from "../src/data/news";
import { ALBUMS } from "../src/data/gallery";
import { SITE } from "../src/lib/site";

const staticRoutes = [
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
  "/recherche",
  "/connexion",
  "/confidentialite",
];

const routes = new Set<string>(staticRoutes);

for (const team of TEAMS) routes.add(`/equipes/${team.slug}`);
for (const arena of ARENAS) routes.add(`/arenas/${arena.slug}`);
for (const article of NEWS) routes.add(`/nouvelles/${article.slug}`);
for (const album of ALBUMS) routes.add(`/galerie/${album.slug}`);

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const urls = Array.from(routes)
  .sort()
  .map((route) => `  <url><loc>${escapeXml(`${SITE.domain}${route}`)}</loc></url>`)
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

await writeFile(resolve("public/sitemap.xml"), sitemap, "utf8");
console.log(`Generated sitemap.xml with ${routes.size} URLs.`);
