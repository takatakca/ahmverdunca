import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { MAIN_NAV, MORE_NAV, SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoSlot } from "./logo-slot";
import { LangSwitch } from "./lang-switch";

export function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close menus on navigation
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Lock scroll when the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isMoreActive = MORE_NAV.some((n) => pathname.startsWith(n.to));

  return (
    <header className="sticky top-0 z-50 border-b border-navy-foreground/10 bg-navy-deep text-navy-foreground shadow-md">
      {/* Top utility bar (desktop) */}
      <div className="hidden border-b border-navy-foreground/10 lg:block">
        <div className="container-site flex h-9 items-center justify-between text-xs">
          <span className="text-navy-foreground/70">{t("home.heroSub")} · {t("common.season")} {SITE.season}</span>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-navy-foreground/60 hover:text-navy-foreground">{t("nav.admin")}</Link>
            <LangSwitch />
          </div>
        </div>
      </div>

      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link to="/" className="flex items-center gap-3" aria-label={t("nav.home")}>
          <LogoSlot />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl font-bold uppercase tracking-tight">AHM Verdun</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-navy-foreground/60">Hockey mineur</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 font-display text-base font-semibold uppercase tracking-wide text-navy-foreground/80 transition-colors hover:bg-navy-foreground/10 hover:text-navy-foreground"
              activeProps={{ className: "!text-navy-foreground border-b-2 border-sport rounded-b-none" }}
            >
              {t(`nav.${item.key}` as const)}
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
                    {t(`nav.${item.key}` as const)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" className="text-navy-foreground hover:bg-navy-foreground/10" aria-label={t("nav.search")}>
            <Link to="/recherche"><Search className="size-5" /></Link>
          </Button>
          <Button asChild variant="sport" size="sm" className="hidden sm:inline-flex">
            <Link to="/connexion">{t("nav.login")}</Link>
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
          <nav aria-label="Navigation mobile" className="container-site flex flex-col py-4">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="border-b border-navy-foreground/10 py-4 font-display text-2xl font-bold uppercase text-navy-foreground/90"
                activeProps={{ className: "text-sport-foreground pl-3 border-l-4 border-l-sport" }}
              >
                {t(`nav.${item.key}` as const)}
              </Link>
            ))}
            <p className="eyebrow mt-6 mb-2 text-navy-foreground/50">{t("nav.more")}</p>
            <div className="grid grid-cols-2 gap-x-4">
              {MORE_NAV.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className="py-3 text-base font-medium text-navy-foreground/85"
                  activeProps={{ className: "text-sport-foreground underline decoration-sport underline-offset-4" }}
                >
                  {t(`nav.${item.key}` as const)}
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild variant="sport" size="lg">
                <Link to="/connexion">{t("nav.login")}</Link>
              </Button>
              <div className="flex items-center justify-between rounded-md border border-navy-foreground/15 px-4 py-3">
                <span className="text-sm text-navy-foreground/70">{t("nav.language")}</span>
                <LangSwitch />
              </div>
              <Link to="/admin" className="py-2 text-center text-xs text-navy-foreground/50 underline-offset-4 hover:underline">{t("nav.admin")}</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
