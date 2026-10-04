import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("production deploy smoke detects public WAF challenges and falls back to the hosting origin", () => {
  const helper = readFileSync("scripts/deploy-production-http-smoke.sh", "utf8");
  const workflow = readFileSync(".github/workflows/deploy-production-auto.yml", "utf8");

  assert.match(helper, /AHMV_HTTP_SMOKE_TARGET:-public/);
  assert.match(helper, /AHMV_HOST/);
  assert.match(helper, /looks_like_waf_challenge/);
  assert.match(helper, /webdriverCheck\|failedChecks\|wsidchk\|pdata/);
  assert.match(helper, /return 90/);
  assert.match(helper, /Detected public WAF challenge/);
  assert.match(helper, /retry_smoke origin/);
  assert.match(helper, /--connect-to "ahmverdun\.ca:443:\$\{connect_target\}:443"/);
  assert.match(helper, /body\|headers\|status/);

  const publicStart = helper.indexOf("public_curl_once() {");
  const originStart = helper.indexOf("origin_curl_once() {");
  const retryStart = helper.indexOf("retry_smoke() {");
  assert.ok(publicStart >= 0 && originStart > publicStart && retryStart > originStart);

  const publicProbe = helper.slice(publicStart, originStart);
  const originProbe = helper.slice(originStart, retryStart);

  // The parent-facing public HTTPS check must never disable TLS validation.
  assert.doesNotMatch(publicProbe, /--insecure|-k(?:\s|$)/);
  // Only the deploy-only direct-origin fallback may relax origin certificate
  // validation, while preserving the ahmverdun.ca URL/Host/SNI.
  assert.match(originProbe, /--connect-to/);
  assert.match(originProbe, /--insecure/);
  assert.doesNotMatch(originProbe, /127\.0\.0\.1/);

  assert.match(workflow, /deploy-production-http-smoke\.sh body \/healthz/);
  assert.match(workflow, /deploy-production-http-smoke\.sh headers \/recherche/);
  assert.match(workflow, /deploy-production-http-smoke\.sh body \/robots\.txt/);
  assert.match(workflow, /deploy-production-http-smoke\.sh body \/sitemap\.xml/);
  assert.match(workflow, /deploy-production-http-smoke\.sh status "\$asset"/);
});
