import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Button } from "@/components/ui/button";
import { getAlbum } from "@/data/gallery";
import { formatDate, useI18n } from "@/lib/i18n";
import { img } from "@/lib/images";

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
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";

  return (
    <>
      <PageHeader eyebrow={`${l(al.eventType)} · ${formatDate(al.date, lang)}`} title={l(al.title)} description={l(al.description)} />
      <div className="container-site py-8 md:py-12">
        <Link to="/galerie" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
          <ArrowLeft className="size-4" /> {t("common.back")}
        </Link>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
          <PlaceholderImage
            src={img(al.cover)}
            alt={l(al.title)}
            className="rounded-xl"
            aspect="aspect-[4/3]"
          />
          <aside className="card-elevated self-start p-6">
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Archive AHMV" : "AHMV archive"}
            </p>
            <h2 className="heading-card mt-3">
              {al.photosPending
                ? (lang === "fr" ? "Médias en validation" : "Media under review")
                : (lang === "fr" ? "Album public" : "Public album")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {al.photosPending
                ? (lang === "fr"
                    ? "Les photos complètes de cet album ne sont pas encore publiées dans cette nouvelle expérience. Elles seront ajoutées seulement après validation des fichiers et des autorisations applicables."
                    : "The full set of photos for this album is not yet published in this new experience. Media will be added only after file and applicable consent validation.")
                : (lang === "fr"
                    ? "Cet album est prêt à être consulté."
                    : "This album is ready to browse.")}
            </p>
            {al.sourceUrl && !publicLaunch && (
              <Button asChild variant="outline" className="mt-5 w-full">
                <a href={al.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {lang === "fr" ? "Voir l'album officiel AHMV" : "View official AHMV album"}
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
