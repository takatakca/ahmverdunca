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

  return (
    <section className="border-y border-navy/10 bg-background">
      <div className="container-site py-7 md:py-9">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-sport">{lang === "fr" ? "Centre parent" : "Parent centre"}</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] text-navy md:text-5xl">
              {team
                ? (lang === "fr" ? "Tout pour mon équipe." : "Everything for my team.")
                : (lang === "fr" ? "Tout commence par votre équipe." : "Everything starts with your team.")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {team
                ? (lang === "fr"
                    ? "Une seule rangée pour ouvrir le mini-site, l’horaire officiel, les résultats et les arénas."
                    : "One row to open the mini-site, official schedule, results and arenas.")
                : (lang === "fr"
                    ? "Choisissez une équipe une fois. Le site la remettra ensuite au premier plan sur mobile et desktop."
                    : "Choose a team once. The site will then keep it front and centre on mobile and desktop.")}
            </p>
          </div>

          {team ? (
            <span className="inline-flex min-h-10 items-center gap-2 border border-sport/25 bg-sport/8 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-navy">
              <ShieldCheck className="size-4 text-sport" />
              {isDemoMember
                ? (lang === "fr" ? "AHMV Member · démo" : "AHMV Member · demo")
                : (lang === "fr" ? "Mode visiteur" : "Visitor mode")}
            </span>
          ) : (
            <a
              href="/equipes"
              className="premium-control inline-flex min-h-11 items-center gap-2 bg-sport px-4 text-[9px] font-bold uppercase tracking-[0.13em] text-sport-foreground"
            >
              <Users className="size-4" />
              {lang === "fr" ? "Choisir mon équipe" : "Choose my team"}
            </a>
          )}
        </div>

        {team ? (
          <>
            <div className="mt-6 grid gap-px overflow-hidden border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: publicTeamHubUrl(team), icon: Users, fr: "Mini-site", en: "Mini-site", hintFr: "Équipe & contenu", hintEn: "Team & content" },
                { href: legacyTeamScheduleUrl(team), icon: CalendarDays, fr: "Horaire", en: "Schedule", hintFr: "Source officielle", hintEn: "Official source", external: true },
                { href: officialTeamResultsUrl(team), icon: Trophy, fr: "Résultats", en: "Results", hintFr: "Scores & classement", hintEn: "Scores & standings", external: true },
                { href: "/arenas", icon: MapPin, fr: "Arénas", en: "Arenas", hintFr: "Adresses & itinéraires", hintEn: "Addresses & directions" },
              ].map(({ href, icon: Icon, fr, en, hintFr, hintEn, external }) => (
                <a
                  key={fr}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex min-h-36 flex-col justify-between bg-background p-5 transition-colors hover:bg-ice"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="size-5 text-sport" />
                    <ChevronRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
                  </div>
                  <div>
                    <p className="font-display text-3xl font-extrabold uppercase leading-none text-navy">{lang === "fr" ? fr : en}</p>
                    <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {lang === "fr" ? hintFr : hintEn}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border border-navy/10 bg-ice px-4 py-3">
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{lang === "fr" ? "Équipe active" : "Active team"}</p>
                <p className="mt-1 truncate font-display text-xl font-extrabold uppercase text-navy">{team.name} · {team.level}</p>
              </div>
              <a href="/equipes" className="shrink-0 text-[9px] font-bold uppercase tracking-[0.13em] text-sport">
                {lang === "fr" ? "Changer" : "Change"}
              </a>
            </div>
          </>
        ) : (
          <div className="mt-6 grid overflow-hidden border border-navy/10 lg:grid-cols-[1fr_0.8fr]">
            <div className="competition-panel p-6 text-white md:p-8">
              <Users className="size-6 text-sport-foreground" />
              <p className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.88]">
                {lang === "fr" ? "Votre équipe devient votre raccourci." : "Your team becomes your shortcut."}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                {lang === "fr"
                  ? "Le choix reste local dans ce navigateur en mode démo. Aucun compte n’est créé."
                  : "The choice stays local in this browser in demo mode. No account is created."}
              </p>
            </div>
            <HouseSponsorSlot placement="home-parent-command" count={1} compact />
          </div>
        )}
      </div>
    </section>
  );
}
