import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { PlaceholderImage } from "@/components/placeholder-image";
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
        {al.photosPending && (
          <DemoNotice kind="info" className="mt-6">
            Album en attente des photos officielles et de la validation des consentements. Les vignettes ci-dessous sont des emplacements.
          </DemoNotice>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlaceholderImage src={img(al.cover)} alt={l(al.title)} className="rounded-lg sm:col-span-2 sm:row-span-2" aspect="aspect-[4/3]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <PlaceholderImage key={i} className="rounded-lg" aspect="aspect-[4/3]" />
          ))}
        </div>
      </div>
    </>
  );
}
