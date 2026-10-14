import test from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("production deploy smoke detects public WAF challenges and falls back to the hosting origin", () => {
  const helper = readFileSync("scripts/deploy-production-http-smoke.sh", "utf8");
  const workflow = readFileSync(".github/workflows/deploy-production-auto.yml", "utf8");

  assert.match(helper, /AHMV_HTTP_SMOKE_TARGET:-public/);
  assert.match(helper, /AHMV_HOST/);
  assert.match(helper, /looks_like_waf_challenge/);
  assert.match(helper, /--fail-with-body/);
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
  assert.ok(publicProbe.indexOf('if looks_like_waf_challenge "$body_file"') < publicProbe.indexOf('if [ "$status" -ne 0 ]'));
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

test("HTTP 403 WAF challenge falls back to origin", () => {
  const directory = mkdtempSync(join(tmpdir(), "ahmv-waf-smoke-"));
  const mockCurl = join(directory, "curl");
  writeFileSync(mockCurl, "#!/usr/bin/env bash\nset -euo pipefail\noutput=\"\"\nheaders=\"\"\norigin=0\npreserve_body=0\nwhile [ \"$#\" -gt 0 ]; do\n  case \"$1\" in\n    -D) headers=\"$2\"; shift 2 ;;\n    -o) output=\"$2\"; shift 2 ;;\n    --connect-to) origin=1; shift 2 ;;\n    --fail-with-body) preserve_body=1; shift ;;\n    *) shift ;;\n  esac\ndone\nif [ \"$origin\" = 0 ]; then\n  test \"$preserve_body\" = 1 || exit 88\n  printf 'HTTP/2 403\\n\\n' > \"$headers\"\n  printf '<html>webdriverCheck WAF verification</html>' > \"$output\"\n  exit 22\nfi\nprintf '{\"ok\":true,\"service\":\"ahmverdun-web\",\"release\":\"test-only\"}'\n", { mode: 0o700 });
  chmodSync(mockCurl, 0o700);
  try {
    const result = spawnSync("bash", ["scripts/deploy-production-http-smoke.sh", "body", "/healthz"], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: directory + ":" + (process.env.PATH ?? ""),
        AHMV_PRODUCTION_URL: "https://ahmverdun.ca",
        AHMV_HOST: "example.invalid",
        AHMV_HTTP_SMOKE_ATTEMPTS: "1",
        AHMV_HTTP_SMOKE_DELAY_SECONDS: "0",
      },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '{"ok":true,"service":"ahmverdun-web","release":"test-only"}');
    assert.match(result.stderr, /Detected public WAF challenge/);
    assert.match(result.stderr, /hosting origin after public WAF challenge/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
