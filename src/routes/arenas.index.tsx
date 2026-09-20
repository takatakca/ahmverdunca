import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Navigation } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { ARENAS, ARENA_ZONES } from "@/data/arenas";
import { mapsDirectionsUrl } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arenas/")({
  head: () => ({
    meta: [
      { title: "Arénas et itinéraires — AHM Verdun" },
      { name: "description", content: "Liste des arénas utilisés par l'AHM Verdun, avec adresse et itinéraire Google Maps pour chaque établissement." },
      { property: "og:title", content: "Arénas et itinéraires — AHM Verdun" },
      { property: "og:description", content: "Trouvez rapidement l'aréna et son itinéraire." },
    ],
  }),
  component: ArenasPage,
});

function ArenasPage() {
  const { t, l } = useI18n();
  const [zone, setZone] = useState("all");
  const list = zone === "all" ? ARENAS : ARENAS.filter((a) => a.zone === zone);

  return (
    <>
      <PageHeader
        eyebrow={t("common.toValidate")}
        title={t("nav.arenas")}
        description="Adresses saisies à partir d'informations publiques. Chaque adresse doit être validée par l'association avant publication."
      />
      <div className="container-site py-8 md:py-12">
        <DemoNotice kind="info" className="mb-6">
          Les adresses affichées ne sont pas encore confirmées par l'AHMV. Les boutons d'itinéraire ouvrent Google Maps avec l'adresse indiquée.
        </DemoNotice>

        <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Tous", en: "All" } }, ...ARENA_ZONES].map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setZone(z.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                zone === z.id ? "border-sport bg-sport text-sport-foreground" : "border-input hover:bg-secondary",
              )}
            >
              {l(z.label)}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <div key={a.slug} className="card-elevated flex flex-col p-5">
              <h2 className="heading-card">
                <Link to="/arenas/$slug" params={{ slug: a.slug }} className="hover:text-sport">{a.name}</Link>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{l(a.borough)}</p>
              <p className="mt-3 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sport" aria-hidden />
                <span>{a.address}</span>
              </p>
              <a
                href={mapsDirectionsUrl(a.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target mt-4 inline-flex items-center justify-center gap-1.5 rounded-md border border-input px-3 text-xs font-semibold uppercase tracking-wide hover:bg-secondary"
              >
                <Navigation className="size-3.5" aria-hidden /> {t("common.directions")}
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
