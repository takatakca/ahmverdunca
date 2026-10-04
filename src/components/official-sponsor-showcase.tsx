import { ExternalLink, Handshake } from "lucide-react";
import { SPONSORS } from "@/data/sponsors";
import { useI18n } from "@/lib/i18n";

export function OfficialSponsorShowcase({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { lang } = useI18n();

  return (
    <div className={compact
      ? "grid gap-px overflow-hidden border border-white/12 bg-white/12 sm:grid-cols-2 lg:grid-cols-4"
      : "grid gap-px overflow-hidden border border-navy/12 bg-navy/12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    }>
      {SPONSORS.map((sponsor, index) => {
        const hasOfficialLogo = sponsor.logoApproved && Boolean(sponsor.logoUrl);
        const inner = (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className={compact
                ? "flex min-h-16 min-w-0 flex-1 items-center border border-white/12 bg-white/[0.035] px-4 py-3"
                : "flex min-h-20 min-w-0 flex-1 items-center border border-navy/10 bg-ice/55 px-4 py-3"
              }>
                {hasOfficialLogo ? (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    loading="lazy"
                    decoding="async"
                    className={compact ? "max-h-10 max-w-full object-contain" : "max-h-12 max-w-full object-contain"}
                  />
                ) : (
                  <span className={compact
                    ? "font-display text-lg font-extrabold uppercase leading-[0.92] text-white"
                    : "font-display text-xl font-extrabold uppercase leading-[0.92] text-navy"
                  }>
                    {sponsor.name}
                  </span>
                )}
              </div>
              <span className={compact
                ? "font-display text-sm font-bold text-white/22"
                : "font-display text-sm font-bold text-navy/16"
              }>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className={compact ? "mt-5" : "mt-6"}>
              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-sport">
                {lang === "fr" ? "Partenaire AHMV" : "AHMV partner"}
              </p>
              <p className={compact
                ? "mt-2 text-[10px] font-semibold leading-relaxed text-white/58"
                : "mt-2 text-xs font-semibold leading-relaxed text-muted-foreground"
              }>
                {hasOfficialLogo
                  ? (lang === "fr" ? "Logo officiel vérifié" : "Verified official logo")
                  : (lang === "fr"
                      ? "Identité officielle affichée sans faux logo; le visuel sera branché dès qu’un fichier officiel est vérifié."
                      : "Official identity shown without a simulated logo; artwork will be connected once an official file is verified.")}
              </p>
            </div>

            <div className={compact
              ? "mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
              : "mt-6 flex items-center justify-between border-t border-navy/10 pt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport"
            }>
              <span>
                {sponsor.website
                  ? (lang === "fr" ? "Site officiel" : "Official website")
                  : (lang === "fr" ? "Lien à confirmer" : "Link to confirm")}
              </span>
              {sponsor.website && <ExternalLink className="size-3.5" aria-hidden />}
            </div>
          </>
        );

        const classes = compact
          ? "interactive-surface flex min-h-48 flex-col justify-between bg-competition p-4 transition-colors hover:bg-white/[0.05]"
          : "interactive-surface flex min-h-64 flex-col justify-between bg-background p-5 transition-colors hover:bg-ice/55";

        return sponsor.website ? (
          <a
            key={sponsor.name}
            href={sponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
            aria-label={`${sponsor.name} · ${lang === "fr" ? "site officiel" : "official website"}`}
          >
            {inner}
          </a>
        ) : (
          <article key={sponsor.name} className={classes}>
            {inner}
          </article>
        );
      })}
    </div>
  );
}

export function SponsorIdentityNotice() {
  const { lang } = useI18n();
  return (
    <div className="flex items-start gap-3 border border-navy/12 bg-ice p-4">
      <span className="flex size-9 shrink-0 items-center justify-center bg-background">
        <Handshake className="size-4 text-sport" aria-hidden />
      </span>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-navy">
          {lang === "fr" ? "Logos officiels seulement" : "Official logos only"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {lang === "fr"
            ? "Aucun logo de commanditaire n’est recréé ou simulé. Les cartes utilisent le nom officiel et le lien vérifié jusqu’à ce qu’un fichier de marque officiel soit disponible."
            : "Sponsor logos are never recreated or simulated. Cards use the official name and verified link until an official brand file is available."}
        </p>
      </div>
    </div>
  );
}
