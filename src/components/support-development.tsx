import { useEffect, useState } from "react";
import { Coffee, ExternalLink, Heart, X } from "lucide-react";
import { DEVELOPMENT_SUPPORT } from "@/lib/monetization";
import { useI18n } from "@/lib/i18n";

export function SupportDevelopment() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openSupport = () => setOpen(true);
    window.addEventListener("ahmv:support-open", openSupport);
    return () => window.removeEventListener("ahmv:support-open", openSupport);
  }, []);

  if (!DEVELOPMENT_SUPPORT.enabled) return null;

  const configuredTiers = DEVELOPMENT_SUPPORT.tiers.filter((tier) => tier.url);
  if (configuredTiers.length === 0 && !DEVELOPMENT_SUPPORT.customUrl) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="premium-control fixed bottom-20 right-3 z-40 inline-flex min-h-11 items-center gap-2 border border-sport/35 bg-competition/96 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_50px_-26px_rgba(0,0,0,0.9)] backdrop-blur lg:bottom-4 lg:right-4"
        aria-label={lang === "fr" ? "Soutenir le développement numérique" : "Support digital development"}
      >
        <Coffee className="size-4 text-sport-foreground" />
        <span className="hidden sm:inline">{lang === "fr" ? "Offrir un café au site" : "Buy the site a coffee"}</span>
        <Heart className="size-3.5 text-sport-foreground" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-navy-deep/72 p-2 backdrop-blur-sm sm:items-center sm:p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-development-title"
            className="relative w-full max-w-xl overflow-hidden border border-white/12 bg-background shadow-[0_32px_90px_-28px_rgba(0,0,0,0.7)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="premium-control absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center border border-navy/12 bg-background"
              aria-label={lang === "fr" ? "Fermer" : "Close"}
            >
              <X className="size-4" />
            </button>

            <div className="bg-competition p-6 pr-16 text-white md:p-8 md:pr-20">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Contribution volontaire" : "Voluntary contribution"}</p>
              <h2 id="support-development-title" className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.86] tracking-[-0.03em]">
                {lang === "fr" ? "Soutenir le développement numérique" : "Support digital development"}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {lang === "fr"
                  ? "Cette contribution soutient le travail numérique et technique. Elle n’est pas présentée comme un don à AHM Verdun ni comme une collecte d’équipe."
                  : "This contribution supports digital and technical work. It is not presented as a donation to AHM Verdun or as team fundraising."}
              </p>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-sport-foreground">
                {lang === "fr" ? "Bénéficiaire" : "Beneficiary"} · {DEVELOPMENT_SUPPORT.beneficiary}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {configuredTiers.map((tier) => (
                  <a
                    key={tier.amount}
                    href={tier.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-control flex min-h-14 items-center justify-center gap-2 border border-navy/12 bg-ice font-display text-xl font-extrabold text-navy hover:border-sport"
                  >
                    {tier.amount} $
                    <ExternalLink className="size-3.5 text-sport" />
                  </a>
                ))}
              </div>
              {DEVELOPMENT_SUPPORT.customUrl && (
                <a
                  href={DEVELOPMENT_SUPPORT.customUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-control mt-2 flex min-h-12 w-full items-center justify-between bg-navy px-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-white"
                >
                  {lang === "fr" ? "Choisir un autre montant" : "Choose another amount"}
                  <ExternalLink className="size-4 text-sport-foreground" />
                </a>
              )}
              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                {lang === "fr"
                  ? "Le paiement s’effectue sur la page sécurisée du fournisseur configuré. AHMV ne conserve aucune donnée de carte."
                  : "Payment takes place on the configured provider’s secure page. AHMV stores no card information."}
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
