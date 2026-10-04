import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const component = readFileSync("src/components/newsletter-interest.tsx", "utf8");
const contract = readFileSync("src/lib/newsletter.ts", "utf8");
const footer = readFileSync("src/components/layout/site-footer.tsx", "utf8");
const env = readFileSync(".env.example", "utf8");

assert.match(contract, /VITE_TAKATAK_NEWSLETTER_URL/);
assert.match(contract, /url\.protocol === "https:"/);
assert.match(contract, /brand", "ahmverdun"/);
assert.match(footer, /<NewsletterInterest/);
assert.match(env, /VITE_TAKATAK_NEWSLETTER_URL=/);
assert.doesNotMatch(component, /<input[^>]+type=["']email["']/i);
assert.doesNotMatch(component + contract, /localStorage|sessionStorage|document\.cookie/);
assert.match(component, /Consentement centralisé|Centralized consent/);

console.log("AHMV newsletter frontend contract passed.");
