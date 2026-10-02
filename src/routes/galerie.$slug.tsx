import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SportArtwork } from "@/components/sport-artwork";
import { Button } from "@/components/ui/button";
import { getAlbum } from "@/data/gallery";
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
            <SportArtwork
              index={al.season.slice(-2)}
              kicker={`${l(al.eventType)} · ${formatDate(al.date, lang)}`}
              title={l(al.title)}
              code="ARCH"
              aspect="absolute inset-0"
              className="absolute inset-0"
            />
            {al.coverUrl && (
              <img
                src={al.coverUrl}
                alt={l(al.title)}
                loading="eager"
                decoding="async"
                className="absolute inset-0 z-[1] size-full object-cover"
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              />
            )}
            <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,transparent_55%,rgba(7,16,43,0.7)_100%)]" />
            <p className="absolute bottom-4 left-4 right-4 z-[3] text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
              {al.coverUrl
                ? (lang === "fr" ? "Aperçu provenant des archives publiques AHMV" : "Preview from AHMV public archives")
                : (lang === "fr" ? "Archive AHMV" : "AHMV archive")}
            </p>
          </div>
          <aside className="broadcast-rail self-start border border-navy/12 bg-background p-6 pl-8">
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
