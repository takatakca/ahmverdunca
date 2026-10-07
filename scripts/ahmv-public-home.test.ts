import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { parseCommunityFeed } from "../src/lib/community-feed";
import { TeamPicker } from "../src/components/team-picker";
import { I18nProvider } from "../src/lib/i18n";
import { PUBLIC_TEAM_DIRECTORY } from "../src/data/team-directory";

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
