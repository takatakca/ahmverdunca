import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEAMS } from "@/data/teams";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";

export function ScheduleFinder() {
  const { lang, l } = useI18n();
  const { preferredTeam, savePreferredTeam } = usePreferredTeam();
  const [category, setCategory] = useState("");
  const [team, setTeam] = useState("");

  useEffect(() => {
    if (preferredTeam) {
      setCategory(preferredTeam);
      setTeam(preferredTeam);
    }
  }, [preferredTeam]);

  return (
    <section id="mon-equipe" className="relative z-10 border-b border-border bg-background py-7 md:py-9" aria-labelledby="schedule-finder-title">
      <div className="container-site grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-end">
        <div className="min-w-0">
          <p className="eyebrow text-sport">{lang === "fr" ? "Accès rapide · Mon équipe" : "Quick access · My team"}</p>
          <h2 id="schedule-finder-title" className="mt-1 font-display text-3xl font-bold uppercase leading-none md:text-4xl">{lang === "fr" ? "Trouver mon horaire" : "Find my schedule"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{lang === "fr" ? "Choisissez une catégorie pour voir ses activités de démonstration." : "Choose a category to see its demo activities."}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <label className="min-w-0 text-xs font-semibold uppercase text-muted-foreground">
            {lang === "fr" ? "Choisir catégorie" : "Choose category"}
            <select aria-label={lang === "fr" ? "Choisir catégorie" : "Choose category"} className="mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground" value={category} onChange={(e) => { setCategory(e.target.value); setTeam(""); }}>
              <option value="">{lang === "fr" ? "Toutes les catégories" : "All categories"}</option>
              {TEAMS.map((item) => <option key={item.slug} value={item.slug}>{item.code === "F" ? l(item.name) : item.code}</option>)}
            </select>
          </label>
          <label className="min-w-0 text-xs font-semibold uppercase text-muted-foreground">
            {lang === "fr" ? "Choisir équipe" : "Choose team"}
            <select aria-label={lang === "fr" ? "Choisir équipe" : "Choose team"} className="mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground disabled:opacity-50" value={team} disabled={!category} onChange={(e) => { setTeam(e.target.value); savePreferredTeam(e.target.value); }}>
              <option value="">{lang === "fr" ? "Sélectionner" : "Select"}</option>
              {TEAMS.filter((item) => item.slug === category).map((item) => <option key={item.slug} value={item.slug}>{l(item.name)}</option>)}
            </select>
          </label>
          <Button asChild variant="sport" size="lg" className="w-full sm:w-auto">
            <Link to="/horaires" search={team ? { team } : {}}><CalendarDays className="size-5" /> {lang === "fr" ? "Voir mon horaire" : "See my schedule"} <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
      </div>
      <p className="container-site mt-3 text-xs text-muted-foreground">{lang === "fr" ? "Sous-équipes et divisions à confirmer par l’association. Votre choix reste sur cet appareil uniquement." : "Sub-teams and divisions to be confirmed by the association. Your selection stays on this device only."}</p>
    </section>
  );
}