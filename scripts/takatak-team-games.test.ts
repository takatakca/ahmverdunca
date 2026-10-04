import test from "node:test";
import assert from "node:assert/strict";
import { handleTakatakTeamGames } from "../src/lib/takatak-team-games.server.ts";

const validTeamId = "2025191400017305";
const root = "/api/ahmv/team-games";

const enabled = {
  TAKATAK_TEAM_GAMES_ENABLED: "true",
  TAKATAK_TEAM_GAMES_ORIGIN: "https://takatak.ca",
  TAKATAK_AHMV_SERVICE_TOKEN: "server-only-test-token",
};

test("unrelated requests bypass team games handler", async () => {
  const result = await handleTakatakTeamGames(new Request("https://ahmverdun.ca/"), enabled);
  assert.equal(result, null);
});

test("missing shared service token fails closed", async () => {
  const response = await handleTakatakTeamGames(
    new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
    {},
  );
  assert.equal(response?.status, 503);
});

test("explicit connector kill switch fails closed", async () => {
  const response = await handleTakatakTeamGames(
    new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
    { ...enabled, TAKATAK_TEAM_GAMES_ENABLED: "false" },
  );
  assert.equal(response?.status, 503);
});

test("only GET is accepted", async () => {
  const response = await handleTakatakTeamGames(
    new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`, { method: "POST" }),
    enabled,
  );
  assert.equal(response?.status, 405);
});

test("unknown public team IDs are rejected before upstream fetch", async () => {
  const response = await handleTakatakTeamGames(
    new Request(`https://ahmverdun.ca${root}?teamId=not-a-team`),
    enabled,
  );
  assert.equal(response?.status, 404);
  assert.deepEqual(await response?.json(), { status: "unknown_team" });
});

test("insecure upstream origin fails closed", async () => {
  const response = await handleTakatakTeamGames(
    new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
    { ...enabled, TAKATAK_TEAM_GAMES_ORIGIN: "http://takatak.ca" },
  );
  assert.equal(response?.status, 503);
});

test("upstream 404 degrades to official-link fallback state", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 404 });
  try {
    const response = await handleTakatakTeamGames(
      new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
      enabled,
    );
    assert.equal(response?.status, 200);
    assert.deepEqual(await response?.json(), { status: "not_connected" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("active upstream data is reduced to approved public fields", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const requestUrl = String(input);
    assert.match(requestUrl, /https:\/\/takatak\.ca\/api\/integrations\/ahmv\/team-games/);
    assert.match(requestUrl, new RegExp(`teamId=${validTeamId}`));
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("authorization"), "Bearer server-only-test-token");
    assert.equal(headers.get("x-ahmv-tenant"), "ahmverdun");
    assert.equal(headers.get("x-ahmv-team-id"), validTeamId);

    return new Response(
      JSON.stringify({
        internalTenantId: "must-not-leak",
        providerAccessToken: "must-not-leak",
        updatedAt: "2026-10-04T12:00:00-04:00",
        sourceUrl: "https://scoresheets.ca/public-team",
        nextGame: {
          id: "g-1",
          startsAt: "2026-10-08T18:30:00-04:00",
          homeTeam: "DUCKS M7-0 VERDUN",
          awayTeam: "OPPONENT",
          venue: "Aréna Denis-Savard",
          venueAddress: "4110 boulevard LaSalle, Montréal, QC",
          status: "scheduled",
          officialUrl: "https://scoresheets.ca/game/g-1",
          privateRoster: ["must-not-leak"],
        },
        latestResult: {
          id: "g-0",
          startsAt: "2026-10-01T17:00:00-04:00",
          homeTeam: "DUCKS M7-0 VERDUN",
          awayTeam: "OPPONENT",
          homeScore: 4,
          awayScore: 2,
          status: "final",
          scoresheetUrl: "https://scoresheets.ca/game/g-0",
        },
        recentResults: [
          {
            id: "g-0",
            startsAt: "2026-10-01T17:00:00-04:00",
            homeTeam: "DUCKS M7-0 VERDUN",
            awayTeam: "OPPONENT",
            homeScore: 4,
            awayScore: 2,
            status: "final",
          },
          {
            id: "bad",
            startsAt: "not-a-date",
            homeTeam: "DUCKS M7-0 VERDUN",
            awayTeam: "OPPONENT",
          },
        ],
        standing: {
          rank: 2,
          gamesPlayed: 8,
          wins: 6,
          losses: 2,
          ties: 0,
          points: 12,
          privateMetric: 99,
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  try {
    const response = await handleTakatakTeamGames(
      new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
      enabled,
    );
    assert.equal(response?.status, 200);
    const body = await response?.json() as Record<string, unknown>;
    assert.equal(body["status"], "active");
    assert.equal(body["source"], "GROUPE TAKATAK");
    assert.equal(body["teamId"], validTeamId);
    assert.equal(body["sourceUrl"], "https://scoresheets.ca/public-team");

    const nextGame = body["nextGame"] as Record<string, unknown>;
    assert.equal(nextGame["id"], "g-1");
    assert.equal("privateRoster" in nextGame, false);

    const results = body["recentResults"] as Array<Record<string, unknown>>;
    assert.equal(results.length, 1);

    const standing = body["standing"] as Record<string, unknown>;
    assert.equal(standing["points"], 12);
    assert.equal("privateMetric" in standing, false);
    assert.equal("providerAccessToken" in body, false);
    assert.equal("internalTenantId" in body, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("unsafe URLs are stripped without discarding valid game data", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    JSON.stringify({
      sourceUrl: "http://unsafe.example/team",
      nextGame: {
        id: "g-2",
        startsAt: "2026-10-09T19:00:00-04:00",
        homeTeam: "HOME",
        awayTeam: "AWAY",
        officialUrl: "javascript:alert(1)",
      },
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );

  try {
    const response = await handleTakatakTeamGames(
      new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
      enabled,
    );
    const body = await response?.json() as Record<string, unknown>;
    assert.equal(body["status"], "active");
    assert.equal("sourceUrl" in body, false);
    const nextGame = body["nextGame"] as Record<string, unknown>;
    assert.equal("officialUrl" in nextGame, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("responses are not indexed or cached", async () => {
  const response = await handleTakatakTeamGames(
    new Request(`https://ahmverdun.ca${root}?teamId=${validTeamId}`),
    {},
  );
  assert.equal(response?.headers.get("cache-control"), "no-store");
  assert.equal(response?.headers.get("X-Robots-Tag"), "noindex, nofollow");
});
