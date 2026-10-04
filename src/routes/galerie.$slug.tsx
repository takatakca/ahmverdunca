import { useMemo, useState } from "react";
import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Images, ZoomIn } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { MediaLuxuryViewer } from "@/components/media/media-luxury-viewer";
import { getAlbum } from "@/data/gallery";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { formatDate, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useContentOverlayRegistry } from "@/lib/community-content";

export const Route = createFileRoute("/galerie/$slug")({
  loader: ({ params }) => {
    const album = getAlbum(params.slug);
    if (!album) throw notFound();
    return { slug: album.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Album introuvable — AHM Verdun" }, { name: "robots", content: "noindex" }] };
    const al = getAlbum(loaderData.slug)!;
    const title = `${al.title.fr} — AHM Verdun`;
    return {
      links: canonicalLink(`/galerie/${loaderData.slug}`),
      meta: [
        { title },
        { name: "description", content: al.description.fr },
        { property: "og:title", content: title },
        { property: "og:description", content: al.description.fr },
        ...(al.coverUrl ? [{ property: "og:image", content: al.coverUrl }] : []),
      ],
    };
  },
  component: AlbumPage,
});

function AlbumPage() {
  const { slug } = Route.useLoaderData();
  const { t, l, lang } = useI18n();
  const contentRegistry = useContentOverlayRegistry();
  const baseAlbum = getAlbum(slug)!;
  const al = contentRegistry.apply(
    "gallery",
    `gallery:${slug}`,
    baseAlbum as unknown as Record<string, unknown>,
  ) as unknown as typeof baseAlbum;
  const photos = useMemo(
    () =>
      (al.photos ?? []).map((media, index) =>
        contentRegistry.apply(
          "photo",
          `photo:${slug}:${index}`,
          media as unknown as Record<string, unknown>,
        ) as unknown as typeof media,
      ),
    [al.photos, contentRegistry.overlays, slug],
  );
  const previewPhotos = photos.slice(0, 6);
  const albumFields = [
    { key: `title.${lang}`, label: { fr: "Titre de l’album", en: "Album title" }, kind: "text" as const, current: al.title[lang] },
    { key: `description.${lang}`, label: { fr: "Description", en: "Description" }, kind: "textarea" as const, current: al.description[lang] },
    { key: "date", label: { fr: "Date", en: "Date" }, kind: "date" as const, current: al.date },
    { key: "coverUrl", label: { fr: "Image de couverture", en: "Cover image" }, kind: "image-url" as const, current: al.coverUrl },
    { key: "sourceUrl", label: { fr: "Lien source", en: "Source link" }, kind: "url" as const, current: al.sourceUrl },
  ];
  const [category, setCategory] = useState("all");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const categories = useMemo(
    () =>
      Array.from(
        new Map(
          photos
            .filter((photo) => photo.category && photo.categoryLabel)
            .map((photo) => [photo.category!, photo.categoryLabel!]),
        ).entries(),
      ),
    [photos],
  );

  const visiblePhotos =
    category === "all" ? photos : photos.filter((photo) => photo.category === category);

  return (
    <>
      <PageHeader
        eyebrow={`${l(al.eventType)} · ${formatDate(al.date, lang)}`}
        title={l(al.title)}
        description={l(al.description)}
        actions={
          <ContentContributionButton
            resourceType="gallery"
            resourceKey={`gallery:${al.slug}`}
            title={l(al.title)}
            snapshot={al as unknown as Record<string, unknown>}
            fields={albumFields}
            appearance="menu"
          />
        }
      />

      <div className="container-site py-8 md:py-12">
        <Link to="/galerie" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
          <ArrowLeft className="size-4" /> {t("common.back")}
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-navy-deep">
            {previewPhotos.length > 0 ? (
              <div
                className={cn(
                  "absolute inset-0 grid gap-px bg-white/10",
                  previewPhotos.length >= 5
                    ? "grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2"
                    : "grid-cols-2",
                )}
              >
                {previewPhotos.map((media, index) => (
                  <button
                    key={media.url}
                    type="button"
                    onClick={() => {
                      setViewerIndex(index);
                      setViewerOpen(true);
                    }}
                    className="group relative overflow-hidden text-left"
                    aria-label={
                      lang === "fr"
                        ? `Ouvrir ${media.label?.fr ?? media.alt.fr}`
                        : `Open ${media.label?.en ?? media.alt.en}`
                    }
                  >
                    <img
                      src={media.url}
                      alt={lang === "fr" ? media.alt.fr : media.alt.en}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute right-2 top-2 inline-flex size-8 items-center justify-center border border-white/20 bg-navy-deep/70 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                      <ZoomIn className="size-4" />
                    </span>
                  </button>
                ))}
              </div>
            ) : al.coverUrl ? (
              <img
                src={al.coverUrl}
                alt={l(al.title)}
                loading="eager"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-white/10">
                {[OFFICIAL_MEDIA.tournamentM11Primary, OFFICIAL_MEDIA.tournamentM11Secondary, OFFICIAL_MEDIA.tournamentM11Tertiary].map((media, index) => (
                  <img
                    key={media.url}
                    src={media.url}
                    alt={lang === "fr" ? media.alt.fr : media.alt.en}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className={cn("size-full object-cover", index === 0 && "row-span-2")}
                  />
                ))}
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(7,16,43,0.82)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/72">
                {photos.length
                  ? lang === "fr"
                    ? `${photos.length} médias AHMV`
                    : `${photos.length} AHMV media items`
                  : al.coverUrl
                    ? lang === "fr"
                      ? "Aperçu provenant des archives publiques AHMV"
                      : "Preview from AHMV public archives"
                    : lang === "fr"
                      ? "Montage d’archives AHMV · aperçu générique"
                      : "AHMV archive montage · generic preview"}
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9] sm:text-4xl">
                {l(al.title)}
              </p>
            </div>
          </div>

          <aside className="broadcast-rail self-start border border-white/12 bg-competition p-6 pl-8 text-white md:p-8 md:pl-10">
            <p className="eyebrow text-sport-foreground">
              {photos.length
                ? lang === "fr"
                  ? "Médiathèque AHMV"
                  : "AHMV media library"
                : lang === "fr"
                  ? "Archive AHMV"
                  : "AHMV archive"}
            </p>
            <h2 className="heading-card mt-3 text-white">
              {photos.length
                ? lang === "fr"
                  ? "Collection restaurée sur le site"
                  : "Collection restored on the site"
                : al.coverUrl
                  ? lang === "fr"
                    ? "Aperçu d’archive restauré"
                    : "Archive preview restored"
                  : lang === "fr"
                    ? "Archive publique AHMV"
                    : "Public AHMV archive"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/56">
              {photos.length
                ? lang === "fr"
                  ? "Les médias disponibles dans cette fiche sont maintenant hébergés et consultables directement dans l’expérience AHM Verdun. Utilisez les filtres plus bas pour naviguer par catégorie."
                  : "The media in this page are now hosted and viewable directly in the AHM Verdun experience. Use the filters below to browse by category."
                : lang === "fr"
                  ? "Cette fiche conserve l’archive dans la nouvelle expérience AHMV. Utilisez le lien ci-dessous pour consulter l’album public d’origine et l’ensemble des photos disponibles."
                  : "This page preserves the archive in the new AHMV experience. Use the link below to view the original public album and all available photos."}
            </p>

            {al.sourceUrl && (
              <Button asChild variant="outline-light" className="mt-5 w-full">
                <a href={al.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {lang === "fr" ? "Voir l’album AHMV d’origine" : "View original AHMV album"}
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-white/42">
              {al.season} · {l(al.eventType)}
              {al.photoCount ? ` · ${al.photoCount}` : ""}
            </p>
          </aside>
        </div>

        {photos.length > 0 && (
          <section className="mt-10 overflow-hidden border border-white/12 bg-navy-deep p-4 text-white md:mt-12 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow text-sport-foreground">
                  {lang === "fr" ? "Collection complète" : "Complete collection"}
                </p>
                <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
                  {category === "all"
                    ? lang === "fr"
                      ? `${photos.length} médias`
                      : `${photos.length} media items`
                    : lang === "fr"
                      ? `${visiblePhotos.length} médias`
                      : `${visiblePhotos.length} media items`}
                </h2>
              </div>

              {categories.length > 1 && (
                <div
                  className="scrollbar-none flex max-w-full gap-1 overflow-x-auto pb-1 md:max-w-[65%]"
                  aria-label={lang === "fr" ? "Filtrer les médias" : "Filter media"}
                >
                  <button
                    type="button"
                    aria-pressed={category === "all"}
                    onClick={() => setCategory("all")}
                    className={cn(
                      "premium-control shrink-0 border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em]",
                      category === "all"
                        ? "border-sport bg-sport text-sport-foreground"
                        : "border-white/14 bg-navy-deep text-white/62 hover:border-sport hover:text-white",
                    )}
                  >
                    {lang === "fr" ? "Tout" : "All"}
                  </button>
                  {categories.map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={category === id}
                      onClick={() => setCategory(id)}
                      className={cn(
                        "premium-control shrink-0 border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em]",
                        category === id
                          ? "border-sport bg-sport text-sport-foreground"
                          : "border-white/14 bg-navy-deep text-white/62 hover:border-sport hover:text-white",
                      )}
                    >
                      {l(label)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 sm:hidden">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/42">
                  {lang === "fr" ? "Glissez pour parcourir" : "Swipe to browse"}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-sport-foreground">
                  <ZoomIn className="size-3.5" />
                  {lang === "fr" ? "Touchez pour zoomer" : "Tap to zoom"}
                </span>
              </div>
              <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3">
                {visiblePhotos.map((media, index) => {
                  const fullIndex = photos.findIndex((photo) => photo.url === media.url);
                  const photoFields = [
                    { key: "url", label: { fr: "Image", en: "Image" }, kind: "image-url" as const, current: media.url },
                    { key: `alt.${lang}`, label: { fr: "Texte alternatif", en: "Alternative text" }, kind: "text" as const, current: media.alt[lang] },
                    { key: `label.${lang}`, label: { fr: "Légende", en: "Caption" }, kind: "text" as const, current: media.label?.[lang] },
                    { key: "sourceUrl", label: { fr: "Lien source", en: "Source link" }, kind: "url" as const, current: media.sourceUrl },
                  ];
                  return (
                    <div key={`${media.url}-mobile`} className="relative w-[82vw] max-w-[22rem] shrink-0 snap-center">
                      <button
                        type="button"
                        onClick={() => {
                          setViewerIndex(Math.max(fullIndex, 0));
                          setViewerOpen(true);
                        }}
                        className="interactive-surface group w-full overflow-hidden border border-white/10 bg-competition text-left"
                      >
                        <figure>
                          <div className="relative aspect-[4/3] overflow-hidden bg-navy-deep">
                            <img
                              src={media.url}
                              alt={lang === "fr" ? media.alt.fr : media.alt.en}
                              loading={index < 3 ? "eager" : "lazy"}
                              decoding="async"
                              className="size-full object-cover transition-transform duration-500 group-active:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(7,16,43,0.76)_100%)]" />
                            {media.categoryLabel && (
                              <span className="absolute left-3 top-3 bg-navy/82 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                                {l(media.categoryLabel)}
                              </span>
                            )}
                            <span className="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center border border-white/20 bg-navy-deep/72 text-white backdrop-blur">
                              <ZoomIn className="size-4" />
                            </span>
                          </div>
                          <figcaption className="min-h-16 p-3">
                            <p className="text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-white/78">
                              {media.label ? l(media.label) : lang === "fr" ? "Média AHMV" : "AHMV media"}
                            </p>
                          </figcaption>
                        </figure>
                      </button>
                      <ContentContributionButton
                        resourceType="photo"
                        resourceKey={`photo:${slug}:${Math.max(fullIndex, 0)}`}
                        title={media.label ? l(media.label) : l(al.title)}
                        snapshot={media as unknown as Record<string, unknown>}
                        fields={photoFields}
                        appearance="menu"
                        className="absolute right-3 top-3 z-20"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 hidden grid-cols-2 gap-2 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visiblePhotos.map((media, index) => {
                const fullIndex = photos.findIndex((photo) => photo.url === media.url);
                const photoFields = [
                  { key: "url", label: { fr: "Image", en: "Image" }, kind: "image-url" as const, current: media.url },
                  { key: `alt.${lang}`, label: { fr: "Texte alternatif", en: "Alternative text" }, kind: "text" as const, current: media.alt[lang] },
                  { key: `label.${lang}`, label: { fr: "Légende", en: "Caption" }, kind: "text" as const, current: media.label?.[lang] },
                  { key: "sourceUrl", label: { fr: "Lien source", en: "Source link" }, kind: "url" as const, current: media.sourceUrl },
                ];
                return (
                  <div key={`${media.url}-desktop`} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setViewerIndex(Math.max(fullIndex, 0));
                        setViewerOpen(true);
                      }}
                      className="interactive-surface group size-full overflow-hidden border border-white/10 bg-competition text-left"
                    >
                      <figure>
                        <div className="relative aspect-[4/3] overflow-hidden bg-navy-deep">
                          <img
                            src={media.url}
                            alt={lang === "fr" ? media.alt.fr : media.alt.en}
                            loading={index < 4 ? "eager" : "lazy"}
                            decoding="async"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                          {media.categoryLabel && (
                            <span className="absolute left-2 top-2 bg-navy/82 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                              {l(media.categoryLabel)}
                            </span>
                          )}
                          <span className="absolute bottom-2 right-2 inline-flex size-8 items-center justify-center border border-white/20 bg-navy-deep/70 text-white backdrop-blur">
                            <ZoomIn className="size-4" />
                          </span>
                        </div>
                        <figcaption className="min-h-16 p-3">
                          <p className="text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-white/78">
                            {media.label ? l(media.label) : lang === "fr" ? "Média AHMV" : "AHMV media"}
                          </p>
                        </figcaption>
                      </figure>
                    </button>
                    <ContentContributionButton
                      resourceType="photo"
                      resourceKey={`photo:${slug}:${Math.max(fullIndex, 0)}`}
                      title={media.label ? l(media.label) : l(al.title)}
                      snapshot={media as unknown as Record<string, unknown>}
                      fields={photoFields}
                      appearance="menu"
                      className="absolute right-2 top-2 z-20"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ShareButton title={l(al.title)} text={l(al.description)} />
          <Link
            to="/galerie"
            className="premium-control inline-flex min-h-10 items-center gap-2 border border-white/14 bg-navy-deep px-3 text-[9px] font-bold uppercase tracking-[0.11em] text-white/72 hover:border-sport hover:text-white"
          >
            <ArrowLeft className="size-3.5 text-sport" />
            {lang === "fr" ? "Tous les albums" : "All albums"}
          </Link>
        </div>

        <HouseSponsorSlot placement={`album-${al.slug}`} count={1} compact className="mt-6" />
      </div>

      <MediaLuxuryViewer
        items={photos}
        open={viewerOpen}
        initialIndex={viewerIndex}
        lang={lang}
        onOpenChange={setViewerOpen}
      />
    </>
  );
}
