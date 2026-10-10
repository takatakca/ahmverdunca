import { Check, ChevronDown, ClipboardCheck, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  TEAM_ICE_BAG_ITEMS,
  parseTeamIceBagState,
  serializeTeamIceBagState,
  teamIceBagStorageKey,
  toggleTeamIceBagItem,
  type TeamIceBagItemId,
} from "@/lib/team-ice-bag";

type Lang = "fr" | "en";

/**
 * Optional, privacy-friendly helper for families before a day on the ice.
 * Nothing is sent to TAKATAK, TeamLinkt, AHMV servers or analytics.
 */
export function TeamIceBagChecklist({ teamSlug, lang }: { teamSlug: string; lang: Lang }) {
  const [selected, setSelected] = useState<TeamIceBagItemId[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loadedForTeam, setLoadedForTeam] = useState<string | null>(null);
  const storageKey = teamIceBagStorageKey(teamSlug);
  const isFr = lang === "fr";
  const count = selected.length;
  const total = TEAM_ICE_BAG_ITEMS.length;
  const isLoaded = loadedForTeam === teamSlug;
  const disclosureId = `ahmv-ice-bag-${teamSlug}`;

  useEffect(() => {
    let loaded: TeamIceBagItemId[] = [];
    if (storageKey) {
      try {
        loaded = parseTeamIceBagState(window.localStorage.getItem(storageKey));
      } catch {
        // Private browsing, disabled storage or a quota error must not break UX.
      }
    }
    setSelected(loaded);
    setLoadedForTeam(teamSlug);
  }, [storageKey, teamSlug]);

  useEffect(() => {
    if (!storageKey || !isLoaded) return;
    try {
      window.localStorage.setItem(storageKey, serializeTeamIceBagState(selected));
    } catch {
      // The checklist remains usable without persistent storage.
    }
  }, [storageKey, selected, isLoaded]);

  return (
    <section
      data-ahmv-parent-checklist
      aria-label={isFr ? "Aide-mémoire du sac de hockey" : "Hockey bag checklist"}
      className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#4fd0c3]/25 bg-[linear-gradient(120deg,#14283e,#1b1638)] text-white"
    >
      <div className="flex items-center gap-3 p-4 sm:gap-5 sm:p-6">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#57dacc]/15 text-[#90f4e8] sm:size-13">
          <ClipboardCheck aria-hidden="true" className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#88f0e5]">
            {isFr ? "L'aide-mémoire des parents" : "Parent's quick checklist"}
          </p>
          <h3 className="mt-1 font-display text-xl font-extrabold uppercase leading-tight tracking-tight sm:text-2xl">
            {isFr ? "Mon sac est-il prêt?" : "Is my bag ready?"}
          </h3>
          <p className="mt-1 text-xs leading-5 text-white/70">
            {isFr ? "Une petite vérification avant de partir pour la glace." : "A quick check before heading to the rink."}
          </p>
        </div>
        <button
          type="button"
          data-ahmv-checklist-toggle
          disabled={!isLoaded}
          aria-controls={disclosureId}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[#7cece2]/45 bg-[#58d4c9]/10 px-3 text-xs font-extrabold uppercase tracking-wider text-[#b6fff5] transition-colors hover:bg-[#58d4c9]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8afff2] disabled:opacity-50 sm:px-4"
        >
          {isFr ? "Voir" : "Open"}
          <ChevronDown aria-hidden="true" className={`size-4 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-white/76">
          <span role="status" aria-live="polite" data-ahmv-checklist-progress>
            {isFr ? `${count} sur ${total} éléments prêts` : `${count} of ${total} items ready`}
          </span>
          {count === total ? (
            <span className="inline-flex items-center gap-1.5 text-[#91f8e8]"><Check className="size-3.5" aria-hidden="true" />{isFr ? "Sac vérifié" : "Bag checked"}</span>
          ) : (
            <span className="text-white/55">{isFr ? "À votre rythme" : "At your own pace"}</span>
          )}
        </div>
        <div
          aria-hidden="true"
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15"
        >
          <div
            className="h-full rounded-full bg-[#73eadb] transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
      </div>

      {expanded && (
        <div id={disclosureId} data-ahmv-checklist-items className="border-t border-white/10 bg-[#0e1830]/55 px-4 py-5 sm:px-6">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_ICE_BAG_ITEMS.map((item) => (
              <label
                key={item.id}
                className="group relative cursor-pointer rounded-xl border border-white/15 bg-white/[0.045] transition-colors hover:border-[#6ce9dc]/55 hover:bg-white/[0.07]"
              >
                <input
                  type="checkbox"
                  data-ahmv-ice-bag-item={item.id}
                  checked={selected.includes(item.id)}
                  onChange={() => setSelected((previous) => toggleTeamIceBagItem(previous, item.id))}
                  className="peer sr-only"
                />
                <span className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#9dfcf1]">
                  <span
                    aria-hidden="true"
                    className={`grid size-6 shrink-0 place-items-center rounded-lg border ${selected.includes(item.id)
                      ? "border-[#67e5d9] bg-[#67e5d9] text-[#0a2030]"
                      : "border-white/40 bg-white/10 text-transparent"}`}
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-semibold text-white/90">{item[lang]}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <p className="max-w-xl text-[11px] leading-5 text-white/62">
              {isFr
                ? "Aide-mémoire facultatif et non exhaustif : suivez toujours les consignes de l’équipe pour l’équipement. Votre liste reste seulement sur cet appareil."
                : "Optional, non-exhaustive reminder: always follow your team's equipment instructions. Your checklist stays on this device only."}
            </p>
            <button
              type="button"
              data-ahmv-checklist-reset
              disabled={count === 0}
              onClick={() => setSelected([])}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 text-xs font-bold text-white/80 transition-colors hover:border-[#88efe6] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8afff2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {isFr ? "Recommencer" : "Start again"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
