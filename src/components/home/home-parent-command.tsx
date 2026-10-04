import { CalendarDays, ChevronRight, MapPin, ShieldCheck, Trophy, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { legacyTeamScheduleUrl, officialTeamResultsUrl, publicTeamHubUrl } from "@/data/team-directory";
import { useDemoMemberMode } from "@/lib/demo-member-mode";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

export function HomeParentCommand() {
  const { lang } = useI18n();
  const { selectedTeams } = usePreferredTeam();
  const { isDemoMember } = useDemoMemberMode();
  const team = selectedTeams[0];

  const actions = team
    ? [
        { href: publicTeamHubUrl(team), icon: Users, fr: "Équipe", en: "Team", hintFr: "Mini-site", hintEn: "Mini-site" },
        { href: legacyTeamScheduleUrl(team), icon: CalendarDays, fr: "Horaire", en: "Schedule", hintFr: "Officiel", hintEn: "Official", external: true },
        { href: officialTeamResultsUrl(team), icon: Trophy, fr: "Résultats", en: "Results", hintFr: "Scores", hintEn: "Scores", external: true },
        { href: "/arenas", icon: MapPin, fr: "Arénas", en: "Arenas", hintFr: "Itinéraires", hintEn: "Directions" },
      ]
    : [];

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-navy-deep text-white">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-15" aria-hidden />
      <div className="arena-light pointer-events-none opacity-25" aria-hidden />
      <div className="container-site relative py-5 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 lg:max-w-md">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Centre parent" : "Parent centre"}</p>
              {team && (
                <span className="inline-flex min-h-7 items-center gap-1.5 border border-sport/30 bg-sport/10 px-2 text-[8px] font-bold uppercase tracking-[0.13em] text-white/75">
                  <ShieldCheck className="size-3.5 text-sport" />
                  {isDemoMember
                    ? (lang === "fr" ? "Membre · aperçu" : "Member · preview")
                    : (lang === "fr" ? "Visiteur" : "Visitor")}
                </span>
              )}
            </div>
            <h2 className="mt-1.5 font-display text-2xl font-extrabold uppercase leading-[0.92] tracking-[-0.025em] text-white sm:text-3xl">
              {team
                ? team.name
                : (lang === "fr" ? "Mon hockey, en un geste." : "My hockey, one tap away.")}
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/55 sm:text-sm">
              {team
                ? (lang === "fr"
                    ? "Vos raccourcis essentiels, sans prendre tout l’écran."
                    : "Your essential shortcuts, without taking over the screen.")
                : (lang === "fr"
                    ? "Choisissez votre équipe une fois pour personnaliser les raccourcis de la page."
                    : "Choose your team once to personalize the page shortcuts.")}
            </p>
          </div>

          {team ? (
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-3xl">
              {actions.map(({ href, icon: Icon, fr, en, hintFr, hintEn, external }) => (
                <a
                  key={fr}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="interactive-surface group flex min-h-20 items-center gap-3 border border-white/10 bg-white/[0.045] px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-sport/45 hover:bg-white/[0.09] sm:min-h-24"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center border border-sport/25 bg-sport/10">
                    <Icon className="size-4 text-sport-foreground" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-base font-extrabold uppercase leading-none text-white sm:text-lg">
                      {lang === "fr" ? fr : en}
                    </span>
                    <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.11em] text-white/42">
                      {lang === "fr" ? hintFr : hintEn}
                    </span>
                  </span>
                  <ChevronRight className="ml-auto hidden size-3.5 shrink-0 text-sport transition-transform group-hover:translate-x-0.5 xl:block" />
                </a>
              ))}
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row lg:max-w-3xl lg:justify-end">
              <a
                href="/equipes"
                className="premium-control group inline-flex min-h-12 items-center justify-center gap-2 bg-sport px-5 text-[10px] font-bold uppercase tracking-[0.13em] text-sport-foreground transition-transform hover:-translate-y-0.5"
              >
                <Users className="size-4" />
                {lang === "fr" ? "Choisir mon équipe" : "Choose my team"}
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <div className="hidden min-w-56 sm:block">
                <HouseSponsorSlot placement="home-parent-command" count={1} compact />
              </div>
            </div>
          )}
        </div>

        {team && (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <p className="truncate text-[8px] font-bold uppercase tracking-[0.14em] text-white/42">
              {lang === "fr" ? "Équipe active" : "Active team"} · <span className="text-white/70">{team.name} · {team.level}</span>
            </p>
            <a href="/equipes" className="shrink-0 text-[9px] font-bold uppercase tracking-[0.13em] text-sport-foreground hover:underline">
              {lang === "fr" ? "Changer" : "Change"}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
