import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { PlaceholderImage } from "@/components/placeholder-image";
import { EventCard } from "@/components/event-list";
import { Button } from "@/components/ui/button";
import { getTeam } from "@/data/teams";
import { SCHEDULE } from "@/data/schedule";
import { NEWS } from "@/data/news";
import { ALBUMS } from "@/data/gallery";
import { ARENAS } from "@/data/arenas";
import { EXTERNAL_LINKS } from "@/lib/site";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { img } from "@/lib/images";

export const Route = createFileRoute("/equipes/$slug")({
  loader: ({ params }) => {
    const team = getTeam(params.slug);
    if (!team) throw notFound();
    return { slug: team.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Équipe introuvable — AHM Verdun" }, { name: "robots", content: "noindex" }] };
    const team = getTeam(loaderData.slug)!;
    const title = `${team.name.fr} — AHM Verdun`;
    const description = team.description.fr;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: TeamPage,
});

function TeamPage() {
  const { slug } = Route.useLoaderData();
  const { t, l, lang } = useI18n();
  const team = getTeam(slug)!;
  const events = SCHEDULE.filter((e) => e.teamSlug === slug);
  const news = NEWS.filter((n) => n.teamSlugs.includes(slug));
  const albums = ALBUMS.filter((a) => a.teamSlugs.includes(slug));
  const arenas = ARENAS.filter((a) => team.arenaSlugs.includes(a.slug));

  return (
    <>
      <PageHeader
        eyebrow={`${team.code} · ${l(team.ages)}`}
        title={l(team.name)}
        description={l(team.description)}
        actions={
          <>
            <Button asChild variant="sport"><Link to="/horaires">{t("teams.schedule")}</Link></Button>
            <Button asChild variant="outline-light">
              <a href={EXTERNAL_LINKS.spordleRegister} target="_blank" rel="noopener noreferrer">{t("reg.cta")} <ExternalLink className="size-4" /></a>
            </Button>
          </>
        }
      />
      <div className="container-site space-y-12 py-8 md:py-12">
        <DemoNotice>{t("teams.divisionsNote")}</DemoNotice>

        <section>
          <SectionHeading eyebrow={t("common.demoData")} title={t("teams.upcoming")} />
          {events.length ? (
            <div className="space-y-3">{events.slice(0, 6).map((e) => <EventCard key={e.id} event={e} />)}</div>
          ) : (
            <p className="text-muted-foreground">{t("schedule.noEvents")}</p>
          )}
        </section>

        <section>
          <SectionHeading title={t("teams.arenas")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {arenas.map((a) => (
              <Link key={a.slug} to="/arenas/$slug" params={{ slug: a.slug }} className="card-elevated p-5 hover:text-sport">
                <h3 className="heading-card">{a.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{l(a.borough)}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title={t("teams.news")} />
          {news.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {news.map((a) => (
                <Link key={a.slug} to="/nouvelles/$slug" params={{ slug: a.slug }} className="card-elevated group overflow-hidden">
                  <PlaceholderImage src={img(a.image)} alt={l(a.title)} />
                  <div className="p-5">
                    <p className="eyebrow text-sport">{formatShortDate(a.date, lang)}</p>
                    <h3 className="heading-card mt-2 group-hover:text-sport">{l(a.title)}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("common.noResults")}</p>
          )}
        </section>

        <section>
          <SectionHeading title={t("teams.albums")} />
          {albums.length ? (
            <div className="grid gap-5 sm:grid-cols-3">
              {albums.map((al) => (
                <Link key={al.slug} to="/galerie/$slug" params={{ slug: al.slug }} className="card-elevated group overflow-hidden">
                  <PlaceholderImage src={img(al.cover)} alt={l(al.title)} aspect="aspect-[4/3]" />
                  <div className="p-4"><h3 className="heading-card group-hover:text-sport">{l(al.title)}</h3></div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("common.noResults")}</p>
          )}
        </section>

        <section>
          <SectionHeading title={t("teams.documents")} />
          <DemoNotice kind="info">{t("common.notAvailable")} — {t("common.toValidate")}</DemoNotice>
        </section>
      </div>
    </>
  );
}
