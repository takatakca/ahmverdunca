import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getArena } from "@/data/arenas";
import { mapsDirectionsUrl } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/arenas/$slug")({
  loader: ({ params }) => {
    const arena = getArena(params.slug);
    if (!arena) throw notFound();
    return { slug: arena.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Aréna introuvable — AHM Verdun" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const arena = getArena(loaderData.slug)!;
    const title = `${arena.name} — AHM Verdun`;
    const description = `Adresse et itinéraire pour ${arena.name} (${arena.borough.fr}).`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ArenaPage,
});

function ArenaPage() {
  const { slug } = Route.useLoaderData();
  const { t, l, lang } = useI18n();
  const arena = getArena(slug)!;

  return (
    <>
      <PageHeader
        eyebrow={l(arena.borough)}
        title={arena.name}
        description={arena.facilities ? l(arena.facilities) : arena.address}
        actions={
          <>
            <Button asChild variant="sport">
              <a
                href={mapsDirectionsUrl(arena.address)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="size-4" />
                {t("common.directions")}
              </a>
            </Button>
            {arena.website && (
              <Button asChild variant="outline-light">
                <a href={arena.website} target="_blank" rel="noopener noreferrer">
                  {t("common.officialSite")} <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </>
        }
      />

      <div className="container-site space-y-10 py-8 md:py-12">
        <Link
          to="/arenas"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline"
        >
          <ArrowLeft className="size-4" /> {t("common.back")}
        </Link>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card-elevated p-6">
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Adresse vérifiée" : "Verified address"}
            </p>
            <p className="mt-4 flex items-start gap-2 text-base">
              <MapPin className="mt-0.5 size-5 shrink-0 text-sport" aria-hidden />
              {arena.address}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-status-confirmed-soft px-3 py-1.5 text-xs font-semibold text-status-confirmed">
              <ShieldCheck className="size-4" aria-hidden />
              {lang === "fr" ? "Source officielle recoupée" : "Official source cross-checked"}
            </div>
          </div>

          <div className="competition-panel rounded-xl p-6 text-navy-foreground">
            <CalendarDays className="size-6 text-sport-foreground" aria-hidden />
            <h2 className="heading-card mt-5">
              {lang === "fr" ? "Vous jouez ici?" : "Playing here?"}
            </h2>
            <p className="mt-2 text-sm text-navy-foreground/70">
              {lang === "fr"
                ? "Consultez l'horaire AHMV et les passerelles vers les calendriers officiels."
                : "Check the AHMV schedule and gateways to official calendars."}
            </p>
            <Button asChild variant="outline-light" className="mt-5">
              <Link to="/horaires">
                {lang === "fr" ? "Voir les horaires" : "View schedules"}
              </Link>
            </Button>
          </div>
        </section>

        {arena.website && (
          <section>
            <SectionHeading
              eyebrow={lang === "fr" ? "Source municipale / institutionnelle" : "Municipal / institutional source"}
              title={lang === "fr" ? "Informations officielles" : "Official information"}
              description={
                lang === "fr"
                  ? "Pour les heures d'ouverture, commodités et avis de fermeture, consultez directement la fiche officielle de l'installation."
                  : "For opening hours, amenities and closure notices, consult the facility's official page directly."
              }
            />
            <Button asChild variant="outline">
              <a href={arena.website} target="_blank" rel="noopener noreferrer">
                {lang === "fr" ? "Ouvrir la fiche officielle" : "Open official listing"}
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </section>
        )}
      </div>
    </>
  );
}
