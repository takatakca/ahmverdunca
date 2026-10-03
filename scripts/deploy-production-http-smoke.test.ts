import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("production deploy smoke separates authenticated origin probing from strict public TLS", () => {
  const helper = readFileSync("scripts/deploy-production-http-smoke.sh", "utf8");
  const workflow = readFileSync(".github/workflows/deploy-production-auto.yml", "utf8");

  assert.match(helper, /AHMV_DEPLOY_TRANSPORT/);
  assert.match(helper, /AHMV_HTTP_SMOKE_TARGET/);
  assert.match(helper, /ahmv-ssh/);
  assert.match(helper, /--resolve 'ahmverdun\.ca:443:127\.0\.0\.1'/);
  assert.match(helper, /https:\/\/ahmverdun\.ca|AHMV_PRODUCTION_URL/);
  assert.match(helper, /body\|headers\|status/);

  const publicStart = helper.indexOf("public_curl_once()");
  const originStart = helper.indexOf("origin_curl_once()");
  const retryStart = helper.indexOf("retry_smoke()");
  assert.ok(publicStart >= 0 && originStart > publicStart && retryStart > originStart);

  const publicCurl = helper.slice(publicStart, originStart);
  const originCurl = helper.slice(originStart, retryStart);

  assert.doesNotMatch(publicCurl, /--insecure|-k(?:\s|$)/);
  assert.match(originCurl, /--insecure/);
  assert.match(originCurl, /127\.0\.0\.1/);

  assert.match(workflow, /deploy-production-http-smoke\.sh body \/healthz/);
  assert.match(workflow, /AHMV_HTTP_SMOKE_TARGET=public/);
  assert.match(workflow, /deploy-production-http-smoke\.sh status \/healthz/);
  assert.match(workflow, /deploy-production-http-smoke\.sh headers \/recherche/);
  assert.match(workflow, /deploy-production-http-smoke\.sh body \/robots\.txt/);
  assert.match(workflow, /deploy-production-http-smoke\.sh body \/sitemap\.xml/);
  assert.match(workflow, /deploy-production-http-smoke\.sh status "\$asset"/);
});
