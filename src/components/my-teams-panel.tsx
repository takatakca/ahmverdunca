import { BookmarkCheck, CalendarDays, ExternalLink, Trophy, X } from "lucide-react";
import { usePreferredTeam } from "@/lib/team-preference";
import { legacyTeamScheduleUrl, officialTeamResultsUrl, publicTeamHubUrl } from "@/data/team-directory";

export function MyTeamsPanel({ lang, compact = false }: { lang: "fr" | "en"; compact?: boolean }) {
  const { selectedTeams, toggleSelectedTeam } = usePreferredTeam();

  if (selectedTeams.length === 0) {
    return (
      <div className="border border-dashed border-navy/20 bg-ice/50 p-5">
        <p className="eyebrow text-sport">{lang === "fr" ? "Mes équipes" : "My teams"}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {lang === "fr"
            ? "Ajoutez les équipes de vos enfants depuis leur mini-site. Elles resteront regroupées ici sur cet appareil."
            : "Add your children’s teams from their mini-sites. They will stay grouped here on this device."}
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden border border-navy/12 bg-background" aria-label={lang === "fr" ? "Mes équipes" : "My teams"}>
      <div className="flex items-center justify-between gap-4 bg-competition px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <BookmarkCheck className="size-5 text-sport-foreground" aria-hidden />
          <div>
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Vue famille" : "Family view"}</p>
            <p className="mt-1 font-display text-xl font-extrabold uppercase">
              {lang === "fr" ? "Mes équipes" : "My teams"} · {selectedTeams.length}
            </p>
          </div>
        </div>
        <span className="hidden text-[9px] font-bold uppercase tracking-[0.14em] text-white/40 sm:block">
          {lang === "fr" ? "Enregistré sur cet appareil" : "Saved on this device"}
        </span>
      </div>

      <div className={compact ? "grid gap-px bg-navy/10" : "grid gap-px bg-navy/10 sm:grid-cols-2 xl:grid-cols-3"}>
        {selectedTeams.map((team) => (
          <article key={team.legacyScheduleTeamId} className="interactive-surface bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <a href={publicTeamHubUrl(team)} className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-sport">{team.level}</p>
                <h3 className="mt-1 truncate font-display text-2xl font-extrabold uppercase leading-none text-navy">{team.name}</h3>
              </a>
              <button
                type="button"
                onClick={() => toggleSelectedTeam(team.legacyScheduleTeamId)}
                className="premium-control flex size-10 shrink-0 items-center justify-center border border-navy/12 text-muted-foreground hover:border-sport hover:text-sport"
                aria-label={lang === "fr" ? `Retirer ${team.name} de mes équipes` : `Remove ${team.name} from my teams`}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1">
              <a href={publicTeamHubUrl(team)} className="premium-control flex min-h-10 items-center justify-center bg-navy px-2 text-center text-[8px] font-bold uppercase tracking-[0.08em] text-white">
                {lang === "fr" ? "Mini-site" : "Team hub"}
              </a>
              <a href={legacyTeamScheduleUrl(team)} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-10 items-center justify-center gap-1 border border-navy/12 px-2 text-[8px] font-bold uppercase tracking-[0.08em] text-navy">
                <CalendarDays className="size-3" /> {lang === "fr" ? "Horaire" : "Schedule"}
              </a>
              <a href={officialTeamResultsUrl(team)} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-10 items-center justify-center gap-1 border border-navy/12 px-2 text-[8px] font-bold uppercase tracking-[0.08em] text-navy">
                <Trophy className="size-3" /> {lang === "fr" ? "Scores" : "Scores"} <ExternalLink className="size-2.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
