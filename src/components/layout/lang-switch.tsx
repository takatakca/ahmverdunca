import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Only expose languages that are fully translated and functional.
 * This keeps the production header truthful and avoids dead-end language choices.
 */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const langs: Lang[] = ["fr", "en"];

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={cn(
        "inline-flex items-center rounded-md border border-navy-foreground/25 bg-navy-foreground/[0.03] p-0.5",
        className,
      )}
    >
      {langs.map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={lang === language}
          onClick={() => setLang(language)}
          className={cn(
            "tap-target min-h-9 rounded-[4px] px-3 font-display text-xs font-bold uppercase tracking-wider transition-colors",
            lang === language
              ? "bg-sport text-sport-foreground"
              : "text-navy-foreground/70 hover:bg-navy-foreground/10 hover:text-navy-foreground",
          )}
        >
          {language}
        </button>
      ))}
    </div>
  );
}
