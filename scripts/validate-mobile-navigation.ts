import { readFileSync } from "node:fs";

const errors: string[] = [];

function source(path: string) {
  return readFileSync(path, "utf8");
}

function requireFragment(path: string, content: string, fragment: string, label: string) {
  if (!content.includes(fragment)) {
    errors.push(`${path}: missing ${label}`);
  }
}

const headerPath = "src/components/layout/site-header.tsx";
const previewPath = "src/components/layout/communications-preview.tsx";
const header = source(headerPath);
const preview = source(previewPath);

requireFragment(headerPath, header, 'aria-controls="mobile-menu"', "menu control relationship");
requireFragment(headerPath, header, "aria-expanded={open}", "aria-expanded state");
requireFragment(headerPath, header, 'id="mobile-menu"', "mobile menu panel id");
requireFragment(headerPath, header, "onClick={toggleMobileMenu}", "explicit mobile menu toggle handler");
requireFragment(headerPath, header, 'new CustomEvent("ahmv:navigation-open")', "navigation priority event");
requireFragment(headerPath, header, 'open ? "z-[300]" : "z-[200]"', "open-header overlay priority");
requireFragment(headerPath, header, 'z-[290] overflow-y-auto', "mobile panel overlay priority");

requireFragment(previewPath, preview, '"ahmv:navigation-open"', "navigation-open listener");
requireFragment(previewPath, preview, "closeForNavigation", "communications overlay close handler");
requireFragment(previewPath, preview, "setOpen(false)", "communications overlay close action");
requireFragment(
  previewPath,
  preview,
  `document.querySelector('[aria-controls="mobile-menu"][aria-expanded="true"]')`,
  "open-menu guard before showing communications preview",
);

if (errors.length > 0) {
  console.error("\nAHM Verdun mobile navigation regression check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.\n`);
  process.exit(1);
}

console.log("AHM Verdun mobile navigation regression check passed.");
