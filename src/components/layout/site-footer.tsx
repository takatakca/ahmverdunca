import { Link } from "@tanstack/react-router";
import { Download, ExternalLink, Facebook, Instagram } from "lucide-react";
import { EXTERNAL_LINKS, MAIN_NAV, MORE_NAV, SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { useAhmvPhoneStatus } from "@/lib/use-ahmv-phone-status";
import { LogoSlot } from "./logo-slot";
import { LangSwitch } from "./lang-switch";
import { NewsletterInterest } from "@/components/newsletter-interest";
import { usePwaInstalled } from "@/lib/use-pwa-installed";

export function SiteFooter() {
  const { t, l, lang } = useI18n();
  const installed = usePwaInstalled();
  const { phonePublic, phoneDisplay, phoneE164 } = useAhmvPhoneStatus();

  return (
    <footer className="relative mt-auto overflow-hidden border-t-2 border-t-sport bg-competition text-navy-foreground">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />
      <div className="giant-watermark pointer-events-none absolute -bottom-6 -left-6 select-none opacity-35" aria-hidden>
        Verdun
      </div>

      <div className="relative border-b border-navy-foreground/10">
        <div className="container-site grid gap-5 py-6 md:grid-cols-[1fr_0.9fr] md:items-center md:py-8">
          <div className="flex min-w-0 items-center gap-3">
            <LogoSlot size="lg" className="size-16 shrink-0 sm:size-20" />
            <div className="min-w-0">
              <p className="font-display text-3xl font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">AHM Verdun</p>
              <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-navy-foreground/45">
                {l(SITE.name)}
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-navy-foreground/38">
                {SITE.city}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("ahmv:install-open"))}
              className="premium-control inline-flex min-h-10 items-center gap-2 border border-sport/35 px-3 text-[9px] font-bold uppercase tracking-[0.08em] text-white hover:bg-white/[0.04]"
              aria-haspopup="dialog"
            >
              <Download className="size-4 text-sport-foreground" aria-hidden />
              {installed ? (lang === "fr" ? "Déjà installé" : "Installed") : (lang === "fr" ? "Installer" : "Install")}
            </button>
            <a href={EXTERNAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="premium-control flex size-10 items-center justify-center border border-white/14 text-white hover:border-sport" aria-label="Facebook AHM Verdun">
              <Facebook className="size-4" />
            </a>
            <a href={EXTERNAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="premium-control flex size-10 items-center justify-center border border-white/14 text-white hover:border-sport" aria-label="Instagram AHM Verdun">
              <Instagram className="size-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-b border-navy-foreground/10">
        <div className="container-site py-5 md:py-6">
          <NewsletterInterest lang={lang} source="ahmv-footer" />
        </div>
      </div>

      <div className="container-site relative grid md:grid-cols-3">
        <div className="border-b border-navy-foreground/10 py-6 md:border-b-0 md:border-r md:pr-7">
          <p className="eyebrow mb-3 text-sport-foreground/85">{t("footer.quick")}</p>
          <div className="grid grid-cols-2 gap-x-4">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className="border-t border-navy-foreground/8 py-2 text-sm text-navy-foreground/70 first:border-t-0 hover:text-white"
              >
                {t(`nav.${item.key}` as const)}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-b border-navy-foreground/10 py-6 md:border-b-0 md:border-r md:px-7">
          <p className="eyebrow mb-3 text-sport-foreground/85">{t("footer.more")}</p>
          <div className="grid grid-cols-2 gap-x-4">
            {MORE_NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className="border-t border-navy-foreground/8 py-2 text-sm text-navy-foreground/70 first:border-t-0 hover:text-white"
              >
                {t(`nav.${item.key}` as const)}
              </Link>
            ))}
          </div>
        </div>

        <div className="py-6 md:pl-7">
          <p className="eyebrow mb-3 text-sport-foreground/85">{lang === "fr" ? "Accès utiles" : "Useful access"}</p>
          <div className="space-y-2 text-sm text-navy-foreground/70">
            <a href="/equipes#resultats" className="flex items-center justify-between border-t border-navy-foreground/8 py-2 hover:text-white">
              {lang === "fr" ? "Résultats & classements" : "Results & standings"}
            </a>
            <a href={EXTERNAL_LINKS.wllv} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between border-t border-navy-foreground/8 py-2 hover:text-white">
              WLLV — Les Chacals <ExternalLink className="size-3.5" />
            </a>
            <Link to="/inscriptions" className="block border-t border-navy-foreground/8 py-2 hover:text-white">
              {t("reg.cta")}
            </Link>
            <Link to="/confidentialite" className="block border-t border-navy-foreground/8 py-2 hover:text-white">
              {t("footer.legal")}
            </Link>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-navy-foreground/35">
              {lang === "fr" ? "Langue" : "Language"}
            </p>
            <LangSwitch />
          </div>

          {phonePublic && (
            <a href={`tel:${phoneE164}`} className="mt-5 block font-display text-lg font-bold text-white hover:text-sport-foreground">
              {phoneDisplay}
            </a>
          )}
        </div>
      </div>

      <div className="relative border-t border-navy-foreground/10">
        <div className="container-site flex flex-col gap-2 py-4 text-[9px] uppercase tracking-[0.12em] text-navy-foreground/34 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {l(SITE.name)} · {t("footer.rights")}</p>
          <span>{lang === "fr" ? "Propulsé par GROUPE TAKATAK" : "Powered by GROUPE TAKATAK"}</span>
        </div>
      </div>
    </footer>
  );
}
