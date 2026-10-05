import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = readFileSync("src/routes/__root.tsx", "utf8");
const splash = readFileSync("src/components/layout/app-launch-splash.tsx", "utf8");
const installPrompt = readFileSync("src/components/layout/install-app-prompt.tsx", "utf8");
const manifest = JSON.parse(readFileSync("public/site.webmanifest", "utf8")) as {
  id?: string;
  display?: string;
  icons?: Array<{ src?: string }>;
};

assert.equal(
  existsSync("public/branding/ahmv-app-splash-2026.webp"),
  true,
  "PWA splash artwork must remain in the production bundle",
);
assert.match(root, /<AppLaunchSplash\s*\/>/);
assert.match(root, /apple-touch-startup-image/);
assert.match(root, /ahmv-app-splash-2026\.webp/);
assert.match(root, /apple-touch-icon/);
assert.match(root, /rel: "preload".*ahmv-app-splash-2026\.webp/);
assert.match(root, /media: "\(display-mode: standalone\)"/);

assert.match(splash, /display-mode:\s*standalone/);
assert.match(splash, /navigatorWithStandalone\.standalone === true/);
assert.match(splash, /AHMV_LOGO_URL/);
assert.match(splash, /Math\.min\(100/);
assert.match(splash, /role="progressbar"/);
assert.match(splash, /Là où les jeunes grandissent, patinent et croient en leurs rêves\./);
assert.match(splash, /sessionStorage/);

assert.match(installPrompt, /beforeinstallprompt/);
assert.match(installPrompt, /appinstalled/);
assert.match(installPrompt, /setInterval\(attemptShow, RETRY_MS\)/);
assert.match(installPrompt, /isIosLike\(\)/);
assert.match(installPrompt, /Date\.now\(\) - dismissedAt < DISMISS_TTL_MS/);
assert.match(installPrompt, /Partager → Sur l’écran d’accueil → Ajouter/);

assert.equal(manifest.id, "/");
assert.equal(manifest.display, "standalone");
assert.equal(
  manifest.icons?.some((icon) => icon.src === "/branding/ahmv-logo-gallery-2026.png"),
  true,
  "Installed app manifest must use the approved AHMV crest",
);

console.log("AHMV PWA launch splash contract passed.");
