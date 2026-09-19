import { useI18n } from "@/lib/i18n";

/** Permanent pre-production marker. Removed only at go-live. */
export function PreprodBanner() {
  const { lang } = useI18n();
  return (
    <div className="bg-demo-soft text-center text-[11px] font-semibold uppercase tracking-wider text-demo-foreground">
      <div className="container-site py-1">
        {lang === "fr"
          ? "Maquette de préproduction — Phase 1 — Données de démonstration. Ce site n'est pas le site officiel."
          : "Pre-production mockup — Phase 1 — Demo data. This is not the official website."}
      </div>
    </div>
  );
}
