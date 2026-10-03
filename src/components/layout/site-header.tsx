import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookmarkCheck, CalendarDays, ChevronDown, CircleHelp, Images, LogIn, MapPin, Menu, Newspaper, PhoneCall, Search, Sparkles, Trophy, Users, X } from "lucide-react";
import { MAIN_NAV, MORE_NAV, SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoSlot } from "./logo-slot";
import { LangSwitch } from "./lang-switch";
import { TEAMS } from "@/data/teams";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { publicTeamHubUrl } from "@/data/team-directory";
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
  const { preferredTeam, selectedTeams } = usePreferredTeam();
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
    <header ref={headerRef} className={cn("sticky top-0 border-b border-t-2 border-b-navy-foreground/12 border-t-sport bg-competition/96 text-navy-foreground shadow-[0_18px_40px_-32px_rgba(0,0,0,0.9)] backdrop-blur-xl", open ? "z-[110]" : "z-50")}>
      {/* Top utility bar (desktop) */}
      <div className={cn("hidden overflow-hidden border-b border-navy-foreground/10 transition-[max-height,opacity] duration-300 lg:block", scrolled ? "max-h-0 opacity-0" : "max-h-9 opacity-100")}>
        <div className="container-site flex h-9 items-center justify-between text-xs">
          <span className="text-navy-foreground/70">{t("home.heroSub")} · {t("common.season")} {SITE.season}</span>
          <div className="flex items-center gap-4">
            {selectedTeams.length > 0 ? (
              <a
                href={publicTeamHubUrl(selectedTeams[0]!)}
                className="inline-flex items-center gap-1.5 font-semibold text-navy-foreground/75 hover:text-navy-foreground"
              >
                <span className="size-1.5 rounded-full bg-sport" aria-hidden />
                {lang === "fr" ? "Mes équipes" : "My teams"} · {selectedTeams.length}
              </a>
            ) : savedTeam ? (
              <Link
                to="/equipes/$slug"
                params={{ slug: savedTeam.slug }}
                className="inline-flex items-center gap-1.5 font-semibold text-navy-foreground/75 hover:text-navy-foreground"
              >
                <span className="size-1.5 rounded-full bg-sport" aria-hidden />
                {lang === "fr" ? "Mon équipe" : "My team"} · {savedTeam.code}
              </Link>
            ) : null}
            {showPhone && (
              phonePublic ? (
                <a
                  href={`tel:${phoneE164}`}
                  className="inline-flex items-center gap-1.5 text-navy-foreground/70 hover:text-navy-foreground"
                >
                  <PhoneCall className="size-3.5" aria-hidden />
                  {phoneDisplay}
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-navy-foreground/60" title={lang === "fr" ? "Numéro réservé — activation à venir" : "Reserved number — activation upcoming"}>
                  <PhoneCall className="size-3.5" aria-hidden />
                  {phoneDisplay}
                  <span className="text-[9px] uppercase tracking-wider text-sport-foreground">{lang === "fr" ? "bientôt" : "soon"}</span>
                </span>
              )
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
            </a>
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
              {lang === "fr" ? "Member · Démo" : "Member · Demo"}
            </Link>
          </Button>
          <button
            type="button"
            className={cn(
              "premium-control tap-target inline-flex h-11 shrink-0 items-center justify-center gap-1.5 border px-2 font-display text-[10px] font-extrabold uppercase tracking-[0.08em] min-[360px]:gap-2 min-[360px]:px-3 min-[360px]:text-xs min-[360px]:tracking-[0.12em] lg:hidden",
              open
                ? "border-sport bg-sport text-sport-foreground"
                : "border-navy-foreground/18 bg-navy-foreground/[0.035] text-navy-foreground hover:bg-navy-foreground/10",
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
      {open && (
        <div
          id="mobile-menu"
          className="technical-grid fixed inset-x-0 z-[110] overflow-y-auto overscroll-contain bg-competition pb-[env(safe-area-inset-bottom)] lg:hidden animate-in fade-in slide-in-from-top-2"
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
            <div className="flex items-start justify-between gap-4 border-b border-navy-foreground/12 pb-5">
              <div>
                <p className="eyebrow text-sport-foreground">
                  {lang === "fr" ? "Navigation AHMV" : "AHMV navigation"}
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-none text-white">
                  {lang === "fr" ? "Tout le hockey. Ici." : "All hockey. Here."}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                  {SITE.season} · Verdun
                </p>
              </div>
              <LogoSlot className="size-16 sm:size-20" />
            </div>

            <Link
              to="/galerie/$slug"
              params={{ slug: "tournoi-m11-2025" }}
              className="interactive-surface group relative mt-4 block min-h-[170px] overflow-hidden border border-white/12 bg-navy"
            >
              <img
                src={OFFICIAL_MEDIA.practiceSkaters.url}
                alt={lang === "fr" ? OFFICIAL_MEDIA.practiceSkaters.alt.fr : OFFICIAL_MEDIA.practiceSkaters.alt.en}
                loading="eager"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,43,0.93)_0%,rgba(7,16,43,0.58)_60%,rgba(7,16,43,0.22)_100%)]" />
              <div className="relative flex min-h-[170px] max-w-[75%] flex-col justify-end p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground">
                  {lang === "fr" ? "Verdun en images" : "Verdun in pictures"}
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.86] text-white">
                  {lang === "fr" ? "Le vrai hockey AHMV" : "Real AHMV hockey"}
                </p>
                <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-white/70">
                  <Images className="size-4 text-sport-foreground" />
                  {lang === "fr" ? "Ouvrir la galerie" : "Open gallery"}
                </span>
              </div>
            </Link>

            {selectedTeams.length > 0 ? (
              <div className="mt-4 overflow-hidden border border-sport/35 bg-sport/10">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground/75">
                      {lang === "fr" ? "Mes équipes" : "My teams"}
                    </p>
                    <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-none text-white">
                      {selectedTeams.length} {lang === "fr" ? "sélectionnée(s)" : "selected"}
                    </p>
                  </div>
                  <BookmarkCheck className="size-5 text-sport-foreground" />
                </div>
                <div className="grid gap-px bg-white/10">
                  {selectedTeams.map((entry) => (
                    <a
                      key={entry.legacyScheduleTeamId}
                      href={publicTeamHubUrl(entry)}
                      className="interactive-surface flex min-h-14 items-center justify-between bg-competition px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-display text-lg font-extrabold uppercase leading-none text-white">{entry.name}</p>
                        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{entry.level}</p>
                      </div>
                      <span className="ml-3 shrink-0 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
                        {lang === "fr" ? "Ouvrir" : "Open"}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : savedTeam ? (
              <Link
                to="/equipes/$slug"
                params={{ slug: savedTeam.slug }}
                className="interactive-surface mt-4 flex items-center justify-between gap-4 border border-sport/35 bg-sport/10 px-4 py-4"
              >
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground/75">
                    {lang === "fr" ? "Mon équipe enregistrée" : "My saved team"}
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold uppercase leading-none text-white">{savedTeam.code}</p>
                </div>
                <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-sport-foreground">{lang === "fr" ? "Ouvrir" : "Open"}</span>
              </Link>
            ) : null}

            <Link
              to="/recherche"
              className="premium-control mt-4 flex min-h-12 items-center justify-between border border-navy-foreground/15 bg-navy-foreground/[0.035] px-4 text-sm font-semibold text-white/85"
            >
              <span className="flex items-center gap-2">
                <Search className="size-4 text-sport-foreground" />
                {lang === "fr" ? "Rechercher équipe, aréna, nouvelle…" : "Search team, arena, news…"}
              </span>
              <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/35">
                {lang === "fr" ? "Chercher" : "Search"}
              </span>
            </Link>

            <a
              href="/equipes#resultats"
              className="premium-control mt-2 flex min-h-12 items-center justify-between border border-sport/30 bg-sport/10 px-4 text-sm font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                <Trophy className="size-4 text-sport-foreground" />
                {lang === "fr" ? "Résultats & classements" : "Results & standings"}
              </span>
              <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-sport-foreground">
                {lang === "fr" ? "Voir" : "View"}
              </span>
            </a>

            <p className="eyebrow mt-6 text-sport-foreground">
              {lang === "fr" ? "Essentiel pour les familles" : "Family essentials"}
            </p>

            <div className="mt-3 grid gap-px overflow-hidden border border-navy-foreground/12 bg-navy-foreground/12 sm:grid-cols-2">
              {[
                { key: "schedule", to: "/horaires", icon: CalendarDays, number: "01" },
                { key: "teams", to: "/equipes", icon: Users, number: "02" },
                { key: "registration", to: "/inscriptions", icon: LogIn, number: "03" },
                { key: "arenas", to: "/arenas", icon: MapPin, number: "04" },
              ].map(({ key, to, icon: Icon, number }) => (
                <Link
                  key={key}
                  to={to}
                  className="group flex min-h-[78px] items-center gap-4 bg-competition px-4 py-3 text-navy-foreground/90 transition-colors hover:bg-navy-foreground/[0.055]"
                  activeProps={{ className: "!bg-sport/10 !text-sport-foreground" }}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center border border-navy-foreground/14">
                    <Icon className="size-5 text-sport-foreground" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">{number}</span>
                    <span className="mt-1 block font-display text-xl font-extrabold uppercase leading-none">
                      {t(`nav.${key}` as TranslationKey)}
                    </span>
                  </span>
                  <ChevronDown className="size-4 -rotate-90 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-sport-foreground" />
                </Link>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between border-b border-navy-foreground/12 pb-2">
              <p className="eyebrow text-navy-foreground/50">
                {lang === "fr" ? "Explorer l'association" : "Explore the association"}
              </p>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
                AHMV
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-5">
              {[
                { key: "news", to: "/nouvelles", icon: Newspaper },
                { key: "tournaments", to: "/tournois", icon: Trophy },
                { key: "gallery", to: "/galerie", icon: Images },
                { key: "wllv", to: "/wllv", icon: Users },
                { key: "coaches", to: "/entraineurs", icon: Users },
                { key: "faq", to: "/faq", icon: CircleHelp },
                { key: "resources", to: "/ressources", icon: CircleHelp },
                { key: "partners", to: "/partenaires", icon: Users },
                { key: "contact", to: "/contact", icon: PhoneCall },
              ].map(({ key, to, icon: Icon }) => (
                <Link
                  key={key}
                  to={to}
                  className="premium-control flex min-h-12 items-center gap-2 border-b border-navy-foreground/10 py-3 text-sm font-semibold text-navy-foreground/82"
                  activeProps={{ className: "text-sport-foreground" }}
                >
                  <Icon className="size-4 shrink-0 text-navy-foreground/42" />
                  <span>{t(`nav.${key}` as TranslationKey)}</span>
                </Link>
              ))}
            </div>

            <Link
              to="/membership"
              className="premium-control mt-7 flex min-h-16 items-center justify-between border border-sport/35 bg-sport/10 px-4 text-white"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center bg-sport text-sport-foreground">
                  <Sparkles className="size-5" />
                </span>
                <span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-sport-foreground">AHMV Member · DEMO</span>
                  <span className="mt-1 block font-display text-xl font-extrabold uppercase leading-none">
                    {lang === "fr" ? "Prêt à activer" : "Ready to switch on"}
                  </span>
                </span>
              </span>
              <ChevronDown className="size-4 -rotate-90 text-sport-foreground" />
            </a>

            <div className="mt-7 grid gap-2">
              <Button asChild variant="sport" size="lg" className="justify-between">
                <Link to="/horaires" search={preferredTeam ? { team: preferredTeam } : {}}>
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-4" />
                    {lang === "fr" ? "Voir mon horaire" : "View my schedule"}
                  </span>
                  <ChevronDown className="size-4 -rotate-90" />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg" className="justify-between">
                <Link to="/connexion">
                  <span className="flex items-center gap-2"><LogIn className="size-4" />{t("nav.login")}</span>
                  <ChevronDown className="size-4 -rotate-90" />
                </Link>
              </Button>
            </div>

            {showPhone && (
              <div className="mt-2">
                {phonePublic ? (
                  <Button asChild variant="outline-light" size="lg" className="w-full justify-between">
                    <a href={`tel:${phoneE164}`}>
                      <span className="flex items-center gap-2"><PhoneCall className="size-4" />{phoneDisplay}</span>
                      <ChevronDown className="size-4 -rotate-90" />
                    </a>
                  </Button>
                ) : (
                  <div className="flex min-h-11 items-center justify-between border border-navy-foreground/20 px-4 text-sm font-semibold text-navy-foreground/75">
                    <span className="flex items-center gap-2"><PhoneCall className="size-4" />{phoneDisplay}</span>
                    <span className="text-[9px] uppercase tracking-[0.16em] text-sport-foreground">{lang === "fr" ? "à venir" : "coming soon"}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between border border-navy-foreground/15 px-4 py-3">
              <span className="text-sm text-navy-foreground/70">{t("nav.language")}</span>
              <LangSwitch />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
