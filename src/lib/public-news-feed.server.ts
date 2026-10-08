import { NEWS, type NewsArticle } from "../data/news";
import { resolvePublicationTime } from "./news-publication";
import { SITE } from "./site";

const RSS_PATH = "/actualites.xml";
const JSON_PATH = "/actualites.json";

function xml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!,
  );
}

function publicArticles(articles: NewsArticle[], now: number) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Montreal",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now));
  return articles
    .filter((article) => {
      if (article.contentPending) return false;
      const publication = resolvePublicationTime(article);
      if (publication.precision === "instant" && publication.epochMs > now) return false;
      return publication.precision === "unknown" || publication.day <= today;
    })
    .sort((a, b) => {
      const first = resolvePublicationTime(a);
      const second = resolvePublicationTime(b);
      return (second.precision === "unknown" ? "" : second.day).localeCompare(
        first.precision === "unknown" ? "" : first.day,
      );
    })
    .slice(0, 25);
}

export function publicNewsFeedItems(articles: NewsArticle[] = NEWS, now = Date.now()) {
  return publicArticles(articles, now).map((article) => {
    const publication = resolvePublicationTime(article);
    const url = `${SITE.domain}/nouvelles/${encodeURIComponent(article.slug)}`;
    return {
      id: url,
      url,
      title: article.title.fr,
      content_text: `${article.archived ? "Archive AHMV — " : ""}${article.excerpt.fr}`,
      ...(publication.precision === "instant"
        ? { date_published: new Date(publication.epochMs).toISOString() }
        : {}),
      language: "fr-CA",
    };
  });
}

export function renderNewsRss(articles: NewsArticle[] = NEWS, now = Date.now()) {
  const items = publicNewsFeedItems(articles, now)
    .map(
      (item) =>
        `<item><title>${xml(item.title)}</title><link>${xml(item.url)}</link><guid isPermaLink="true">${xml(item.url)}</guid><description>${xml(item.content_text)}</description>${item.date_published ? `<pubDate>${new Date(item.date_published).toUTCString()}</pubDate>` : ""}</item>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>AHM Verdun — Nouvelles</title><link>${SITE.domain}/nouvelles</link><description>Nouvelles du hockey mineur de Verdun, Montréal.</description><language>fr-ca</language><atom:link href="${SITE.domain}${RSS_PATH}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}

export function handlePublicNewsFeed(request: Request) {
  const path = new URL(request.url).pathname;
  if (path !== RSS_PATH && path !== JSON_PATH) return null;
  if (request.method !== "GET" && request.method !== "HEAD")
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  const body =
    path === RSS_PATH
      ? renderNewsRss()
      : JSON.stringify({
          version: "https://jsonfeed.org/version/1.1",
          title: "AHM Verdun — Nouvelles",
          home_page_url: `${SITE.domain}/nouvelles`,
          feed_url: `${SITE.domain}${JSON_PATH}`,
          language: "fr-CA",
          items: publicNewsFeedItems(),
        });
  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "content-type":
        path === RSS_PATH
          ? "application/rss+xml; charset=utf-8"
          : "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
