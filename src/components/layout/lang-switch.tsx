import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** FR / EN switch. Keeps the user on the same page. */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const langs: Lang[] = ["fr", "en"];
  return (
    <div role="group" aria-label={t("nav.language")} className={cn("inline-flex items-center rounded-md border border-navy-foreground/25 p-0.5", className)}>
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-[4px] px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wider transition-colors",
            lang === l ? "bg-navy-foreground text-navy" : "text-navy-foreground/70 hover:text-navy-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
