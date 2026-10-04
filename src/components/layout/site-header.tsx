import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertStatus } from "./alert-status";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ChevronDown, LogIn, MapPin, Menu, PhoneCall, Search, Sparkles, Trophy, Users, X } from "lucide-react";
import { MAIN_NAV, MORE_NAV, SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AHMV_LOGO_URL, LogoSlot } from "./logo-slot";
import { LangSwitch } from "./lang-switch";
import { TEAMS } from "@/data/teams";
import { officialTeamResultsUrl, publicTeamHubUrl } from "@/data/team-directory";
import { usePreferredTeam } from "@/lib/team-preference";
import { useAhmvPhoneStatus } from "@/lib/use-ahmv-phone-status";
import type { TranslationKey } from "@/lib/translations";

export function SiteHeader() {
  const { t, lang } = useI18n();
  const { phonePublic, phoneDisplay, phoneE164 } = useAhmvPhoneStatus();
  const showPhone = phonePublic;
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
  const { preferredTeam, selectedTeams, clearAllTeamPreferences } = usePreferredTeam();
  const savedTeam = TEAMS.find((team) => team.slug === preferredTeam);

  // Close menus on navigation
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeForAssistant = () => {
      setOpen(false);
      setMoreOpen(false);
    };
    window.addEventListener("ahmv:assistant-open", closeForAssistant);
    return () => window.removeEventListener("ahmv:assistant-open", closeForAssistant);
  }, []);

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

  const toggleMobileMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }

    // Navigation always wins over promotional/dialog overlays. Give those
    // surfaces one frame to release their scroll lock before opening the menu.
    window.dispatchEvent(new CustomEvent("ahmv:navigation-open"));
    window.requestAnimationFrame(() => setOpen(true));
  };

  return (
    <header ref={headerRef} className={cn("sticky top-0 isolate overflow-hidden border-b border-t-2 border-b-navy-foreground/12 border-t-sport bg-competition text-navy-foreground shadow-[0_18px_40px_-32px_rgba(0,0,0,0.9)]", open ? "z-[300]" : "z-[200]")}>
      <img
        src={AHMV_LOGO_URL}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-10 top-1/2 w-72 -translate-y-1/2 select-none object-contain opacity-[0.055] saturate-150 sm:w-80 lg:right-6 lg:w-[24rem]"
      />
      <div className="border-b border-white/10 bg-navy-deep">
        <div className="container-site">
          <AlertStatus language={lang} compact />
        </div>
      </div>

      {/* Top utility bar (desktop) */}
      <div className={cn("hidden overflow-hidden border-b border-navy-foreground/10 transition-[max-height,opacity] duration-300 lg:block", scrolled ? "max-h-0 opacity-0" : "max-h-9 opacity-100")}>
        <div className="container-site flex h-9 items-center justify-between text-xs">
          <span className="text-navy-foreground/70">{t("home.heroSub")} · {t("common.season")} {SITE.season}</span>
          <div className="flex items-center gap-4">
            {selectedTeams.length > 0 ? (
              <span className="inline-flex items-center gap-1">
                <a
                  href={publicTeamHubUrl(selectedTeams[0]!)}
                  className="inline-flex items-center gap-1.5 font-semibold text-navy-foreground/75 hover:text-navy-foreground"
                >
                  <span className="size-1.5 rounded-full bg-sport" aria-hidden />
                  {lang === "fr" ? "Mes équipes" : "My teams"} · {selectedTeams.length}
                </a>
                <button
                  type="button"
                  onClick={clearAllTeamPreferences}
                  className="inline-flex size-6 items-center justify-center text-navy-foreground/45 hover:text-sport-foreground"
                  aria-label={lang === "fr" ? "Voir toutes les équipes" : "View all teams"}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </span>
            ) : savedTeam ? (
              <span className="inline-flex items-center gap-1">
                <Link
                  to="/equipes/$slug"
                  params={{ slug: savedTeam.slug }}
                  className="inline-flex items-center gap-1.5 font-semibold text-navy-foreground/75 hover:text-navy-foreground"
                >
                  <span className="size-1.5 rounded-full bg-sport" aria-hidden />
                  {lang === "fr" ? "Ma catégorie" : "My category"} · {savedTeam.code}
                </Link>
                <button
                  type="button"
                  onClick={clearAllTeamPreferences}
                  className="inline-flex size-6 items-center justify-center text-navy-foreground/45 hover:text-sport-foreground"
                  aria-label={lang === "fr" ? "Retirer ma catégorie" : "Remove my category"}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </span>
            ) : null}
            {showPhone && (
              <a
                href={`tel:${phoneE164}`}
                className="inline-flex items-center gap-1.5 text-navy-foreground/70 hover:text-navy-foreground"
              >
                <PhoneCall className="size-3.5" aria-hidden />
                {phoneDisplay}
              </a>
            )}
            <LangSwitch />
          </div>
        </div>
      </div>

      <div className={cn("container-site flex items-center justify-between gap-3 transition-[height] duration-300", scrolled ? "h-[68px] lg:h-[72px]" : "h-[76px] lg:h-[86px]")}>
        <Link to="/" className="group flex min-w-0 items-center gap-3" aria-label={t("nav.home")}>
          <LogoSlot className="transition-transform duration-300 group-hover:scale-[1.045]" />
          <span className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="hidden h-8 w-px bg-navy-foreground/20 sm:block" aria-hidden />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-display text-[1.05rem] font-extrabold uppercase tracking-[-0.025em] xs:text-[1.15rem] sm:text-[1.48rem]">
                <span className="sm:hidden">AHMV</span>
                <span className="hidden sm:inline">AHM Verdun</span>
              </span>
              <span className="mt-1 hidden truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-foreground/55 sm:block">
                {lang === "fr" ? "Leafs · Louves · Hockey mineur" : "Leafs · Louves · Minor hockey"}
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
          <Button asChild variant="sport" size="sm" className="h-11 gap-1.5 px-2 sm:hidden">
            <Link to="/horaires" search={preferredTeam ? { team: preferredTeam } : {}}>
              <CalendarDays className="size-4" />
              <span className="hidden text-[11px] xs:inline">{lang === "fr" ? "Horaire" : "Schedule"}</span>
            </Link>
          </Button>
          <Button asChild variant="sport" size="sm" className="hidden sm:inline-flex">
            <Link to="/horaires" search={preferredTeam ? { team: preferredTeam } : {}}>
              <CalendarDays className="size-4" />
              {lang === "fr" ? "Mon horaire" : "My schedule"}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden border border-sport/30 text-navy-foreground hover:bg-sport/10 md:inline-flex">
            <a href="/membership">
              <Sparkles className="size-4 text-sport-foreground" />
              {lang === "fr" ? "Member · Aperçu" : "Member · Preview"}
            </a>
          </Button>
          <button
            type="button"
            className={cn(
              "premium-control tap-target relative z-[1] inline-flex h-11 shrink-0 items-center justify-center gap-1.5 border-2 px-3 font-display text-[10px] font-extrabold uppercase tracking-[0.08em] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.95)] min-[360px]:gap-2 min-[360px]:px-4 min-[360px]:text-xs min-[360px]:tracking-[0.12em]",
              open
                ? "border-sport bg-sport text-sport-foreground"
                : "border-white/60 bg-white text-competition hover:border-sport hover:bg-sport hover:text-sport-foreground",
            )}
            aria-label={open ? t("nav.close") : t("nav.menu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={toggleMobileMenu}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span>{open ? (lang === "fr" ? "Fermer" : "Close") : "Menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && createPortal(
        <div
          id="mobile-menu"
          className="technical-grid fixed inset-x-0 z-[290] overflow-y-auto overscroll-contain border-t border-white/10 bg-competition shadow-[0_24px_80px_rgba(0,0,0,0.65)] pb-[env(safe-area-inset-bottom)] animate-in fade-in slide-in-from-top-2"
          style={{
            top: mobileMenuTop,
            bottom: "calc(3.5rem + env(safe-area-inset-bottom))",
            maxHeight: `calc(100dvh - ${mobileMenuTop}px - 3.5rem - env(safe-area-inset-bottom))`,
          }}
        >
          <nav
            aria-label={lang === "fr" ? "Navigation mobile" : "Mobile navigation"}
            className="container-site py-3"
          >
            <div className="flex items-center justify-between gap-3 border-b border-navy-foreground/12 pb-3">
              <div className="min-w-0">
                <p className="eyebrow text-sport-foreground">
                  {lang === "fr" ? "Centre parent AHMV" : "AHMV parent centre"}
                </p>
                <p className="mt-1 truncate font-display text-2xl font-extrabold uppercase leading-none text-white">
                  {selectedTeams[0]
                    ? selectedTeams[0].name
                    : savedTeam
                      ? savedTeam.code
                      : (lang === "fr" ? "Votre hockey. Rapidement." : "Your hockey. Fast.")}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                  {SITE.season} · Verdun
                </p>
              </div>
              <LogoSlot className="size-14" />
            </div>

            {selectedTeams[0] ? (
              <div className="mt-3 grid grid-cols-[1fr_auto] overflow-hidden border border-sport/35 bg-sport/10">
                <a
                  href={publicTeamHubUrl(selectedTeams[0])}
                  className="interactive-surface flex min-h-12 items-center justify-between gap-3 px-3 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.16em] text-sport-foreground">
                      {lang === "fr" ? "Mon équipe" : "My team"}
                    </span>
                    <span className="mt-1 block truncate font-display text-xl font-extrabold uppercase leading-none text-white">
                      {selectedTeams[0].name}
                    </span>
                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-white/42">
                      {selectedTeams[0].level}
                      {selectedTeams.length > 1 ? ` · +${selectedTeams.length - 1}` : ""}
                    </span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 -rotate-90 text-sport-foreground" />
                </a>
                <button
                  type="button"
                  onClick={clearAllTeamPreferences}
                  className="flex w-12 items-center justify-center border-l border-white/12 text-white/55 hover:bg-white/10 hover:text-white"
                  aria-label={lang === "fr" ? "Voir toutes les équipes" : "View all teams"}
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
            ) : savedTeam ? (
              <div className="mt-3 grid grid-cols-[1fr_auto] overflow-hidden border border-sport/35 bg-sport/10">
                <Link
                  to="/equipes/$slug"
                  params={{ slug: savedTeam.slug }}
                  className="interactive-surface flex min-h-12 items-center justify-between gap-3 px-3 py-2.5"
                >
                  <span>
                    <span className="block text-[8px] font-bold uppercase tracking-[0.16em] text-sport-foreground">
                      {lang === "fr" ? "Ma catégorie" : "My category"}
                    </span>
                    <span className="mt-1 block font-display text-xl font-extrabold uppercase text-white">{savedTeam.code}</span>
                  </span>
                  <ChevronDown className="size-4 -rotate-90 text-sport-foreground" />
                </Link>
                <button
                  type="button"
                  onClick={clearAllTeamPreferences}
                  className="flex w-12 items-center justify-center border-l border-white/12 text-white/55 hover:bg-white/10 hover:text-white"
                  aria-label={lang === "fr" ? "Retirer ma catégorie" : "Remove my category"}
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
            ) : (
              <Link
                to="/equipes"
                className="interactive-surface mt-2.5 flex min-h-12 items-center justify-between gap-3 border border-sport/35 bg-sport/10 px-3 py-2.5"
              >
                <span>
                  <span className="block text-[8px] font-bold uppercase tracking-[0.16em] text-sport-foreground">
                    {lang === "fr" ? "Personnaliser" : "Personalize"}
                  </span>
                  <span className="mt-1 block font-display text-xl font-extrabold uppercase text-white">
                    {lang === "fr" ? "Choisir mon équipe" : "Choose my team"}
                  </span>
                </span>
                <ChevronDown className="size-4 -rotate-90 text-sport-foreground" />
              </Link>
            )}

            <div className="mt-2.5 grid grid-cols-4 gap-px overflow-hidden border border-white/12 bg-white/12">
              <Link
                to="/horaires"
                search={preferredTeam ? { team: preferredTeam } : {}}
                className="premium-control flex min-h-[58px] flex-col items-center justify-center gap-1.5 bg-competition p-2 text-center text-white"
              >
                <CalendarDays className="size-4 text-sport-foreground" />
                <span className="font-display text-lg font-extrabold uppercase leading-none">{lang === "fr" ? "Horaire" : "Schedule"}</span>
              </Link>
              {selectedTeams[0] ? (
                <a
                  href={officialTeamResultsUrl(selectedTeams[0])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-control flex min-h-[58px] flex-col items-center justify-center gap-1.5 bg-competition p-2 text-center text-white"
                >
                  <Trophy className="size-4 text-sport-foreground" />
                  <span className="font-display text-lg font-extrabold uppercase leading-none">{lang === "fr" ? "Résultats" : "Results"}</span>
                </a>
              ) : (
                <Link
                  to="/equipes"
                  className="premium-control flex min-h-[58px] flex-col items-center justify-center gap-1.5 bg-competition p-2 text-center text-white"
                >
                  <Trophy className="size-4 text-sport-foreground" />
                  <span className="font-display text-lg font-extrabold uppercase leading-none">{lang === "fr" ? "Résultats" : "Results"}</span>
                </Link>
              )}
              <Link
                to="/arenas"
                className="premium-control flex min-h-[58px] flex-col items-center justify-center gap-1.5 bg-competition p-2 text-center text-white"
              >
                <MapPin className="size-4 text-sport-foreground" />
                <span className="font-display text-lg font-extrabold uppercase leading-none">{lang === "fr" ? "Arénas" : "Arenas"}</span>
              </Link>
              <Link
                to="/equipes"
                className="premium-control flex min-h-[58px] flex-col items-center justify-center gap-1.5 bg-competition p-2 text-center text-white"
              >
                <Users className="size-4 text-sport-foreground" />
                <span className="font-display text-lg font-extrabold uppercase leading-none">{lang === "fr" ? "Équipes" : "Teams"}</span>
              </Link>
            </div>

            <Link
              to="/recherche"
              className="premium-control mt-2.5 flex min-h-10 items-center justify-between border border-white/12 bg-white/[0.025] px-3 text-xs font-semibold text-white/80"
            >
              <span className="flex items-center gap-2">
                <Search className="size-4 text-sport-foreground" />
                {lang === "fr" ? "Chercher équipe, aréna, nouvelle…" : "Search team, arena, news…"}
              </span>
              <ChevronDown className="size-3.5 -rotate-90 text-white/35" />
            </Link>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {[
                { key: "news", to: "/nouvelles" },
                { key: "registration", to: "/inscriptions" },
                { key: "gallery", to: "/galerie" },
                { key: "wllv", to: "/wllv" },
                { key: "faq", to: "/faq" },
                { key: "contact", to: "/contact" },
              ].map(({ key, to }) => (
                <Link
                  key={key}
                  to={to}
                  className="premium-control inline-flex min-h-9 items-center justify-center border border-white/10 px-2 text-center text-[8px] font-bold uppercase tracking-[0.09em] text-white/68 hover:border-sport hover:text-white"
                  activeProps={{ className: "!border-sport !text-sport-foreground" }}
                >
                  {t(`nav.${key}` as TranslationKey)}
                </Link>
              ))}
            </div>

            <a
              href="/membership"
              className="premium-control mt-3 flex min-h-10 items-center justify-between border border-sport/30 bg-sport/10 px-3 text-white"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="size-4 text-sport-foreground" />
                <span>
                  <span className="block text-[8px] font-bold uppercase tracking-[0.14em] text-sport-foreground">AHMV Member · APERÇU</span>
                  <span className="mt-0.5 block font-display text-sm font-extrabold uppercase">
                    {lang === "fr" ? "Aperçu sans publicité" : "Ad-free preview"}
                  </span>
                </span>
              </span>
              <ChevronDown className="size-3.5 -rotate-90 text-sport-foreground" />
            </a>

            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              <Link
                to="/connexion"
                className="premium-control flex min-h-9 items-center justify-between border border-white/10 px-3 text-[9px] font-bold uppercase tracking-[0.09em] text-white/65"
              >
                <span className="flex items-center gap-2"><LogIn className="size-3.5" />{t("nav.login")}</span>
                <ChevronDown className="size-3 -rotate-90" />
              </Link>
              {showPhone && phonePublic ? (
                <a
                  href={`tel:${phoneE164}`}
                  className="premium-control flex min-h-9 items-center justify-between border border-white/10 px-3 text-[9px] font-bold uppercase tracking-[0.09em] text-white/65"
                >
                  <span className="flex items-center gap-2"><PhoneCall className="size-3.5" />{phoneDisplay}</span>
                  <ChevronDown className="size-3 -rotate-90" />
                </a>
              ) : (
                <Link
                  to="/partenaires"
                  className="premium-control flex min-h-9 items-center justify-between border border-white/10 px-3 text-[9px] font-bold uppercase tracking-[0.09em] text-white/65"
                >
                  <span>{lang === "fr" ? "Partenaires" : "Partners"}</span>
                  <ChevronDown className="size-3 -rotate-90" />
                </Link>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/38">
                {lang === "fr" ? "Langue" : "Language"}
              </span>
              <LangSwitch />
            </div>
          </nav>
        </div>,
        document.body,
      )}
    </header>
  );
}
