import { ArenaTripCard } from "@/components/arena-trip-card";
import { Link } from "@tanstack/react-router";
import { ExternalLink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HAS_NEWER_PUBLISHED_SCHEDULE,
  LATEST_PUBLISHED_SCHEDULE_DOCUMENT,
  OFFICIAL_WEEK_ACTIVITIES,
  OFFICIAL_WEEK_META,
} from "@/data/official-week";
import { TEAMS } from "@/data/teams";
import { formatDate, useI18n } from "@/lib/i18n";
import { montrealDateKey, montrealTimeKey } from "@/lib/montreal-date";
import { usePreferredTeam } from "@/lib/team-preference";
import { officialScheduleTermsForTeam } from "@/lib/official-schedule-team";
import { cn } from "@/lib/utils";

function displayTime(value: string) {
  const [hourRaw, minute] = value.split(":");
  const hour = Number(hourRaw);
  if (Number.isNaN(hour)) return value;
  return minute === "00" ? `${hour} h` : `${hour} h ${minute}`;
}

export function OfficialWeekPreview() {
  const { lang, l } = useI18n();
  const { preferredTeam } = usePreferredTeam();
  const today = montrealDateKey();
  const nowTime = montrealTimeKey();

  const inPublishedWeek =
    today >= OFFICIAL_WEEK_META.start && today <= OFFICIAL_WEEK_META.end;

  const upcomingOfficialDocument =
    HAS_NEWER_PUBLISHED_SCHEDULE ? LATEST_PUBLISHED_SCHEDULE_DOCUMENT : null;
  const upcomingRangeLabel = upcomingOfficialDocument
    ? `${formatDate(upcomingOfficialDocument.start, lang, { day: "numeric", month: "long" })} — ${formatDate(
        upcomingOfficialDocument.end,
        lang,
        { day: "numeric", month: "long", year: "numeric" },
      )}`
    : "";

  const savedTeam = TEAMS.find((item) => item.slug === preferredTeam);
  const savedTerms = officialScheduleTermsForTeam(savedTeam).map((term) => term.toUpperCase());

  const upcoming = inPublishedWeek
    ? OFFICIAL_WEEK_ACTIVITIES.filter(
        (item) => item.date > today || (item.date === today && item.end > nowTime),
      )
    : [];

  const personalized = savedTerms.length
    ? upcoming.filter((item) => {
        const group = item.group.toUpperCase();
        return savedTerms.some((term) => group.includes(term));
      })
    : [];

  const relevant = personalized.length > 0 ? personalized.slice(0, 4) : upcoming.slice(0, 6);
  const isPersonalized = personalized.length > 0 && savedTeam;

  return (
    <section className="competition-panel relative overflow-hidden py-10 text-navy-foreground md:py-14">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden />
      <div className="container-site relative">
        {upcomingOfficialDocument ? (
          <a
            href={upcomingOfficialDocument.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive-surface mb-6 flex flex-col gap-4 border border-sport/45 bg-sport/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Prochaine semaine publiée" : "Next published week"}
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-none text-white">
                {lang === "fr"
                  ? `Semaine ${upcomingOfficialDocument.week} · ${upcomingRangeLabel}`
                  : `Week ${upcomingOfficialDocument.week} · ${upcomingRangeLabel}`}
              </p>

            </div>
            <span className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 bg-sport px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
              {lang === "fr" ? "Ouvrir le PDF" : "Open PDF"}
              <ExternalLink className="size-3.5" />
            </span>
          </a>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>

            <h2 className="mt-2 font-display text-[clamp(2.4rem,5.2vw,4.8rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.03em]">
              {isPersonalized
                ? lang === "fr"
                  ? `${savedTeam.code === "F" ? l(savedTeam.name) : savedTeam.code} · Cette semaine`
                  : `${savedTeam.code === "F" ? l(savedTeam.name) : savedTeam.code} · This week`
                : lang === "fr"
                  ? "Cette semaine à AHM Verdun"
                  : "This week at AHM Verdun"}
            </h2>

          </div>

          <Button asChild variant="outline-light">
            <Link to="/horaires" search={savedTeam ? { team: savedTeam.slug } : {}}>
              {isPersonalized
                ? lang === "fr"
                  ? "Voir tout mon horaire"
                  : "View my full schedule"
                : lang === "fr"
                  ? "Voir tous les horaires"
                  : "View all schedules"}
            </Link>
          </Button>
        </div>

        {relevant.length ? (
          <div className="mt-7 grid gap-3 lg:grid-cols-2">
            {relevant.map((item) => {
              const cancelled = item.status === "cancelled";
              return (
                <article
                  key={item.id}
                  className={cn(
                    "interactive-surface border border-white/12 bg-navy-deep p-5 text-white",
                    cancelled && "border-status-cancelled/50 bg-status-cancelled-soft",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow text-sport">
                        {item.date === today
                          ? lang === "fr"
                            ? "Aujourd'hui"
                            : "Today"
                          : formatDate(item.date, lang, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                      </p>
                      <p
                        className={cn(
                          "mt-1 font-display text-2xl font-extrabold tabular-nums text-white",
                          cancelled && "text-status-cancelled line-through decoration-2",
                        )}
                      >
                        {displayTime(item.start)} – {displayTime(item.end)}
                      </p>
                    </div>
                    {cancelled && (
                      <span className="inline-flex shrink-0 items-center gap-1 bg-status-cancelled px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        <XCircle className="size-3" aria-hidden />
                        {lang === "fr" ? "Annulée" : "Cancelled"}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-xl font-bold uppercase">{item.group}</h3>
                  <p className="mt-1 text-sm font-semibold text-sport-foreground">{item.activity}</p>

                  <div className="mt-4"><ArenaTripCard venue={item.venue} /></div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 border border-navy-foreground/15 bg-navy-foreground/[0.04] p-5">
            <p className="text-sm text-navy-foreground/75">
              {lang === "fr"
                ? "Le dernier PDF hebdomadaire intégré n'est plus dans sa semaine active. Ouvrez Horaires pour consulter les liens officiels."
                : "The last integrated weekly PDF is no longer in its active week. Open Schedules for the official links."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
