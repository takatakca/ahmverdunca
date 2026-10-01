import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEAMS } from "@/data/teams";
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
      className="relative z-10 border-b border-border bg-background py-8 md:py-10"
      aria-labelledby="parent-hub-title"
    >
      <div className="container-site">
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr] xl:items-start">
          <div>
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Accès parent" : "Parent access"}
            </p>
            <h2
              id="parent-hub-title"
              className="mt-2 font-display text-4xl font-extrabold uppercase leading-none text-navy md:text-5xl"
            >
              {lang === "fr" ? "Trouvez-le en quelques secondes" : "Find it in seconds"}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {lang === "fr"
                ? "Horaire, équipe, aréna ou inscription : les quatre actions les plus utilisées sont toujours ici."
                : "Schedule, team, arena or registration: the four most-used actions are always right here."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Link
              to="/horaires"
              search={team ? { team } : {}}
              className="group rounded-xl border border-border bg-ice p-4 transition-all hover:-translate-y-0.5 hover:border-sport/40 hover:bg-background hover:shadow-card"
            >
              <CalendarDays className="size-5 text-sport" aria-hidden />
              <p className="mt-5 font-display text-xl font-bold uppercase text-navy">
                {lang === "fr" ? "Mon horaire" : "My schedule"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected
                  ? `${selected.code} · ${l(selected.name)}`
                  : lang === "fr"
                    ? "Tous les horaires"
                    : "All schedules"}
              </p>
            </Link>

            {selected ? (
              <Link
                to="/equipes/$slug"
                params={{ slug: selected.slug }}
                className="group rounded-xl border border-border bg-ice p-4 transition-all hover:-translate-y-0.5 hover:border-sport/40 hover:bg-background hover:shadow-card"
              >
                <Users className="size-5 text-sport" aria-hidden />
                <p className="mt-5 font-display text-xl font-bold uppercase text-navy">
                  {lang === "fr" ? "Mon équipe" : "My team"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selected.code} · {l(selected.name)}
                </p>
              </Link>
            ) : (
              <Link
                to="/equipes"
                className="group rounded-xl border border-border bg-ice p-4 transition-all hover:-translate-y-0.5 hover:border-sport/40 hover:bg-background hover:shadow-card"
              >
                <Users className="size-5 text-sport" aria-hidden />
                <p className="mt-5 font-display text-xl font-bold uppercase text-navy">
                  {lang === "fr" ? "Mon équipe" : "My team"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {lang === "fr" ? "Choisir une catégorie" : "Choose a category"}
                </p>
              </Link>
            )}

            <Link
              to="/arenas"
              className="group rounded-xl border border-border bg-ice p-4 transition-all hover:-translate-y-0.5 hover:border-sport/40 hover:bg-background hover:shadow-card"
            >
              <MapPin className="size-5 text-sport" aria-hidden />
              <p className="mt-5 font-display text-xl font-bold uppercase text-navy">
                {lang === "fr" ? "Mon aréna" : "My arena"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lang === "fr" ? "Adresse & itinéraire" : "Address & directions"}
              </p>
            </Link>

            <Link
              to="/inscriptions"
              className="group rounded-xl border border-border bg-ice p-4 transition-all hover:-translate-y-0.5 hover:border-sport/40 hover:bg-background hover:shadow-card"
            >
              <ShieldCheck className="size-5 text-sport" aria-hidden />
              <p className="mt-5 font-display text-xl font-bold uppercase text-navy">
                {lang === "fr" ? "Inscription" : "Registration"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lang === "fr" ? "Accès officiel Spordle" : "Official Spordle access"}
              </p>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-xl border border-border bg-background p-4 shadow-card md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-5">
          <div className="min-w-0">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === "fr" ? "Mémoriser ma catégorie sur cet appareil" : "Remember my category on this device"}
              <select
                aria-label={lang === "fr" ? "Mon équipe ou catégorie" : "My team or category"}
                className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-base text-foreground"
                value={team}
                onChange={(event) => {
                  const value = event.target.value;
                  setTeam(value);
                  savePreferredTeam(value);
                }}
              >
                <option value="">{lang === "fr" ? "Choisir une catégorie…" : "Choose a category…"}</option>
                {TEAMS.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.code === "F" ? l(item.name) : `${item.code} · ${l(item.name)}`}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {selected && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <CheckCircle2 className="size-3.5 text-status-confirmed" aria-hidden />
                  {lang === "fr" ? "Choix mémorisé" : "Saved"} · {selected.code}
                </span>
              )}
              <span>
                {lang === "fr"
                  ? "Le choix reste uniquement sur cet appareil."
                  : "The choice stays only on this device."}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex">
            <Button asChild variant="outline" size="lg">
              <Link to="/recherche">
                <Search className="size-4" />
                {lang === "fr" ? "Rechercher" : "Search"}
              </Link>
            </Button>
            <Button asChild variant="sport" size="lg">
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

        {selected && nextActivity && (
          <div className="mt-4 overflow-hidden rounded-xl border border-sport/25 bg-ice shadow-card">
            <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="eyebrow text-sport">
                    {lang === "fr" ? "Prochaine activité publiée" : "Next published activity"}
                  </p>
                  {nextActivity.status === "cancelled" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-status-cancelled px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      <XCircle className="size-3" aria-hidden />
                      {lang === "fr" ? "Annulée" : "Cancelled"}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight text-navy">
                  {nextActivity.group} · {nextActivity.activity}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(nextActivity.date, lang, { weekday: "long", day: "numeric", month: "long" })}
                  {" · "}
                  {nextActivity.start}–{nextActivity.end}
                  {" · "}
                  {nextActivity.venue}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:flex">
                <Button asChild variant="outline">
                  <a href={mapsDirectionsUrl(nextActivity.venue)} target="_blank" rel="noopener noreferrer">
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
          </div>
        )}
      </div>
    </section>
  );
}
