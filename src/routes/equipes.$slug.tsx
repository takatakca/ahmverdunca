import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound, useRouterState } from "@tanstack/react-router";
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
import { TeamPortfolio } from "@/components/team-portfolio";
import { TeamGameCenter } from "@/components/team-game-center";
import { TeamLiveFeed } from "@/components/team-live-feed";
import { TeamParentPremium } from "@/components/team-parent-premium";
import { TeamCommunityBoard } from "@/components/team-community-board";
import { getTeam } from "@/data/teams";
import { getPublicTeamById, legacyTeamScheduleUrl, officialTeamResultsUrl, publicTeamHubUrl, teamsForCategory } from "@/data/team-directory";
import { getPublicTeamSocialLinks, getTeamSocialLinks } from "@/data/team-social";
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
  const currentHref = useRouterState({ select: (state) => state.location.href });
  const teamId = new URL(currentHref, SITE.domain).searchParams.get("teamId") ?? undefined;
  const { t, l, lang } = useI18n();
  const { preferredTeam, savePreferredTeam } = usePreferredTeam();
  const team = getTeam(slug)!;
  const isPreferred = preferredTeam === slug;
  const news = NEWS.filter((article) => article.teamSlugs.includes(slug));
  const albums = ALBUMS.filter((album) => album.teamSlugs.includes(slug));
  const categorySocialLinks = getTeamSocialLinks(slug);
  const publicTeams = teamsForCategory(slug);
  const exactTeamCandidate = teamId ? getPublicTeamById(teamId) : undefined;
  const exactTeam = exactTeamCandidate?.categorySlug === slug ? exactTeamCandidate : undefined;
  const socialLinks = exactTeam
    ? getPublicTeamSocialLinks(exactTeam.legacyScheduleTeamId)
    : categorySocialLinks;
  const visiblePublicTeams = exactTeam
    ? publicTeams.filter((entry) => entry.legacyScheduleTeamId !== exactTeam.legacyScheduleTeamId)
    : publicTeams;
  const updateSubject = exactTeam
    ? `AHMV — mise à jour ${exactTeam.name} · ${exactTeam.level} · ${exactTeam.legacyScheduleTeamId}`
    : `AHMV — mise à jour ${team.code}`;
  const updateBody = lang === "fr"
    ? exactTeam
      ? `Bonjour, je souhaite proposer une mise à jour pour cette équipe AHMV.\n\nÉquipe : ${exactTeam.name}\nNiveau : ${exactTeam.level}\nRéférence publique : ${exactTeam.legacyScheduleTeamId}\nInformation à publier :\nSource ou lien :\n`
      : "Bonjour, je souhaite proposer une mise à jour pour cette catégorie/équipe AHMV.\n\nÉquipe :\nInformation à publier :\nSource ou lien :\n"
    : exactTeam
      ? `Hello, I would like to suggest an update for this AHMV team.\n\nTeam: ${exactTeam.name}\nLevel: ${exactTeam.level}\nPublic reference: ${exactTeam.legacyScheduleTeamId}\nInformation to publish:\nSource or link:\n`
      : "Hello, I would like to suggest an update for this AHMV category/team.\n\nTeam:\nInformation to publish:\nSource or link:\n";
  const archiveImages = [
    OFFICIAL_MEDIA.tournamentM11Primary,
    OFFICIAL_MEDIA.tournamentM11Secondary,
    OFFICIAL_MEDIA.tournamentM11Tertiary,
    OFFICIAL_MEDIA.volunteerArchive,
  ];

  return (
    <>
      <PageHeader
        eyebrow={
          exactTeam
            ? `${team.code} · ${exactTeam.level} · #${exactTeam.legacyScheduleTeamId.slice(-4)}`
            : `${team.code} · ${l(team.ages)}`
        }
        title={exactTeam ? exactTeam.name : l(team.name)}
        description={
          exactTeam
            ? (lang === "fr"
                ? "Hub public de cette équipe : accès officiels, résultats, médias approuvés et contributions vérifiées, sans recopier de données personnelles de joueurs."
                : "Public team hub: official access, results, approved media and reviewed contributions, without copying player personal data.")
            : l(team.description)
        }
        actions={
          exactTeam ? (
            <>
              <Button asChild variant="sport">
                <a href={legacyTeamScheduleUrl(exactTeam)} target="_blank" rel="noopener noreferrer">
                  <CalendarDays className="size-4" />
                  {lang === "fr" ? "Horaire officiel" : "Official schedule"}
                </a>
              </Button>
              <Button asChild variant="outline-light">
                <a href={officialTeamResultsUrl(exactTeam)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  {lang === "fr" ? "Résultats / classement" : "Results / standings"}
                </a>
              </Button>
              <Button asChild variant="outline-light">
                <a href={`/equipes/${slug}`}>
                  {lang === "fr" ? "Retour à la catégorie" : "Back to category"}
                </a>
              </Button>
            </>
          ) : (
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
          )
        }
      />

      <div className="container-site space-y-10 py-6 md:space-y-12 md:py-10">
        {exactTeam && <TeamGameCenter team={exactTeam} lang={lang} />}

        {exactTeam ? (
          <section className="grid overflow-hidden border border-navy/12 bg-navy lg:grid-cols-[1.35fr_0.65fr]">
            <div className="relative min-h-[250px] overflow-hidden sm:min-h-[330px]">
              <img
                src={slug === "m11" ? OFFICIAL_MEDIA.practiceSkaters.url : OFFICIAL_MEDIA.practiceCoach.url}
                alt={lang === "fr" ? "Photo réelle AHM Verdun — jeunes et entraîneur sur la glace" : "Real AHM Verdun photo — players and coach on the ice"}
                loading="eager"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.10),rgba(7,16,43,0.88))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-9">
                <p className="eyebrow text-sport-foreground">
                  {lang === "fr" ? "Hub public d’équipe" : "Public team hub"}
                </p>
                <p className="mt-2 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.86] tracking-[-0.03em] sm:text-5xl md:text-6xl">
                  {exactTeam.name}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                  <span className="border border-white/18 px-2.5 py-1">{team.code}</span>
                  <span className="border border-white/18 px-2.5 py-1">{exactTeam.level}</span>
                  <span className="border border-white/18 px-2.5 py-1">#{exactTeam.legacyScheduleTeamId.slice(-4)}</span>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
                  {lang === "fr"
                    ? "Photo réelle AHMV utilisée comme ambiance; elle n’est pas présentée comme une photo spécifique de cette équipe."
                    : "Real AHMV photo used for atmosphere; it is not presented as a photo of this specific team."}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between border-t border-white/12 p-6 text-white lg:border-l lg:border-t-0 md:p-8">
              <div>
                <p className="eyebrow text-sport-foreground">
                  {lang === "fr" ? "Accès officiels" : "Official access"}
                </p>
                <div className="mt-5 border-y border-white/12">
                  <div className="flex items-end justify-between gap-4 border-b border-white/12 py-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.13em] text-white/52">
                      {lang === "fr" ? "Catégorie" : "Category"}
                    </span>
                    <span className="font-display text-3xl font-extrabold uppercase">{team.code}</span>
                  </div>
                  <div className="flex items-end justify-between gap-4 border-b border-white/12 py-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.13em] text-white/52">
                      {lang === "fr" ? "Niveau" : "Level"}
                    </span>
                    <span className="font-display text-3xl font-extrabold uppercase">{exactTeam.level}</span>
                  </div>
                  <div className="py-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.13em] text-white/52">
                      {lang === "fr" ? "Référence publique" : "Public reference"}
                    </span>
                    <p className="mt-2 break-all font-mono text-sm text-white/78">{exactTeam.legacyScheduleTeamId}</p>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-2">
                <a
                  href={legacyTeamScheduleUrl(exactTeam)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-control flex min-h-12 items-center justify-between bg-sport px-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-sport-foreground"
                >
                  {lang === "fr" ? "Horaire officiel" : "Official schedule"}
                  <CalendarDays className="size-4" />
                </a>
                <a
                  href={officialTeamResultsUrl(exactTeam)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-control flex min-h-12 items-center justify-between border border-white/18 px-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-white"
                >
                  {lang === "fr" ? "Résultats / classement" : "Results / standings"}
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid overflow-hidden border border-navy/12 bg-navy lg:grid-cols-[1.4fr_0.6fr]">
            <div className="relative min-h-[240px] overflow-hidden sm:min-h-[320px]">
              <img
                src={slug === "m11" ? OFFICIAL_MEDIA.practiceSkaters.url : OFFICIAL_MEDIA.practiceCoach.url}
                alt={lang === "fr" ? "Photo réelle AHM Verdun — entraînement sur glace" : "Real AHM Verdun photo — on-ice practice"}
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
        )}
        {exactTeam && (
          <TeamPortfolio
            team={exactTeam}
            lang={lang}
            newsCount={news.length}
            albumCount={albums.length}
            approvedSocialCount={socialLinks.length}
          />
        )}

        {exactTeam && <TeamLiveFeed team={exactTeam} lang={lang} />}

        {exactTeam && <TeamParentPremium team={exactTeam} lang={lang} />}
        {exactTeam && <TeamCommunityBoard team={exactTeam} lang={lang} />}

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
                {exactTeam ? exactTeam.name : team.code}
              </h2>
              <p className="mt-4 max-w-2xl text-sm text-navy-foreground/75 md:text-base">
                {exactTeam
                  ? (lang === "fr"
                      ? "Le point d’entrée de cette équipe exacte : horaire et résultats officiels, médias approuvés, arénas et mises à jour révisées."
                      : "The entry point for this exact team: official schedule and results, approved media, arenas and reviewed updates.")
                  : (lang === "fr"
                      ? "Un point d'entrée simple pour les parents : horaires, arénas, inscriptions, nouvelles et médias publics."
                      : "A simple starting point for families: schedules, arenas, registration, news and public media.")}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="sport">
                  {exactTeam ? (
                    <a href={legacyTeamScheduleUrl(exactTeam)} target="_blank" rel="noopener noreferrer">
                      <CalendarDays className="size-4" />
                      {lang === "fr" ? "Horaire officiel" : "Official schedule"}
                    </a>
                  ) : (
                    <Link to="/horaires" search={{ team: slug }}>
                      <CalendarDays className="size-4" />
                      {lang === "fr" ? "Horaires officiels" : "Official schedules"}
                    </Link>
                  )}
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
                {(exactTeam || socialLinks.length > 0) && (
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

        <section className="grid overflow-hidden border border-navy/12 bg-ice lg:grid-cols-[1fr_auto] lg:items-stretch">
          <div className="p-6 md:p-8">
            <p className="eyebrow text-sport">{lang === "fr" ? "Communauté d'équipe" : "Team community"}</p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold uppercase leading-[0.9] text-navy md:text-4xl">
              {lang === "fr" ? "Vous avez une mise à jour fiable?" : "Have a reliable team update?"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {lang === "fr"
                ? "Parents, entraîneurs et bénévoles peuvent proposer une nouvelle, un document ou un lien d'équipe. Pour l'instant, chaque envoi passe par une révision humaine avant publication."
                : "Parents, coaches and volunteers can suggest a story, document or team link. For now, every submission is reviewed by a person before publication."}
            </p>
          </div>
          <div className="flex min-w-[250px] flex-col justify-center border-t border-navy/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <Button asChild variant="sport" size="lg" className="justify-between">
              <a
                href={`mailto:${SITE.operationsEmail}?subject=${encodeURIComponent(updateSubject)}&body=${encodeURIComponent(updateBody)}`}
              >
                <span className="flex items-center gap-2"><Mail className="size-4" />{lang === "fr" ? "Proposer une mise à jour" : "Suggest an update"}</span>
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Canal courriel actuel — aucune publication automatique n'est activée."
                : "Current email channel — automatic publishing is not enabled."}
            </p>
          </div>
        </section>

        {visiblePublicTeams.length > 0 && (
          <section aria-labelledby="public-team-directory-title">
            <SectionHeading
              eyebrow={lang === "fr" ? "Répertoire public 2026–2027" : "2026–2027 public directory"}
              title={
                exactTeam
                  ? (lang === "fr" ? "Autres équipes de la catégorie" : "Other teams in this category")
                  : (lang === "fr" ? "Équipes publiées" : "Published teams")
              }
              description={lang === "fr"
                ? "Noms et niveaux actuellement affichés dans le répertoire public AHM Verdun. Aucun alignement de joueurs ni donnée personnelle n’est recopié."
                : "Names and levels currently shown in AHM Verdun’s public directory. No player roster or personal information is mirrored."}
            />
            <div id="public-team-directory-title" className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {visiblePublicTeams.map((entry, index) => {
                const teamSocialLinks = getPublicTeamSocialLinks(entry.legacyScheduleTeamId);
                return (
                  <div
                    id={`team-${entry.legacyScheduleTeamId}`}
                    key={entry.legacyScheduleTeamId}
                    className="interactive-surface scoreboard-panel scroll-mt-28 flex min-h-[270px] flex-col overflow-hidden p-0 text-white"
                  >
                    <div className="relative flex min-h-40 flex-1 flex-col justify-between overflow-hidden p-5">
                      <span
                        className="pointer-events-none absolute -right-1 -top-5 font-display text-[7.5rem] font-extrabold leading-none tracking-[-0.08em] text-white/[0.035]"
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="relative flex items-start justify-between gap-3">
                        <p className="eyebrow text-sport-foreground">{entry.level}</p>
                        <span className="border border-white/12 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/48">
                          #{entry.legacyScheduleTeamId.slice(-4)}
                        </span>
                      </div>
                      <div className="relative mt-8">
                        <p className="font-display text-[clamp(2rem,7vw,3rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.035em] text-white">
                          {entry.name}
                        </p>
                        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/38">
                          {lang === "fr" ? "Équipe publiée · source officielle" : "Published team · official source"}
                        </p>
                      </div>
                    </div>

                    <div className="relative mt-auto border-t border-white/12 bg-white/[0.035] p-3">
                      <a
                        href={publicTeamHubUrl(entry)}
                        className="premium-control mb-2 flex min-h-11 items-center justify-between bg-sport px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-sport-foreground hover:brightness-95"
                      >
                        <span>{lang === "fr" ? "Page équipe" : "Team page"}</span>
                        <ArrowRight className="size-3.5" />
                      </a>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={legacyTeamScheduleUrl(entry)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="premium-control flex min-h-11 items-center justify-between border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white hover:border-sport hover:bg-white/[0.05]"
                        >
                          <span>{lang === "fr" ? "Horaire" : "Schedule"}</span>
                          <CalendarDays className="size-3.5 text-sport-foreground" />
                        </a>
                        <a
                          href={officialTeamResultsUrl(entry)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="premium-control flex min-h-11 items-center justify-between border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white hover:border-sport hover:bg-white/[0.05]"
                        >
                          <span>{lang === "fr" ? "Résultats" : "Results"}</span>
                          <ExternalLink className="size-3.5 text-sport-foreground" />
                        </a>
                      </div>

                      {teamSocialLinks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                          {teamSocialLinks.map((social) => {
                            const Icon = social.platform === "facebook" ? Facebook : Instagram;
                            return (
                              <a
                                key={`${social.platform}-${social.url}`}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="premium-control inline-flex min-h-9 items-center gap-2 border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white hover:border-sport"
                              >
                                <Icon className="size-3.5 text-sport-foreground" />
                                {social.platform}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
          <section id="social-links-equipe">
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
