import { readBrowserPreference, writeBrowserPreference, removeBrowserPreference } from "@/lib/browser-preferences";
import { useEffect, useState } from "react";
import { CalendarDays, Check, MapPin, ShieldCheck, Trophy } from "lucide-react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import { legacyTeamScheduleUrl, officialTeamResultsUrl } from "@/data/team-directory";

const CHECKLIST = [
  { key: "schedule", fr: "Heure vérifiée", en: "Time checked" },
  { key: "arena", fr: "Aréna vérifié", en: "Arena checked" },
  { key: "equipment", fr: "Équipement prêt", en: "Equipment ready" },
  { key: "water", fr: "Bouteille d’eau", en: "Water bottle" },
] as const;

function storageKey(teamId: string) {
  return `ahmv-game-day-${teamId}`;
}

export function TeamGameDayPanel({
  team,
  lang,
}: {
  team: PublicTeamDirectoryEntry;
  lang: "fr" | "en";
}) {
  const [checks, setChecks] = useState<string[]>([]);

  useEffect(() => {
    try {
      const value = JSON.parse(readBrowserPreference(storageKey(team.legacyScheduleTeamId)) || "[]");
      setChecks(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
    } catch {
      setChecks([]);
    }
  }, [team.legacyScheduleTeamId]);

  const toggle = (key: string) => {
    setChecks((current) => {
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      writeBrowserPreference(storageKey(team.legacyScheduleTeamId), JSON.stringify(next));
      return next;
    });
  };

  return (
    <section id="jour-de-match" className="overflow-hidden border border-sport/30 bg-background">
      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <div className="competition-panel p-5 text-white md:p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-sport-foreground" />
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Mode jour de match" : "Game day mode"}
            </p>
          </div>
          <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.86]">
            {lang === "fr" ? "Tout avant de partir." : "Everything before you leave."}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            {lang === "fr"
              ? "Ce panneau n’invente jamais une heure ni un aréna. Vérifiez la source officielle, puis gardez votre préparation localement sur cet appareil."
              : "This panel never invents a time or arena. Check the official source, then keep your preparation locally on this device."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <a
              href={legacyTeamScheduleUrl(team)}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-control flex min-h-14 flex-col justify-between border border-white/14 bg-white/[0.035] p-3 text-white"
            >
              <CalendarDays className="size-4 text-sport-foreground" />
              <span className="font-display text-base font-extrabold uppercase leading-none">
                {lang === "fr" ? "Source officielle" : "Official source"}
              </span>
            </a>
            <a
              href={officialTeamResultsUrl(team)}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-control flex min-h-14 flex-col justify-between border border-white/14 bg-white/[0.035] p-3 text-white"
            >
              <Trophy className="size-4 text-sport-foreground" />
              <span className="font-display text-base font-extrabold uppercase leading-none">
                {lang === "fr" ? "Résultats" : "Results"}
              </span>
            </a>
            <a
              href="/arenas"
              className="premium-control col-span-2 flex min-h-11 items-center justify-between bg-sport px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
            >
              <span className="flex items-center gap-2">
                <MapPin className="size-4" />
                {lang === "fr" ? "Arénas & itinéraires" : "Arenas & directions"}
              </span>
              <span>→</span>
            </a>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-sport">
                {lang === "fr" ? "Checklist locale" : "Local checklist"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {lang === "fr"
                  ? "Mémorisée uniquement dans ce navigateur. Aucun message n’est envoyé."
                  : "Saved only in this browser. No message is sent."}
              </p>
            </div>
            <span className="font-display text-2xl font-extrabold text-navy">
              {checks.length}/{CHECKLIST.length}
            </span>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {CHECKLIST.map((item) => {
              const checked = checks.includes(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggle(item.key)}
                  aria-pressed={checked}
                  className={
                    checked
                      ? "premium-control flex min-h-16 items-center gap-3 border border-sport bg-sport/10 p-3 text-left text-navy"
                      : "premium-control flex min-h-16 items-center gap-3 border border-navy/12 bg-background p-3 text-left text-navy hover:border-sport"
                  }
                >
                  <span className={
                    checked
                      ? "flex size-8 shrink-0 items-center justify-center bg-sport text-sport-foreground"
                      : "flex size-8 shrink-0 items-center justify-center border border-navy/12 bg-ice text-muted-foreground"
                  }>
                    {checked ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-navy/20" />}
                  </span>
                  <span className="font-display text-lg font-extrabold uppercase leading-none">
                    {lang === "fr" ? item.fr : item.en}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              removeBrowserPreference(storageKey(team.legacyScheduleTeamId));
              setChecks([]);
            }}
            className="mt-4 text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-sport"
          >
            {lang === "fr" ? "Réinitialiser la checklist" : "Reset checklist"}
          </button>
        </div>
      </div>
    </section>
  );
}
