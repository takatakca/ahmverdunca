import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Images } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { PlaceholderImage } from "@/components/placeholder-image";
import { ALBUMS } from "@/data/gallery";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { img } from "@/lib/images";
import { cn } from "@/lib/utils";

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
  const { l, lang } = useI18n();
  const [season, setSeason] = useState("all");
  const seasons = useMemo(
    () => Array.from(new Set(ALBUMS.map((album) => album.season))).sort().reverse(),
    [],
  );
  const albums = season === "all" ? ALBUMS : ALBUMS.filter((album) => album.season === season);

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Archives AHMV" : "AHMV archives"}
        title={lang === "fr" ? "Photos et vidéos" : "Photos & videos"}
        description={
          lang === "fr"
            ? "Retrouvez les albums publics de l'association par saison. Les médias officiels seront ajoutés seulement après validation des fichiers et des consentements."
            : "Browse the association's public albums by season. Official media will be added only after file and consent validation."
        }
      />
      <div className="container-site py-8 md:py-12">
        <DemoNotice kind="info" className="mb-6">
          {lang === "fr"
            ? "L'inventaire des albums provient du site public existant. Aucune nouvelle photo de mineur n'est publiée sans validation."
            : "The album inventory comes from the existing public site. No new photo of a minor is published without validation."}
        </DemoNotice>

        <div className="mb-7 flex flex-col gap-4 rounded-xl border border-border bg-ice p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-sport">{lang === "fr" ? "Filtrer" : "Filter"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {albums.length} {lang === "fr" ? "albums affichés" : "albums shown"}
            </p>
          </div>
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSeason("all")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                season === "all" ? "border-sport bg-sport text-sport-foreground" : "border-input bg-background hover:bg-secondary",
              )}
            >
              {lang === "fr" ? "Toutes les saisons" : "All seasons"}
            </button>
            {seasons.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSeason(value)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                  season === value ? "border-sport bg-sport text-sport-foreground" : "border-input bg-background hover:bg-secondary",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link
              key={album.slug}
              to="/galerie/$slug"
              params={{ slug: album.slug }}
              className="card-elevated group overflow-hidden"
            >
              <div className="relative">
                <PlaceholderImage src={img(album.cover)} alt={l(album.title)} aspect="aspect-[4/3]" />
                <span className="absolute left-3 top-3 rounded-full bg-navy-deep/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-foreground">
                  {album.season}
                </span>
              </div>
              <div className="p-5">
                <p className="eyebrow flex items-center gap-1.5 text-sport">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {l(album.eventType)} · {formatShortDate(album.date, lang)}
                </p>
                <h2 className="heading-card mt-2 group-hover:text-sport">{l(album.title)}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{l(album.description)}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy">
                  <Images className="size-3.5" aria-hidden />
                  {album.photosPending
                    ? (lang === "fr" ? "Médias à valider" : "Media pending approval")
                    : (lang === "fr" ? "Voir l'album" : "View album")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
