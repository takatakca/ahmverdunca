import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { MAIN_NAV, MORE_NAV, EXTERNAL_LINKS, SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { LogoSlot } from "./logo-slot";
import { LangSwitch } from "./lang-switch";

export function SiteFooter() {
  const { t, l, lang } = useI18n();
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";
  const showPhone = SITE.phonePublic;

  return (
    <footer className="relative mt-auto overflow-hidden bg-competition text-navy-foreground">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden />
      <div className="giant-watermark pointer-events-none absolute -bottom-6 -left-6 select-none opacity-60" aria-hidden>
        Verdun
      </div>

      <div className="relative border-y border-navy-foreground/12">
        <div className="container-site grid md:grid-cols-[0.72fr_1.28fr]">
          <div className="border-b border-navy-foreground/12 py-8 md:border-b-0 md:border-r md:py-10 md:pr-10">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Le raccourci des familles" : "Families' shortcut"}</p>
            <p className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.82] tracking-[-0.04em] sm:text-6xl">
              {lang === "fr" ? "Mon horaire." : "My schedule."}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-5 py-8 md:py-10 md:pl-10 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-navy-foreground/62 md:text-base">
              {lang === "fr"
                ? "Pratiques, matchs, arénas et accès officiels : l’information utile avant de partir pour la glace."
                : "Practices, games, arenas and official access: the information families need before heading to the rink."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/horaires"
                className="inline-flex min-h-12 items-center gap-2 bg-sport px-5 font-display text-base font-bold uppercase tracking-wide text-sport-foreground transition-transform hover:-translate-y-0.5"
              >
                {lang === "fr" ? "Voir les horaires" : "View schedules"} <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/equipes"
                className="inline-flex min-h-12 items-center border border-navy-foreground/22 px-5 font-display text-base font-bold uppercase tracking-wide text-navy-foreground/90 transition-colors hover:bg-navy-foreground/8"
              >
                {lang === "fr" ? "Équipes" : "Teams"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-site relative grid gap-0 py-0 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.9fr]">
        <div className="border-b border-navy-foreground/10 py-10 lg:border-b-0 lg:border-r lg:py-14 lg:pr-10">
          <div className="flex items-center gap-4">
            <LogoSlot className="drop-shadow-[0_12px_26px_rgba(0,0,0,0.28)]" />
            <div>
              <p className="font-display text-3xl font-extrabold uppercase leading-none tracking-[-0.025em]">AHM Verdun</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-foreground/45">
                {l(SITE.name)}
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-navy-foreground/58">{t("footer.tagline")}</p>
          <div className="mt-7 grid grid-cols-2 gap-px border border-navy-foreground/10 bg-navy-foreground/10">
            <div className="bg-competition p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-navy-foreground/40">{lang === "fr" ? "Territoire" : "Home"}</p>
              <p className="mt-1 font-display text-xl font-bold uppercase">{SITE.city}</p>
            </div>
            <div className="bg-competition p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-navy-foreground/40">{lang === "fr" ? "Saison" : "Season"}</p>
              <p className="mt-1 font-display text-xl font-bold uppercase">{SITE.season}</p>
            </div>
          </div>
          {showPhone && (
            SITE.phonePublic ? (
              <a href={`tel:${SITE.phoneE164}`} className="mt-5 inline-block font-display text-xl font-bold text-navy-foreground hover:text-sport-foreground">
                {SITE.phoneDisplay}
              </a>
            ) : (
              <p className="mt-5 font-display text-xl font-bold text-navy-foreground/72">
                {SITE.phoneDisplay}
                <span className="ml-2 align-middle text-[9px] font-sans uppercase tracking-[0.18em] text-sport-foreground">
                  {lang === "fr" ? "canal à venir" : "channel upcoming"}
                </span>
              </p>
            )
          )}
        </div>

        <div className="border-b border-navy-foreground/10 py-9 lg:border-b-0 lg:border-r lg:px-8 lg:py-14">
          <p className="eyebrow mb-5 text-sport-foreground/85">{t("footer.quick")}</p>
          <ul className="space-y-0">
            {MAIN_NAV.map((item, index) => (
              <li key={item.key} className="border-t border-navy-foreground/8 first:border-t-0">
                <Link to={item.to} className="group flex items-center justify-between py-2.5 text-sm text-navy-foreground/72 hover:text-navy-foreground">
                  <span>{t(`nav.${item.key}` as const)}</span>
                  <span className="font-display text-xs text-navy-foreground/25 group-hover:text-sport-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-b border-navy-foreground/10 py-9 lg:border-b-0 lg:border-r lg:px-8 lg:py-14">
          <p className="eyebrow mb-5 text-sport-foreground/85">{t("footer.more")}</p>
          <ul className="space-y-0">
            {MORE_NAV.map((item) => (
              <li key={item.key} className="border-t border-navy-foreground/8 first:border-t-0">
                <Link to={item.to} className="block py-2.5 text-sm text-navy-foreground/72 hover:text-navy-foreground">
                  {t(`nav.${item.key}` as const)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="py-9 lg:py-14 lg:pl-8">
          <p className="eyebrow mb-5 text-sport-foreground/85">{lang === "fr" ? "Accès officiels" : "Official access"}</p>
          <div className="space-y-3">
            <a href={EXTERNAL_LINKS.wllv} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between border-b border-navy-foreground/10 pb-3 text-sm text-navy-foreground/72 hover:text-navy-foreground">
              WLLV — Les Chacals <ExternalLink className="size-3.5" />
            </a>
            <Link to="/inscriptions" className="block border-b border-navy-foreground/10 pb-3 text-sm text-navy-foreground/72 hover:text-navy-foreground">
              {t("reg.cta")}
            </Link>
            <Link to="/connexion" className="block border-b border-navy-foreground/10 pb-3 text-sm text-navy-foreground/72 hover:text-navy-foreground">
              {t("reg.loginTitle")}
            </Link>
            <Link to="/confidentialite" className="block border-b border-navy-foreground/10 pb-3 text-sm text-navy-foreground/72 hover:text-navy-foreground">
              {t("footer.legal")}
            </Link>
          </div>
          <div className="mt-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-foreground/35">{lang === "fr" ? "Langue" : "Language"}</p>
            <LangSwitch />
          </div>
        </div>
      </div>

      <div className="relative border-t border-navy-foreground/10">
        <div className="container-site flex flex-col gap-3 py-5 text-[10px] uppercase tracking-[0.14em] text-navy-foreground/38 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {l(SITE.name)} · {t("footer.rights")}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {!publicLaunch && <span>{t("footer.prototype")}</span>}
            <span>Expérience numérique · GROUPE TAKATAK</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
