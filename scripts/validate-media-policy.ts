import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(process.cwd(), "src");
const forbidden = [
  "hero-hockey.jpg",
  "news-cancellation.jpg",
  "news-season.jpg",
  "news-academy.jpg",
  "gallery-party.jpg",
  "gallery-feminine.jpg",
  "gallery-tournament.jpg",
];

const forbiddenRuntimePatterns = ["/__l5e/", ".asset.json"];
const forbiddenPublicPlaceholderCopy = [
  "Photo officielle à intégrer",
  "Official photo to be added",
];

const failures: string[] = [];

const uploadedMedia = readFileSync(join(process.cwd(), "src/data/uploaded-media.ts"), "utf8");
const galleryData = readFileSync(join(process.cwd(), "src/data/gallery.ts"), "utf8");
const galleryIndex = readFileSync(join(process.cwd(), "src/routes/galerie.index.tsx"), "utf8");

if (!uploadedMedia.includes("PUBLIC_UPLOADED_AHMV_MEDIA")) {
  failures.push("uploaded media registry is missing the public fail-closed collection.");
}
if (!uploadedMedia.includes("filter((asset) => !asset.containsMinors)")) {
  failures.push("uploaded youth media is not excluded from the public collection by default.");
}
if (!galleryData.includes("PUBLIC_UPLOADED_AHMV_MEDIA")) {
  failures.push("gallery data does not consume the consent-safe public media collection.");
}
if (galleryData.includes('import { UPLOADED_AHMV_MEDIA }')) {
  failures.push("gallery data imports raw uploaded media instead of the public collection.");
}
if (!galleryIndex.includes("publicUploadedAhmvMediaById")) {
  failures.push("gallery highlights do not use the consent-safe media lookup.");
}
if (galleryIndex.includes("UPLOADED_AHMV_MEDIA[")) {
  failures.push("gallery highlights index directly into the raw uploaded media collection.");
}

function visit(directory: string) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      visit(path);
      continue;
    }
    if (!/\.(?:ts|tsx|js|jsx|css)$/.test(name)) continue;

    const source = readFileSync(path, "utf8");
    for (const asset of forbidden) {
      if (source.includes(asset)) {
        failures.push(`${relative(process.cwd(), path)} references disabled synthetic asset ${asset}.`);
      }
    }

    for (const pattern of forbiddenRuntimePatterns) {
      if (source.includes(pattern)) {
        failures.push(
          `${relative(process.cwd(), path)} references production-incompatible runtime asset pattern ${pattern}.`,
        );
      }
    }

    for (const copy of forbiddenPublicPlaceholderCopy) {
      if (source.includes(copy)) {
        failures.push(
          `${relative(process.cwd(), path)} exposes internal placeholder copy: ${copy}.`,
        );
      }
    }
  }
}

visit(root);

if (failures.length) {
  console.error("Media policy validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Media policy validation passed: no disabled synthetic assets or Lovable-only runtime asset paths are referenced by application code.");
