import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Facebook,
  Instagram,
  ExternalLink,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getTeam } from "@/data/teams";
import { legacyTeamScheduleUrl, teamsForCategory } from "@/data/team-directory";
import { getTeamSocialLinks } from "@/data/team-social";
import { NEWS, newsDateLabel } from "@/data/news";
import { ALBUMS } from "@/data/gallery";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { SITE } from "@/lib/site";

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
      links: canonicalLink(`/equipes/${loaderData.slug}`),
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
  const { preferredTeam, savePreferredTeam } = usePreferredTeam();
  const team = getTeam(slug)!;
  const isPreferred = preferredTeam === slug;
  const news = NEWS.filter((article) => article.teamSlugs.includes(slug));
  const albums = ALBUMS.filter((album) => album.teamSlugs.includes(slug));
  const socialLinks = getTeamSocialLinks(slug);
  const publicTeams = teamsForCategory(slug);
  const archiveImages = [
    OFFICIAL_MEDIA.tournamentM11Primary,
    OFFICIAL_MEDIA.tournamentM11Secondary,
    OFFICIAL_MEDIA.tournamentM11Tertiary,
    OFFICIAL_MEDIA.volunteerArchive,
  ];

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
            <Button
              type="button"
              variant="outline-light"
              onClick={() => savePreferredTeam(slug)}
              aria-pressed={isPreferred}
            >
              <CheckCircle2 className="size-4" />
              {isPreferred
                ? lang === "fr"
                  ? "Ma catégorie"
                  : "My category"
                : lang === "fr"
                  ? "Mémoriser"
                  : "Remember"}
            </Button>
          </>
        }
      />

      <div className="container-site space-y-14 py-8 md:py-12">
        <section className="grid overflow-hidden border border-navy/12 bg-navy lg:grid-cols-[1.4fr_0.6fr]">
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px]">
            <img
              src={slug === "m11" ? OFFICIAL_MEDIA.tournamentM11Primary.url : OFFICIAL_MEDIA.tournamentM11Secondary.url}
              alt={lang === "fr" ? "Archive photographique publique AHM Verdun" : "AHM Verdun public photo archive"}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.82))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Vie AHMV" : "AHMV life"}</p>
              <p className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.88] sm:text-5xl">
                {team.code} · {l(team.ages)}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/72">
                {lang === "fr"
                  ? "Une entrée directe vers ce qui compte pour cette catégorie : horaires, équipes publiées, arénas, nouvelles et ressources."
                  : "A direct route to what matters for this category: schedules, published teams, arenas, news and resources."}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-white/12 p-6 text-white lg:border-l lg:border-t-0 md:p-8">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Repères rapides" : "Quick facts"}</p>
              <div className="mt-5 border-y border-white/12">
                <div className="flex items-end justify-between gap-4 border-b border-white/12 py-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.13em] text-white/52">{lang === "fr" ? "Catégorie" : "Category"}</span>
                  <span className="font-display text-3xl font-extrabold uppercase">{team.code}</span>
                </div>
                <div className="flex items-end justify-between gap-4 border-b border-white/12 py-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.13em] text-white/52">{lang === "fr" ? "Équipes publiées" : "Published teams"}</span>
                  <span className="font-display text-3xl font-extrabold uppercase">{publicTeams.length}</span>
                </div>
                <div className="flex items-end justify-between gap-4 py-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.13em] text-white/52">{lang === "fr" ? "Saison" : "Season"}</span>
                  <span className="font-display text-xl font-extrabold uppercase">2026–2027</span>
                </div>
              </div>
            </div>
            <a
              href={OFFICIAL_MEDIA.tournamentM11Primary.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/55 hover:text-white"
            >
              {lang === "fr" ? "Archives publiques AHMV" : "AHMV public archives"} <ArrowRight className="size-3.5" />
            </a>
          </div>
        </section>
        <section
          aria-labelledby="team-command-title"
          className="overflow-hidden border border-navy/12 bg-background"
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
                {news.length > 0 && (
                  <a
                    href="#nouvelles-equipe"
                    className="premium-control group flex items-center justify-between border border-navy/12 px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                  >
                    {lang === "fr" ? "Nouvelles" : "News"}
                    <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                  </a>
                )}
                {albums.length > 0 && (
                  <a
                    href="#photos-equipe"
                    className="premium-control group flex items-center justify-between border border-navy/12 px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                  >
                    {lang === "fr" ? "Photos" : "Photos"}
                    <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                  </a>
                )}
                {socialLinks.length > 0 && (
                  <a
                    href="#social-equipe"
                    className="premium-control group flex items-center justify-between border border-navy/12 px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                  >
                    {lang === "fr" ? "Réseaux sociaux" : "Social"}
                    <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                  </a>
                )}
                <Link
                  to="/inscriptions"
                  className="premium-control group flex items-center justify-between border border-navy/12 px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                >
                  {lang === "fr" ? "Inscriptions" : "Registration"}
                  <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                </Link>
                {slug === "feminin" && (
                  <a
                    href={`mailto:${SITE.girlsHockeyEmail}`}
                    className="premium-control group flex items-center justify-between border border-navy/12 px-4 py-3 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                  >
                    {lang === "fr" ? "Questions hockey féminin" : "Girls' hockey questions"}
                    <Mail className="size-4 text-sport" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {publicTeams.length > 0 && (
          <section aria-labelledby="public-team-directory-title">
            <SectionHeading
              eyebrow={lang === "fr" ? "Répertoire public 2026–2027" : "2026–2027 public directory"}
              title={lang === "fr" ? "Équipes publiées" : "Published teams"}
              description={lang === "fr"
                ? "Noms et niveaux actuellement affichés dans le répertoire public AHM Verdun. Aucun alignement de joueurs ni donnée personnelle n’est recopié."
                : "Names and levels currently shown in AHM Verdun’s public directory. No player roster or personal information is mirrored."}
            />
            <div id="public-team-directory-title" className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {publicTeams.map((entry) => (
                <div key={entry.legacyScheduleTeamId} className="interactive-surface bg-background p-5">
                  <p className="eyebrow text-sport">{entry.level}</p>
                  <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-none text-navy">{entry.name}</p>
                  <a
                    href={legacyTeamScheduleUrl(entry)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-sport hover:underline"
                  >
                    {lang === "fr" ? "Horaire et classement publiés" : "Published schedule and standings"}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

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

        {news.length > 0 && (
          <section id="nouvelles-equipe">
            <SectionHeading title={t("teams.news")} />
            <div className="grid gap-5 md:grid-cols-3">
              {news.map((article, index) => {
                const media = archiveImages[index % archiveImages.length]!;
                return (
                  <Link
                    key={article.slug}
                    to="/nouvelles/$slug"
                    params={{ slug: article.slug }}
                    className="interactive-surface group overflow-hidden border border-navy/12 bg-background"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-navy">
                      <img
                        src={media.url}
                        alt={lang === "fr" ? media.alt.fr : media.alt.en}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      />
                      <span className="absolute bottom-3 left-3 bg-navy/78 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                        {lang === "fr" ? "Archive AHMV" : "AHMV archive"}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="eyebrow text-sport">{newsDateLabel(article, lang)}</p>
                      <h3 className="heading-card mt-2 group-hover:text-sport">{l(article.title)}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {albums.length > 0 && (
          <section id="photos-equipe">
            <SectionHeading title={t("teams.albums")} />
            <div className="grid gap-5 sm:grid-cols-3">
              {albums.map((album, index) => {
                const media = archiveImages[index % archiveImages.length]!;
                const imageUrl = album.coverUrl ?? media.url;
                return (
                  <Link
                    key={album.slug}
                    to="/galerie/$slug"
                    params={{ slug: album.slug }}
                    className="interactive-surface group overflow-hidden border border-navy/12 bg-background"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-navy">
                      <img
                        src={imageUrl}
                        alt={l(album.title)}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      />
                      <span className="absolute bottom-3 left-3 bg-navy/78 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                        {album.coverUrl
                          ? (lang === "fr" ? "Aperçu de l’album" : "Album preview")
                          : (lang === "fr" ? "Archive AHMV · aperçu générique" : "AHMV archive · generic preview")}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="heading-card group-hover:text-sport">{l(album.title)}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {socialLinks.length > 0 && (
          <section id="social-equipe">
            <SectionHeading
              eyebrow={lang === "fr" ? "Médias d'équipe" : "Team media"}
              title={lang === "fr" ? "Réseaux sociaux officiels" : "Official social media"}
              description={
                lang === "fr"
                  ? "Accédez uniquement aux comptes d'équipe approuvés par l'association."
                  : "Access only team accounts approved by the association."
              }
            />

            <div className="grid gap-4 md:grid-cols-2">
              {socialLinks.map((social) => {
                const Icon = social.platform === "facebook" ? Facebook : Instagram;
                const label = social.platform === "facebook" ? "Facebook" : "Instagram";
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-elevated group border-t-4 border-t-sport p-6"
                  >
                    <Icon className="size-6 text-navy" aria-hidden />
                    <h3 className="heading-card mt-8 group-hover:text-sport">{label}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {lang === "fr" ? "Ouvrir le compte officiel de l'équipe." : "Open the team's official account."}
                    </p>
                  </a>
                );
              })}
            </div>
          </section>
        )}

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
