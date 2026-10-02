import {
  applyPublicResponsePolicy,
  robotsDirectiveForResponse,
} from "../src/lib/response-policy";

const failures: string[] = [];

function expect(label: string, actual: unknown, expected: unknown) {
  if (actual !== expected) failures.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
}

expect("preview homepage", robotsDirectiveForResponse({ pathname: "/", status: 200, publicIndexingEnabled: false }), "noindex, nofollow");
expect("production homepage", robotsDirectiveForResponse({ pathname: "/", status: 200, publicIndexingEnabled: true }), "index, follow");
expect("production search", robotsDirectiveForResponse({ pathname: "/recherche", status: 200, publicIndexingEnabled: true }), "noindex, follow");
expect("production 404", robotsDirectiveForResponse({ pathname: "/missing", status: 404, publicIndexingEnabled: true }), "noindex, follow");
expect("production 500", robotsDirectiveForResponse({ pathname: "/", status: 500, publicIndexingEnabled: true }), "noindex, follow");

const secured = applyPublicResponsePolicy(
  new Response("<!doctype html><title>AHMV</title>", {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  }),
  new Request("https://ahmverdun.ca/"),
  true,
);

expect("nosniff", secured.headers.get("X-Content-Type-Options"), "nosniff");
expect("referrer policy", secured.headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
expect("frame policy", secured.headers.get("X-Frame-Options"), "SAMEORIGIN");
expect("permissions policy", secured.headers.get("Permissions-Policy"), "camera=(), geolocation=(), payment=(), usb=()");
expect("production HTML robots", secured.headers.get("X-Robots-Tag"), "index, follow");

if (failures.length) {
  console.error("Runtime policy validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Runtime policy validation passed.");
