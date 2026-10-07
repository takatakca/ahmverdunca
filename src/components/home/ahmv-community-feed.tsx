import { parseCommunityFeed, type CommunityFeedItem } from "@/lib/community-feed";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Facebook,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { EXTERNAL_LINKS } from "@/lib/site";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";

const COMMUNITY_FEED_URL = "https://takatak.ca/api/public/ahmv/community-feed";
const FACEBOOK_PAGE_URL = EXTERNAL_LINKS.facebook;

export function AhmvCommunityFeed() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const rail = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CommunityFeedItem[]>([]);
  const [embedEnabled, setEmbedEnabled] = useState(false);
  const fallbackMedia = [17, 18, 21, 23]
    .map((id) => uploadedAhmvMediaById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  useEffect(() => {
    const controller = new AbortController();
    let fetching = false;
    const refresh = async () => {
      if (fetching || document.visibilityState === "hidden") return;
      fetching = true;
      try {
        const response = await fetch(COMMUNITY_FEED_URL, {
          headers: { Accept: "application/json" },
          credentials: "omit",
          signal: controller.signal,
        });
        if (response.ok) setItems(parseCommunityFeed(await response.json()));
      } catch {
        /* Official Page access and the gallery remain available. */
      } finally {
        fetching = false;
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    const visible = () => void refresh();
    document.addEventListener("visibilitychange", visible);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  const move = (direction: number) =>
    rail.current?.scrollBy({
      left: direction * rail.current.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  const embedUrl = `https://www.facebook.com/plugins/page.php?${new URLSearchParams({ href: FACEBOOK_PAGE_URL, tabs: "timeline", width: "340", height: "500", small_header: "true", adapt_container_width: "true", hide_cover: "false", show_facepile: "false" })}`;
  return (
    <section className="border-y border-white/10 bg-competition py-8 text-white md:py-12">
      <div className="container-site">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-sport-foreground">
              <Facebook className="size-4" />
              Facebook AHM Verdun
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase md:text-4xl">
              {fr ? "La vie du club" : "Life at the club"}
            </h2>
          </div>
          <div className="flex gap-2">
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-3 text-xs font-semibold"
            >
              {fr ? "Voir la page" : "Visit the Page"}
              <ExternalLink className="size-3.5" />
            </a>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={fr ? "Publications précédentes" : "Previous posts"}
              className="flex size-11 items-center justify-center rounded-xl border border-white/15"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={fr ? "Publications suivantes" : "Next posts"}
              className="flex size-11 items-center justify-center rounded-xl border border-white/15"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
        <div
          ref={rail}
          className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3"
          tabIndex={0}
          role="region"
          aria-label={
            fr ? "Publications Facebook et galerie AHMV" : "Facebook posts and AHMV gallery"
          }
        >
          <article className="flex w-[min(88vw,22rem)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/15 bg-navy-deep">
            {embedEnabled ? (
              <div className="flex min-h-[500px] justify-center overflow-hidden">
                <iframe
                  src={embedUrl}
                  title={
                    fr
                      ? "Fil officiel Facebook AHM Verdun"
                      : "Official AHM Verdun Facebook timeline"
                  }
                  width="340"
                  height="500"
                  loading="lazy"
                  allow="encrypted-media"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="max-w-full border-0"
                />
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-1 flex-col items-start justify-center bg-gradient-to-br from-navy to-navy-deep p-6">
                <Facebook className="size-10 text-sport-foreground" />
                <h3 className="mt-6 font-display text-3xl font-extrabold uppercase">
                  Facebook AHM Verdun
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {fr
                    ? "Retrouvez les publications de l’association directement ici."
                    : "See the association’s posts right here."}
                </p>
                <button
                  type="button"
                  onClick={() => setEmbedEnabled(true)}
                  className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-sport px-4 text-sm font-semibold text-sport-foreground"
                >
                  {fr ? "Afficher le fil Facebook" : "Show Facebook timeline"}
                  <ChevronRight className="size-4" />
                </button>
                <p className="mt-3 text-[11px] leading-relaxed text-white/45">
                  {fr
                    ? "En l’affichant, vous chargez le contenu et les témoins de Facebook."
                    : "Displaying it loads Facebook content and cookies."}
                </p>
              </div>
            )}
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-between border-t border-white/10 px-4 text-xs font-semibold text-white/75"
            >
              {fr ? "Ouvrir dans Facebook" : "Open in Facebook"}
              <ExternalLink className="size-3.5" />
            </a>
          </article>
          {items.map((item) => (
            <article
              key={item.id}
              className="w-[min(82vw,22rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/12 bg-navy-deep"
            >
              <div className="relative aspect-[4/3] bg-navy">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Facebook className="size-10 text-white/30" />
                  </div>
                )}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-navy-deep/90 px-3 py-1.5 text-[10px] font-semibold">
                  {item.source === "official" ? (
                    <ShieldCheck className="size-3 text-sport-foreground" />
                  ) : (
                    <Users className="size-3" />
                  )}
                  {item.source === "official"
                    ? fr
                      ? "Officiel AHMV"
                      : "Official AHMV"
                    : fr
                      ? "Communauté"
                      : "Community"}
                </span>
              </div>
              <div className="p-4">
                <time dateTime={item.publishedAt} className="text-xs text-white/45">
                  {new Intl.DateTimeFormat(fr ? "fr-CA" : "en-CA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(item.publishedAt))}
                </time>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/80">
                  {item.text || (fr ? "Publication AHM Verdun" : "AHM Verdun post")}
                </p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-sport-foreground"
                  >
                    {fr ? "Voir la publication" : "View post"}
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
          {items.length === 0 &&
            fallbackMedia.map((media) => (
              <a
                key={media.id}
                href={media.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative min-h-[320px] w-[min(78vw,22rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/12 bg-navy-deep"
              >
                <img
                  src={media.url}
                  alt={media.alt[lang]}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition-transform group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent" />
                <span className="absolute inset-x-4 bottom-5">
                  <span className="text-xs text-sport-foreground">
                    {fr ? "Galerie AHMV" : "AHMV gallery"}
                  </span>
                  <span className="mt-2 block font-display text-2xl font-bold uppercase">
                    {media.label[lang]}
                  </span>
                </span>
              </a>
            ))}
        </div>
      </div>
    </section>
  );
}
