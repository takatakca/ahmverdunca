import { useI18n } from "@/lib/i18n";

/** Proposal marker. Keep visible until the association approves go-live. */
export function PreprodBanner() {
  const { lang } = useI18n();
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";

  if (publicLaunch) return null;

  return (
    <div className="border-b border-navy-foreground/10 bg-navy-deep text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-foreground/70">
      <div className="container-site py-1.5">
        <span className="sm:hidden">
          {lang === "fr" ? "Aperçu AHM Verdun · Préproduction" : "AHM Verdun preview · Pre-production"}
        </span>
        <span className="hidden sm:inline">
          {lang === "fr"
            ? "Aperçu de proposition AHM Verdun — certaines intégrations restent à activer avant lancement"
            : "AHM Verdun proposal preview — some integrations remain to be activated before launch"}
        </span>
      </div>
    </div>
  );
}
