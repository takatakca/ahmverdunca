import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ExternalLink, Facebook, Instagram, MapPin, ShieldCheck, Trophy, Users } from "lucide-react";
import { MAIN_NAV, MORE_NAV, EXTERNAL_LINKS, SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { useAhmvPhoneStatus } from "@/lib/use-ahmv-phone-status";
import { LogoSlot } from "./logo-slot";
import { LangSwitch } from "./lang-switch";
import { usePreferredTeam } from "@/lib/team-preference";
import { legacyTeamScheduleUrl, officialTeamResultsUrl, publicTeamHubUrl } from "@/data/team-directory";

export function SiteFooter() {
  const { t, l, lang } = useI18n();
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";
  const { phonePublic, phoneDisplay, phoneE164 } = useAhmvPhoneStatus();
  const { selectedTeams } = usePreferredTeam();
  const primaryTeam = selectedTeams[0];
  const showPhone = phonePublic;

  return (
    <footer className="relative mt-auto overflow-hidden bg-competition text-navy-foreground">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden />
      <div className="giant-watermark pointer-events-none absolute -bottom-6 -left-6 select-none opacity-60" aria-hidden>
        Verdun
      </div>

      <div className="relative border-y border-navy-foreground/12 border-t-2 border-t-sport">
        <div className="container-site grid md:grid-cols-[0.36fr_1.64fr]">
          <div className="flex items-center border-b border-navy-foreground/12 py-6 md:border-b-0 md:border-r md:py-7 md:pr-8">
            <span className="font-display text-[4.6rem] font-extrabold leading-none tracking-[-0.07em] text-sport-foreground sm:text-[5.5rem]">125</span>
          </div>
          <div className="flex flex-col justify-center gap-5 py-6 md:py-7 md:pl-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Hockey à Verdun · mémoire collective" : "Hockey in Verdun · shared heritage"}
              </p>
              <p className="mt-2 max-w-3xl font-display text-2xl font-extrabold uppercase leading-[0.92] sm:text-3xl">
                {lang === "fr" ? "125 ans d’histoire. Des générations à raconter." : "125 years of history. Generations of stories."}
              </p>
            </div>
            <a
              href="/#archives-hockey"
              className="premium-control inline-flex min-h-12 shrink-0 items-center justify-between gap-4 border border-navy-foreground/20 px-5 font-display text-sm font-bold uppercase tracking-[0.12em] text-white hover:border-sport"
            >
              {lang === "fr" ? "Voir les archives" : "Explore the archive"} <ArrowRight className="size-4 text-sport-foreground" />
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-b border-navy-foreground/12">
        <div className="container-site py-6 md:py-7">
          <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border border-navy-foreground/12 bg-white/[0.025] p-5 md:p-6">
              <p className="eyebrow text-sport-foreground">
                {primaryTeam
                  ? (lang === "fr" ? "Mon équipe · accès direct" : "My team · direct access")
                  : (lang === "fr" ? "Le raccourci des familles" : "Families' shortcut")}
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.88] sm:text-4xl">
                {primaryTeam ? primaryTeam.name : (lang === "fr" ? "Horaire. Équipe. Aréna." : "Schedule. Team. Arena.")}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-foreground/58">
                {primaryTeam
                  ? (lang === "fr"
                      ? "Votre équipe enregistrée reste accessible jusqu’au dernier écran du site."
                      : "Your saved team stays accessible all the way to the final screen.")
                  : (lang === "fr"
                      ? "Enregistrez une équipe pour transformer le portail en raccourci personnalisé."
                      : "Save a team to turn the portal into a personalized shortcut.")}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {primaryTeam ? (
                  <>
                    <a href={publicTeamHubUrl(primaryTeam)} className="premium-control flex min-h-11 items-center justify-center gap-2 bg-sport px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-sport-foreground">
                      <Users className="size-3.5" /> {lang === "fr" ? "Équipe" : "Team"}
                    </a>
                    <a href={legacyTeamScheduleUrl(primaryTeam)} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-11 items-center justify-center gap-2 border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                      <CalendarDays className="size-3.5 text-sport-foreground" /> {lang === "fr" ? "Horaire" : "Schedule"}
                    </a>
                    <a href={officialTeamResultsUrl(primaryTeam)} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-11 items-center justify-center gap-2 border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                      <Trophy className="size-3.5 text-sport-foreground" /> {lang === "fr" ? "Résultats" : "Results"}
                    </a>
                    <Link to="/arenas" className="premium-control flex min-h-11 items-center justify-center gap-2 border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                      <MapPin className="size-3.5 text-sport-foreground" /> {lang === "fr" ? "Arénas" : "Arenas"}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/horaires" className="premium-control flex min-h-11 items-center justify-center gap-2 bg-sport px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-sport-foreground">
                      <CalendarDays className="size-3.5" /> {lang === "fr" ? "Horaires" : "Schedules"}
                    </Link>
                    <Link to="/equipes" className="premium-control flex min-h-11 items-center justify-center gap-2 border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                      <Users className="size-3.5 text-sport-foreground" /> {lang === "fr" ? "Équipes" : "Teams"}
                    </Link>
                    <Link to="/arenas" className="premium-control flex min-h-11 items-center justify-center gap-2 border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                      <MapPin className="size-3.5 text-sport-foreground" /> {lang === "fr" ? "Arénas" : "Arenas"}
                    </Link>
                    <Link to="/inscriptions" className="premium-control flex min-h-11 items-center justify-center gap-2 border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                      {lang === "fr" ? "Inscriptions" : "Registration"}
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-px border border-navy-foreground/12 bg-navy-foreground/12 sm:grid-cols-2 lg:grid-cols-1">
              <a href="/membership" className="group flex min-h-28 items-center justify-between bg-competition p-5 hover:bg-white/[0.04]">
                <span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-sport-foreground">AHMV Member · APERÇU</span>
                  <span className="mt-2 block font-display text-2xl font-extrabold uppercase leading-[0.9] text-white">
                    {lang === "fr" ? "Aperçu sans publicité" : "Ad-free preview"}
                  </span>
                </span>
                <ShieldCheck className="size-5 text-sport-foreground" />
              </a>
              <div className="flex min-h-28 items-center justify-between bg-competition p-5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-navy-foreground/38">
                    {lang === "fr" ? "Réseaux officiels" : "Official social"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a href={EXTERNAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="premium-control flex size-10 items-center justify-center border border-white/14 text-white hover:border-sport" aria-label="Facebook AHM Verdun">
                      <Facebook className="size-4" />
                    </a>
                    <a href={EXTERNAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="premium-control flex size-10 items-center justify-center border border-white/14 text-white hover:border-sport" aria-label="Instagram AHM Verdun">
                      <Instagram className="size-4" />
                    </a>
                  </div>
                </div>
                <ArrowRight className="size-4 text-sport-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-site relative grid gap-0 py-0 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.9fr]">
        <div className="border-b border-navy-foreground/10 py-8 lg:border-b-0 lg:border-r lg:py-10 lg:pr-10">
          <div className="flex items-center gap-4">
            <LogoSlot size="lg" className="size-24 sm:size-28" />
            <div>
              <p className="font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.035em]">AHM Verdun</p>
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
            phonePublic ? (
              <a href={`tel:${phoneE164}`} className="mt-5 inline-block font-display text-xl font-bold text-navy-foreground hover:text-sport-foreground">
                {phoneDisplay}
              </a>
            ) : (
              <p className="mt-5 font-display text-xl font-bold text-navy-foreground/72">
                {phoneDisplay}
                <span className="ml-2 align-middle text-[9px] font-sans uppercase tracking-[0.18em] text-sport-foreground">
                  {lang === "fr" ? "canal à venir" : "channel upcoming"}
                </span>
              </p>
            )
          )}
        </div>

        <div className="border-b border-navy-foreground/10 py-9 lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
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

        <div className="border-b border-navy-foreground/10 py-9 lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
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

        <div className="py-9 lg:py-10 lg:pl-8">
          <p className="eyebrow mb-5 text-sport-foreground/85">{lang === "fr" ? "Accès officiels" : "Official access"}</p>
          <div className="space-y-3">
            <a href="/equipes#resultats" className="flex items-center justify-between border-b border-navy-foreground/10 pb-3 text-sm text-navy-foreground/72 hover:text-navy-foreground">
              {lang === "fr" ? "Résultats & classements" : "Results & standings"} <ArrowRight className="size-3.5 text-sport-foreground" />
            </a>
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
