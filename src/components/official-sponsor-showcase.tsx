import { ExternalLink, Handshake } from "lucide-react";
import { SPONSORS } from "@/data/sponsors";
import { useI18n } from "@/lib/i18n";

function sponsorMark(name: string) {
  const clean = name
    .replace(/[—/&]/g, " ")
    .split(/\s+/)
    .filter((part) => part.length > 1 && !["de", "du", "des", "la", "le", "les"].includes(part.toLocaleLowerCase("fr-CA")));
  return clean.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AH";
}

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
        const mark = sponsorMark(sponsor.name);
        const inner = (
          <>
            <div className="flex items-start justify-between gap-4">
              <span className={compact
                ? "flex size-11 items-center justify-center border border-white/16 bg-white/[0.045] font-display text-lg font-extrabold text-sport-foreground"
                : "flex size-12 items-center justify-center border border-navy/12 bg-competition font-display text-lg font-extrabold text-sport-foreground"
              }>
                {mark}
              </span>
              <span className={compact
                ? "font-display text-sm font-bold text-white/22"
                : "font-display text-sm font-bold text-navy/16"
              }>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className={compact ? "mt-6" : "mt-8"}>
              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-sport">
                {lang === "fr" ? "Partenaire AHMV" : "AHMV partner"}
              </p>
              <p className={compact
                ? "mt-2 font-display text-xl font-extrabold uppercase leading-[0.9] text-white"
                : "mt-2 font-display text-2xl font-extrabold uppercase leading-[0.9] tracking-[-0.02em] text-navy"
              }>
                {sponsor.name}
              </p>
              <p className={compact
                ? "mt-3 text-[8px] font-bold uppercase tracking-[0.14em] text-white/38"
                : "mt-3 text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
              }>
                {sponsor.websiteVerified
                  ? (lang === "fr" ? "Lien officiel vérifié" : "Verified official link")
                  : (lang === "fr" ? "Identité répertoriée" : "Listed identity")}
              </p>
            </div>

            <div className={compact
              ? "mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
              : "mt-6 flex items-center justify-between border-t border-navy/10 pt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport"
            }>
              <span>
                {sponsor.website
                  ? (lang === "fr" ? "Visiter" : "Visit")
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
          {lang === "fr" ? "Identités protégées" : "Protected identities"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {lang === "fr"
            ? "Les initiales servent uniquement de repère graphique AHMV. Elles ne remplacent pas et ne prétendent pas reproduire le logo du partenaire. Un logo approuvé pourra être branché plus tard."
            : "Initials are only an AHMV visual marker. They do not replace or imitate the partner logo. An approved logo can be connected later."}
        </p>
      </div>
    </div>
  );
}
