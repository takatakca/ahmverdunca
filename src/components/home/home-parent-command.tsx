import { ChevronRight, MapPin, Trophy, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import {
  officialTeamResultsUrl,
  publicTeamHubUrl,
} from "@/data/team-directory";
import { teamVisualForCategory } from "@/data/team-visuals";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";
import { OFFICIAL_WEEK_ACTIVITIES } from "@/data/official-week";
import { officialWeekActivityMatchesPublicTeam } from "@/lib/official-schedule-team";
import { montrealDateKey } from "@/lib/montreal-date";

export function HomeParentCommand() {
  const { lang } = useI18n();
  const { selectedTeams } = usePreferredTeam();
  const introMedia = uploadedAhmvMediaById(52);
  const today = montrealDateKey();
  return (
    <section className="border-y border-white/10 bg-competition py-7 text-white md:py-10">
      <div className="container-site">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
            {lang === "fr" ? "Mes équipes" : "My teams"}
          </h2>
          <a
            href="#mon-equipe"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-sport-foreground"
          >
            {lang === "fr" ? "Ajouter une équipe" : "Add a team"}
            <ChevronRight className="size-4" />
          </a>
        </div>
        {selectedTeams.length ? (
          <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {selectedTeams.map((team) => {
              const visual = teamVisualForCategory(team.categorySlug);
              const nextActivity = OFFICIAL_WEEK_ACTIVITIES.find(
                (item) => item.date >= today && officialWeekActivityMatchesPublicTeam(item, team),
              );
              const nextDay = nextActivity
                ? new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", { weekday: "short" })
                    .format(new Date(`${nextActivity.date}T12:00:00-04:00`))
                    .replace(".", "")
                    .toUpperCase()
                : undefined;
              return (
                <article
                  key={team.legacyScheduleTeamId}
                  className="w-[min(85vw,24rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/12 bg-navy-deep"
                >
                  <a
                    href={publicTeamHubUrl(team)}
                    className="group relative block h-40 overflow-hidden"
                  >
                    {visual && (
                      <img
                        src={visual.url}
                        alt={visual.alt[lang]}
                        loading="lazy"
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/20 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="text-xs font-semibold text-sport-foreground">
                        {team.categorySlug.toUpperCase()} · {team.level}
                      </p>
                      <h3 className="mt-1 font-display text-2xl font-extrabold uppercase">
                        {team.name}
                      </h3>
                    </div>
                    <ChevronRight
                      className="absolute right-4 top-4 size-5 text-white"
                      aria-hidden
                    />
                  </a>
                  {nextActivity && (
                    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 border-t border-white/10 bg-navy px-4 py-3">
                      <div>
                        <p className="font-display text-xl font-extrabold uppercase text-sport-foreground">{nextDay}</p>
                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/42">{nextActivity.start}</p>
                      </div>
                      <div className="min-w-0 border-l border-white/10 pl-3">
                        <p className="truncate text-xs font-semibold uppercase tracking-[0.06em] text-white">{nextActivity.activity}</p>
                        <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-white/48">
                          <MapPin className="size-3 shrink-0 text-sport-foreground" />
                          {nextActivity.venue}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10">
                    {[
                      {
                        href: publicTeamHubUrl(team),
                        icon: Users,
                        fr: "Mon équipe",
                        en: "My team",
                      },
                      {
                        href: officialTeamResultsUrl(team),
                        icon: Trophy,
                        fr: "Résultats",
                        en: "Results",
                        external: true,
                      },
                    ].map(({ href, icon: Icon, fr, en, external }) => (
                      <a
                        key={fr}
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="flex min-h-14 items-center justify-center gap-2 bg-navy-deep text-xs font-semibold hover:bg-navy"
                      >
                        <Icon className="size-4 text-sport-foreground" />
                        {lang === "fr" ? fr : en}
                      </a>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <a
            href="#mon-equipe"
            className="group relative flex min-h-48 items-end overflow-hidden rounded-2xl border border-white/12 p-5"
          >
            {introMedia && (
              <img
                src={introMedia.url}
                alt={introMedia.alt[lang]}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform group-hover:scale-[1.03]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 to-navy-deep/20" />
            <span className="relative flex w-full items-center justify-between gap-4">
              <span className="font-display text-3xl font-extrabold uppercase">
                {lang === "fr" ? "Trouver mes équipes" : "Find my teams"}
              </span>
              <ChevronRight className="size-6 text-sport-foreground" />
            </span>
          </a>
        )}
      </div>
    </section>
  );
}
