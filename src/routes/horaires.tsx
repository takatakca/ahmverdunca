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
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { officialScheduleQueryForTeam } from "@/lib/official-schedule-team";
import { legacyTeamScheduleUrl, officialTeamResultsUrl, publicTeamHubUrl } from "@/data/team-directory";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

export const Route = createFileRoute("/horaires")({
  head: () => ({
    links: canonicalLink("/horaires"),
    meta: [
      { title: "Horaires — AHM Verdun" },
      { name: "description", content: "Horaire hebdomadaire publié par l'AHM Verdun, recherche rapide et accès aux calendriers sportifs officiels." },
      { property: "og:title", content: "Horaires — AHM Verdun" },
      { property: "og:description", content: "Consultez l'horaire hebdomadaire AHMV et accédez aux calendriers sportifs officiels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { t, lang } = useI18n();
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
    <>
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
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[340px]">
            <img
              src={OFFICIAL_MEDIA.tournamentM11Primary.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.tournamentM11Primary.alt.fr : OFFICIAL_MEDIA.tournamentM11Primary.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
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
          </div>

          <div className="flex flex-col justify-center border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Priorité aux données officielles" : "Official data first"}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              {lang === "fr"
                ? "La recherche ci-dessous utilise uniquement l’horaire hebdomadaire publié. Pour une partie, un score ou un classement, ouvrez directement le calendrier officiel de l’équipe."
                : "The search below uses only the published weekly schedule. For a game, score or standing, open the team’s official calendar directly."}
            </p>
          </div>
        </section>

        {selectedTeams.length > 0 && (
          <section className="mb-6 overflow-hidden border border-sport/30 bg-background">
            <div className="grid bg-competition text-white lg:grid-cols-[1fr_auto]">
              <div className="p-5 md:p-6">
                <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Portail parent" : "Parent portal"}</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9]">
                  {lang === "fr" ? "Mes équipes — accès direct" : "My teams — direct access"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-white/62">
                  {lang === "fr"
                    ? "Les raccourcis utilisent l’identifiant public exact de chaque équipe enregistrée sur cet appareil."
                    : "These shortcuts use the exact public identifier for every team saved on this device."}
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

            <div className="grid gap-px bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
              {selectedTeams.map((entry) => (
                <article key={entry.legacyScheduleTeamId} className="flex min-h-44 flex-col bg-background p-4">
                  <div>
                    <p className="eyebrow text-sport">{entry.level}</p>
                    <p className="mt-2 font-display text-xl font-extrabold uppercase leading-[0.9] text-navy">{entry.name}</p>
                  </div>
                  <div className="mt-auto grid grid-cols-3 gap-2 pt-5">
                    <a
                      href={publicTeamHubUrl(entry)}
                      className="premium-control flex min-h-10 items-center justify-center border border-navy/12 px-2 text-center text-[8px] font-bold uppercase tracking-[0.08em] text-navy hover:border-sport"
                    >
                      {lang === "fr" ? "Équipe" : "Team"}
                    </a>
                    <a
                      href={legacyTeamScheduleUrl(entry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="premium-control flex min-h-10 items-center justify-center border border-navy/12 px-2 text-center text-[8px] font-bold uppercase tracking-[0.08em] text-navy hover:border-sport"
                    >
                      {lang === "fr" ? "Horaire" : "Schedule"}
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

        <section className="mb-6 overflow-hidden border border-navy/12 bg-background">
          <div className="border-b border-border bg-ice px-5 py-4 md:px-6">
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Horaires et classements officiels" : "Official schedules and standings"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Besoin de la donnée sportive officielle maintenant? Choisissez votre circuit."
                : "Need official sport data right now? Choose your circuit."}
            </p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 md:p-6">
            <Button asChild variant="outline" className="h-auto min-h-12 justify-between py-3">
              <a href={EXTERNAL_LINKS.officialSimpleLetterSchedule} target="_blank" rel="noopener noreferrer">
                <span>{lang === "fr" ? "Simple lettre" : "Single letter"}</span>
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-12 justify-between py-3">
              <a href={EXTERNAL_LINKS.officialDoubleLetterSchedule} target="_blank" rel="noopener noreferrer">
                <span>{lang === "fr" ? "Double lettre AA/BB" : "Double letter AA/BB"}</span>
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-12 justify-between py-3">
              <a href={EXTERNAL_LINKS.officialGirlsSchedule} target="_blank" rel="noopener noreferrer">
                <span>{lang === "fr" ? "Hockey féminin" : "Girls' hockey"}</span>
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-12 justify-between py-3">
              <a href={EXTERNAL_LINKS.legacyTeamNotifications} target="_blank" rel="noopener noreferrer">
                <span>{lang === "fr" ? "Notifications d’équipe" : "Team notifications"}</span>
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </section>

        <OfficialWeekSchedule initialQuery={officialInitialQuery} />

        <HouseSponsorSlot placement="schedule-after-official" count={1} compact className="mt-8" />
      </div>
    </>
  );
}
