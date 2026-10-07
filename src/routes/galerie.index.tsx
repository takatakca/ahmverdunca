import { canonicalLink } from "@/lib/seo";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Images } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SportArtwork } from "@/components/sport-artwork";
import { ALBUMS } from "@/data/gallery";
import { publicUploadedAhmvMediaById } from "@/data/uploaded-media";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { MediaLuxuryViewer } from "@/components/media/media-luxury-viewer";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useContentOverlayRegistry } from "@/lib/community-content";

export const Route = createFileRoute("/galerie/")({
  head: () => ({
    links: canonicalLink("/galerie"),
    meta: [
      { title: "Photos et vidéos — AHM Verdun" },
      { name: "description", content: "Albums photos et vidéos des équipes et événements de l'AHM Verdun, organisés par saison." },
      { property: "og:title", content: "Photos et vidéos — AHM Verdun" },
      { property: "og:description", content: "Albums des équipes et événements de l'association." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { l, lang } = useI18n();
  const [season, setSeason] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const contentRegistry = useContentOverlayRegistry();
  const allAlbums = useMemo(
    () =>
      ALBUMS.map((album) =>
        contentRegistry.apply(
          "gallery",
          `gallery:${album.slug}`,
          album as unknown as Record<string, unknown>,
        ) as unknown as typeof album,
      ),
    [contentRegistry.overlays],
  );
  const featuredMediaIds = [7, 17, 26, 43] as const;
  const featuredMedia = useMemo(
    () =>
      featuredMediaIds
        .map((mediaId) => {
          const media = publicUploadedAhmvMediaById(mediaId);
          if (!media) return null;
          const sourceIndex = media.id - 1;
          const patched = contentRegistry.apply(
            "photo",
            `photo:mediatheque-ahmv-2026-2027:${sourceIndex}`,
            media as unknown as Record<string, unknown>,
          ) as unknown as typeof media;
          return { media: patched, sourceIndex };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [contentRegistry.overlays],
  );
  const seasons = useMemo(
    () => Array.from(new Set(allAlbums.map((album) => album.season))).sort().reverse(),
    [allAlbums],
  );
  const eventTypes = useMemo(
    () => Array.from(new Map(allAlbums.map((album) => [album.eventType.fr, album.eventType])).values()),
    [allAlbums],
  );
  const albums = allAlbums.filter((album) => {
    const seasonMatch = season === "all" || album.season === season;
    const typeMatch = eventType === "all" || album.eventType.fr === eventType;
    return seasonMatch && typeMatch;
  });

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Archives · Mémoire AHMV" : "Archives · AHMV memory"}
        title={lang === "fr" ? "Photos et vidéos" : "Photos & videos"}
        description={
          lang === "fr"
            ? "La médiathèque AHMV réunit maintenant les photos, affiches, horaires et documents de l’association avec les archives publiques, organisés par saison et catégorie."
            : "The AHMV media library now brings together association photos, posters, schedules and documents with the public archives, organized by season and category."
        }
      />

      <div className="relative overflow-hidden bg-navy-deep py-9 text-white md:py-14">
        <div className="technical-grid pointer-events-none absolute inset-0 opacity-15" aria-hidden />
        <div className="container-site relative">
        <HouseSponsorSlot placement="gallery" compact className="mb-8" />
        <section className="mb-8 overflow-hidden border border-navy/12 bg-navy md:mb-10">
          <div className="grid h-[320px] grid-cols-2 grid-rows-2 gap-px bg-white/10 sm:h-[420px] lg:grid-cols-4 lg:grid-rows-1">
            {featuredMedia.map(({ media, sourceIndex }, index) => (
              <div key={media.url} className="relative overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setViewerIndex(index);
                  setViewerOpen(true);
                }}
                className="interactive-surface group relative block size-full overflow-hidden bg-navy text-left"
                aria-label={
                  lang === "fr"
                    ? `Agrandir ${media.label.fr}`
                    : `Enlarge ${media.label.en}`
                }
              >
                <img
                  src={media.url}
                  alt={lang === "fr" ? media.alt.fr : media.alt.en}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.045]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(7,16,43,0.72)_100%)]" />
                <span className="absolute bottom-4 left-4 bg-navy/78 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                  {index === 0
                    ? lang === "fr"
                      ? "Photos réelles AHMV · toucher pour agrandir"
                      : "Real AHMV photography · tap to enlarge"
                    : lang === "fr"
                      ? "Agrandir"
                      : "Enlarge"}
                </span>
              </button>
              <ContentContributionButton
                resourceType="photo"
                resourceKey={`photo:mediatheque-ahmv-2026-2027:${sourceIndex}`}
                title={media.label[lang]}
                snapshot={media as unknown as Record<string, unknown>}
                fields={[
                  { key: "url", label: { fr: "Image", en: "Image" }, kind: "image-url", current: media.url },
                  { key: `alt.${lang}`, label: { fr: "Texte alternatif", en: "Alternative text" }, kind: "text", current: media.alt[lang] },
                  { key: `label.${lang}`, label: { fr: "Légende", en: "Caption" }, kind: "text", current: media.label[lang] },
                  { key: "sourceUrl", label: { fr: "Source", en: "Source" }, kind: "url", current: media.sourceUrl },
                ]}
                appearance="menu"
                className="absolute right-3 top-3 z-20"
              />
              </div>
            ))}
          </div>
        </section>
        <section className="grid gap-px overflow-hidden border border-white/12 bg-white/10 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="bg-competition p-6 text-white md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Archives AHMV vérifiées" : "Verified AHMV archives"}</p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/70">
              {lang === "fr"
                ? "La nouvelle médiathèque héberge directement les médias remis à l’AHMV et conserve aussi les liens vers les archives historiques déjà publiées. Les collections sont consultables par saison et type."
                : "The new media library directly hosts media supplied to AHMV and also preserves links to previously published historical archives. Collections can be browsed by season and type."}
            </p>
          </div>
          <div className="bg-navy p-6 text-white md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Filtre d’archive" : "Archive filter"}</p>
                <p className="mt-2 font-display text-4xl font-extrabold uppercase leading-none text-white">
                  {albums.length} {lang === "fr" ? "albums" : "albums"}
                </p>
              </div>
              <div className="space-y-2 sm:max-w-[58%]">
                <div className="scrollbar-none flex gap-1 overflow-x-auto pb-1" aria-label={lang === "fr" ? "Filtrer par saison" : "Filter by season"}>
                  <button
                    type="button"
                    aria-pressed={season === "all"}
                    onClick={() => setSeason("all")}
                    className={cn(
                      "premium-control shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em]",
                      season === "all" ? "border-sport bg-sport text-sport-foreground" : "border-white/15 bg-white/[0.04] text-white hover:border-sport",
                    )}
                  >
                    {lang === "fr" ? "Toutes saisons" : "All seasons"}
                  </button>
                  {seasons.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={season === value}
                      onClick={() => setSeason(value)}
                      className={cn(
                        "shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em]",
                        season === value ? "border-sport bg-sport text-sport-foreground" : "border-white/15 bg-white/[0.04] text-white hover:border-sport",
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div className="scrollbar-none flex gap-1 overflow-x-auto pb-1" aria-label={lang === "fr" ? "Filtrer par type d’événement" : "Filter by event type"}>
                  <button
                    type="button"
                    aria-pressed={eventType === "all"}
                    onClick={() => setEventType("all")}
                    className={cn(
                      "premium-control shrink-0 border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em]",
                      eventType === "all" ? "border-sport bg-sport text-sport-foreground" : "border-white/15 bg-white/[0.04] text-white hover:border-sport",
                    )}
                  >
                    {lang === "fr" ? "Tous types" : "All types"}
                  </button>
                  {eventTypes.map((value) => (
                    <button
                      key={value.fr}
                      type="button"
                      aria-pressed={eventType === value.fr}
                      onClick={() => setEventType(value.fr)}
                      className={cn(
                        "premium-control shrink-0 border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em]",
                        eventType === value.fr ? "border-sport bg-sport text-sport-foreground" : "border-white/15 bg-white/[0.04] text-white hover:border-sport",
                      )}
                    >
                      {l(value)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {albums.length > 0 ? (
          <>
            <div className="mt-7 sm:hidden">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/48">
                  {lang === "fr" ? "Glissez entre les albums" : "Swipe through albums"}
                </p>
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-sport-foreground">
                  {albums.length} {lang === "fr" ? "collections" : "collections"}
                </span>
              </div>
              <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3">
                {albums.map((album, index) => (
                  <Link
                    key={album.slug}
                    to="/galerie/$slug"
                    params={{ slug: album.slug }}
                    className="interactive-surface group relative h-[68vw] max-h-[330px] min-h-[250px] w-[84vw] max-w-[24rem] shrink-0 snap-center overflow-hidden border border-white/12 bg-navy"
                  >
                    <SportArtwork
                      index={String(index + 1).padStart(2, "0")}
                      kicker={`${l(album.eventType)} · ${formatShortDate(album.date, lang)}`}
                      title={l(album.title)}
                      code={album.season.slice(-2)}
                      aspect="absolute inset-0"
                      className="absolute inset-0"
                    />
                    {album.coverUrl && (
                      <img
                        src={album.coverUrl}
                        alt={l(album.title)}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 z-[1] size-full object-cover transition-transform duration-500 group-active:scale-[1.02]"
                        onError={(event) => { event.currentTarget.style.display = "none"; }}
                      />
                    )}
                    <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,transparent_28%,rgba(7,16,43,0.88)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white">
                      <p className="eyebrow text-sport-foreground">{l(album.eventType)}</p>
                      <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9]">
                        {l(album.title)}
                      </h3>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/12 pt-3">
                        <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/62">
                          <Images className="size-3.5 text-sport-foreground" />
                          {album.photoCount
                            ? lang === "fr"
                              ? `${album.photoCount} médias`
                              : `${album.photoCount} media`
                            : album.season}
                        </span>
                        <ArrowRight className="size-4 text-sport-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-7 hidden auto-rows-[220px] gap-2 sm:grid sm:auto-rows-[240px] sm:grid-cols-2 lg:grid-cols-4">
              {albums.map((album, index) => (
                <Link
                  key={album.slug}
                  to="/galerie/$slug"
                  params={{ slug: album.slug }}
                  className={cn(
                    "interactive-surface group relative overflow-hidden",
                    index === 0 && "sm:row-span-2 lg:col-span-2 lg:row-span-2",
                    index === 1 && "lg:col-span-2",
                  )}
                >
                  <SportArtwork
                    index={String(index + 1).padStart(2, "0")}
                    kicker={`${l(album.eventType)} · ${formatShortDate(album.date, lang)}`}
                    title={l(album.title)}
                    code={album.season.slice(-2)}
                    aspect="absolute inset-0"
                    className="absolute inset-0"
                  />
                  {album.coverUrl && (
                    <img
                      src={album.coverUrl}
                      alt={l(album.title)}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 z-[1] size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      onError={(event) => { event.currentTarget.style.display = "none"; }}
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(7,16,43,0.62)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-navy-foreground/12 bg-competition/85 px-5 py-3 text-navy-foreground backdrop-blur-sm">
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                      <Images className="size-3.5 text-sport-foreground" />
                      {album.photoCount
                        ? lang === "fr"
                          ? `${album.photoCount} médias`
                          : `${album.photoCount} media`
                        : album.coverUrl
                          ? lang === "fr"
                            ? "Aperçu AHMV"
                            : "AHMV preview"
                          : lang === "fr"
                            ? "Archive AHMV"
                            : "AHMV archive"}
                    </span>
                    <ArrowRight className="size-4 text-sport-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-7 border border-white/12 bg-competition p-8 text-center">
            <Images className="mx-auto size-6 text-sport" aria-hidden />
            <p className="mt-3 font-display text-2xl font-extrabold uppercase text-white">
              {lang === "fr" ? "Aucune archive pour ces filtres" : "No archives for these filters"}
            </p>
            <button
              type="button"
              onClick={() => {
                setSeason("all");
                setEventType("all");
              }}
              className="mt-4 min-h-11 border border-white/18 bg-white/[0.04] px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-white hover:border-sport"
            >
              {lang === "fr" ? "Réinitialiser les filtres" : "Reset filters"}
            </button>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3 border-t border-white/12 pt-5 text-xs text-white/48">
          <CalendarDays className="size-4 text-sport" />
          <span>{lang === "fr" ? "Archives organisées par saison et type d’événement." : "Archives organized by season and event type."}</span>
        </div>
        </div>
      </div>

      <MediaLuxuryViewer
        items={featuredMedia.map((item) => item.media)}
        open={viewerOpen}
        initialIndex={viewerIndex}
        lang={lang}
        onOpenChange={setViewerOpen}
      />
    </>
  );
}
