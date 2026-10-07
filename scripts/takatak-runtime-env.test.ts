import test from "node:test";
import assert from "node:assert/strict";
import { getAhmvContentRuntimeConfig } from "../src/lib/takatak-content-config.server.ts";
import { handleTakatakContentContributions } from "../src/lib/takatak-content-contributions.server.ts";

const ENV_KEYS = [
  "TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED",
  "TAKATAK_CONTENT_ORIGIN",
  "TAKATAK_AHMV_CONTENT_TOKEN",
] as const;
const TEST_TOKEN = "synthetic-runtime-test-token-over-thirty-two-characters";
const runtimeReady = {
  TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED: "true",
  TAKATAK_CONTENT_ORIGIN: "https://moderation.example.test",
  TAKATAK_AHMV_CONTENT_TOKEN: TEST_TOKEN,
};
const overlaysRequest = () => new Request("https://ahmverdun.ca/api/ahmv/content-overlays");

async function withRuntime(
  settings: Record<string, string | undefined>,
  fetchMock: typeof fetch,
  run: () => Promise<void>,
) {
  const previous = ENV_KEYS.map((key) => [key, process.env[key]] as const);
  const previousFetch = globalThis.fetch;
  for (const key of ENV_KEYS) {
    if (settings[key] === undefined) delete process.env[key];
    else process.env[key] = settings[key];
  }
  globalThis.fetch = fetchMock;
  try {
    await run();
  } finally {
    globalThis.fetch = previousFetch;
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("moderation reads credentials supplied after module import, without exposing them", async () => {
  let requests = 0;
  await withRuntime(
    runtimeReady,
    async (input, init) => {
      requests += 1;
      assert.equal(
        String(input),
        "https://moderation.example.test/api/integrations/ahmv/content/overlays",
      );
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("authorization"), `Bearer ${TEST_TOKEN}`);
      assert.equal(headers.get("x-ahmv-tenant"), "ahmverdun");
      return Response.json({
        ok: true,
        serviceToken: TEST_TOKEN,
        publications: [
          {
            id: "published-1",
            resourceType: "news",
            resourceKey: "news:example",
            patch: { title: "Approved" },
            version: 1,
            internalReviewer: "private",
          },
        ],
      });
    },
    async () => {
      const response = await handleTakatakContentContributions(overlaysRequest());
      assert.equal(response?.status, 200);
      const body = await response!.text();
      assert.equal(body.includes(TEST_TOKEN), false);
      assert.equal(body.includes("internalReviewer"), false);
      assert.deepEqual(JSON.parse(body), {
        ok: true,
        publications: [
          {
            id: "published-1",
            resourceType: "news",
            resourceKey: "news:example",
            patch: { title: "Approved" },
            version: 1,
          },
        ],
      });
      assert.equal(requests, 1);

      // Runtime changes must be picked up on the next request, not cached at import/build.
      process.env["TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED"] = "false";
      const disabled = await handleTakatakContentContributions(overlaysRequest());
      assert.deepEqual(await disabled?.json(), {
        ok: false,
        status: "not_connected",
        publications: [],
      });
      assert.equal(requests, 1);
    },
  );
});

test("disabled, missing, short-token and invalid HTTPS configuration never contact a provider", async () => {
  for (const settings of [
    {},
    { ...runtimeReady, TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED: "false" },
    { ...runtimeReady, TAKATAK_AHMV_CONTENT_TOKEN: "short" },
    { ...runtimeReady, TAKATAK_CONTENT_ORIGIN: "http://moderation.example.test" },
    { ...runtimeReady, TAKATAK_CONTENT_ORIGIN: "not-a-url" },
  ]) {
    let requests = 0;
    await withRuntime(
      settings,
      async () => {
        requests += 1;
        throw new Error("A disabled bridge must not request a provider");
      },
      async () => {
        assert.equal(getAhmvContentRuntimeConfig().ready, false);
        const response = await handleTakatakContentContributions(overlaysRequest());
        assert.deepEqual(await response?.json(), {
          ok: false,
          status: "not_connected",
          publications: [],
        });
        assert.equal(requests, 0);
      },
    );
  }
});

test("runtime-backed contribution submission keeps its tenant and payload boundary", async () => {
  await withRuntime(
    runtimeReady,
    async (input, init) => {
      assert.equal(
        String(input),
        "https://moderation.example.test/api/integrations/ahmv/contributions",
      );
      assert.equal(init?.method, "POST");
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("authorization"), `Bearer ${TEST_TOKEN}`);
      assert.equal(headers.get("x-ahmv-tenant"), "ahmverdun");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.resourceKey, "news:example");
      assert.equal(body.identityId, undefined);
      return Response.json({ ok: true, id: "contribution-1" }, { status: 201 });
    },
    async () => {
      const request = new Request("https://ahmverdun.ca/api/ahmv/contributions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          resourceType: "news",
          resourceKey: "news:example",
          action: "update",
          idempotencyKey: "runtime-test-1",
          proposedPatch: { title: "Proposed" },
          identityId: "browser-cannot-grant-paid-priority",
        }),
      });
      const response = await handleTakatakContentContributions(request);
      assert.equal(response?.status, 201);
      assert.deepEqual(await response?.json(), { ok: true, id: "contribution-1" });
    },
  );
});
