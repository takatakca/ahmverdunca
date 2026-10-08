import { describe, expect, test } from "bun:test";
import type { NewsArticle } from "../src/data/news";
import {
  handlePublicNewsFeed,
  publicNewsFeedItems,
  renderNewsRss,
} from "../src/lib/public-news-feed.server";

const article: NewsArticle = {
  slug: "test",
  title: { fr: "Hockey <Verdun> & Montréal", en: "Hockey" },
  excerpt: { fr: "Une nouvelle vérifiée.", en: "Verified news." },
  body: { fr: ["Article"] },
  author: "AHMV",
  category: "association",
  teamSlugs: [],
  season: "2026-2027",
  contentPending: false,
};
const now = Date.parse("2026-10-08T12:00:00-04:00");
describe("public news syndication", () => {
  test("future and unfinished posts are excluded and only verified instants gain publication times", () => {
    const items = publicNewsFeedItems(
      [
        { ...article, slug: "future", date: "2026-10-09" },
        { ...article, slug: "pending", contentPending: true },
        { ...article, slug: "day", date: "2026-10-07" },
        { ...article, slug: "instant", publishedAt: "2026-10-07T10:30:00-04:00" },
        { ...article, archived: true },
      ],
      now,
    );
    expect(items).toHaveLength(3);
    expect(items.find((item) => item.id.endsWith("/day"))).not.toHaveProperty("date_published");
    expect(items.find((item) => item.id.endsWith("/instant"))?.date_published).toBe(
      "2026-10-07T14:30:00.000Z",
    );
    expect(items.find((item) => item.id.endsWith("/test"))?.content_text).toStartWith(
      "Archive AHMV",
    );
  });
  test("XML escapes titles and has real canonical permalinks without invented build dates", () => {
    const output = renderNewsRss([article], now);
    expect(output).toContain("Hockey &lt;Verdun&gt; &amp; Montréal");
    expect(output).toContain("https://ahmverdun.ca/nouvelles/test");
    expect(output).not.toContain("<pubDate>");
    expect(output).not.toContain("<lastBuildDate>");
  });
  test("RSS and JSON feeds are readable, HEAD is empty and unsupported methods are rejected", async () => {
    expect(handlePublicNewsFeed(new Request("https://ahmverdun.ca/"))).toBeNull();
    const rss = handlePublicNewsFeed(new Request("https://ahmverdun.ca/actualites.xml"));
    expect(rss?.headers.get("content-type")).toContain("application/rss+xml");
    expect(await rss?.text()).toContain("<rss version=");
    const feed = await handlePublicNewsFeed(
      new Request("https://ahmverdun.ca/actualites.json"),
    )?.json();
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.items.length).toBeLessThanOrEqual(25);
    expect(
      await handlePublicNewsFeed(
        new Request("https://ahmverdun.ca/actualites.xml", { method: "HEAD" }),
      )?.text(),
    ).toBe("");
    expect(
      handlePublicNewsFeed(new Request("https://ahmverdun.ca/actualites.json", { method: "POST" }))
        ?.status,
    ).toBe(405);
  });
});
