import { canonicalLink } from "@/lib/seo";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Images } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SportArtwork } from "@/components/sport-artwork";
import { ALBUMS } from "@/data/gallery";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

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
            ? "Les archives publiques AHMV sont regroupées par saison. Les aperçus vérifiés disponibles sur l’ancien site sont maintenant restaurés ici; les albums complets restent accessibles à leur source officielle."
            : "Public AHMV archives are grouped by season. Verified previews available on the previous site are now restored here, while full albums remain accessible from their official source."
        }
      />

      <div className="container-site py-9 md:py-14">
        <HouseSponsorSlot placement="gallery" compact className="mb-8" />
        <section className="mb-8 overflow-hidden border border-navy/12 bg-navy md:mb-10">
          <div className="grid h-[320px] grid-cols-2 grid-rows-2 gap-px bg-white/10 sm:h-[420px] lg:grid-cols-4 lg:grid-rows-1">
            {[
              OFFICIAL_MEDIA.practiceGroup,
              OFFICIAL_MEDIA.practiceSkaters,
              OFFICIAL_MEDIA.practiceGoalie,
              OFFICIAL_MEDIA.practicePlayers,
            ].map((media, index) => (
              <a
                key={media.url}
                href={media.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-surface group relative overflow-hidden bg-navy"
              >
                <img
                  src={media.url}
                  alt={lang === "fr" ? media.alt.fr : media.alt.en}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(7,16,43,0.72)_100%)]" />
                {index === 0 && (
                  <span className="absolute bottom-4 left-4 bg-navy/78 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                    {lang === "fr" ? "Photos réelles AHMV" : "Real AHMV photography"}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
        <section className="grid gap-0 overflow-hidden border border-navy/12 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="bg-navy p-6 text-navy-foreground md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Archives AHMV vérifiées" : "Verified AHMV archives"}</p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/70">
              {lang === "fr"
                ? "Nous réutilisons uniquement des aperçus déjà publiés publiquement par l’AHM Verdun. Lorsqu’un aperçu local n’est pas encore restauré, la fiche renvoie vers l’album AHMV d’origine."
                : "We reuse only previews already published publicly by AHM Verdun. When a local preview has not yet been restored, the album page links back to the original AHMV archive."}
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
                    "premium-control shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em]",
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

        <div className="mt-7 grid auto-rows-[220px] gap-2 sm:auto-rows-[240px] sm:grid-cols-2 lg:grid-cols-4">
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
                  className="absolute inset-0 z-[1] size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(7,16,43,0.62)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-navy-foreground/12 bg-competition/85 px-5 py-3 text-navy-foreground backdrop-blur-sm">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                  <Images className="size-3.5 text-sport-foreground" />
                  {album.coverUrl ? (lang === "fr" ? "Aperçu AHMV" : "AHMV preview") : (lang === "fr" ? "Archive AHMV" : "AHMV archive")}
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
