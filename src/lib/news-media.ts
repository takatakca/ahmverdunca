import { INSTAGRAM_ARCHIVE_SOURCES } from "../data/instagram-archive";
import type { NewsArticle } from "../data/news";
import type { MediaViewerItem } from "../components/media/media-luxury-viewer";

/** Add only the verified images explicitly assigned to this article. */
export function newsArticleMedia(
  article: Pick<NewsArticle, "slug" | "title">,
  primary: MediaViewerItem,
): MediaViewerItem[] {
  const sources = INSTAGRAM_ARCHIVE_SOURCES.filter((source) => source.articleSlug === article.slug);
  const primarySource = sources.find((source) => source.image === primary.url);
  const candidates: MediaViewerItem[] = [
    { ...primary, ...(primarySource ? { sourceUrl: primarySource.url } : {}) },
    ...sources.map((source) => ({
      url: source.image,
      sourceUrl: source.url,
      alt: article.title,
      label: article.title,
    })),
  ];
  const seen = new Set<string>();
  return candidates.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
