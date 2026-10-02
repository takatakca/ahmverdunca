import { canonicalLink } from "@/lib/seo";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Images } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SportArtwork } from "@/components/sport-artwork";
import { ALBUMS } from "@/data/gallery";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
  const seasons = useMemo(
    () => Array.from(new Set(ALBUMS.map((album) => album.season))).sort().reverse(),
    [],
  );
  const albums = season === "all" ? ALBUMS : ALBUMS.filter((album) => album.season === season);

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Archives · Mémoire AHMV" : "Archives · AHMV memory"}
        title={lang === "fr" ? "Photos et vidéos" : "Photos & videos"}
        description={
          lang === "fr"
            ? "Les albums publics de l’association sont conservés par saison. En attendant la validation des médias et des consentements, l’expérience utilise une direction graphique AHMV plutôt que des images artificielles."
            : "The association's public albums are preserved by season. Until media and consent validation is complete, the experience uses AHMV graphic art rather than artificial imagery."
        }
      />

      <div className="container-site py-9 md:py-14">
        <section className="grid gap-0 overflow-hidden border border-navy/12 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="bg-navy p-6 text-navy-foreground md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Protection des jeunes" : "Youth privacy"}</p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/70">
              {lang === "fr"
                ? "Aucune photo de mineur n’est importée automatiquement. Les albums restent référencés et les médias seront publiés uniquement après validation des fichiers et des autorisations applicables."
                : "No youth photo is imported automatically. Albums remain referenced and media will be published only after file and applicable-consent validation."}
            </p>
          </div>
          <div className="rink-surface p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-sport">{lang === "fr" ? "Filtre d’archive" : "Archive filter"}</p>
                <p className="mt-2 font-display text-4xl font-extrabold uppercase leading-none text-navy">
                  {albums.length} {lang === "fr" ? "albums" : "albums"}
                </p>
              </div>
              <div className="scrollbar-none flex gap-1 overflow-x-auto pb-1">
                <button
                  type="button"
                  aria-pressed={season === "all"}
                  onClick={() => setSeason("all")}
                  className={cn(
                    "shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em]",
                    season === "all" ? "border-navy bg-navy text-navy-foreground" : "border-navy/15 bg-background/80 text-navy hover:border-sport",
                  )}
                >
                  {lang === "fr" ? "Toutes" : "All"}
                </button>
                {seasons.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={season === value}
                    onClick={() => setSeason(value)}
                    className={cn(
                      "shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em]",
                      season === value ? "border-navy bg-navy text-navy-foreground" : "border-navy/15 bg-background/80 text-navy hover:border-sport",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid auto-rows-[260px] gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {albums.map((album, index) => (
            <Link
              key={album.slug}
              to="/galerie/$slug"
              params={{ slug: album.slug }}
              className={cn(
                "group relative overflow-hidden",
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
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-navy-foreground/12 bg-competition/85 px-5 py-3 text-navy-foreground backdrop-blur-sm">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                  <Images className="size-3.5 text-sport-foreground" />
                  {album.photosPending ? (lang === "fr" ? "Archive protégée" : "Protected archive") : (lang === "fr" ? "Voir l’album" : "View album")}
                </span>
                <ArrowRight className="size-4 text-sport-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3 border-t border-navy/12 pt-5 text-xs text-muted-foreground">
          <CalendarDays className="size-4 text-sport" />
          <span>{lang === "fr" ? "Archives organisées par saison et type d’événement." : "Archives organized by season and event type."}</span>
        </div>
      </div>
    </>
  );
}
