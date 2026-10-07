import { describe, expect, test } from "bun:test";
import { INSTAGRAM_ARCHIVE_NEWS, INSTAGRAM_ARCHIVE_SOURCES } from "../src/data/instagram-archive";
import { newsArticleMedia } from "../src/lib/news-media";

describe("News media from verified article sources", () => {
  test("the volunteer archive includes all three December photos exactly once", () => {
    const article = INSTAGRAM_ARCHIVE_NEWS.find((item) => item.slug === "journee-benevoles-decembre-2024-instagram")!;
    const media = newsArticleMedia(article, { url: article.image!, sourceUrl: article.sourceUrl, alt: article.title });
    expect(media.map((item) => item.url)).toEqual([
      "/news-media/instagram/DDod0fCRIm2.jpg",
      "/news-media/instagram/DDodwwhxVM1.jpg",
      "/news-media/instagram/DDodmmNxkfL.jpg",
    ]);
    expect(media.map((item) => item.sourceUrl)).toEqual(
      INSTAGRAM_ARCHIVE_SOURCES.filter((source) => source.articleSlug === article.slug).map((source) => source.url),
    );
  });

  test("every one of the twelve imported photos is accessible from its own news archive", () => {
    const rendered = INSTAGRAM_ARCHIVE_NEWS.flatMap((article) => newsArticleMedia(article, {
      url: article.image!, sourceUrl: article.sourceUrl, alt: article.title,
    }));
    expect(rendered).toHaveLength(12);
    expect(new Set(rendered.map((item) => item.url))).toEqual(new Set(INSTAGRAM_ARCHIVE_SOURCES.map((source) => source.image)));
  });

  test("a single-photo archive does not inherit photos from another article", () => {
    const article = INSTAGRAM_ARCHIVE_NEWS.find((item) => item.slug === "portrait-ahmv-2-fevrier-2025-instagram")!;
    expect(newsArticleMedia(article, { url: article.image!, alt: article.title }).map((item) => item.url))
      .toEqual(["/news-media/instagram/DFle-7BSLNi.jpg"]);
  });

  test("an unrelated news article retains only its supplied cover", () => {
    const primary = { url: "/news-media/facebook/horaire-semaine-29-septembre.jpg", alt: { fr: "Horaire", en: "Schedule" } };
    expect(newsArticleMedia({ slug: "horaire-semaine-29-septembre", title: primary.alt }, primary)).toEqual([primary]);
  });

  test("an approved replacement cover stays first while the verified originals remain available", () => {
    const article = INSTAGRAM_ARCHIVE_NEWS.find((item) => item.slug === "journee-benevoles-decembre-2024-instagram")!;
    const originalPrimary = { url: "/approved-correction.jpg", sourceUrl: "https://ahmverdun.ca/", alt: article.title };
    const before = { ...originalPrimary };
    const media = newsArticleMedia(article, originalPrimary);
    expect(media).toHaveLength(4);
    expect(media[0]).toEqual(originalPrimary);
    expect(new Set(media.map((item) => item.url)).size).toBe(4);
    expect(originalPrimary).toEqual(before);
  });

  test("each known image retains its exact verified post permalink", () => {
    const article = INSTAGRAM_ARCHIVE_NEWS[0]!;
    const media = newsArticleMedia(article, { url: article.image!, sourceUrl: "https://www.instagram.com/ahm_verdun/", alt: article.title });
    expect(media[0]?.sourceUrl).toBe(article.sourceUrl);
  });
});
