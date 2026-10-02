import { canonicalLink } from "@/lib/seo";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ARENAS, ARENA_ZONES } from "@/data/arenas";
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
                "shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
                zone === zoneItem.id
                  ? "border-sport bg-sport text-sport-foreground"
                  : "border-input bg-background hover:bg-secondary",
              )}
            >
              {l(zoneItem.label)}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((arena) => (
            <article key={arena.slug} className="card-elevated flex flex-col p-5">
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
                  className="tap-target inline-flex items-center justify-center border border-input px-3 text-xs font-semibold uppercase tracking-wide hover:bg-secondary"
                >
                  {lang === "fr" ? "Détails" : "Details"}
                </Link>
                <a
                  href={mapsDirectionsUrl(arena.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target inline-flex items-center justify-center gap-1.5 bg-navy px-3 text-xs font-semibold uppercase tracking-wide text-navy-foreground hover:bg-navy-deep"
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
