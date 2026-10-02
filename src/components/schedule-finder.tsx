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
import { TEAMS } from "@/data/teams";
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
    if (preferredTeam) setTeam(preferredTeam);
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
      className="relative overflow-hidden bg-background py-14 md:py-20"
      aria-labelledby="schedule-finder-title"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(135deg,transparent_0_35%,color-mix(in_oklab,var(--color-sport)_7%,transparent)_35%_36%,transparent_36%_48%,color-mix(in_oklab,var(--color-navy)_6%,transparent)_48%_49%,transparent_49%)] lg:block" />
      <div className="container-site relative">
        <div className="grid gap-10 xl:grid-cols-[0.72fr_1.28fr] xl:items-end">
          <div>
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Accès parent · priorité #1" : "Parent access · priority #1"}
            </p>
            <h2
              id="schedule-finder-title"
              className="mt-3 max-w-3xl font-display text-5xl font-extrabold uppercase leading-[0.86] tracking-[-0.035em] text-navy sm:text-6xl lg:text-7xl"
            >
              {lang === "fr" ? "Trouver mon horaire" : "Find my schedule"}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Une seule trajectoire : votre catégorie, votre espace équipe, puis les activités publiées de la semaine."
                : "One path: your category, your team space, then this week's published activities."}
            </p>
            <div className="mt-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="h-px w-10 bg-sport" />
              {lang === "fr" ? "Simple. Rapide. Sur un seul écran." : "Simple. Fast. One screen."}
            </div>
          </div>

          <div className="overflow-hidden border border-navy/10 bg-ice shadow-[0_24px_60px_-36px_rgba(8,20,54,0.45)]">
            <div className="grid lg:grid-cols-3">
              <div className="relative border-b border-navy/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                <span className="font-display text-6xl font-extrabold leading-none text-navy/10">01</span>
                <p className="mt-3 eyebrow text-sport">{lang === "fr" ? "Catégorie" : "Category"}</p>
                <label className="mt-2 block">
                  <span className="sr-only">
                    {lang === "fr" ? "Choisir ma catégorie" : "Choose my category"}
                  </span>
                  <select
                    aria-label={lang === "fr" ? "Choisir ma catégorie" : "Choose my category"}
                    className="mt-2 h-12 w-full border-0 border-b-2 border-navy bg-transparent px-0 font-display text-xl font-bold uppercase text-navy outline-none focus:border-sport"
                    value={team}
                    onChange={(event) => {
                      const value = event.target.value;
                      setTeam(value);
                      savePreferredTeam(value);
                    }}
                  >
                    <option value="">{lang === "fr" ? "Choisir…" : "Choose…"}</option>
                    {TEAMS.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.code === "F" ? l(item.name) : `${item.code} · ${l(item.name)}`}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {selected
                    ? lang === "fr"
                      ? `${selected.code === "F" ? l(selected.name) : selected.code} est mémorisé sur cet appareil.`
                      : `${selected.code === "F" ? l(selected.name) : selected.code} is saved on this device.`
                    : lang === "fr"
                      ? "Choisissez la catégorie de votre enfant."
                      : "Choose your child's category."}
                </p>
              </div>

              <div className="relative border-b border-navy/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                <span className="font-display text-6xl font-extrabold leading-none text-navy/10">02</span>
                <p className="mt-3 eyebrow text-sport">{lang === "fr" ? "Mon équipe" : "My team"}</p>
                <p className="mt-2 font-display text-2xl font-extrabold uppercase text-navy">
                  {selected
                    ? selected.code === "F"
                      ? l(selected.name)
                      : selected.code
                    : lang === "fr"
                      ? "Espace équipe"
                      : "Team space"}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {selected
                    ? l(selected.ages)
                    : lang === "fr"
                      ? "Actualités, accès et horaire filtré par catégorie."
                      : "News, access and schedule filtered by category."}
                </p>
                <Button asChild variant="outline" className="mt-5 w-full justify-between">
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

              <div className="relative bg-navy p-5 text-navy-foreground sm:p-6">
                <span className="font-display text-6xl font-extrabold leading-none text-navy-foreground/10">03</span>
                <p className="mt-3 eyebrow text-sport-foreground">
                  {lang === "fr" ? "Cette semaine" : "This week"}
                </p>
                <p className="mt-2 font-display text-2xl font-extrabold uppercase">
                  {lang === "fr" ? "Prêt pour la glace?" : "Ready for the ice?"}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-navy-foreground/65">
                  {lang === "fr"
                    ? "Ouvrez directement les activités publiées et les sources officielles."
                    : "Open published activities and official sources directly."}
                </p>
                <Button asChild variant="sport" size="lg" className="mt-5 w-full justify-between">
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
          <div className="mt-7 border-l-4 border-sport bg-navy-deep px-5 py-5 text-navy-foreground shadow-[0_18px_48px_-30px_rgba(6,17,46,0.8)] md:flex md:items-center md:justify-between md:gap-6 md:px-7">
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
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-status-confirmed" aria-hidden />
              {lang === "fr" ? "Choix mémorisé localement" : "Saved locally"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-navy" aria-hidden />
              {lang === "fr" ? "Aucune donnée personnelle hockey enregistrée" : "No hockey personal data stored"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
