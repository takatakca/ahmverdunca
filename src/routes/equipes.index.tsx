import { useState } from "react";
import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, BookmarkCheck, CalendarDays, ExternalLink, Images, Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CURRENT_TEAMS } from "@/data/teams";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { officialTeamResultsUrl, publicTeamHubUrl, teamsForCategory } from "@/data/team-directory";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { cn } from "@/lib/utils";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

export const Route = createFileRoute("/equipes/")({
  head: () => ({
    links: canonicalLink("/equipes"),
    meta: [
      { title: "Équipes et catégories — AHM Verdun" },
      { name: "description", content: "M5, M7, M9, M11, M13, M15, M17, M19, M22 et hockey féminin : les catégories AHM Verdun pour la saison 2026–2027." },
      { property: "og:title", content: "Équipes et catégories — AHM Verdun" },
      { property: "og:description", content: "Toutes les catégories de l'AHM Verdun, avec page dédiée pour chacune." },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const { t, l, lang } = useI18n();
  const {
    preferredTeam,
    savePreferredTeam,
    selectedTeamIds,
    selectedTeams,
    toggleSelectedTeam,
    clearSelectedTeams,
    isTeamSelected,
  } = usePreferredTeam();
  const [showAllResults, setShowAllResults] = useState(false);
  const [showAllDirectory, setShowAllDirectory] = useState(false);
  const totalPublicTeams = CURRENT_TEAMS.reduce((count, team) => count + teamsForCategory(team.slug).length, 0);
  const filterToMine = selectedTeamIds.length > 0 && !showAllResults;
  const selectedCategorySlugs = new Set(selectedTeams.map((team) => team.categorySlug));
  const categoriesToRender =
    selectedTeamIds.length > 0 && !showAllDirectory
      ? CURRENT_TEAMS.filter((team) => selectedCategorySlugs.has(team.slug))
      : CURRENT_TEAMS;

  return (
    <>
      <PageHeader
        eyebrow={`${t("common.season")} · 2026–2027`}
        title={t("teams.title")}
        description={lang === "fr"
          ? "Du premier coup de patin à M22 : choisissez une catégorie pour retrouver son horaire, ses équipes publiques, ses résultats, son classement, ses arénas et ses informations."
          : "From the first skate to U22: choose a category to find its schedule, public teams, results, standings, arenas and information."}
      />

      <div className="container-site py-9 md:py-14">
        <section className="mb-8 grid overflow-hidden border border-navy/12 bg-navy text-navy-foreground lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[320px] overflow-hidden sm:min-h-[390px]">
            <img
              src={OFFICIAL_MEDIA.tournamentM11Primary.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.tournamentM11Primary.alt.fr : OFFICIAL_MEDIA.tournamentM11Primary.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.78))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Sur la glace à Verdun" : "On the ice in Verdun"}
              </p>
              <p className="mt-2 max-w-xl font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-5xl">
                {lang === "fr" ? "Choisissez votre parcours." : "Choose your path."}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/72">
                {lang === "fr"
                  ? "Chaque catégorie devient un point d’entrée vers l’horaire, les équipes publiées, les nouvelles et les ressources utiles aux familles."
                  : "Each category becomes a starting point for schedules, published teams, news and family resources."}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Portail familles" : "Family portal"}</p>
              <div className="mt-6 grid gap-px border border-white/12 bg-white/12">
                <div className="bg-navy p-5">
                  <p className="font-display text-5xl font-extrabold">{String(CURRENT_TEAMS.length).padStart(2, "0")}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.17em] text-white/48">
                    {lang === "fr" ? "catégories AHMV" : "AHMV categories"}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-px bg-white/12">
                  <Link to="/horaires" className="interactive-surface bg-navy p-4 sm:p-5 hover:bg-white/[0.06]">
                    <CalendarDays className="size-5 text-sport-foreground" />
                    <p className="mt-4 font-display text-lg font-bold uppercase sm:text-xl">{lang === "fr" ? "Horaires" : "Schedules"}</p>
                  </Link>
                  <a href="#resultats" className="interactive-surface bg-sport/10 p-4 sm:p-5 hover:bg-sport/15">
                    <Trophy className="size-5 text-sport-foreground" />
                    <p className="mt-4 font-display text-lg font-bold uppercase sm:text-xl">{lang === "fr" ? "Résultats" : "Results"}</p>
                  </a>
                  <Link to="/galerie" className="interactive-surface bg-navy p-4 sm:p-5 hover:bg-white/[0.06]">
                    <Images className="size-5 text-sport-foreground" />
                    <p className="mt-4 font-display text-lg font-bold uppercase sm:text-xl">{lang === "fr" ? "Photos" : "Photos"}</p>
                  </Link>
                </div>
              </div>
            </div>
            <a
              href={OFFICIAL_MEDIA.tournamentM11Primary.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/55 hover:text-white"
            >
              {lang === "fr" ? "Photo : archive publique AHMV" : "Photo: AHMV public archive"} <ArrowRight className="size-3.5" />
            </a>
          </div>
        </section>

        <HouseSponsorSlot placement="teams-directory" compact className="mb-8" />

        {selectedTeams.length > 0 ? (
          <section className="mb-8 overflow-hidden border border-sport/30 bg-background">
            <div className="grid bg-competition text-white lg:grid-cols-[1fr_auto]">
              <div className="p-6 md:p-8">
                <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Portail parent" : "Parent portal"}</p>
                <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] md:text-5xl">
                  {lang === "fr" ? "Mes équipes" : "My teams"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/62">
                  {lang === "fr"
                    ? "Le portail met maintenant vos équipes en priorité. Ajoutez-en plusieurs si vos enfants jouent dans des formations différentes."
                    : "The portal now prioritizes your teams. Add several when your children play on different teams."}
                </p>
              </div>
              <div className="flex items-center border-t border-white/12 p-5 lg:border-l lg:border-t-0">
                <button
                  type="button"
                  onClick={clearSelectedTeams}
                  className="premium-control min-h-11 border border-white/18 px-4 text-[10px] font-bold uppercase tracking-[0.13em] text-white hover:border-sport"
                >
                  {lang === "fr" ? "Effacer ma sélection" : "Clear selection"}
                </button>
              </div>
            </div>
            <div className="grid gap-px bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
              {selectedTeams.map((entry) => (
                <article key={entry.legacyScheduleTeamId} className="flex min-h-52 flex-col bg-background p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow text-sport">{entry.level}</p>
                      <h3 className="mt-2 font-display text-2xl font-extrabold uppercase leading-[0.88] text-navy">{entry.name}</h3>
                    </div>
                    <BookmarkCheck className="size-5 shrink-0 text-sport" aria-hidden />
                  </div>
                  <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    #{entry.legacyScheduleTeamId.slice(-4)}
                  </p>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
                    <a
                      href={publicTeamHubUrl(entry)}
                      className="premium-control flex min-h-11 items-center justify-between bg-navy px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white"
                    >
                      {lang === "fr" ? "Mon mini-site" : "My mini-site"} <ArrowRight className="size-3.5 text-sport-foreground" />
                    </a>
                    <a
                      href={officialTeamResultsUrl(entry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="premium-control flex min-h-11 items-center justify-between border border-navy/12 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-navy hover:border-sport"
                    >
                      {lang === "fr" ? "Résultats" : "Results"} <Trophy className="size-3.5 text-sport" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-8 flex flex-col gap-5 border border-navy/12 bg-ice p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="eyebrow text-sport">{lang === "fr" ? "Personnaliser le portail" : "Personalize the portal"}</p>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9] text-navy">
                {lang === "fr" ? "Choisissez les équipes de vos enfants." : "Choose your children’s teams."}
              </p>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Ajoutez une ou plusieurs équipes. Le portail pourra ensuite mettre leurs résultats, nouvelles et contenus en premier."
                  : "Add one or more teams. The portal can then put their results, news and content first."}
              </p>
            </div>
            <a href="#resultats" className="premium-control inline-flex min-h-12 shrink-0 items-center gap-2 bg-navy px-5 font-display text-sm font-bold uppercase tracking-[0.1em] text-white">
              <Bookmark className="size-4 text-sport-foreground" />
              {lang === "fr" ? "Choisir mes équipes" : "Choose my teams"}
            </a>
          </section>
        )}

        <div className="grid gap-px border border-navy/12 bg-navy/12 md:grid-cols-2">
          <div className="bg-navy p-6 text-navy-foreground md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Répertoire public" : "Public directory"}</p>
            <p className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em]">
              {lang === "fr" ? "Catégories d’abord." : "Categories first."}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/65">{t("teams.divisionsNote")}</p>
          </div>
          <div className="rink-surface p-6 md:p-8">
            <p className="eyebrow text-sport">{lang === "fr" ? "Confidentialité" : "Privacy"}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("teams.privacyNote")}</p>
          </div>
        </div>

        <section id="resultats" className="mt-9 scroll-mt-28 overflow-hidden border border-navy/12 bg-background">
          <div className="grid bg-competition text-white lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Centre officiel" : "Official centre"}
              </p>
              <h2 className="mt-2 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] md:text-5xl">
                {lang === "fr" ? "Résultats & classements" : "Results & standings"}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/68 md:text-base">
                {lang === "fr"
                  ? "Choisissez l’équipe exacte. Les résultats et classements restent servis par la source hockey officielle; AHMV vous amène directement au bon identifiant sans recréer une deuxième version des scores."
                  : "Choose the exact team. Results and standings remain served by the official hockey source; AHMV takes you directly to the correct identifier without creating a second version of the scores."}
              </p>
              {selectedTeamIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllResults((value) => !value)}
                  className="premium-control mt-5 min-h-11 border border-white/18 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:border-sport"
                >
                  {showAllResults
                    ? (lang === "fr" ? "Afficher seulement mes équipes" : "Show only my teams")
                    : (lang === "fr" ? "Voir toutes les équipes" : "View all teams")}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 border-t border-white/12 lg:border-l lg:border-t-0">
              <div className="flex flex-col justify-center p-6 md:p-8">
                <span className="font-display text-5xl font-extrabold text-sport-foreground">{totalPublicTeams}</span>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/48">
                  {lang === "fr" ? "équipes publiques" : "public teams"}
                </span>
              </div>
              <div className="flex flex-col justify-center border-l border-white/12 p-6 md:p-8">
                <Trophy className="size-8 text-sport-foreground" aria-hidden />
                <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/48">
                  {lang === "fr" ? "horaire · matchs terminés · classement" : "schedule · completed games · standings"}
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-navy/10">
            {CURRENT_TEAMS.map((category) => {
              const allEntries = teamsForCategory(category.slug);
              const entries = filterToMine
                ? allEntries.filter((entry) => selectedTeamIds.includes(entry.legacyScheduleTeamId))
                : allEntries;
              if (!entries.length) return null;
              return (
                <div key={category.slug} className="grid lg:grid-cols-[10rem_minmax(0,1fr)]">
                  <div className="bg-ice p-4 lg:border-r lg:border-navy/10 lg:p-5">
                    <p className="font-display text-3xl font-extrabold uppercase text-navy">{category.code}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      {entries.length} {lang === "fr" ? "équipe(s)" : "team(s)"}
                    </p>
                  </div>
                  <div className="grid gap-px bg-navy/10 sm:grid-cols-2 xl:grid-cols-3">
                    {entries.map((entry) => (
                      <article key={entry.legacyScheduleTeamId} className="flex min-h-40 flex-col bg-background p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="eyebrow text-sport">{entry.level}</p>
                            <h3 className="mt-2 font-display text-xl font-extrabold uppercase leading-none text-navy">
                              {entry.name}
                            </h3>
                          </div>
                          <span className="shrink-0 border border-navy/10 px-2 py-1 font-mono text-[9px] text-muted-foreground">
                            #{entry.legacyScheduleTeamId.slice(-4)}
                          </span>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                          <a
                            href={publicTeamHubUrl(entry)}
                            className="premium-control flex min-h-10 items-center justify-between border border-navy/12 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-navy hover:border-sport hover:text-sport"
                          >
                            {lang === "fr" ? "Équipe" : "Team"}
                            <ArrowRight className="size-3.5" />
                          </a>
                          <a
                            href={officialTeamResultsUrl(entry)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="premium-control flex min-h-10 items-center justify-between bg-navy px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white hover:bg-navy-deep"
                          >
                            {lang === "fr" ? "Résultats" : "Results"}
                            <ExternalLink className="size-3.5 text-sport-foreground" />
                          </a>
                          <button
                            type="button"
                            onClick={() => toggleSelectedTeam(entry.legacyScheduleTeamId)}
                            className={cn(
                              "premium-control col-span-2 flex min-h-10 items-center justify-between border px-3 text-[9px] font-bold uppercase tracking-[0.1em]",
                              isTeamSelected(entry.legacyScheduleTeamId)
                                ? "border-sport bg-sport text-sport-foreground"
                                : "border-navy/12 bg-background text-navy hover:border-sport",
                            )}
                          >
                            <span>{isTeamSelected(entry.legacyScheduleTeamId)
                              ? (lang === "fr" ? "Dans mes équipes" : "In my teams")
                              : (lang === "fr" ? "Ajouter à mes équipes" : "Add to my teams")}</span>
                            {isTeamSelected(entry.legacyScheduleTeamId)
                              ? <BookmarkCheck className="size-3.5" />
                              : <Bookmark className="size-3.5" />}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-navy/10 bg-ice px-5 py-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Source officielle externe : la surface publique AHMV « Horaire et Classements ». Les scores et classements ne sont pas inventés ni recopiés manuellement dans ce portail."
                : "Official external source: AHMV’s public “Schedule and Standings” surface. Scores and standings are not invented or manually duplicated in this portal."}
            </p>
          </div>
        </section>

        <div className="mt-9 flex flex-col gap-4 border-t-2 border-navy pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-sport">{lang === "fr" ? "Répertoire des catégories" : "Category directory"}</p>
            {selectedTeamIds.length > 0 && !showAllDirectory && (
              <p className="mt-1 text-sm text-muted-foreground">
                {lang === "fr" ? "Seules les catégories de vos équipes sont affichées." : "Only categories containing your teams are shown."}
              </p>
            )}
          </div>
          {selectedTeamIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAllDirectory((value) => !value)}
              className="premium-control min-h-11 border border-navy/12 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:border-sport"
            >
              {showAllDirectory
                ? (lang === "fr" ? "Afficher seulement mes catégories" : "Show only my categories")
                : (lang === "fr" ? "Voir toutes les catégories" : "View all categories")}
            </button>
          )}
        </div>
        <div className="border-t border-navy/12">
          {categoriesToRender.map((team, index) => {
            const saved = preferredTeam === team.slug;
            const publicTeams = teamsForCategory(team.slug);
            return (
              <article
                key={team.slug}
                className={cn(
                  "interactive-surface group grid border-b border-navy/12 md:grid-cols-[5rem_8rem_minmax(0,1fr)_13rem] md:items-stretch",
                  saved && "bg-sport/[0.045]",
                )}
              >
                <div className="flex items-center py-5 md:border-r md:border-navy/10 md:py-7">
                  <span className="font-display text-4xl font-extrabold tracking-[-0.06em] text-navy/12">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <Link
                  to="/equipes/$slug"
                  params={{ slug: team.slug }}
                  className="flex items-center md:border-r md:border-navy/10 md:px-5"
                >
                  <span className="font-display text-5xl font-extrabold uppercase leading-none tracking-[-0.04em] text-navy transition-colors group-hover:text-sport">
                    {team.code}
                  </span>
                </Link>

                <Link to="/equipes/$slug" params={{ slug: team.slug }} className="py-5 md:px-6 md:py-7">
                  <div className="flex flex-wrap items-center gap-2">
                    {saved && (
                      <span className="bg-sport px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-sport-foreground">
                        {lang === "fr" ? "Ma catégorie" : "My category"}
                      </span>
                    )}
                    {publicTeams.length > 0 && (
                      <span className="border border-navy/12 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        {publicTeams.length} {lang === "fr" ? "équipe(s) publique(s)" : "public team(s)"}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.9] text-navy md:text-4xl">
                    {l(team.name)}
                  </h2>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-sport">
                    {t("teams.ages")} · {l(team.ages)}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{l(team.description)}</p>
                </Link>

                <div className="flex flex-col justify-center gap-2 border-t border-navy/10 py-4 md:border-l md:border-t-0 md:px-5">
                  <Link
                    to="/equipes/$slug"
                    params={{ slug: team.slug }}
                    className="premium-control inline-flex min-h-11 items-center justify-between border border-navy/12 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-navy hover:border-sport hover:text-sport"
                  >
                    {lang === "fr" ? "Ouvrir" : "Open"} <ArrowRight className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => savePreferredTeam(saved ? "" : team.slug)}
                    className={cn(
                      "premium-control min-h-11 border px-3 text-[10px] font-bold uppercase tracking-[0.13em]",
                      saved
                        ? "border-sport bg-sport text-sport-foreground"
                        : "border-navy/12 bg-background text-navy hover:border-sport",
                    )}
                  >
                    {saved
                      ? (lang === "fr" ? "Mémorisée ✓" : "Saved ✓")
                      : (lang === "fr" ? "Définir comme mienne" : "Set as mine")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
