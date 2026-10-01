import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Facebook, Instagram, MapPin, Radio } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { PlaceholderImage } from "@/components/placeholder-image";
import { EventCard } from "@/components/event-list";
import { Button } from "@/components/ui/button";
import { getTeam } from "@/data/teams";
import { DEMO_TODAY, SCHEDULE } from "@/data/schedule";
import { NEWS } from "@/data/news";
import { ALBUMS } from "@/data/gallery";
import { ARENAS } from "@/data/arenas";
import { formatDate, formatShortDate, useI18n } from "@/lib/i18n";
import { img } from "@/lib/images";

export const Route = createFileRoute("/equipes/$slug")({
  loader: ({ params }) => {
    const team = getTeam(params.slug);
    if (!team) throw notFound();
    return { slug: team.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Équipe introuvable — AHM Verdun" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

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
  const events = SCHEDULE.filter((event) => event.teamSlug === slug);
  const upcomingEvents = events.filter((event) => event.date >= DEMO_TODAY);
  const news = NEWS.filter((article) => article.teamSlugs.includes(slug));
  const albums = ALBUMS.filter((album) => album.teamSlugs.includes(slug));
  const eventArenaSlugs = new Set(events.map((event) => event.arenaSlug));
  const arenas = ARENAS.filter((arena) => eventArenaSlugs.has(arena.slug));
  const nextEvent =
    events.find((event) => event.date >= DEMO_TODAY && event.status !== "cancelled") ??
    events.find((event) => event.date >= DEMO_TODAY) ??
    events[0];
  const nextArena = nextEvent
    ? ARENAS.find((arena) => arena.slug === nextEvent.arenaSlug)
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow={`${team.code} · ${l(team.ages)}`}
        title={l(team.name)}
        description={l(team.description)}
        actions={
          <>
            <Button asChild variant="sport">
              <Link to="/horaires" search={{ team: slug }}>
                <CalendarDays className="size-4" />
                {t("teams.schedule")}
              </Link>
            </Button>
            <Button asChild variant="outline-light">
              <Link to="/inscriptions">
                {t("reg.cta")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="container-site space-y-14 py-8 md:py-12">
        <DemoNotice>{t("teams.divisionsNote")}</DemoNotice>

        <section
          aria-labelledby="team-command-title"
          className="overflow-hidden rounded-xl border border-border bg-background shadow-card"
        >
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="competition-panel p-6 text-navy-foreground md:p-8">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Prochaine activité" : "Next activity"}
              </p>
              <h2
                id="team-command-title"
                className="mt-2 font-display text-3xl font-extrabold uppercase leading-none md:text-4xl"
              >
                {nextEvent
                  ? formatDate(nextEvent.date, lang, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : lang === "fr"
                    ? "Horaire à venir"
                    : "Schedule coming soon"}
              </h2>

              {nextEvent ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
                  <div>
                    <p className="font-display text-5xl font-extrabold tabular-nums text-sport-foreground">
                      {nextEvent.start}
                    </p>
                    <p className="mt-1 text-sm text-navy-foreground/65">
                      {nextEvent.end ? `→ ${nextEvent.end}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold uppercase">
                      {t(`type.${nextEvent.type}`)}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-navy-foreground/75">
                      <MapPin className="size-4 text-sport-foreground" aria-hidden />
                      {nextArena?.name ?? nextEvent.rink ?? t("common.toValidate")}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 max-w-xl text-sm text-navy-foreground/70">
                  {lang === "fr"
                    ? "Aucune activité officielle n’est encore connectée pour cette équipe."
                    : "No official activity is connected for this team yet."}
                </p>
              )}

              <Button asChild variant="outline-light" className="mt-7">
                <Link to="/horaires" search={{ team: slug }}>
                  {lang === "fr" ? "Voir la semaine complète" : "View full week"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="p-6 md:p-8">
              <p className="eyebrow text-sport">
                {lang === "fr" ? "Centre équipe" : "Team centre"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Tout ce qu’un parent cherche pour cette catégorie, sans retourner dans le menu général."
                  : "Everything a parent needs for this category without returning to the main menu."}
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <a
                  href="#horaires-equipe"
                  className="group flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                >
                  {lang === "fr" ? "Activités" : "Activities"}
                  <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#nouvelles-equipe"
                  className="group flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                >
                  {lang === "fr" ? "Nouvelles" : "News"}
                  <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#photos-equipe"
                  className="group flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                >
                  {lang === "fr" ? "Photos" : "Photos"}
                  <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#social-equipe"
                  className="group flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                >
                  {lang === "fr" ? "Réseaux sociaux" : "Social"}
                  <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="horaires-equipe">
          <SectionHeading
            eyebrow={t("common.demoData")}
            title={t("teams.upcoming")}
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/horaires" search={{ team: slug }}>
                  {lang === "fr" ? "Horaire complet" : "Full schedule"}
                </Link>
              </Button>
            }
          />
          {upcomingEvents.length ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("schedule.noEvents")}</p>
          )}
        </section>

        <section id="arenas-equipe">
          <SectionHeading title={t("teams.arenas")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {arenas.map((arena) => (
              <Link
                key={arena.slug}
                to="/arenas/$slug"
                params={{ slug: arena.slug }}
                className="card-elevated group p-5 hover:text-sport"
              >
                <MapPin className="size-5 text-sport" aria-hidden />
                <h3 className="heading-card mt-5">{arena.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{l(arena.borough)}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sport">
                  {lang === "fr" ? "Voir l’aréna" : "View arena"}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="nouvelles-equipe">
          <SectionHeading title={t("teams.news")} />
          {news.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {news.map((article) => (
                <Link
                  key={article.slug}
                  to="/nouvelles/$slug"
                  params={{ slug: article.slug }}
                  className="card-elevated group overflow-hidden"
                >
                  <PlaceholderImage src={img(article.image)} alt={l(article.title)} />
                  <div className="p-5">
                    <p className="eyebrow text-sport">
                      {formatShortDate(article.date, lang)}
                    </p>
                    <h3 className="heading-card mt-2 group-hover:text-sport">
                      {l(article.title)}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("common.noResults")}</p>
          )}
        </section>

        <section id="photos-equipe">
          <SectionHeading title={t("teams.albums")} />
          {albums.length ? (
            <div className="grid gap-5 sm:grid-cols-3">
              {albums.map((album) => (
                <Link
                  key={album.slug}
                  to="/galerie/$slug"
                  params={{ slug: album.slug }}
                  className="card-elevated group overflow-hidden"
                >
                  <PlaceholderImage
                    src={img(album.cover)}
                    alt={l(album.title)}
                    aspect="aspect-[4/3]"
                  />
                  <div className="p-4">
                    <h3 className="heading-card group-hover:text-sport">
                      {l(album.title)}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("common.noResults")}</p>
          )}
        </section>

        <section id="social-equipe">
          <SectionHeading
            eyebrow={lang === "fr" ? "Aperçu GROUPE TAKATAK" : "GROUPE TAKATAK preview"}
            title={lang === "fr" ? "Dans le vestiaire" : "Inside the team"}
            description={
              lang === "fr"
                ? "Les comptes réels de cette équipe pourront être reliés ici après autorisation. Aucun faux contenu social n’est affiché."
                : "The team’s real accounts can be connected here after approval. No fake social content is shown."
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Facebook", Icon: Facebook },
              { label: "Instagram", Icon: Instagram },
            ].map(({ label, Icon }) => (
              <div
                key={label}
                className="card-elevated relative overflow-hidden border-t-4 border-t-sport p-6"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-6 text-navy" aria-hidden />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ice px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Radio className="size-3" aria-hidden />
                    {lang === "fr" ? "Connexion à venir" : "Connection coming"}
                  </span>
                </div>
                <h3 className="heading-card mt-8">{label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lang === "fr"
                    ? "Publications, photos, nouvelles générales et événements de l’équipe pourront apparaître ici depuis le dashboard GROUPE TAKATAK."
                    : "Posts, photos, general news and team events can appear here from the GROUPE TAKATAK dashboard."}
                </p>
              </div>
            ))}
          </div>

          <DemoNotice kind="connect" className="mt-4">
            {lang === "fr"
              ? "Les futurs accès sociaux seront limités à leur périmètre autorisé. Cette connexion n’est pas active dans la maquette."
              : "Future social access will be limited to its authorized scope. This connection is not active in the prototype."}
          </DemoNotice>
        </section>

        <section>
          <SectionHeading title={t("teams.documents")} />
          <DemoNotice kind="info">
            {t("common.notAvailable")} — {t("common.toValidate")}
          </DemoNotice>
        </section>
      </div>
    </>
  );
}
