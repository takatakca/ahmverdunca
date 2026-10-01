import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Facebook,
  Instagram,
  MapPin,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Button } from "@/components/ui/button";
import { getTeam } from "@/data/teams";
import { NEWS } from "@/data/news";
import { ALBUMS } from "@/data/gallery";
import { formatShortDate, useI18n } from "@/lib/i18n";
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
  const news = NEWS.filter((article) => article.teamSlugs.includes(slug));
  const albums = ALBUMS.filter((album) => album.teamSlugs.includes(slug));

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
                {lang === "fr" ? "Voir les horaires" : "View schedules"}
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
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-ice p-5">
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Structure d'équipe" : "Team structure"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Les sous-équipes et divisions officielles seront affichées lorsque leur structure sera confirmée. Aucune équipe n'est inventée ici."
                : "Official sub-teams and divisions will appear once their structure is confirmed. No team is invented here."}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-ice p-5">
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Confidentialité" : "Privacy"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("teams.privacyNote")}
            </p>
          </div>
        </div>

        <section
          aria-labelledby="team-command-title"
          className="overflow-hidden rounded-xl border border-border bg-background shadow-card"
        >
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="competition-panel p-6 text-navy-foreground md:p-8">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Centre équipe" : "Team centre"}
              </p>
              <h2
                id="team-command-title"
                className="mt-2 font-display text-4xl font-extrabold uppercase leading-none md:text-5xl"
              >
                {team.code}
              </h2>
              <p className="mt-4 max-w-2xl text-sm text-navy-foreground/75 md:text-base">
                {lang === "fr"
                  ? "Un point d'entrée simple pour les parents : horaires, arénas, inscriptions, nouvelles et médias publics."
                  : "A simple starting point for families: schedules, arenas, registration, news and public media."}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="sport">
                  <Link to="/horaires" search={{ team: slug }}>
                    <CalendarDays className="size-4" />
                    {lang === "fr" ? "Horaires officiels" : "Official schedules"}
                  </Link>
                </Button>
                <Button asChild variant="outline-light">
                  <Link to="/arenas">
                    <MapPin className="size-4" />
                    {lang === "fr" ? "Arénas & itinéraires" : "Arenas & directions"}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="eyebrow text-sport">
                {lang === "fr" ? "Accès rapide" : "Quick access"}
              </p>
              <div className="mt-5 grid gap-2">
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
                <Link
                  to="/inscriptions"
                  className="group flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                >
                  {lang === "fr" ? "Inscriptions" : "Registration"}
                  <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="horaires-equipe">
          <SectionHeading
            eyebrow={lang === "fr" ? "Source officielle" : "Official source"}
            title={lang === "fr" ? "Horaires" : "Schedules"}
            description={
              lang === "fr"
                ? "Les horaires et résultats restent sous l'autorité des systèmes hockey officiels. Cette page vous dirige vers le bon accès sans créer de données parallèles."
                : "Schedules and results remain under the authority of official hockey systems. This page directs you to the right place without creating parallel data."
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/horaires" search={{ team: slug }} className="card-elevated group p-6">
              <CalendarDays className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-5 group-hover:text-sport">
                {lang === "fr" ? "Consulter les horaires" : "View schedules"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Horaire hebdomadaire AHMV et passerelles vers les calendriers officiels."
                  : "AHMV weekly schedule and gateways to official calendars."}
              </p>
            </Link>
            <Link to="/arenas" className="card-elevated group p-6">
              <MapPin className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-5 group-hover:text-sport">
                {lang === "fr" ? "Trouver un aréna" : "Find an arena"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Adresses et itinéraires regroupés dans un seul endroit."
                  : "Addresses and directions grouped in one place."}
              </p>
            </Link>
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
            <p className="rounded-xl border border-border bg-ice p-5 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Aucune nouvelle vérifiée n'est encore associée à cette catégorie."
                : "No verified news is associated with this category yet."}
            </p>
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
            <p className="rounded-xl border border-border bg-ice p-5 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Aucun album public validé n'est encore associé à cette catégorie."
                : "No approved public album is associated with this category yet."}
            </p>
          )}
        </section>

        <section id="social-equipe">
          <SectionHeading
            eyebrow={lang === "fr" ? "GROUPE TAKATAK — prochaine étape" : "GROUPE TAKATAK — next step"}
            title={lang === "fr" ? "Dans le vestiaire" : "Inside the team"}
            description={
              lang === "fr"
                ? "Les comptes sociaux autorisés de cette équipe pourront être reliés ici plus tard. Aucun faux fil social n'est affiché."
                : "Authorized social accounts for this team can connect here later. No fake social feed is shown."
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
                    ? "Publications, photos, nouvelles générales et événements pourront être préparés dans GROUPE TAKATAK selon les permissions accordées."
                    : "Posts, photos, general news and events can be prepared in GROUPE TAKATAK according to granted permissions."}
                </p>
              </div>
            ))}
          </div>

          <DemoNotice kind="connect" className="mt-4">
            {lang === "fr"
              ? "Cette intégration sociale n'est pas active dans la démonstration actuelle."
              : "This social integration is not active in the current demonstration."}
          </DemoNotice>
        </section>

        <section>
          <SectionHeading
            eyebrow={lang === "fr" ? "Ressources publiques" : "Public resources"}
            title={lang === "fr" ? "Besoin d'autre chose?" : "Need something else?"}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/ressources" className="card-elevated group p-6">
              <ShieldCheck className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-5 group-hover:text-sport">
                {lang === "fr" ? "Ressources hockey" : "Hockey resources"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Hockey Québec, Hockey Canada, aide financière et liens officiels."
                  : "Hockey Québec, Hockey Canada, financial assistance and official links."}
              </p>
            </Link>
            <Link to="/faq" className="card-elevated group p-6">
              <ArrowRight className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-5 group-hover:text-sport">
                F.A.Q.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Réponses rapides aux questions les plus fréquentes des familles."
                  : "Quick answers to families' most common questions."}
              </p>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
