import { canonicalLink } from "@/lib/seo";
import { useEffect } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { OfficialWeekSchedule } from "@/components/official-week-schedule";
import { Button } from "@/components/ui/button";
import { TEAMS } from "@/data/teams";
import { ARENAS } from "@/data/arenas";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { EXTERNAL_LINKS } from "@/lib/site";
import { publicUploadedAhmvMediaById } from "@/data/uploaded-media";
import { officialScheduleQueryForTeam } from "@/lib/official-schedule-team";
import { officialTeamResultsUrl, publicTeamHubUrl, publicTeamScheduleUrl } from "@/data/team-directory";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { MediaZoomTrigger } from "@/components/media/media-zoom-trigger";

// A dated poster can contradict the active week; use an approved practice photo.
const SCHEDULE_VISUAL = publicUploadedAhmvMediaById(2)!;

export const Route = createFileRoute("/horaires")({
  head: () => ({
    links: canonicalLink("/horaires"),
    meta: [
      { title: "Horaires — AHM Verdun" },
      { name: "description", content: "Horaire hebdomadaire publié par l'AHM Verdun, recherche rapide et accès aux calendriers sportifs officiels." },
      { property: "og:title", content: "Horaires — AHM Verdun" },
      { property: "og:image", content: SCHEDULE_VISUAL.url },
      { property: "og:description", content: "Consultez l'horaire hebdomadaire AHMV et accédez aux calendriers sportifs officiels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { t, lang } = useI18n();
  const weeklyScheduleVisual = SCHEDULE_VISUAL;
  const { preferredTeam, savePreferredTeam, selectedTeams } = usePreferredTeam();
  const search = useRouterState({ select: (state) => state.location.search }) as Record<string, unknown>;

  const selectedTeam =
    typeof search["team"] === "string" && TEAMS.some((item) => item.slug === search["team"])
      ? search["team"]
      : undefined;

  const selectedArena =
    typeof search["arena"] === "string"
      ? ARENAS.find((item) => item.slug === search["arena"])
      : undefined;

  const searchQuery = typeof search["q"] === "string" ? search["q"].trim() : "";
  const scheduleTeamSlug = selectedTeam ?? preferredTeam;
  const scheduleTeam = TEAMS.find((item) => item.slug === scheduleTeamSlug);
  const officialInitialQuery =
    searchQuery ||
    (selectedArena ? selectedArena.name : "") ||
    officialScheduleQueryForTeam(scheduleTeam);

  useEffect(() => {
    if (selectedTeam) savePreferredTeam(selectedTeam);
  }, [selectedTeam, savePreferredTeam]);

  return (
    <div className="bg-navy-deep text-white">
      <PageHeader
        eyebrow={lang === "fr" ? "Accès rapide" : "Quick access"}
        title={t("schedule.title")}
        description={
          lang === "fr"
            ? "Une seule page pour l’horaire hebdomadaire publié par AHM Verdun et les calendriers sportifs officiels de votre circuit."
            : "One page for AHM Verdun’s published weekly schedule and your circuit’s official sport calendars."
        }
      />

      <div className="container-site py-8 md:py-12">
        <section className="mb-6 grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.15fr_0.85fr]">
          <MediaZoomTrigger
            items={[weeklyScheduleVisual]}
            lang={lang}
            className="relative min-h-[280px] overflow-hidden sm:min-h-[340px]"
          >
            <img
              src={weeklyScheduleVisual.url}
              alt={lang === "fr" ? weeklyScheduleVisual.alt.fr : weeklyScheduleVisual.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full bg-navy-deep object-contain p-3 transition-transform duration-700 group-hover:scale-[1.012] sm:p-5"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.88))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "La semaine hockey en un coup d’œil" : "Your hockey week at a glance"}
              </p>
              <p className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-5xl">
                {lang === "fr" ? "Trouvez votre équipe. Trouvez votre glace." : "Find your team. Find your ice."}
              </p>
            </div>
          </MediaZoomTrigger>

          <div className="flex flex-col justify-center border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Votre semaine" : "Your week"}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
              {lang === "fr"
                ? "Pratiques, matchs, arénas et résultats : l’essentiel est regroupé ici."
                : "Practices, games, arenas and results: the essentials are grouped here."}
            </p>
          </div>
        </section>

        {selectedTeams.length > 0 && (
          <section className="mb-6 overflow-hidden border border-sport/30 bg-navy-deep text-white">
            <div className="grid bg-competition text-white lg:grid-cols-[1fr_auto]">
              <div className="p-5 md:p-6">
                <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Mes équipes" : "My teams"}</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9]">
                  {lang === "fr" ? "Mes équipes — accès direct" : "My teams — direct access"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-white/62">
                  {lang === "fr"
                    ? "Retrouvez ici les équipes que vous avez enregistrées et ouvrez directement leur horaire, leur page et leurs résultats."
                    : "Find your saved teams here and open their schedule, team page and results directly."}
                </p>
              </div>
              <div className="flex items-center border-t border-white/12 p-5 lg:border-l lg:border-t-0">
                <a
                  href="/equipes"
                  className="premium-control min-h-11 border border-white/18 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:border-sport"
                >
                  {lang === "fr" ? "Gérer mes équipes" : "Manage my teams"}
                </a>
              </div>
            </div>

            <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto bg-navy/10 p-3 sm:grid sm:grid-cols-2 sm:gap-px sm:overflow-visible sm:p-0 lg:grid-cols-3">
              {selectedTeams.map((entry) => (
                <article key={entry.legacyScheduleTeamId} className="flex min-h-44 w-[82vw] max-w-[23rem] shrink-0 snap-center flex-col bg-competition p-4 text-white sm:w-auto sm:max-w-none">
                  <div>
                    <p className="eyebrow text-sport-foreground">{entry.level}</p>
                    <p className="mt-2 font-display text-xl font-extrabold uppercase leading-[0.9] text-white">{entry.name}</p>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                    <a
                      href={publicTeamHubUrl(entry)}
                      className="premium-control flex min-h-10 items-center justify-center border border-white/12 px-2 text-center text-[8px] font-bold uppercase tracking-[0.08em] text-white/75 hover:border-sport hover:text-white"
                    >
                      {lang === "fr" ? "Équipe" : "Team"}
                    </a>
                    <a
                      href={officialTeamResultsUrl(entry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="premium-control flex min-h-10 items-center justify-center bg-navy px-2 text-center text-[8px] font-bold uppercase tracking-[0.08em] text-white"
                    >
                      {lang === "fr" ? "Résultats" : "Results"}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mb-6 overflow-hidden border-y border-white/10 bg-competition text-white">
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div>
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Circuits hockey" : "Hockey circuits"}
              </p>
              <p className="mt-1 text-sm text-white/55">
                {lang === "fr" ? "Accès direct selon votre équipe." : "Direct access for your team."}
              </p>
            </div>
            <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:pb-0">
              {[
                { href: EXTERNAL_LINKS.officialSimpleLetterSchedule, fr: "Simple lettre", en: "Single letter" },
                { href: EXTERNAL_LINKS.officialDoubleLetterSchedule, fr: "AA / BB", en: "AA / BB" },
                { href: EXTERNAL_LINKS.officialGirlsSchedule, fr: "Féminin", en: "Girls" },
                { href: EXTERNAL_LINKS.legacyTeamNotifications, fr: "Notifications", en: "Notifications" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-control inline-flex min-h-10 shrink-0 items-center gap-2 border border-white/14 bg-white/[0.035] px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white hover:border-sport"
                >
                  {lang === "fr" ? item.fr : item.en}
                  <ExternalLink className="size-3.5 text-sport-foreground" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <OfficialWeekSchedule initialQuery={officialInitialQuery} />

        <HouseSponsorSlot placement="schedule-after-official" count={1} compact className="mt-8" />
      </div>
    </div>
  );
}
