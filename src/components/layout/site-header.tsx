import { useEffect, useRef, useState } from "react";
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
  const showPhone = SITE.phonePublic;
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuTop, setMobileMenuTop] = useState(72);
  const headerRef = useRef<HTMLElement>(null);

  // Subtle compaction once the parent starts scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { preferredTeam } = usePreferredTeam();
  const savedTeam = TEAMS.find((team) => team.slug === preferredTeam);

  // Close menus on navigation
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Lock the page behind the mobile navigation without losing the previous
  // body state. The menu is modal-like on phones and must not allow the page
  // underneath to scroll.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  // Keep the mobile panel exactly below the rendered header. This avoids
  // overlap when the preproduction banner is visible and while the sticky
  // header compacts on scroll.
  useEffect(() => {
    if (!open) return;

    const updateMobileMenuTop = () => {
      const bottom = headerRef.current?.getBoundingClientRect().bottom ?? 72;
      setMobileMenuTop(Math.max(0, Math.round(bottom)));
    };

    updateMobileMenuTop();

    const observer = new ResizeObserver(updateMobileMenuTop);
    if (headerRef.current) observer.observe(headerRef.current);

    window.addEventListener("resize", updateMobileMenuTop);
    window.addEventListener("scroll", updateMobileMenuTop, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMobileMenuTop);
      window.removeEventListener("scroll", updateMobileMenuTop);
    };
  }, [open, scrolled]);

  // Do not keep a phone/tablet overlay alive after crossing the desktop
  // breakpoint (rotation, foldables, window resizing).
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeMobileMenuOnDesktop = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) setOpen(false);
    };
    closeMobileMenuOnDesktop(media);
    media.addEventListener("change", closeMobileMenuOnDesktop);
    return () => media.removeEventListener("change", closeMobileMenuOnDesktop);
  }, []);

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
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-navy-foreground/12 bg-competition/96 text-navy-foreground shadow-[0_18px_40px_-32px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      {/* Top utility bar (desktop) */}
      <div className={cn("hidden overflow-hidden border-b border-navy-foreground/10 transition-[max-height,opacity] duration-300 lg:block", scrolled ? "max-h-0 opacity-0" : "max-h-9 opacity-100")}>
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
            {showPhone && (
              SITE.phonePublic ? (
                <a
                  href={`tel:${SITE.phoneE164}`}
                  className="inline-flex items-center gap-1.5 text-navy-foreground/70 hover:text-navy-foreground"
                >
                  <PhoneCall className="size-3.5" aria-hidden />
                  {SITE.phoneDisplay}
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-navy-foreground/60" title={lang === "fr" ? "Numéro réservé — activation à venir" : "Reserved number — activation upcoming"}>
                  <PhoneCall className="size-3.5" aria-hidden />
                  {SITE.phoneDisplay}
                  <span className="text-[9px] uppercase tracking-wider text-sport-foreground">{lang === "fr" ? "bientôt" : "soon"}</span>
                </span>
              )
            )}
            <LangSwitch />
          </div>
        </div>
      </div>

      <div className={cn("container-site flex items-center justify-between gap-3 transition-[height] duration-300", scrolled ? "h-16 lg:h-[68px]" : "h-[72px] lg:h-20")}>
        <Link to="/" className="group flex min-w-0 items-center gap-3" aria-label={t("nav.home")}>
          <LogoSlot className="drop-shadow-[0_10px_22px_rgba(0,0,0,0.28)] transition-transform duration-300 group-hover:scale-[1.03]" />
          <span className="hidden min-w-0 items-center gap-3 sm:flex">
            <span className="h-8 w-px bg-navy-foreground/20" aria-hidden />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-display text-[1.35rem] font-extrabold uppercase tracking-tight">AHM Verdun</span>
              <span className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-foreground/55">
                {lang === "fr" ? "Hockey mineur · Verdun" : "Minor hockey · Verdun"}
              </span>
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
              className="border-b-2 border-transparent px-3 py-2 font-display text-sm font-bold uppercase tracking-[0.08em] text-navy-foreground/72 transition-colors hover:border-navy-foreground/20 hover:text-navy-foreground"
              activeProps={{ className: "!text-navy-foreground !border-sport" }}
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
                "flex items-center gap-1 border-b-2 border-transparent px-3 py-2 font-display text-sm font-bold uppercase tracking-[0.08em] text-navy-foreground/72 transition-colors hover:border-navy-foreground/20 hover:text-navy-foreground",
                isMoreActive && "border-sport text-navy-foreground",
              )}
            >
              {t("nav.more")} <ChevronDown className={cn("size-4 transition-transform", moreOpen && "rotate-180")} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full w-72 border border-navy/10 border-t-sport bg-background p-2 text-foreground shadow-xl animate-in fade-in slide-in-from-top-1">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.key}
                    to={item.to}
                    className="block border-b border-navy/8 px-3 py-3 text-sm font-semibold last:border-b-0 hover:bg-ice hover:text-sport"
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
            className="hidden text-navy-foreground hover:bg-navy-foreground/10 xs:inline-flex md:hidden"
            aria-label={t("nav.search")}
          >
            <Link to="/recherche"><Search className="size-5" /></Link>
          </Button>
          <Button asChild variant="sport" size="sm" className="px-2.5 sm:hidden">
            <Link to="/horaires" search={preferredTeam ? { team: preferredTeam } : {}}>
              <CalendarDays className="size-4" />
              <span className="text-xs">{lang === "fr" ? "Horaire" : "Schedule"}</span>
            </Link>
          </Button>
          <Button asChild variant="sport" size="sm" className="hidden sm:inline-flex">
            <Link to="/horaires" search={preferredTeam ? { team: preferredTeam } : {}}>
              <CalendarDays className="size-4" />
              {lang === "fr" ? "Mon horaire" : "My schedule"}
            </Link>
          </Button>
          <button
            type="button"
            className="tap-target inline-flex size-11 shrink-0 items-center justify-center border border-navy-foreground/15 text-navy-foreground hover:bg-navy-foreground/10 lg:hidden"
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
        <div
          id="mobile-menu"
          className="technical-grid fixed inset-x-0 z-[60] overflow-y-auto overscroll-contain bg-competition pb-[env(safe-area-inset-bottom)] lg:hidden animate-in fade-in slide-in-from-top-2"
          style={{
            top: mobileMenuTop,
            bottom: "calc(3.5rem + env(safe-area-inset-bottom))",
            maxHeight: `calc(100dvh - ${mobileMenuTop}px - 3.5rem - env(safe-area-inset-bottom))`,
          }}
        >
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
                  className="relative overflow-hidden border border-navy-foreground/15 bg-navy-foreground/[0.035] px-4 py-5 font-display text-xl font-extrabold uppercase leading-none text-navy-foreground/90"
                  activeProps={{ className: "border-sport bg-sport/10 text-sport-foreground" }}
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
              {showPhone && (
                SITE.phonePublic ? (
                  <Button asChild variant="outline-light" size="lg">
                    <a href={`tel:${SITE.phoneE164}`}>
                      <PhoneCall className="size-4" />
                      {SITE.phoneDisplay}
                    </a>
                  </Button>
                ) : (
                  <div className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-navy-foreground/20 px-4 text-sm font-semibold text-navy-foreground/75">
                    <PhoneCall className="size-4" />
                    {SITE.phoneDisplay}
                    <span className="text-[10px] uppercase tracking-wider text-sport-foreground">{lang === "fr" ? "à venir" : "coming soon"}</span>
                  </div>
                )
              )}
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
