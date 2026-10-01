import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, Navigation } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { EventCard } from "@/components/event-list";
import { Button } from "@/components/ui/button";
import { getArena } from "@/data/arenas";
import { DEMO_TODAY, SCHEDULE } from "@/data/schedule";
import { mapsDirectionsUrl } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/arenas/$slug")({
  loader: ({ params }) => {
    const arena = getArena(params.slug);
    if (!arena) throw notFound();
    return { slug: arena.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Aréna introuvable — AHM Verdun" }, { name: "robots", content: "noindex" }] };
    const a = getArena(loaderData.slug)!;
    const title = `${a.name} — AHM Verdun`;
    const description = `Adresse, itinéraire et activités de démonstration à l'${a.name} (${a.borough.fr}).`;
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
  const { t, l } = useI18n();
  const a = getArena(slug)!;
  const events = SCHEDULE.filter(
    (event) => event.arenaSlug === slug && event.date >= DEMO_TODAY,
  );

  return (
    <>
      <PageHeader
        eyebrow={l(a.borough)}
        title={a.name}
        description={a.facilities ? l(a.facilities) : undefined}
        actions={
          <>
            <Button asChild variant="sport">
              <a href={mapsDirectionsUrl(a.address)} target="_blank" rel="noopener noreferrer">
                <Navigation className="size-4" /> {t("common.directions")}
              </a>
            </Button>
            <Button asChild variant="outline-light">
              <Link to="/horaires" search={{ arena: slug }}>
                <CalendarDays className="size-4" />
                {t("schedule.title")}
              </Link>
            </Button>
            {a.website && (
              <Button asChild variant="outline-light">
                <a href={a.website} target="_blank" rel="noopener noreferrer">
                  {t("common.officialSite")} <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </>
        }
      />
      <div className="container-site space-y-10 py-8 md:py-12">
        <Link to="/arenas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
          <ArrowLeft className="size-4" /> {t("common.back")}
        </Link>

        <div className="card-elevated p-5">
          <p className="flex items-start gap-2 text-base">
            <MapPin className="mt-0.5 size-5 shrink-0 text-sport" aria-hidden /> {a.address}
          </p>
          {!a.addressVerified && <DemoNotice kind="info" className="mt-4">Adresse à confirmer par l'association avant publication.</DemoNotice>}
        </div>

        <section>
          <SectionHeading
            eyebrow={t("common.demoData")}
            title={t("home.upcoming")}
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/horaires" search={{ arena: slug }}>
                  <CalendarDays className="size-4" />
                  {t("common.seeAll")}
                </Link>
              </Button>
            }
          />
          {events.length ? (
            <div className="space-y-3">
              {events.slice(0, 8).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("schedule.noEvents")}</p>
          )}
        </section>
      </div>
    </>
  );
}
