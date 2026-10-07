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
import { TeamMicrositeHero } from "@/components/team-microsite-hero";
import { TeamParentDeck } from "@/components/team-parent-deck";
import { TeamShareTools } from "@/components/team-share-tools";
import { TeamGameDayPanel } from "@/components/team-game-day-panel";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { TeamLiveFeed } from "@/components/team-live-feed";
import { TeamParentPremium } from "@/components/team-parent-premium";
import { TeamCommunityBoard } from "@/components/team-community-board";
import { getTeam } from "@/data/teams";
import { getPublicTeamById, legacyTeamScheduleUrl, officialTeamResultsUrl, publicTeamHubUrl, publicTeamScheduleUrl, teamsForCategory } from "@/data/team-directory";
import { getPublicTeamSocialLinks, getTeamSocialLinks } from "@/data/team-social";
import { NEWS, newsDateLabel } from "@/data/news";
import { ALBUMS } from "@/data/gallery";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { teamVisualForCategory } from "@/data/team-visuals";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { SITE } from "@/lib/site";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useContentOverlay } from "@/lib/community-content";

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
  const baseTeam = getTeam(slug)!;
  const team = useContentOverlay(
    "team",
    `team:category:${slug}`,
    baseTeam as unknown as Record<string, unknown>,
  ) as unknown as typeof baseTeam & { heroImageUrl?: string };
  const categoryVisual = teamVisualForCategory(slug) ?? OFFICIAL_MEDIA.practiceCoach;
  const categoryHeroUrl = team.heroImageUrl ?? categoryVisual.url;
  const feminineMedia = slug === "feminin"
    ? [16, 35, 46, 50]
        .map((id) => uploadedAhmvMediaById(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : [];
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
  const archiveImages = [
    OFFICIAL_MEDIA.tournamentM11Primary,
    OFFICIAL_MEDIA.tournamentM11Secondary,
    OFFICIAL_MEDIA.tournamentM11Tertiary,
    OFFICIAL_MEDIA.volunteerArchive,
  ];
  const contributionResourceKey = exactTeam
    ? `team:${exactTeam.legacyScheduleTeamId}`
    : `team:category:${slug}`;
  const contributionFields = [
    { key: `description.${lang}`, label: { fr: "Description publique", en: "Public description" }, kind: "textarea" as const, current: team.description[lang] },
    { key: "heroImageUrl", label: { fr: "Photo / visuel", en: "Photo / visual" }, kind: "image-url" as const, current: categoryHeroUrl },
    ...(exactTeam
      ? [
          { key: "scheduleUrl", label: { fr: "Lien d’horaire officiel", en: "Official schedule link" }, kind: "url" as const, current: legacyTeamScheduleUrl(exactTeam) },
          { key: "resultsUrl", label: { fr: "Lien résultats officiels", en: "Official results link" }, kind: "url" as const, current: officialTeamResultsUrl(exactTeam) },
        ] as const
      : []),
    { key: "socialLinks", label: { fr: "Liens sociaux", en: "Social links" }, kind: "json" as const, current: socialLinks },
  ];

  return (
    <div className="bg-navy-deep text-white">
      {!exactTeam && (
        <PageHeader
          eyebrow={`${team.code} · ${l(team.ages)}`}
          title={l(team.name)}
          description={l(team.description)}
          actions={
            <>
              <ContentContributionButton
                resourceType="team"
                resourceKey={contributionResourceKey}
                title={l(team.name)}
                snapshot={{
                  description: team.description,
                  heroImageUrl: categoryHeroUrl,
                  socialLinks,
                }}
                fields={contributionFields}
                appearance="menu"
              />
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
      )}

      <div className="container-site space-y-10 py-6 md:space-y-12 md:py-10">
        {exactTeam && <TeamMicrositeHero team={exactTeam} categoryCode={team.code} lang={lang} />}

        {exactTeam && (
          <nav
            aria-label={lang === "fr" ? "Navigation du mini-site d’équipe" : "Team mini-site navigation"}
            className="scrollbar-none -mt-5 flex gap-1 overflow-x-auto border-y border-white/10 bg-competition px-2 py-2 md:-mt-7"
          >
            {[
              { href: "#jour-de-match", fr: "Jour de match", en: "Game day" },
              { href: "#match-center", fr: "Parties", en: "Games" },
              { href: "#social-equipe", fr: "Réseaux", en: "Social" },
              { href: "#nouvelles-equipe", fr: "Nouvelles", en: "News" },
              { href: "#photos-equipe", fr: "Photos", en: "Photos" },
              { href: "#benevolat-equipe", fr: "Bénévoles", en: "Volunteers" },
              { href: "#documents-equipe", fr: "Documents", en: "Documents" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="premium-control shrink-0 border border-white/12 bg-white/[0.035] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.13em] text-white/68 hover:border-sport hover:bg-white/[0.07] hover:text-white"
              >
                {lang === "fr" ? item.fr : item.en}
              </a>
            ))}
          </nav>
        )}

        {exactTeam && <TeamShareTools team={exactTeam} lang={lang} />}

        {exactTeam ? null : (
          <section className="grid overflow-hidden border border-navy/12 bg-navy lg:grid-cols-[1.4fr_0.6fr]">
            <div className="relative min-h-[240px] overflow-hidden sm:min-h-[320px]">
              <img
                src={categoryHeroUrl}
                alt={lang === "fr" ? categoryVisual.alt.fr : categoryVisual.alt.en}
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

        {!exactTeam && slug === "feminin" && feminineMedia.length > 0 && (
          <section className="overflow-hidden border border-navy/12 bg-navy-deep text-white">
            <div className="grid gap-px bg-white/10 lg:grid-cols-[0.78fr_1.22fr]">
              <div className="flex flex-col justify-center bg-competition p-6 md:p-8">
                <p className="eyebrow text-sport-foreground">
                  {lang === "fr" ? "Louves · hockey féminin" : "Louves · girls hockey"}
                </p>
                <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.88] md:text-5xl">
                  {lang === "fr" ? "Une place pour jouer, apprendre et grandir." : "A place to play, learn and grow."}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/68 md:text-base">
                  {lang === "fr"
                    ? "Retrouvez les visuels, équipes, portes ouvertes et moments du programme féminin AHMV dans une collection dédiée."
                    : "Explore the AHMV girls hockey program through dedicated team, open-house and season media."}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild variant="sport">
                    <Link to="/galerie/$slug" params={{ slug: "hockey-feminin-2026-2027" }}>
                      {lang === "fr" ? "Voir l’album féminin" : "View girls hockey album"} <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline-light">
                    <a href={`mailto:${SITE.girlsHockeyEmail}`}>
                      <Mail className="size-4" />
                      {lang === "fr" ? "Écrire à l’équipe" : "Email the program"}
                    </a>
                  </Button>
                </div>
              </div>

              <div className="grid min-h-[360px] grid-cols-2 grid-rows-2 gap-px bg-white/10">
                {feminineMedia.map((media, index) => (
                  <a
                    key={media.id}
                    href={media.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive-surface group relative overflow-hidden bg-navy"
                  >
                    <img
                      src={media.url}
                      alt={lang === "fr" ? media.alt.fr : media.alt.en}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(7,16,43,0.84)_100%)]" />
                    <span className="absolute inset-x-3 bottom-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white/82">
                      {lang === "fr" ? media.label.fr : media.label.en}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {exactTeam && <TeamGameCenter team={exactTeam} lang={lang} />}

        {exactTeam && <TeamGameDayPanel team={exactTeam} lang={lang} />}

        {exactTeam && <TeamParentDeck team={exactTeam} lang={lang} />}
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
        {exactTeam && <HouseSponsorSlot placement={`team-lower-${exactTeam.legacyScheduleTeamId}`} count={1} compact />}
        {exactTeam && <TeamCommunityBoard team={exactTeam} lang={lang} />}

        <section
          aria-labelledby="team-command-title"
          className="overflow-hidden border border-white/12 bg-navy-deep text-white"
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

            <div className="bg-competition p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Accès rapide" : "Quick access"}
              </p>
              <div className="mt-5 grid gap-2">
                {news.length > 0 && (
                  <a
                    href="#nouvelles-equipe"
                    className="premium-control group flex items-center justify-between border border-white/12 bg-white/[0.025] px-4 py-3 text-sm font-semibold text-white/78 hover:border-sport/50 hover:bg-white/[0.06] hover:text-white"
                  >
                    {lang === "fr" ? "Nouvelles" : "News"}
                    <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                  </a>
                )}
                {albums.length > 0 && (
                  <a
                    href="#photos-equipe"
                    className="premium-control group flex items-center justify-between border border-white/12 bg-white/[0.025] px-4 py-3 text-sm font-semibold text-white/78 hover:border-sport/50 hover:bg-white/[0.06] hover:text-white"
                  >
                    {lang === "fr" ? "Photos" : "Photos"}
                    <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                  </a>
                )}
                {(exactTeam || socialLinks.length > 0) && (
                  <a
                    href="#social-equipe"
                    className="premium-control group flex items-center justify-between border border-white/12 bg-white/[0.025] px-4 py-3 text-sm font-semibold text-white/78 hover:border-sport/50 hover:bg-white/[0.06] hover:text-white"
                  >
                    {lang === "fr" ? "Réseaux sociaux" : "Social"}
                    <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                  </a>
                )}
                <Link
                  to="/inscriptions"
                  className="premium-control group flex items-center justify-between border border-white/12 bg-white/[0.025] px-4 py-3 text-sm font-semibold text-white/78 hover:border-sport/50 hover:bg-white/[0.06] hover:text-white"
                >
                  {lang === "fr" ? "Inscriptions" : "Registration"}
                  <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                </Link>
                {slug === "feminin" && (
                  <a
                    href={`mailto:${SITE.girlsHockeyEmail}`}
                    className="premium-control group flex items-center justify-between border border-white/12 bg-white/[0.025] px-4 py-3 text-sm font-semibold text-white/78 hover:border-sport/50 hover:bg-white/[0.06] hover:text-white"
                  >
                    {lang === "fr" ? "Questions hockey féminin" : "Girls' hockey questions"}
                    <Mail className="size-4 text-sport" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid overflow-hidden border border-white/12 bg-competition text-white lg:grid-cols-[1fr_auto] lg:items-stretch">
          <div className="p-6 md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Communauté d'équipe" : "Team community"}</p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold uppercase leading-[0.9] text-white md:text-4xl">
              {lang === "fr" ? "Vous avez une mise à jour fiable?" : "Have a reliable team update?"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
              {lang === "fr"
                ? "Parents, entraîneurs et bénévoles peuvent proposer une nouvelle, un document ou un lien d'équipe. Pour l'instant, chaque envoi passe par une révision humaine avant publication."
                : "Parents, coaches and volunteers can suggest a story, document or team link. For now, every submission is reviewed by a person before publication."}
            </p>
          </div>
          <div className="flex min-w-[250px] flex-col justify-center border-t border-white/12 bg-navy-deep p-6 lg:border-l lg:border-t-0 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/70">
                  {lang === "fr" ? "Modifier l’information publique" : "Correct public information"}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/45">
                  {lang === "fr"
                    ? "Chaque correction est vérifiée avant sa publication."
                    : "Every correction is reviewed before publication."}
                </p>
              </div>
              <ContentContributionButton
                resourceType="team"
                resourceKey={contributionResourceKey}
                title={exactTeam ? `${exactTeam.name} · ${exactTeam.level}` : l(team.name)}
                snapshot={{
                  description: team.description,
                  heroImageUrl: categoryHeroUrl,
                  scheduleUrl: exactTeam ? legacyTeamScheduleUrl(exactTeam) : undefined,
                  resultsUrl: exactTeam ? officialTeamResultsUrl(exactTeam) : undefined,
                  socialLinks,
                }}
                fields={contributionFields}
                appearance="menu"
              />
            </div>
          </div>
        </section>

        {visiblePublicTeams.length > 0 && (
          <section aria-labelledby="public-team-directory-title">
            <SectionHeading
              eyebrow={lang === "fr" ? "Répertoire d’équipes" : "Team directory"}
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
                      <img
                        src={categoryVisual.url}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        decoding="async"
                        className="pointer-events-none absolute inset-0 size-full object-cover opacity-[0.16] grayscale-[0.15]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.55),rgba(7,16,43,0.94))]" aria-hidden />
                      <span
                        className="pointer-events-none absolute -right-1 -top-5 font-display text-[7.5rem] font-extrabold leading-none tracking-[-0.08em] text-white/[0.05]"
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
                          href={publicTeamScheduleUrl(entry)}
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

        {!exactTeam && (
          <section id="horaires-equipe">
            <SectionHeading
              eyebrow={lang === "fr" ? "Accès utiles" : "Useful links"}
              title={lang === "fr" ? "Horaire & arénas" : "Schedule & arenas"}
              description={
                lang === "fr"
                  ? "Retrouvez l’horaire de la catégorie et les itinéraires vers les arénas."
                  : "Find the category schedule and directions to the arenas."
              }
              className="border-white/12 [&_h2]:text-white [&_p]:text-white/55"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Link to="/horaires" search={{ team: slug }} className="interactive-surface group border border-white/12 bg-navy p-5 text-white hover:border-sport/50 hover:bg-white/[0.05]">
                <CalendarDays className="size-5 text-sport-foreground" aria-hidden />
                <h3 className="heading-card mt-4 text-white group-hover:text-sport-foreground">
                  {lang === "fr" ? "Horaire" : "Schedule"}
                </h3>
                <p className="mt-2 text-sm text-white/52">
                  {lang === "fr" ? "Voir les activités de cette catégorie." : "View this category’s activities."}
                </p>
              </Link>
              <Link to="/arenas" className="interactive-surface group border border-white/12 bg-navy p-5 text-white hover:border-sport/50 hover:bg-white/[0.05]">
                <MapPin className="size-5 text-sport-foreground" aria-hidden />
                <h3 className="heading-card mt-4 text-white group-hover:text-sport-foreground">
                  {lang === "fr" ? "Arénas" : "Arenas"}
                </h3>
                <p className="mt-2 text-sm text-white/52">
                  {lang === "fr" ? "Adresses, photos et itinéraires." : "Addresses, photos and directions."}
                </p>
              </Link>
            </div>
          </section>
        )}

        {news.length > 0 && (
          <section id="nouvelles-equipe">
            <div className="flex items-end justify-between gap-4">
              <SectionHeading title={t("teams.news")} className="border-white/12 [&_h2]:text-white [&_p]:text-white/55" />
              <p className="mb-1 hidden text-[9px] font-bold uppercase tracking-[0.14em] text-white/38 sm:block md:hidden">
                {lang === "fr" ? "Glissez pour parcourir" : "Swipe to browse"}
              </p>
            </div>

            <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 md:hidden">
              {news.map((article, index) => {
                const media = archiveImages[index % archiveImages.length]!;
                return (
                  <Link
                    key={article.slug}
                    to="/nouvelles/$slug"
                    params={{ slug: article.slug }}
                    className="interactive-surface group w-[84vw] max-w-[23rem] shrink-0 snap-center overflow-hidden border border-white/12 bg-navy text-white"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-navy">
                      <img
                        src={media.url}
                        alt={lang === "fr" ? media.alt.fr : media.alt.en}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-active:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(7,16,43,0.84)_100%)]" />
                      <span className="absolute bottom-3 left-3 bg-navy/78 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                        {lang === "fr" ? "Archive AHMV" : "AHMV archive"}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="eyebrow text-sport-foreground">{newsDateLabel(article, lang)}</p>
                      <h3 className="heading-card mt-2 text-white group-hover:text-sport-foreground">{l(article.title)}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="hidden gap-5 md:grid md:grid-cols-3">
              {news.map((article, index) => {
                const media = archiveImages[index % archiveImages.length]!;
                return (
                  <Link
                    key={article.slug}
                    to="/nouvelles/$slug"
                    params={{ slug: article.slug }}
                    className="interactive-surface group overflow-hidden border border-white/12 bg-navy text-white"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-navy">
                      <img
                        src={media.url}
                        alt={lang === "fr" ? media.alt.fr : media.alt.en}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />
                      <span className="absolute bottom-3 left-3 bg-navy/78 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                        {lang === "fr" ? "Archive AHMV" : "AHMV archive"}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="eyebrow text-sport-foreground">{newsDateLabel(article, lang)}</p>
                      <h3 className="heading-card mt-2 text-white group-hover:text-sport-foreground">{l(article.title)}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {albums.length > 0 && (
          <section id="photos-equipe">
            <div className="flex items-end justify-between gap-4">
              <SectionHeading title={t("teams.albums")} className="border-white/12 [&_h2]:text-white [&_p]:text-white/55" />
              <p className="mb-1 hidden text-[9px] font-bold uppercase tracking-[0.14em] text-white/38 sm:block md:hidden">
                {lang === "fr" ? "Albums à glisser" : "Swipe albums"}
              </p>
            </div>

            <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 md:hidden">
              {albums.map((album, index) => {
                const media = archiveImages[index % archiveImages.length]!;
                const imageUrl = album.coverUrl ?? media.url;
                return (
                  <Link
                    key={album.slug}
                    to="/galerie/$slug"
                    params={{ slug: album.slug }}
                    className="interactive-surface group w-[82vw] max-w-[22rem] shrink-0 snap-center overflow-hidden border border-white/12 bg-navy text-white"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-navy">
                      <img
                        src={imageUrl}
                        alt={l(album.title)}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-active:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(7,16,43,0.82)_100%)]" />
                      <span className="absolute bottom-3 left-3 bg-navy/78 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                        {album.photoCount
                          ? lang === "fr"
                            ? `${album.photoCount} médias`
                            : `${album.photoCount} media`
                          : lang === "fr"
                            ? "Album AHMV"
                            : "AHMV album"}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="heading-card text-white group-hover:text-sport-foreground">{l(album.title)}</h3>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/42">
                        {album.season} · {l(album.eventType)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="hidden gap-5 md:grid md:grid-cols-3">
              {albums.map((album, index) => {
                const media = archiveImages[index % archiveImages.length]!;
                const imageUrl = album.coverUrl ?? media.url;
                return (
                  <Link
                    key={album.slug}
                    to="/galerie/$slug"
                    params={{ slug: album.slug }}
                    className="interactive-surface group overflow-hidden border border-white/12 bg-navy text-white"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-navy">
                      <img
                        src={imageUrl}
                        alt={l(album.title)}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />
                      <span className="absolute bottom-3 left-3 bg-navy/78 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                        {album.photoCount
                          ? lang === "fr"
                            ? `${album.photoCount} médias`
                            : `${album.photoCount} media`
                          : album.coverUrl
                            ? lang === "fr"
                              ? "Aperçu de l’album"
                              : "Album preview"
                            : lang === "fr"
                              ? "Archive AHMV"
                              : "AHMV archive"}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="heading-card text-white group-hover:text-sport-foreground">{l(album.title)}</h3>
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
                    className="interactive-surface group border border-white/12 border-t-4 border-t-sport bg-navy p-5 text-white hover:bg-white/[0.05]"
                  >
                    <Icon className="size-5 text-sport-foreground" aria-hidden />
                    <h3 className="heading-card mt-8 group-hover:text-sport">{label}</h3>
                    <p className="mt-2 text-sm text-white/52">
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
            className="border-white/12 [&_h2]:text-white [&_p]:text-white/55"
            title={lang === "fr" ? "Besoin d'autre chose?" : "Need something else?"}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/ressources" className="interactive-surface group border border-white/12 bg-navy p-5 text-white hover:border-sport/50 hover:bg-white/[0.05]">
              <ShieldCheck className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-4 text-white group-hover:text-sport-foreground">
                {lang === "fr" ? "Ressources hockey" : "Hockey resources"}
              </h3>
              <p className="mt-2 text-sm text-white/52">
                {lang === "fr"
                  ? "Hockey Québec, Hockey Canada, aide financière et liens officiels."
                  : "Hockey Québec, Hockey Canada, financial assistance and official links."}
              </p>
            </Link>
            <Link to="/faq" className="interactive-surface group border border-white/12 bg-navy p-5 text-white hover:border-sport/50 hover:bg-white/[0.05]">
              <ArrowRight className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-4 text-white group-hover:text-sport-foreground">
                F.A.Q.
              </h3>
              <p className="mt-2 text-sm text-white/52">
                {lang === "fr"
                  ? "Réponses rapides aux questions les plus fréquentes des familles."
                  : "Quick answers to families' most common questions."}
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
