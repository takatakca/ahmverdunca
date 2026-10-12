import { canonicalLink } from "@/lib/seo";
import { useEffect } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, ChevronDown } from "lucide-react";
import { OfficialWeekSchedule } from "@/components/official-week-schedule";
import { ScheduleTeamCarousel } from "@/components/schedule-team-carousel";
import { CURRENT_TEAMS } from "@/data/teams";
import { ARENAS } from "@/data/arenas";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { EXTERNAL_LINKS } from "@/lib/site";
import { publicUploadedAhmvMediaById } from "@/data/uploaded-media";
import { officialScheduleQueryForTeam } from "@/lib/official-schedule-team";
import { publicTeamHubUrl, teamsForCategory } from "@/data/team-directory";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

// Meta must remain rooted in authorized AHMV imagery, not a dated week poster.
const SCHEDULE_VISUAL = publicUploadedAhmvMediaById(2)!;
const FEMALE_DIRECTORY_ENTRIES = teamsForCategory("feminin");

export const Route = createFileRoute("/horaires")({
  head: () => ({
    links: canonicalLink("/horaires"),
    meta: [
      { title: "Horaires — AHM Verdun" },
      { name: "description", content: "Choisissez votre équipe AHM Verdun et consultez rapidement les horaires hebdomadaires publiés." },
      { property: "og:title", content: "Horaires — AHM Verdun" },
      { property: "og:image", content: SCHEDULE_VISUAL.url },
      { property: "og:description", content: "Choisissez une catégorie de hockey et consultez les horaires officiels AHMV." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { lang } = useI18n();
  const { preferredTeam, savePreferredTeam, selectedTeams } = usePreferredTeam();
  const search = useRouterState({ select: (state) => state.location.search }) as Record<string, unknown>;

  const selectedTeam =
    typeof search["team"] === "string" && CURRENT_TEAMS.some((item) => item.slug === search["team"])
      ? search["team"]
      : undefined;
  const selectedArena =
    typeof search["arena"] === "string"
      ? ARENAS.find((item) => item.slug === search["arena"])
      : undefined;
  const searchQuery = typeof search["q"] === "string" ? search["q"].trim() : "";
  const scheduleTeamSlug = selectedTeam ?? preferredTeam;
  const scheduleTeam = CURRENT_TEAMS.find((item) => item.slug === scheduleTeamSlug);
  const officialInitialQuery =
    searchQuery ||
    (selectedArena ? selectedArena.name : "") ||
    officialScheduleQueryForTeam(scheduleTeam);

  useEffect(() => {
    if (selectedTeam) savePreferredTeam(selectedTeam);
  }, [selectedTeam, savePreferredTeam]);

  return (
    <div className="min-w-0 bg-navy-deep pb-8 text-white">
      {/* No large hero/poster before choosing the team: the primary user action comes first. */}
      <header className="container-site pt-5 sm:pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#146f8a] text-white" aria-hidden="true">
            <CalendarDays className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-[clamp(2rem,5vw,3.3rem)] font-black uppercase leading-none tracking-tight">
              {lang === "fr" ? "Horaires" : "Schedules"}
            </h1>
            <p className="mt-1 text-sm font-medium text-white/76">
              {lang === "fr" ? "Votre équipe. Votre prochaine glace." : "Your team. Your next ice time."}
            </p>
          </div>
        </div>
      </header>

      <div className="container-site pt-6 sm:pt-8">
        <ScheduleTeamCarousel lang={lang} selectedTeamSlug={scheduleTeamSlug} />

        {scheduleTeamSlug === "feminin" && (
          <section data-ahmv-feminine-team-choices aria-labelledby="feminine-choices-heading" className="mt-5 rounded-2xl border border-[#8cebe3]/30 bg-[#153253] p-4 sm:p-5">
            <h3 id="feminine-choices-heading" className="font-display text-xl font-black uppercase leading-tight">
              {lang === "fr" ? "Les Louves" : "Louves teams"}
            </h3>
            <p className="mt-1 text-sm leading-6 text-white/75">
              {lang === "fr"
                ? "Choisissez une équipe précise. Les heures M12B attendent leur validation officielle."
                : "Choose an exact team. U12B game times still require official validation."}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="/equipes/louves-m12b"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#86f4e6] px-4 text-sm font-extrabold text-[#0d3041] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b2fff6]"
              >
                {lang === "fr" ? "Louves M12B · Microsite" : "Louves U12B · Team hub"}
                <ArrowUpRight aria-hidden="true" className="size-5" />
              </a>
              {FEMALE_DIRECTORY_ENTRIES.map((entry) => (
                <a
                  key={entry.legacyScheduleTeamId}
                  href={publicTeamHubUrl(entry)}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-4 text-sm font-bold text-white hover:border-[#86f4e6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b2fff6]"
                >
                  {lang === "fr" ? "Louves M12A · Répertoire historique" : "Louves U12A · Historical directory"}
                  <ArrowUpRight aria-hidden="true" className="size-5" />
                </a>
              ))}
            </div>
          </section>
        )}

        <section id="horaire-publie" className="mt-6 scroll-mt-28 sm:mt-8" aria-label={lang === "fr" ? "Horaire publié" : "Published schedule"}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#89ede3]">
                {lang === "fr" ? "Les activités publiées" : "Published activities"}
              </p>
              <h2 className="mt-1 font-display text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
                {scheduleTeam
                  ? (lang === "fr" ? `Horaire · ${scheduleTeam.name.fr}` : `Schedule · ${scheduleTeam.name.en}`)
                  : (lang === "fr" ? "Horaire de la semaine" : "This week's schedule")}
              </h2>
            </div>
            {scheduleTeam && (
              <a
                href="/horaires#horaire-publie"
                onClick={() => savePreferredTeam("")}
                className="inline-flex min-h-11 items-center rounded-xl border border-white/35 px-4 text-sm font-bold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8cebe3]"
              >
                {lang === "fr" ? "Voir toutes les équipes" : "Show all teams"}
              </a>
            )}
          </div>

          <OfficialWeekSchedule initialQuery={officialInitialQuery} />
        </section>

        {/* Optional links stay available without preceding the schedule. */}
        <details className="group mt-7 overflow-hidden rounded-2xl border border-white/20 bg-[#102848]">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-base font-bold text-white marker:hidden hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8cebe3] [&::-webkit-details-marker]:hidden">
              {lang === "fr" ? "Mes équipes et autres calendriers" : "My teams and other calendars"}
              <ChevronDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="border-t border-white/15 px-5 py-5">
              {selectedTeams.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-white/85">{lang === "fr" ? "Mes équipes enregistrées" : "Saved teams"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTeams.map((entry) => (
                      <a
                        key={entry.legacyScheduleTeamId}
                        href={publicTeamHubUrl(entry)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8cebe3]"
                      >
                        {entry.name} · {entry.level}
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                      </a>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-white/65">
                    {lang === "fr"
                      ? "Les équipes enregistrées conservent leurs liens individuels; les pointages publiés restent accessibles dans chaque page d’équipe."
                      : "Saved teams retain individual links; published results are accessible from each team page."}
                  </p>
                </div>
              )}
              <p className={`${selectedTeams.length ? "mt-5" : ""} text-sm font-bold text-white/85`}>
                {lang === "fr" ? "Circuits et renseignements officiels" : "Official circuits and resources"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { href: EXTERNAL_LINKS.officialSimpleLetterSchedule, fr: "Simple lettre", en: "Single letter" },
                  { href: EXTERNAL_LINKS.officialDoubleLetterSchedule, fr: "AA / BB", en: "AA / BB" },
                  { href: EXTERNAL_LINKS.officialGirlsSchedule, fr: "Féminin", en: "Girls" },
                  { href: EXTERNAL_LINKS.legacyTeamNotifications, fr: "Notifications", en: "Notifications" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-semibold text-white hover:border-[#89ede3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8cebe3]"
                  >
                    {lang === "fr" ? link.fr : link.en}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </details>

        <HouseSponsorSlot placement="schedule-after-official" count={1} compact className="mt-8" />
      </div>
    </div>
  );
}
