import { CalendarDays, ChevronRight, MapPin, ShieldCheck, Trophy, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { officialTeamResultsUrl, publicTeamHubUrl, publicTeamScheduleUrl } from "@/data/team-directory";
import { useDemoMemberMode } from "@/lib/demo-member-mode";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { PARENT_PREMIUM } from "@/lib/parent-premium";

export function HomeParentCommand() {
  const { lang } = useI18n();
  const { selectedTeams } = usePreferredTeam();
  const { isDemoMember } = useDemoMemberMode();
  const team = selectedTeams[0];

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-competition text-white">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />
      <div className="container-site relative py-5 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Centre parent" : "Parent centre"}</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-white md:text-4xl">
              {team
                ? (lang === "fr" ? "Tout pour mon équipe." : "Everything for my team.")
                : (lang === "fr" ? "Tout commence par votre équipe." : "Everything starts with your team.")}
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/58 sm:text-sm">
              {team
                ? (lang === "fr"
                    ? "Une seule rangée pour ouvrir le mini-site, l’horaire officiel, les résultats et les arénas."
                    : "One row to open the mini-site, official schedule, results and arenas.")
                : (lang === "fr"
                    ? "Choisissez une équipe une fois. Le site la remettra ensuite au premier plan sur mobile et desktop."
                    : "Choose a team once. The site will then keep it front and centre on mobile and desktop.")}
            </p>
          </div>

          {team && PARENT_PREMIUM.visible ? (
            <span className="inline-flex min-h-10 items-center gap-2 border border-sport/40 bg-sport/12 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
              <ShieldCheck className="size-4 text-sport" />
              {isDemoMember
                ? (lang === "fr" ? "AHMV Member · aperçu" : "AHMV Member · preview")
                : "AHMV Member"}
            </span>
          ) : !team ? (
            <a
              href="/equipes"
              className="premium-control inline-flex min-h-11 items-center gap-2 bg-sport px-4 text-[9px] font-bold uppercase tracking-[0.13em] text-sport-foreground"
            >
              <Users className="size-4" />
              {lang === "fr" ? "Choisir mon équipe" : "Choose my team"}
            </a>
          ) : null}
        </div>

        {team ? (
          <>
            <div className="scrollbar-none -mx-4 mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-px sm:overflow-hidden sm:border sm:border-white/12 sm:bg-white/12 sm:px-0 sm:pb-0 lg:grid-cols-4">
              {[
                { href: publicTeamHubUrl(team), icon: Users, fr: "Mini-site", en: "Mini-site", hintFr: "Équipe & contenu", hintEn: "Team & content" },
                { href: publicTeamScheduleUrl(team), icon: CalendarDays, fr: "Horaire", en: "Schedule", hintFr: "Dans le mini-site", hintEn: "Inside the mini-site" },
                { href: officialTeamResultsUrl(team), icon: Trophy, fr: "Résultats", en: "Results", hintFr: "Scores & classement", hintEn: "Scores & standings", external: true },
                { href: "/arenas", icon: MapPin, fr: "Arénas", en: "Arenas", hintFr: "Adresses & itinéraires", hintEn: "Addresses & directions" },
              ].map(({ href, icon: Icon, fr, en, hintFr, hintEn, external }) => (
                <a
                  key={fr}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="interactive-surface group flex min-h-20 w-[44vw] max-w-[11rem] shrink-0 snap-center flex-col justify-between border border-white/12 bg-white/[0.045] p-3 transition-colors hover:bg-white/[0.085] sm:min-h-24 sm:w-auto sm:max-w-none sm:border-0 sm:p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="size-5 text-sport" />
                    <ChevronRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-extrabold uppercase leading-none text-white sm:text-2xl">{lang === "fr" ? fr : en}</p>
                    <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/45">
                      {lang === "fr" ? hintFr : hintEn}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between gap-4 border border-white/12 bg-white/[0.035] px-3 py-2.5 sm:mt-3 sm:px-4 sm:py-3">
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/42">{lang === "fr" ? "Équipe active" : "Active team"}</p>
                <p className="mt-1 truncate font-display text-xl font-extrabold uppercase text-white">{team.name} · {team.level}</p>
              </div>
              <a href="/equipes" className="shrink-0 text-[9px] font-bold uppercase tracking-[0.13em] text-sport">
                {lang === "fr" ? "Changer" : "Change"}
              </a>
            </div>
          </>
        ) : (
          <div className="mt-4 grid overflow-hidden border border-white/12 lg:grid-cols-[1fr_0.8fr]">
            <div className="competition-panel p-5 text-white md:p-6">
              <Users className="size-6 text-sport-foreground" />
              <p className="mt-4 font-display text-3xl font-extrabold uppercase leading-[0.88]">
                {lang === "fr" ? "Votre équipe devient votre raccourci." : "Your team becomes your shortcut."}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                {lang === "fr"
                  ? "Le choix reste local dans ce navigateur. Aucun compte n’est créé."
                  : "The choice stays local in this browser. No account is created."}
              </p>
            </div>
            <HouseSponsorSlot placement="home-parent-command" count={1} compact />
          </div>
        )}
      </div>
    </section>
  );
}
