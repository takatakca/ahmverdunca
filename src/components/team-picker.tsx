import { Check, ChevronDown, Users, X } from "lucide-react";
import { PUBLIC_TEAM_DIRECTORY, publicTeamHubUrl } from "@/data/team-directory";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";

export function TeamPicker() {
  const { lang } = useI18n();
  const { selectedTeams, isTeamSelected, toggleSelectedTeam, removeSelectedTeam } =
    usePreferredTeam();
  return (
    <div className="mt-5 space-y-3">
      <details className="group rounded-2xl border border-white/14 bg-white/[0.045]">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
          <Users className="size-5 text-sport-foreground" aria-hidden />
          <span className="flex-1">
            {lang === "fr" ? "Choisir mes équipes" : "Choose my teams"}
          </span>
          {selectedTeams.length > 0 && (
            <span className="rounded-full bg-sport px-2 py-0.5 text-xs text-sport-foreground">
              {selectedTeams.length}
            </span>
          )}
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <fieldset className="grid max-h-80 gap-2 overflow-y-auto border-t border-white/10 p-3 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="sr-only">
            {lang === "fr" ? "Mes équipes — choix multiples" : "My teams — multiple selection"}
          </legend>
          {PUBLIC_TEAM_DIRECTORY.map((team) => (
            <label
              key={team.legacyScheduleTeamId}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-navy-deep px-3 py-2 text-sm has-[:checked]:border-sport/60 has-[:checked]:bg-sport/10"
            >
              <input
                type="checkbox"
                checked={isTeamSelected(team.legacyScheduleTeamId)}
                onChange={() => toggleSelectedTeam(team.legacyScheduleTeamId)}
                className="size-4 accent-sport"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{team.name}</span>
                <span className="text-xs text-white/50">
                  {team.categorySlug.toUpperCase()} · {team.level}
                </span>
              </span>
              {isTeamSelected(team.legacyScheduleTeamId) && (
                <Check className="size-4 text-sport-foreground" aria-hidden />
              )}
            </label>
          ))}
        </fieldset>
      </details>
      {selectedTeams.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          aria-label={lang === "fr" ? "Mes équipes enregistrées" : "My saved teams"}
        >
          {selectedTeams.map((team) => (
            <span
              key={team.legacyScheduleTeamId}
              className="inline-flex max-w-full items-center rounded-full border border-sport/35 bg-sport/10 text-white"
            >
              <a
                href={publicTeamHubUrl(team)}
                className="min-w-0 truncate px-3 py-2 text-xs font-semibold hover:text-sport-foreground"
              >
                {team.name} · {team.level}
              </a>
              <button
                type="button"
                onClick={() => removeSelectedTeam(team.legacyScheduleTeamId)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
                aria-label={
                  lang === "fr"
                    ? `Retirer ${team.name} ${team.level}`
                    : `Remove ${team.name} ${team.level}`
                }
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
