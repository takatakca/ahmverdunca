import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("production deploy smoke bypasses the public WAF only through the authenticated SSH origin path", () => {
  const helper = readFileSync("scripts/deploy-production-http-smoke.sh", "utf8");
  const workflow = readFileSync(".github/workflows/deploy-production-auto.yml", "utf8");

  assert.match(helper, /AHMV_DEPLOY_TRANSPORT/);
  assert.match(helper, /ahmv-ssh/);
  assert.match(helper, /--resolve 'ahmverdun\.ca:443:127\.0\.0\.1'/);
  assert.match(helper, /https:\/\/ahmverdun\.ca|AHMV_PRODUCTION_URL/);
  assert.match(helper, /body\|headers\|status/);
  assert.match(helper, /public_curl/);

  const publicStart = helper.indexOf("public_curl_once() {");
  const originStart = helper.indexOf("origin_curl_once() {");
  const retryStart = helper.indexOf("retry_smoke() {");
  assert.ok(publicStart >= 0 && originStart > publicStart && retryStart > originStart);

  const publicProbe = helper.slice(publicStart, originStart);
  const originProbe = helper.slice(originStart, retryStart);

  // Public HTTPS must always verify certificates.
  assert.doesNotMatch(publicProbe, /--insecure|-k(?:\s|$)/);
  // Only the authenticated server-local 127.0.0.1 origin probe may ignore the
  // cPanel loopback certificate mismatch.
  assert.match(originProbe, /--resolve 'ahmverdun\.ca:443:127\.0\.0\.1'/);
  assert.match(originProbe, /--insecure/);

  assert.match(workflow, /deploy-production-http-smoke\.sh body \/healthz/);
  assert.match(workflow, /deploy-production-http-smoke\.sh headers \/recherche/);
  assert.match(workflow, /deploy-production-http-smoke\.sh body \/robots\.txt/);
  assert.match(workflow, /deploy-production-http-smoke\.sh body \/sitemap\.xml/);
  assert.match(workflow, /deploy-production-http-smoke\.sh status "\$asset"/);
});
