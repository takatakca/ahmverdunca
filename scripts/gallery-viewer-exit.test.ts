import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const viewer = readFileSync("src/components/media/media-luxury-viewer.tsx", "utf8");
const route = readFileSync("src/routes/galerie.$slug.tsx", "utf8");

test("viewing an AHMV photo always offers a visible, descriptive exit", () => {
  assert.match(viewer, /data-ahmv-gallery-exit/);
  assert.match(viewer, /Retour à l’album/);
  assert.match(viewer, /Back to album/);
  assert.match(viewer, /min-h-12/);
  assert.match(viewer, /onEscapeKeyDown/);
  assert.match(viewer, /onOpenChange\(false\)/);
  assert.match(viewer, /env\(safe-area-inset-top\)/);
});

test("gallery viewer closes rather than requiring a content correction", () => {
  assert.match(route, /<MediaLuxuryViewer/);
  assert.match(route, /onOpenChange=\{setViewerOpen\}/);
  assert.match(viewer, /DialogPrimitive\.Root open=\{open\}/);
  assert.doesNotMatch(viewer, /submitCorrection|screenshotRequired|mustReport/);
});
