import { useEffect, useState } from "react";
import { Check, ClipboardCheck, RotateCcw } from "lucide-react";

const STORAGE_KEY = "ahmv-coach-game-day-checklist";

const ITEMS = [
  { key: "schedule", fr: "Heure et aréna vérifiés", en: "Time and arena checked" },
  { key: "equipment", fr: "Équipement collectif prêt", en: "Team equipment ready" },
  { key: "staff", fr: "Personnel d’équipe confirmé", en: "Team staff confirmed" },
  { key: "families", fr: "Message aux familles relu", en: "Family message reviewed" },
] as const;

export function CoachMatchDayChecklist({ lang }: { lang: "fr" | "en" }) {
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      setChecked(Array.isArray(stored) ? stored.filter((value): value is string => typeof value === "string") : []);
    } catch {
      setChecked([]);
    }
  }, []);

  const toggle = (key: string) => {
    setChecked((current) => {
      const next = current.includes(key)
        ? current.filter((value) => value !== key)
        : [...current, key];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <section className="overflow-hidden border border-white/12 bg-navy-deep text-white">
      <div className="competition-panel flex flex-col gap-4 p-5 text-white sm:flex-row sm:items-end sm:justify-between md:p-6">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="size-4 text-sport-foreground" aria-hidden />
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Checklist entraîneur" : "Coach checklist"}
            </p>
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9]">
            {lang === "fr" ? "Avant de partir pour l’aréna" : "Before leaving for the arena"}
          </h2>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/60">
            {lang === "fr"
              ? "Cette checklist reste seulement dans ce navigateur. Elle ne crée aucun dossier et n’envoie aucune donnée."
              : "This checklist stays only in this browser. It creates no record and sends no data."}
          </p>
        </div>
        <span className="font-display text-3xl font-extrabold tabular-nums text-sport-foreground">
          {checked.length}/{ITEMS.length}
        </span>
      </div>

      <div className="grid gap-px bg-navy/10 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const active = checked.includes(item.key);
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(item.key)}
              className={
                active
                  ? "premium-control flex min-h-16 items-center gap-3 bg-sport/10 p-4 text-left text-white"
                  : "premium-control flex min-h-16 items-center gap-3 bg-competition p-4 text-left text-white hover:bg-white/[0.04]"
              }
            >
              <span className={active
                ? "flex size-8 shrink-0 items-center justify-center bg-sport text-sport-foreground"
                : "flex size-8 shrink-0 items-center justify-center border border-white/12 bg-white/[0.04] text-white/42"
              }>
                {active ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-white/20" />}
              </span>
              <span className="font-display text-lg font-extrabold uppercase leading-none">
                {lang === "fr" ? item.fr : item.en}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-3 text-right">
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            setChecked([]);
          }}
          className="inline-flex min-h-9 items-center gap-2 px-2 text-[8px] font-bold uppercase tracking-[0.14em] text-white/42 hover:text-sport-foreground"
        >
          <RotateCcw className="size-3" aria-hidden />
          {lang === "fr" ? "Réinitialiser" : "Reset"}
        </button>
      </div>
    </section>
  );
}
