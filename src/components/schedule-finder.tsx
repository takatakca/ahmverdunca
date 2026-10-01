import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEAMS } from "@/data/teams";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";

export function ScheduleFinder() {
  const { lang, l } = useI18n();
  const { preferredTeam, savePreferredTeam } = usePreferredTeam();
  const [team, setTeam] = useState("");

  useEffect(() => {
    if (preferredTeam) setTeam(preferredTeam);
  }, [preferredTeam]);

  const selected = TEAMS.find((item) => item.slug === team);

  return (
    <section
      id="mon-equipe"
      className="relative z-10 border-b border-border bg-background py-7 md:py-9"
      aria-labelledby="schedule-finder-title"
    >
      <div className="container-site grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-end">
        <div className="min-w-0">
          <p className="eyebrow text-sport">
            {lang === "fr" ? "Accès rapide · Mon équipe" : "Quick access · My team"}
          </p>
          <h2
            id="schedule-finder-title"
            className="mt-1 font-display text-3xl font-bold uppercase leading-none md:text-4xl"
          >
            {lang === "fr" ? "Trouver mon horaire" : "Find my schedule"}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {lang === "fr"
              ? "Choisissez votre groupe une fois. Le site le gardera sur cet appareil pour retrouver l’horaire plus vite."
              : "Choose your group once. The site will remember it on this device so you can get back to the schedule faster."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="min-w-0 text-xs font-semibold uppercase text-muted-foreground">
            {lang === "fr" ? "Mon équipe / catégorie" : "My team / category"}
            <select
              aria-label={lang === "fr" ? "Mon équipe ou catégorie" : "My team or category"}
              className="mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
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

          <Button
            asChild
            variant="sport"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link to="/horaires" search={team ? { team } : {}}>
              <CalendarDays className="size-5" />
              {team
                ? lang === "fr"
                  ? "Voir mon horaire"
                  : "See my schedule"
                : lang === "fr"
                  ? "Voir tous les horaires"
                  : "See all schedules"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="container-site mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {selected && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <CheckCircle2 className="size-3.5 text-status-confirmed" aria-hidden />
            {lang === "fr" ? "Choix mémorisé" : "Saved choice"} · {l(selected.name)}
          </span>
        )}
        <span>
          {lang === "fr"
            ? "Votre choix reste uniquement sur cet appareil. Les sous-équipes seront ajoutées lorsque les données officielles seront confirmées."
            : "Your choice stays on this device only. Sub-teams will be added once official data is confirmed."}
        </span>
      </div>
    </section>
  );
}
