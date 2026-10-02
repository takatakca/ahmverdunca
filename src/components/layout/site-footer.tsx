import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { MAIN_NAV, MORE_NAV, EXTERNAL_LINKS, SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { LogoSlot } from "./logo-slot";
import { LangSwitch } from "./lang-switch";

export function SiteFooter() {
  const { t, l, lang } = useI18n();
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";
  const showPhone = !publicLaunch || SITE.phonePublic;

  return (
    <footer className="mt-auto bg-navy-deep text-navy-foreground">
      <div className="h-1 w-full bg-sport" aria-hidden />
      <div className="container-site grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <LogoSlot />
            <div className="leading-tight">
              <p className="font-display text-xl font-bold uppercase">AHM Verdun</p>
              <p className="text-xs text-navy-foreground/60">{l(SITE.name)}</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-navy-foreground/70">{t("footer.tagline")}</p>
          <p className="mt-4 text-xs text-navy-foreground/50">{SITE.city}</p>
          {showPhone && (
            SITE.phonePublic ? (
              <a href={`tel:${SITE.phoneE164}`} className="mt-2 inline-block text-sm font-semibold text-navy-foreground/85 hover:text-navy-foreground hover:underline">
                {SITE.phoneDisplay}
              </a>
            ) : (
              <p className="mt-2 text-sm font-semibold text-navy-foreground/85">
                {SITE.phoneDisplay}
                <span className="ml-2 text-[10px] uppercase tracking-wider text-sport-foreground">{lang === "fr" ? "canal à venir" : "channel upcoming"}</span>
              </p>
            )
          )}
          {!publicLaunch && <p className="mt-1 text-xs italic text-navy-foreground/50">{t("footer.contactNote")}</p>}
        </div>

        <div>
          <p className="eyebrow mb-4 text-navy-foreground/60">{t("footer.quick")}</p>
          <ul className="space-y-2.5">
            {MAIN_NAV.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.to}
                  className="text-sm text-navy-foreground/85 underline-offset-4 hover:text-navy-foreground hover:underline"
                >
                  {t(`nav.${item.key}` as const)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 text-navy-foreground/60">{t("footer.more")}</p>
          <ul className="space-y-2.5">
            {MORE_NAV.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.to}
                  className="text-sm text-navy-foreground/85 underline-offset-4 hover:text-navy-foreground hover:underline"
                >
                  {t(`nav.${item.key}` as const)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 text-navy-foreground/60">
            {lang === "fr" ? "Accès & partenaires" : "Access & partners"}
          </p>
          <div className="mb-5">
            <p className="mb-2 text-xs text-navy-foreground/55">{lang === "fr" ? "Langues" : "Languages"}</p>
            <LangSwitch />
          </div>
          <ul className="space-y-2.5">
            <li>
              <Link
                to="/inscriptions"
                className="text-sm text-navy-foreground/85 underline-offset-4 hover:text-navy-foreground hover:underline"
              >
                {t("reg.cta")}
              </Link>
            </li>
            <li>
              <Link
                to="/connexion"
                className="text-sm text-navy-foreground/85 underline-offset-4 hover:text-navy-foreground hover:underline"
              >
                {t("reg.loginTitle")}
              </Link>
            </li>
            <li>
              <a
                href={EXTERNAL_LINKS.wllv}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-navy-foreground/85 underline-offset-4 hover:text-navy-foreground hover:underline"
              >
                WLLV — Les Chacals <ExternalLink className="size-3" />
              </a>
            </li>
            <li>
              <Link
                to="/confidentialite"
                className="text-sm text-navy-foreground/85 underline-offset-4 hover:text-navy-foreground hover:underline"
              >
                {t("footer.legal")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-navy-foreground/50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {l(SITE.name)}. {t("footer.rights")}</p>
          <div className="flex flex-col gap-1 text-left md:text-right">
            <p className="uppercase tracking-[0.12em]">{t("footer.prototype")}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-navy-foreground/35">
              Expérience numérique développée par GROUPE TAKATAK
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
