import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, MapPin, ShieldCheck, Trophy, Users, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { legacyTeamScheduleUrl, officialTeamResultsUrl, publicTeamHubUrl } from "@/data/team-directory";
import { useDemoMemberMode } from "@/lib/demo-member-mode";

export function ParentQuickPanel() {
  const { lang } = useI18n();
  const { selectedTeams } = usePreferredTeam();
  const { isDemoMember } = useDemoMemberMode();
  const [open, setOpen] = useState(false);

  const team = selectedTeams[0];

  useEffect(() => {
    if (!team) setOpen(false);
  }, [team]);

  if (!team) return null;

  return (
    <aside className="fixed bottom-6 right-6 z-40 hidden lg:block">
      {open && (
        <section className="mb-3 w-[360px] overflow-hidden border border-navy/12 bg-background shadow-[0_28px_80px_-34px_rgba(7,16,43,0.48)]">
          <div className="competition-panel flex items-start justify-between gap-4 p-5 text-white">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Accès parent" : "Parent access"}</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.88]">{team.name}</h2>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/42">{team.level}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="premium-control flex size-9 shrink-0 items-center justify-center border border-white/14"
              aria-label={lang === "fr" ? "Fermer" : "Close"}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-px bg-navy/10">
            {[
              { href: publicTeamHubUrl(team), labelFr: "Mini-site", labelEn: "Mini-site", icon: Users },
              { href: legacyTeamScheduleUrl(team), labelFr: "Horaire", labelEn: "Schedule", icon: CalendarDays, external: true },
              { href: officialTeamResultsUrl(team), labelFr: "Résultats", labelEn: "Results", icon: Trophy, external: true },
              { href: "/arenas", labelFr: "Arénas", labelEn: "Arenas", icon: MapPin },
            ].map(({ href, labelFr, labelEn, icon: Icon, external }) => (
              <a
                key={labelFr}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group flex min-h-24 flex-col justify-between bg-background p-4 hover:bg-ice"
              >
                <Icon className="size-4 text-sport" />
                <span className="flex items-center justify-between gap-2 font-display text-lg font-extrabold uppercase text-navy">
                  {lang === "fr" ? labelFr : labelEn}
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>

          <a
            href="/membership"
            className="flex min-h-12 items-center justify-between border-t border-navy/10 bg-ice px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-navy"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-sport" />
              {isDemoMember
                ? (lang === "fr" ? "AHMV Member · démo active" : "AHMV Member · demo active")
                : (lang === "fr" ? "Voir AHMV Member" : "View AHMV Member")}
            </span>
            <ChevronRight className="size-3.5 text-sport" />
          </a>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="premium-control ml-auto flex min-h-14 max-w-[340px] items-center gap-3 border border-sport/35 bg-competition px-4 text-left text-white shadow-[0_22px_60px_-30px_rgba(7,16,43,0.78)]"
        aria-expanded={open}
      >
        <span className="flex size-9 shrink-0 items-center justify-center bg-sport text-sport-foreground">
          <Users className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-[8px] font-bold uppercase tracking-[0.15em] text-sport-foreground">
            {lang === "fr" ? "Mon équipe" : "My team"}
          </span>
          <span className="mt-0.5 block truncate font-display text-lg font-extrabold uppercase leading-none">{team.name}</span>
        </span>
        <ChevronRight className={`ml-1 size-4 shrink-0 text-sport-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
    </aside>
  );
}
