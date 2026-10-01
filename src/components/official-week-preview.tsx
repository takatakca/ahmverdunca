import { Link } from "@tanstack/react-router";
import { ExternalLink, MapPin, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OFFICIAL_WEEK_ACTIVITIES,
  OFFICIAL_WEEK_META,
} from "@/data/official-week";
import { TEAMS } from "@/data/teams";
import { formatDate, useI18n } from "@/lib/i18n";
import { montrealDateKey, montrealTimeKey } from "@/lib/montreal-date";
import { mapsDirectionsUrl } from "@/lib/site";
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
    <section className="competition-panel py-12 text-navy-foreground md:py-16">
      <div className="container-site">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-sport-foreground">
              {inPublishedWeek
                ? isPersonalized
                  ? lang === "fr"
                    ? "Votre horaire officiel"
                    : "Your official schedule"
                  : lang === "fr"
                    ? "Horaire officiel de la semaine"
                    : "Official weekly schedule"
                : lang === "fr"
                  ? "Horaires"
                  : "Schedules"}
            </p>
            <h2 className="heading-section mt-2">
              {isPersonalized
                ? lang === "fr"
                  ? `${savedTeam.code === "F" ? l(savedTeam.name) : savedTeam.code} · Cette semaine`
                  : `${savedTeam.code === "F" ? l(savedTeam.name) : savedTeam.code} · This week`
                : lang === "fr"
                  ? "Cette semaine à AHM Verdun"
                  : "This week at AHM Verdun"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-navy-foreground/70">
              {inPublishedWeek
                ? isPersonalized
                  ? lang === "fr"
                    ? `Votre catégorie mémorisée (${l(savedTeam.name)}) est priorisée à partir du PDF hebdomadaire AHMV publié le 29 septembre 2026.`
                    : `Your saved category (${l(savedTeam.name)}) is prioritized from the AHMV weekly PDF published September 29, 2026.`
                  : lang === "fr"
                    ? "Données transcrites du PDF hebdomadaire AHMV publié le 29 septembre 2026."
                    : "Data transcribed from the AHMV weekly PDF published September 29, 2026."
                : lang === "fr"
                  ? "Consultez la page Horaires pour accéder aux sources officielles les plus récentes."
                  : "Open the Schedules page for the latest official sources."}
            </p>
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
                    "rounded-lg border border-navy-foreground/15 bg-background p-4 text-foreground shadow-card",
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
                          "mt-1 font-display text-2xl font-extrabold tabular-nums text-navy",
                          cancelled && "text-status-cancelled line-through decoration-2",
                        )}
                      >
                        {displayTime(item.start)} – {displayTime(item.end)}
                      </p>
                    </div>
                    {cancelled && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-status-cancelled px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        <XCircle className="size-3" aria-hidden />
                        {lang === "fr" ? "Annulée" : "Cancelled"}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-xl font-bold uppercase">{item.group}</h3>
                  <p className="mt-1 text-sm font-semibold text-sport">{item.activity}</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{item.venue}</span>
                    </p>
                    <a
                      href={mapsDirectionsUrl(item.venue)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sport hover:underline"
                    >
                      {lang === "fr" ? "Itinéraire" : "Directions"} <ExternalLink className="size-3" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 rounded-lg border border-navy-foreground/15 bg-navy-foreground/[0.04] p-5">
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
