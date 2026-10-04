import { ExternalLink, Facebook, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n";

const COMMUNITY_FEED_URL =
  "https://takatak.ca/api/public/ahmv/community-feed";
const FACEBOOK_PAGE_URL = "https://www.facebook.com/ahmverdun.ca";

type CommunityFeedItem = {
  id: string;
  source: "official" | "community";
  contentType: "post" | "reel" | string;
  publishedAt: string;
  text: string | null;
  url: string | null;
  imageUrl: string | null;
};

type CommunityFeedResponse = {
  ok?: boolean;
  connected?: boolean;
  items?: CommunityFeedItem[];
};

function FeedCard({
  item,
  lang,
}: {
  item: CommunityFeedItem;
  lang: "fr" | "en";
}) {
  const community = item.source === "community";
  const date = new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(item.publishedAt));

  const content = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-deep">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Facebook className="size-10 text-white/35" aria-hidden />
          </div>
        )}
        <span
          className={
            community
              ? "absolute left-3 top-3 inline-flex items-center gap-1.5 bg-white px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-navy shadow-sm"
              : "absolute left-3 top-3 inline-flex items-center gap-1.5 bg-sport px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-sport-foreground shadow-sm"
          }
        >
          {community ? (
            <Users className="size-3" aria-hidden />
          ) : (
            <ShieldCheck className="size-3" aria-hidden />
          )}
          {community
            ? lang === "fr"
              ? "Communauté AHMV"
              : "AHMV Community"
            : lang === "fr"
              ? "Officiel AHMV"
              : "Official AHMV"}
        </span>
      </div>

      <div className="flex min-h-44 flex-col bg-white/[0.035] p-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/42">
          Facebook · {date}
        </p>
        <p className="mt-3 line-clamp-4 text-sm font-medium leading-6 text-white/82">
          {item.text ||
            (lang === "fr"
              ? "Publication Facebook AHM Verdun"
              : "AHM Verdun Facebook post")}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-bold uppercase tracking-[0.12em] text-sport-foreground">
          {lang === "fr" ? "Voir sur Facebook" : "View on Facebook"}
          <ExternalLink className="size-3.5" aria-hidden />
        </span>
      </div>
    </>
  );

  return item.url ? (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="interactive-surface group overflow-hidden border border-white/12 bg-navy-deep transition-shadow hover:border-sport/45 hover:shadow-lg"
    >
      {content}
    </a>
  ) : (
    <article className="interactive-surface group overflow-hidden border border-white/12 bg-navy-deep">
      {content}
    </article>
  );
}

export function AhmvCommunityFeed() {
  const { lang } = useI18n();
  const [items, setItems] = useState<CommunityFeedItem[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(COMMUNITY_FEED_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("feed_unavailable");
        return (await response.json()) as CommunityFeedResponse;
      })
      .then((payload) => {
        setConnected(payload.connected === true);
        setItems(Array.isArray(payload.items) ? payload.items.slice(0, 6) : []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setConnected(false);
        setItems([]);
      });

    return () => controller.abort();
  }, []);

  if (connected === false && items.length === 0) {
    return (
      <section className="relative overflow-hidden border-y border-white/10 bg-competition py-8 text-white md:py-10">
        <div className="technical-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />
        <div className="container-site relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Communauté AHMV" : "AHMV Community"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-none text-white md:text-4xl">
              {lang === "fr" ? "Sur la glace" : "From the rink"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
              {lang === "fr"
                ? "Les publications Facebook de la communauté apparaîtront ici automatiquement lorsqu’elles seront disponibles."
                : "Facebook community posts will appear here automatically when they become available."}
            </p>
          </div>
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="premium-control inline-flex min-h-11 items-center justify-center gap-2 bg-sport px-5 text-sm font-bold uppercase tracking-[0.1em] text-sport-foreground"
          >
            <Facebook className="size-4" aria-hidden />
            Facebook AHM Verdun
          </a>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-competition py-10 text-white md:py-14">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />
      <div className="container-site relative">
        <div className="flex flex-col gap-4 border-b border-white/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Communauté AHMV" : "AHMV Community"}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
              {lang === "fr" ? "Sur la glace" : "From the rink"}
            </h2>
          </div>
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-white/72 hover:text-sport-foreground"
          >
            <Facebook className="size-4" aria-hidden />
            {lang === "fr" ? "Voir la page Facebook" : "View Facebook page"}
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <FeedCard key={item.id} item={item} lang={lang} />
          ))}
        </div>

        <div className="mt-5 border-l-2 border-sport pl-4 text-xs leading-5 text-white/48">
          {lang === "fr"
            ? "OFFICIEL AHMV = publié par l’association. COMMUNAUTÉ AHMV = publication publique d’un membre de la communauté ayant identifié AHM Verdun; ce contenu n’est pas un communiqué officiel de l’association."
            : "OFFICIAL AHMV = published by the association. AHMV COMMUNITY = a public post from a community member that tagged AHM Verdun; it is not an official association statement."}
        </div>
      </div>
    </section>
  );
}
