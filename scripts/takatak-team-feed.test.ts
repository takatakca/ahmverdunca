import test from "node:test";
import assert from "node:assert/strict";
import { handleTakatakTeamFeed } from "../src/lib/takatak-team-feed.server.ts";

const validTeamId = "2025191400017305";
const root = "/api/ahmv/team-feed";

const enabled = {
  TAKATAK_TEAM_FEED_ENABLED: "true",
  TAKATAK_TEAM_FEED_ORIGIN: "https://takatak.ca",
  TAKATAK_TEAM_FEED_TOKEN: "server-only-test-token",
};

test("unrelated requests bypass GROUPE TAKATAK team feed handler", async () => {
  const result = await handleTakatakTeamFeed(new Request("https://ahmverdun.ca/"), enabled);
  assert.equal(result, null);
});

test("disabled team feed fails closed", async () => {
  const response = await handleTakatakTeamFeed(
    new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
    {},
  );
  assert.equal(response?.status, 503);
});

test("only GET is accepted", async () => {
  const response = await handleTakatakTeamFeed(
    new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`, { method: "POST" }),
    enabled,
  );
  assert.equal(response?.status, 405);
});

test("unknown public team IDs are rejected before upstream fetch", async () => {
  const response = await handleTakatakTeamFeed(
    new Request(`https://ahmverdun.ca${root}?teamId=not-a-team`),
    enabled,
  );
  assert.equal(response?.status, 404);
  assert.deepEqual(await response?.json(), { status: "unknown_team", items: [] });
});

test("insecure GROUPE TAKATAK origin fails closed", async () => {
  const response = await handleTakatakTeamFeed(
    new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
    { ...enabled, TAKATAK_TEAM_FEED_ORIGIN: "http://takatak.ca" },
  );
  assert.equal(response?.status, 503);
});

test("subscription-required upstream does not leak provider details", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 402 });
  try {
    const response = await handleTakatakTeamFeed(
      new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
      enabled,
    );
    assert.equal(response?.status, 200);
    assert.deepEqual(await response?.json(), { status: "subscription_required", items: [] });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("active upstream feed is reduced to approved public fields", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const requestUrl = String(input);
    assert.match(requestUrl, /https:\/\/takatak\.ca\/api\/integrations\/ahmv\/team-feed/);
    assert.match(requestUrl, new RegExp(`teamId=${validTeamId}`));
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("authorization"), "Bearer server-only-test-token");
    assert.equal(headers.get("x-ahmv-team-id"), validTeamId);

    return new Response(
      JSON.stringify({
        internalTenantId: "must-not-leak",
        providerAccessToken: "must-not-leak",
        items: [
          {
            id: "post-1",
            platform: "facebook",
            publishedAt: "2026-10-03T12:00:00Z",
            text: "Team update",
            url: "https://www.facebook.com/example",
            mediaUrl: "https://images.example.test/photo.jpg",
            providerToken: "must-not-leak",
          },
          {
            id: "bad-http-url",
            platform: "instagram",
            publishedAt: "2026-10-03T12:00:00Z",
            text: "Unsafe",
            url: "http://example.com/post",
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  try {
    const response = await handleTakatakTeamFeed(
      new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
      enabled,
    );
    assert.equal(response?.status, 200);
    const body = await response?.json() as Record<string, unknown>;
    assert.equal(body["status"], "active");
    assert.equal(body["source"], "GROUPE TAKATAK");
    assert.equal(body["teamId"], validTeamId);
    assert.equal(Array.isArray(body["items"]), true);
    const items = body["items"] as Array<Record<string, unknown>>;
    assert.equal(items.length, 1);
    assert.equal(items[0]?.["id"], "post-1");
    assert.equal("providerToken" in (items[0] ?? {}), false);
    assert.equal("providerAccessToken" in body, false);
    assert.equal("internalTenantId" in body, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("responses are not indexed or cached", async () => {
  const response = await handleTakatakTeamFeed(
    new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
    {},
  );
  assert.equal(response?.headers.get("cache-control"), "no-store");
  assert.equal(response?.headers.get("X-Robots-Tag"), "noindex, nofollow");
});
