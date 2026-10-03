import { canonicalLink } from "@/lib/seo";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, MapPin, Navigation } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ARENAS, ARENA_ZONES } from "@/data/arenas";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { mapsDirectionsUrl } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arenas/")({
  head: () => ({
    links: canonicalLink("/arenas"),
    meta: [
      { title: "Arénas et itinéraires — AHM Verdun" },
      {
        name: "description",
        content:
          "Arénas utilisés par les familles de l'AHM Verdun, avec adresses vérifiées, itinéraires et liens officiels.",
      },
      { property: "og:title", content: "Arénas et itinéraires — AHM Verdun" },
      {
        property: "og:description",
        content: "Trouvez rapidement l'aréna, son adresse et l'itinéraire.",
      },
    ],
  }),
  component: ArenasPage,
});

function ArenasPage() {
  const { t, l, lang } = useI18n();
  const [zone, setZone] = useState("all");
  const list = zone === "all" ? ARENAS : ARENAS.filter((arena) => arena.zone === zone);

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Adresses vérifiées" : "Verified addresses"}
        title={t("nav.arenas")}
        description={
          lang === "fr"
            ? "Toutes les adresses ont été recoupées avec les pages municipales ou institutionnelles officielles."
            : "All addresses were cross-checked against official municipal or institutional pages."
        }
      />

      <div className="container-site py-8 md:py-12">
        <section className="mb-8 grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[360px]">
            <img
              src={OFFICIAL_MEDIA.tournamentM11Tertiary.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.tournamentM11Tertiary.alt.fr : OFFICIAL_MEDIA.tournamentM11Tertiary.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.82))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Avant de partir pour la glace" : "Before heading to the rink"}</p>
              <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-5xl">
                {lang === "fr" ? "Adresse. Itinéraire. Horaire." : "Address. Directions. Schedule."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/72">
                {lang === "fr"
                  ? "Le répertoire regroupe les installations utilisées par les familles AHMV. La photo illustre la vie de l’association; les adresses ci-dessous sont les données vérifiées."
                  : "The directory groups facilities used by AHMV families. The photo illustrates association life; the addresses below are the verified facility data."}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Répertoire glace" : "Rink directory"}</p>
              <p className="mt-4 font-display text-6xl font-extrabold tracking-[-0.05em]">{String(ARENAS.length).padStart(2, "0")}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.17em] text-white/48">
                {lang === "fr" ? "installations répertoriées" : "listed facilities"}
              </p>
            </div>
            <div className="mt-7 grid gap-px bg-white/12">
              <Link to="/horaires" className="interactive-surface flex items-center justify-between bg-navy p-5 hover:bg-white/[0.06]">
                <span className="font-display text-xl font-bold uppercase">{lang === "fr" ? "Voir les horaires" : "View schedules"}</span>
                <CalendarDays className="size-5 text-sport-foreground" />
              </Link>
              <a
                href={OFFICIAL_MEDIA.tournamentM11Tertiary.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-surface flex items-center justify-between bg-navy p-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/55 hover:bg-white/[0.06] hover:text-white"
              >
                {lang === "fr" ? "Photo : archive AHMV" : "Photo: AHMV archive"} <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        </section>
        <div className="mb-7 grid gap-px border border-navy/12 bg-navy/12 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Trouver la bonne glace" : "Find the right rink"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {ARENAS.length} {lang === "fr" ? "installations répertoriées" : "facilities listed"}
            </p>
          </div>
          <Link
            to="/horaires"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline"
          >
            {lang === "fr" ? "Voir les horaires" : "View schedules"}
          </Link>
        </div>

        <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Tous", en: "All" } }, ...ARENA_ZONES].map((zoneItem) => (
            <button
              key={zoneItem.id}
              type="button"
              aria-pressed={zone === zoneItem.id}
              onClick={() => setZone(zoneItem.id)}
              className={cn(
                "premium-control shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em]",
                zone === zoneItem.id
                  ? "border-sport bg-sport text-sport-foreground"
                  : "border-input bg-background hover:bg-secondary",
              )}
            >
              {l(zoneItem.label)}
            </button>
          ))}
        </div>

        <div className="grid gap-px overflow-hidden border border-navy/12 bg-navy/12 md:grid-cols-2 lg:grid-cols-3">
          {list.map((arena) => (
            <article key={arena.slug} className="interactive-surface flex flex-col bg-background p-5 hover:bg-ice/55">
              <div className="flex items-start justify-between gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-sport" aria-hidden />
                {arena.website && <ExternalLink className="size-4 text-muted-foreground" aria-hidden />}
              </div>

              <h2 className="heading-card mt-5">
                <Link
                  to="/arenas/$slug"
                  params={{ slug: arena.slug }}
                  className="hover:text-sport"
                >
                  {arena.name}
                </Link>
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">{l(arena.borough)}</p>
              <p className="mt-3 text-sm leading-relaxed">{arena.address}</p>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Link
                  to="/arenas/$slug"
                  params={{ slug: arena.slug }}
                  className="premium-control tap-target inline-flex items-center justify-center border border-input px-3 text-xs font-semibold uppercase tracking-wide hover:bg-secondary"
                >
                  {lang === "fr" ? "Détails" : "Details"}
                </Link>
                <a
                  href={mapsDirectionsUrl(arena.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-control tap-target inline-flex items-center justify-center gap-1.5 bg-navy px-3 text-xs font-semibold uppercase tracking-wide text-navy-foreground hover:bg-navy-deep"
                >
                  <Navigation className="size-3.5" aria-hidden />
                  {t("common.directions")}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
