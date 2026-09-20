import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { PlaceholderImage } from "@/components/placeholder-image";
import { ALBUMS } from "@/data/gallery";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { img } from "@/lib/images";

export const Route = createFileRoute("/galerie/")({
  head: () => ({
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
  const { t, l, lang } = useI18n();
  return (
    <>
      <PageHeader eyebrow={t("common.demoData")} title={t("nav.gallery")} description="Albums de démonstration. Les photos officielles seront ajoutées après réception des fichiers et vérification des consentements." />
      <div className="container-site py-8 md:py-12">
        <DemoNotice kind="info" className="mb-6">
          Aucune photo d'enfant n'est publiée sans autorisation. Les vignettes visibles sont des images d'illustration.
        </DemoNotice>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ALBUMS.map((al) => (
            <Link key={al.slug} to="/galerie/$slug" params={{ slug: al.slug }} className="card-elevated group overflow-hidden">
              <PlaceholderImage src={img(al.cover)} alt={l(al.title)} aspect="aspect-[4/3]" />
              <div className="p-5">
                <p className="eyebrow text-sport">{l(al.eventType)} · {formatShortDate(al.date, lang)}</p>
                <h2 className="heading-card mt-2 group-hover:text-sport">{l(al.title)}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{l(al.description)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
