import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getAlbum } from "@/data/gallery";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { formatDate, useI18n } from "@/lib/i18n";

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
      ],
    };
  },
  component: AlbumPage,
});

function AlbumPage() {
  const { slug } = Route.useLoaderData();
  const { t, l, lang } = useI18n();
  const al = getAlbum(slug)!;

  return (
    <>
      <PageHeader eyebrow={`${l(al.eventType)} · ${formatDate(al.date, lang)}`} title={l(al.title)} description={l(al.description)} />
      <div className="container-site py-8 md:py-12">
        <Link to="/galerie" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
          <ArrowLeft className="size-4" /> {t("common.back")}
        </Link>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-navy-deep">
            {al.coverUrl ? (
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
                    className={`size-full object-cover ${index === 0 ? "row-span-2" : ""}`}
                  />
                ))}
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(7,16,43,0.82)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/72">
                {al.coverUrl
                  ? (lang === "fr" ? "Aperçu provenant des archives publiques AHMV" : "Preview from AHMV public archives")
                  : (lang === "fr" ? "Montage d’archives AHMV · aperçu générique" : "AHMV archive montage · generic preview")}
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9] sm:text-4xl">{l(al.title)}</p>
            </div>
          </div>
          <aside className="broadcast-rail self-start border border-navy/12 bg-background p-6 pl-8 md:p-8 md:pl-10">
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Archive AHMV" : "AHMV archive"}
            </p>
            <h2 className="heading-card mt-3">
              {al.coverUrl
                ? (lang === "fr" ? "Aperçu d’archive restauré" : "Archive preview restored")
                : (lang === "fr" ? "Archive publique AHMV" : "Public AHMV archive")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Cette fiche conserve l’archive dans la nouvelle expérience AHMV. Utilisez le lien ci-dessous pour consulter l’album public d’origine et l’ensemble des photos disponibles."
                : "This page preserves the archive in the new AHMV experience. Use the link below to view the original public album and all available photos."}
            </p>
            {al.sourceUrl && (
              <Button asChild variant="outline" className="mt-5 w-full">
                <a href={al.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {lang === "fr" ? "Voir l’album AHMV d’origine" : "View original AHMV album"}
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {al.season} · {l(al.eventType)}
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
