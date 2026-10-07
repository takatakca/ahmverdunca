import { TeamPicker } from "@/components/team-picker";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEAMS, CURRENT_TEAMS } from "@/data/teams";
import { arenaDirectionsTargetForVenue } from "@/data/arenas";
import { OFFICIAL_WEEK_ACTIVITIES } from "@/data/official-week";
import { formatDate, useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { montrealDateKey, montrealTimeKey } from "@/lib/montreal-date";
import { mapsDirectionsUrl } from "@/lib/site";

export function ScheduleFinder() {
  const { lang, l } = useI18n();
  const { preferredTeam, savePreferredTeam } = usePreferredTeam();
  const [team, setTeam] = useState("");

  useEffect(() => {
    setTeam(preferredTeam);
  }, [preferredTeam]);

  const selected = TEAMS.find((item) => item.slug === team);
  const today = montrealDateKey();
  const nowTime = montrealTimeKey();
  const nextActivity =
    selected?.code.startsWith("M")
      ? OFFICIAL_WEEK_ACTIVITIES
          .filter((item) => item.group.toUpperCase().includes(selected.code.toUpperCase()))
          .filter((item) => item.date > today || (item.date === today && item.end >= nowTime))
          .sort((a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`))[0]
      : undefined;

  return (
    <section
      id="mon-equipe"
      className="relative overflow-hidden border-y border-white/10 bg-[linear-gradient(135deg,var(--color-competition)_0%,var(--color-navy-deep)_48%,var(--color-navy)_100%)] py-6 text-white md:py-9"
      aria-labelledby="schedule-finder-title"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(135deg,transparent_0_35%,color-mix(in_oklab,var(--color-sport)_7%,transparent)_35%_36%,transparent_36%_48%,color-mix(in_oklab,var(--color-navy)_6%,transparent)_48%_49%,transparent_49%)] lg:block" />
      <div className="container-site relative">
        <div className="grid gap-4 xl:grid-cols-[0.62fr_1.38fr] xl:items-center">
          <div>

            <h2
              id="schedule-finder-title"
              className="mt-1.5 max-w-3xl font-display text-2xl font-extrabold uppercase leading-[0.9] tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl"
            >
              {lang === "fr" ? "Trouver mon horaire" : "Find my schedule"}
            </h2>

            <TeamPicker />
          </div>

          <div className="interactive-surface overflow-hidden rounded-2xl border border-white/12 bg-white/[0.055] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.72)] backdrop-blur-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3">
              <div className="relative col-span-2 border-b border-white/10 p-3 sm:col-span-1 sm:border-b-0 sm:border-r sm:p-5">
                <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Catégorie" : "Category"}</p>
                <label className="mt-2 block">
                  <span className="sr-only">
                    {lang === "fr" ? "Choisir ma catégorie" : "Choose my category"}
                  </span>
                  <select
                    aria-label={lang === "fr" ? "Choisir ma catégorie" : "Choose my category"}
                    className="mt-1.5 h-10 w-full border-0 border-b-2 border-white/30 bg-transparent px-0 font-display text-lg font-bold uppercase text-white outline-none transition-colors focus:border-sport focus:ring-0 [&_option]:text-navy"
                    value={team}
                    onChange={(event) => {
                      const value = event.target.value;
                      setTeam(value);
                      savePreferredTeam(value);
                    }}
                  >
                    <option value="">{lang === "fr" ? "Choisir…" : "Choose…"}</option>
                    {CURRENT_TEAMS.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.code === "F" ? l(item.name) : `${item.code} · ${l(item.name)}`}
                      </option>
                    ))}
                  </select>
                </label>
                {team && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 min-h-11 gap-2"
                    onClick={() => {
                      setTeam("");
                      savePreferredTeam("");
                    }}
                    aria-label={lang === "fr" ? "Effacer ma catégorie" : "Clear my category"}
                  >
                    <XCircle className="size-4" aria-hidden />
                    {lang === "fr" ? "Effacer mon choix" : "Clear my selection"}
                  </Button>
                )}
                <p className="mt-2 hidden text-xs leading-relaxed text-white/58 sm:block">
                  {selected
                    ? lang === "fr"
                      ? `${selected.code === "F" ? l(selected.name) : selected.code} est mémorisé sur cet appareil.`
                      : `${selected.code === "F" ? l(selected.name) : selected.code} is saved on this device.`
                    : lang === "fr"
                      ? "Choisissez la catégorie de votre enfant."
                      : "Choose your child's category."}
                </p>
              </div>

              <div className="relative border-r border-white/10 p-3 sm:p-5">
                <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Mon équipe" : "My team"}</p>
                <p className="mt-1.5 font-display text-lg font-extrabold uppercase leading-none text-white sm:text-2xl">
                  {selected
                    ? selected.code === "F"
                      ? l(selected.name)
                      : selected.code
                    : lang === "fr"
                      ? "Espace équipe"
                      : "Team space"}
                </p>
                <p className="mt-2 hidden text-xs leading-relaxed text-white/58 md:block">
                  {selected
                    ? l(selected.ages)
                    : lang === "fr"
                      ? "Actualités, accès et horaire filtré par catégorie."
                      : "News, access and schedule filtered by category."}
                </p>
                <Button asChild variant="outline" className="mt-3 w-full justify-center gap-1 px-2 text-[10px] sm:justify-between sm:text-sm">
                  {selected ? (
                    <Link to="/equipes/$slug" params={{ slug: selected.slug }}>
                      <Users className="size-4" />
                      {lang === "fr" ? "Voir mon équipe" : "View my team"}
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <Link to="/equipes">
                      <Users className="size-4" />
                      {lang === "fr" ? "Choisir une équipe" : "Choose a team"}
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </Button>
              </div>

              <div className="relative bg-sport/12 p-3 text-white sm:p-5">
                <p className="eyebrow text-sport-foreground">
                  {lang === "fr" ? "Cette semaine" : "This week"}
                </p>
                <p className="mt-1.5 font-display text-lg font-extrabold uppercase leading-none sm:text-2xl">
                  {lang === "fr" ? "Prêt pour la glace?" : "Ready for the ice?"}
                </p>
                <p className="mt-2 hidden text-xs leading-relaxed text-navy-foreground/65 md:block">
                  {lang === "fr"
                    ? "Ouvrez directement les activités publiées et les sources officielles."
                    : "Open published activities and official sources directly."}
                </p>
                <Button asChild variant="sport" className="mt-3 w-full justify-center gap-1 px-2 text-[10px] sm:justify-between sm:text-sm">
                  <Link to="/horaires" search={team ? { team } : {}}>
                    <CalendarDays className="size-5" />
                    {team
                      ? lang === "fr"
                        ? "Voir mon horaire"
                        : "My schedule"
                      : lang === "fr"
                        ? "Tous les horaires"
                        : "All schedules"}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {selected && nextActivity && (
          <div className="interactive-surface mt-4 border-l-4 border-sport bg-navy-deep px-4 py-4 text-navy-foreground shadow-[0_18px_48px_-30px_rgba(6,17,46,0.8)] md:flex md:items-center md:justify-between md:gap-6 md:px-7">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow text-sport-foreground">
                  {lang === "fr" ? "Prochaine activité publiée" : "Next published activity"}
                </p>
                {nextActivity.status === "cancelled" && (
                  <span className="inline-flex items-center gap-1 bg-status-cancelled px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    <XCircle className="size-3" aria-hidden />
                    {lang === "fr" ? "Annulée" : "Cancelled"}
                  </span>
                )}
              </div>
              <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight md:text-3xl">
                {nextActivity.group} · {nextActivity.activity}
              </p>
              <p className="mt-1 text-sm text-navy-foreground/65">
                {formatDate(nextActivity.date, lang, { weekday: "long", day: "numeric", month: "long" })}
                {" · "}
                {nextActivity.start}–{nextActivity.end}
                {" · "}
                {nextActivity.venue}
              </p>
            </div>
            <div className="mt-4 flex shrink-0 flex-wrap gap-2 md:mt-0">
              <Button asChild variant="outline-light">
                <a href={mapsDirectionsUrl(arenaDirectionsTargetForVenue(nextActivity.venue))} target="_blank" rel="noopener noreferrer">
                  <MapPin className="size-4" />
                  {lang === "fr" ? "Itinéraire" : "Directions"}
                </a>
              </Button>
              <Button asChild variant="sport">
                <Link to="/horaires" search={{ q: selected.code }}>
                  <CalendarDays className="size-4" />
                  {lang === "fr" ? "Horaire" : "Schedule"}
                </Link>
              </Button>
            </div>
          </div>
        )}

        {!selected && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-white/58 sm:text-xs">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-status-confirmed" aria-hidden />
              {lang === "fr" ? "Votre choix reste disponible" : "Your choice stays available"}
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <ShieldCheck className="size-3.5 text-white" aria-hidden />
              {lang === "fr" ? "Modifiable en tout temps" : "Change it anytime"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
