import { useI18n } from "@/lib/i18n";

/** Proposal marker. Keep visible until the association approves go-live. */
export function PreprodBanner() {
  const { lang } = useI18n();
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";

  if (publicLaunch) return null;

  return (
    <div className="border-b border-navy-foreground/10 bg-navy-deep text-center text-[9px] font-semibold uppercase tracking-[0.11em] text-navy-foreground/65 sm:text-[10px] sm:tracking-[0.14em]">
      <div className="container-site line-clamp-1 py-1 sm:line-clamp-none sm:py-1.5">
        {lang === "fr"
          ? "Aperçu de proposition AHM Verdun — certaines intégrations restent à activer avant lancement"
          : "AHM Verdun proposal preview — some integrations remain to be activated before launch"}
      </div>
    </div>
  );
}
