import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ChevronDown, Menu, PhoneCall, Search, X } from "lucide-react";
import { MAIN_NAV, MORE_NAV, SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoSlot } from "./logo-slot";
import { LangSwitch } from "./lang-switch";
import { TEAMS } from "@/data/teams";
import { usePreferredTeam } from "@/lib/team-preference";
import type { TranslationKey } from "@/lib/translations";

export function SiteHeader() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { preferredTeam } = usePreferredTeam();
  const savedTeam = TEAMS.find((team) => team.slug === preferredTeam);

  // Close menus on navigation
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Lock scroll when the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Let keyboard users close either navigation menu immediately.
  useEffect(() => {
    if (!open && !moreOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      setMoreOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, moreOpen]);

  const isMoreActive = MORE_NAV.some((n) => pathname.startsWith(n.to));

  return (
    <header className="sticky top-0 z-50 border-b border-navy-foreground/10 bg-navy-deep text-navy-foreground shadow-md">
      {/* Top utility bar (desktop) */}
      <div className="hidden border-b border-navy-foreground/10 lg:block">
        <div className="container-site flex h-9 items-center justify-between text-xs">
          <span className="text-navy-foreground/70">{t("home.heroSub")} · {t("common.season")} {SITE.season}</span>
          <div className="flex items-center gap-4">
            {savedTeam && (
              <Link
                to="/equipes/$slug"
                params={{ slug: savedTeam.slug }}
                className="inline-flex items-center gap-1.5 font-semibold text-navy-foreground/75 hover:text-navy-foreground"
              >
                <span className="size-1.5 rounded-full bg-sport" aria-hidden />
                {lang === "fr" ? "Mon équipe" : "My team"} · {savedTeam.code}
              </Link>
            )}
            <a
              href={`tel:${SITE.phoneE164}`}
              className="inline-flex items-center gap-1.5 text-navy-foreground/70 hover:text-navy-foreground"
            >
              <PhoneCall className="size-3.5" aria-hidden />
              {SITE.phoneDisplay}
            </a>
            <LangSwitch />
          </div>
        </div>
      </div>

      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link to="/" className="flex items-center gap-3" aria-label={t("nav.home")}>
          <LogoSlot />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl font-bold uppercase tracking-tight">AHM Verdun</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-navy-foreground/60">
              {lang === "fr" ? "Hockey mineur" : "Minor hockey"}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label={lang === "fr" ? "Navigation principale" : "Main navigation"} className="hidden items-center gap-1 lg:flex">
          {MAIN_NAV.filter((item) => item.key !== "home").map((item) => (
            <Link
              key={item.key}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 font-display text-base font-semibold uppercase tracking-wide text-navy-foreground/80 transition-colors hover:bg-navy-foreground/10 hover:text-navy-foreground"
              activeProps={{ className: "!text-navy-foreground border-b-2 border-sport rounded-b-none" }}
            >
              {t(`nav.${item.key}` as TranslationKey)}
            </Link>
          ))}
          <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((v) => !v)}
              onMouseEnter={() => setMoreOpen(true)}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-2 font-display text-base font-semibold uppercase tracking-wide text-navy-foreground/80 transition-colors hover:bg-navy-foreground/10 hover:text-navy-foreground",
                isMoreActive && "text-navy-foreground border-b-2 border-sport rounded-b-none",
              )}
            >
              {t("nav.more")} <ChevronDown className={cn("size-4 transition-transform", moreOpen && "rotate-180")} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full w-64 rounded-b-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl animate-in fade-in slide-in-from-top-1">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.key}
                    to={item.to}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                    activeProps={{ className: "bg-secondary text-sport" }}
                  >
                    {t(`nav.${item.key}` as TranslationKey)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden gap-1.5 text-navy-foreground hover:bg-navy-foreground/10 md:inline-flex"
          >
            <Link to="/recherche">
              <Search className="size-4" />
              <span>{t("nav.search")}</span>
              <kbd className="ml-1 rounded border border-navy-foreground/20 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-navy-foreground/50">
                /
              </kbd>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-navy-foreground hover:bg-navy-foreground/10 md:hidden"
            aria-label={t("nav.search")}
          >
            <Link to="/recherche"><Search className="size-5" /></Link>
          </Button>
          <Button asChild variant="sport" size="sm" className="hidden sm:inline-flex">
            <Link to="/horaires" search={preferredTeam ? { team: preferredTeam } : {}}>
              <CalendarDays className="size-4" />
              {lang === "fr" ? "Mon horaire" : "My schedule"}
            </Link>
          </Button>
          <button
            type="button"
            className="tap-target inline-flex items-center justify-center rounded-md text-navy-foreground hover:bg-navy-foreground/10 lg:hidden"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-navy-deep lg:hidden animate-in fade-in slide-in-from-top-2">
          <nav
            aria-label={lang === "fr" ? "Navigation mobile" : "Mobile navigation"}
            className="container-site py-5"
          >
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Accès rapides" : "Quick access"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { key: "schedule", to: "/horaires" },
                { key: "teams", to: "/equipes" },
                { key: "registration", to: "/inscriptions" },
                { key: "arenas", to: "/arenas" },
              ].map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className="rounded-lg border border-navy-foreground/15 bg-navy-foreground/[0.04] px-4 py-4 font-display text-xl font-bold uppercase text-navy-foreground/90"
                  activeProps={{ className: "border-sport bg-navy-foreground/[0.08] text-sport-foreground" }}
                >
                  {t(`nav.${item.key}` as TranslationKey)}
                </Link>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between">
              <p className="eyebrow text-navy-foreground/50">
                {lang === "fr" ? "Explorer" : "Explore"}
              </p>
              <Link
                to="/recherche"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-foreground/80"
              >
                <Search className="size-4" />
                {t("nav.search")}
              </Link>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-5">
              {[
                { key: "news", to: "/nouvelles" },
                { key: "tournaments", to: "/tournois" },
                { key: "gallery", to: "/galerie" },
                { key: "wllv", to: "/wllv" },
                { key: "coaches", to: "/entraineurs" },
                { key: "faq", to: "/faq" },
                { key: "resources", to: "/ressources" },
                { key: "partners", to: "/partenaires" },
                { key: "contact", to: "/contact" },
              ].map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className="border-b border-navy-foreground/10 py-3 text-base font-medium text-navy-foreground/85"
                  activeProps={{ className: "text-sport-foreground" }}
                >
                  {t(`nav.${item.key}` as TranslationKey)}
                </Link>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <Button asChild variant="sport" size="lg">
                <Link to="/horaires" search={preferredTeam ? { team: preferredTeam } : {}}>
                  <CalendarDays className="size-4" />
                  {lang === "fr" ? "Voir mon horaire" : "View my schedule"}
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <Link to="/connexion">{t("nav.login")}</Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <a href={`tel:${SITE.phoneE164}`}>
                  <PhoneCall className="size-4" />
                  {SITE.phoneDisplay}
                </a>
              </Button>
              <div className="flex items-center justify-between rounded-md border border-navy-foreground/15 px-4 py-3">
                <span className="text-sm text-navy-foreground/70">{t("nav.language")}</span>
                <LangSwitch />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
