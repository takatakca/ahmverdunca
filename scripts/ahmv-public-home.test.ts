import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { parseCommunityFeed } from "../src/lib/community-feed";
import { TeamPicker } from "../src/components/team-picker";
import { I18nProvider } from "../src/lib/i18n";
import { PUBLIC_TEAM_DIRECTORY } from "../src/data/team-directory";
import { createCommunityFeedHandler } from "../src/lib/community-feed.server";

const post = {
  id: "official-1",
  source: "official",
  publishedAt: "2026-10-07T10:00:00-04:00",
  text: "AHMV",
  url: "https://www.facebook.com/AHMVerdun/posts/1",
  imageUrl: "https://example.com/photo.jpg",
};
describe("public home feed and multi-team selection", () => {
  test("unconnected and malformed provider responses never appear as a live feed", () => {
    expect(parseCommunityFeed(null)).toEqual([]);
    expect(parseCommunityFeed({ connected: false, items: [post] })).toEqual([]);
    expect(
      parseCommunityFeed({
        connected: true,
        items: [
          { ...post, publishedAt: "not-a-date" },
          { ...post, source: "unverified" },
        ],
      }),
    ).toEqual([]);
    expect(parseCommunityFeed({ connected: true, items: [post] })).toEqual([post]);
  });
  test("provider URLs reject scripts, insecure transport and embedded credentials", () => {
    const [parsed] = parseCommunityFeed({
      connected: true,
      items: [
        {
          ...post,
          url: "javascript:alert(1)",
          imageUrl: "https://user:password@example.com/image.jpg",
        },
      ],
    });
    expect(parsed?.url).toBeNull();
    expect(parsed?.imageUrl).toBeNull();
    expect(
      parseCommunityFeed({
        connected: true,
        items: [{ ...post, imageUrl: "http://example.com/image.jpg" }],
      })[0]?.imageUrl,
    ).toBeNull();
  });
  test("the home picker exposes independent checkboxes for all exact public teams", () => {
    const markup = renderToStaticMarkup(
      createElement(I18nProvider, null, createElement(TeamPicker)),
    );
    expect((markup.match(/type="checkbox"/g) ?? []).length).toBe(PUBLIC_TEAM_DIRECTORY.length);
    expect(PUBLIC_TEAM_DIRECTORY.length).toBe(24);
    expect(markup).toContain("Mes équipes — choix multiples");
    expect(markup).toContain("Choisir mes équipes");
  });
});

describe("public community feed server boundary", () => {
  const request = () => new Request("https://ahmverdun.ca/api/ahmv/community-feed");
  const handlerWith = (
    fetcher: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
    now?: () => number,
  ) => createCommunityFeedHandler({ fetcher: fetcher as typeof fetch, now });

  test("unrelated routes and unsupported methods never contact the provider", async () => {
    let calls = 0;
    const handler = handlerWith(async () => {
      calls++;
      return new Response();
    });
    expect(await handler(new Request("https://ahmverdun.ca/"))).toBeNull();
    const response = await handler(new Request(request(), { method: "POST" }));
    expect(response?.status).toBe(405);
    expect(response?.headers.get("Allow")).toBe("GET");
    expect(calls).toBe(0);
  });

  test("provider outages are explicit, safe and cached across visitors", async () => {
    let calls = 0;
    let clock = 0;
    const handler = handlerWith(
      async () => {
        calls++;
        return new Response("private upstream error", { status: 404 });
      },
      () => clock,
    );
    const responses = await Promise.all([
      handler(request()),
      handler(request()),
      handler(request()),
    ]);
    expect(calls).toBe(1);
    for (const response of responses) {
      expect(response?.status).toBe(200);
      expect(response?.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
      expect(await response?.json()).toEqual({
        connected: false,
        status: "unavailable",
        items: [],
      });
    }
    clock = 60_001;
    await handler(request());
    expect(calls).toBe(2);
  });

  test("only the fixed public provider is contacted and only public fields are returned", async () => {
    const handler = handlerWith(async (input, init) => {
      expect(String(input)).toBe("https://takatak.ca/api/public/ahmv/community-feed");
      expect(init?.credentials).toBe("omit");
      expect(init?.redirect).toBe("error");
      expect(new Headers(init?.headers).get("authorization")).toBeNull();
      return Response.json({
        connected: true,
        privateToken: "secret",
        items: [{ ...post, privateToken: "secret" }],
      });
    });
    const body = await (
      await handler(new Request(request().url + "?url=https://evil.example"))
    )?.json();
    expect(body).toEqual({ connected: true, status: "connected", items: [post] });
    expect(JSON.stringify(body)).not.toContain("secret");
  });

  test("invalid JSON, oversized payloads and connection failures keep the gallery available", async () => {
    for (const fetcher of [
      async () => new Response("not json"),
      async () => new Response(" ".repeat(256_001)),
      async () => {
        throw new Error("private connection error");
      },
    ]) {
      const response = await handlerWith(fetcher)(request());
      expect(await response?.json()).toEqual({
        connected: false,
        status: "unavailable",
        items: [],
      });
    }
  });
});
