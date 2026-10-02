import { useEffect, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OTHER_LANGUAGES = [
  "中文",
  "Português",
  "العربية",
  "Русский",
  "Italiano",
  "Deutsch",
  "Polski",
  "Українська",
  "हिन्दी",
  "한국어",
  "日本語",
  "Türkçe",
] as const;

/**
 * FR / EN are functional today.
 * ES and the extended language menu intentionally demonstrate the future
 * multilingual surface without pretending translations already exist.
 */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const [otherOpen, setOtherOpen] = useState(false);
  const [demoChoice, setDemoChoice] = useState<string | null>(null);
  const langs: Lang[] = ["fr", "en"];

  useEffect(() => {
    if (!otherOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOtherOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [otherOpen]);

  const chooseDemoLanguage = (label: string) => {
    setDemoChoice(label);
    setOtherOpen(true);
  };

  return (
    <div className={cn("relative inline-flex items-center gap-1.5", className)}>
      <div
        role="group"
        aria-label={t("nav.language")}
        className="inline-flex items-center rounded-md border border-navy-foreground/25 bg-navy-foreground/[0.03] p-0.5"
      >
        {langs.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={lang === l}
            onClick={() => {
              setLang(l);
              setDemoChoice(null);
            }}
            className={cn(
              "rounded-[4px] px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wider transition-colors",
              lang === l && !demoChoice
                ? "bg-navy-foreground text-navy"
                : "text-navy-foreground/70 hover:text-navy-foreground",
            )}
          >
            {l}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={demoChoice === "Español"}
          onClick={() => chooseDemoLanguage("Español")}
          className={cn(
            "rounded-[4px] px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wider transition-colors",
            demoChoice === "Español"
              ? "bg-navy-foreground text-navy"
              : "text-navy-foreground/70 hover:text-navy-foreground",
          )}
          title="Español — aperçu visuel"
        >
          ES
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOtherOpen((value) => !value)}
        aria-expanded={otherOpen}
        aria-haspopup="menu"
        className="tap-target inline-flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md border border-navy-foreground/20 text-navy-foreground/70 transition-colors hover:bg-navy-foreground/10 hover:text-navy-foreground"
        aria-label={lang === "fr" ? "Autres langues" : "Other languages"}
      >
        <Globe2 className="size-3.5" />
        <ChevronDown className={cn("-ml-0.5 size-3 transition-transform", otherOpen && "rotate-180")} />
      </button>

      {otherOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-72 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl"
        >
          <div className="border-b bg-ice px-4 py-3">
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Aperçu multilingue" : "Multilingual preview"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {lang === "fr"
                ? "FR et EN sont actifs. Les autres langues illustrent l'expérience future."
                : "FR and EN are active. Other languages preview the future experience."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1 p-2">
            {["Español", ...OTHER_LANGUAGES].map((label) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                onClick={() => chooseDemoLanguage(label)}
                className={cn(
                  "flex min-h-10 items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                  demoChoice === label && "bg-secondary font-semibold text-navy",
                )}
              >
                <span>{label}</span>
                {demoChoice === label && <Check className="size-3.5 text-sport" />}
              </button>
            ))}
          </div>
          {demoChoice && (
            <div className="border-t px-4 py-2.5 text-[11px] text-muted-foreground">
              {demoChoice} · {lang === "fr" ? "démo visuelle, traduction non activée" : "visual demo, translation not enabled"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
