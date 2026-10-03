import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, Newspaper, Search, Users } from "lucide-react";
import { TEAMS } from "@/data/teams";
import { usePreferredTeam } from "@/lib/team-preference";
import { publicTeamHubUrl } from "@/data/team-directory";
import { useI18n } from "@/lib/i18n";

export function MobileQuickNav() {
  const { lang } = useI18n();
  const { preferredTeam, selectedTeams } = usePreferredTeam();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hasPreferredTeam = preferredTeam && TEAMS.some((team) => team.slug === preferredTeam);
  const exactTeam = selectedTeams[0];
  const teamTarget = exactTeam ? publicTeamHubUrl(exactTeam) : hasPreferredTeam ? `/equipes/${preferredTeam}` : "/equipes";

  const links = [
    { id: "home", label: lang === "fr" ? "Accueil" : "Home", to: "/" as const, icon: Home },
    { id: "team", label: exactTeam || hasPreferredTeam ? (lang === "fr" ? "Mon équipe" : "My team") : (lang === "fr" ? "Équipes" : "Teams"), to: teamTarget, icon: Users },
    { id: "schedule", label: lang === "fr" ? "Horaire" : "Schedule", to: "/horaires" as const, icon: CalendarDays, primary: true },
    { id: "news", label: lang === "fr" ? "Nouvelles" : "News", to: "/nouvelles" as const, icon: Newspaper },
    { id: "search", label: lang === "fr" ? "Recherche" : "Search", to: "/recherche" as const, icon: Search },
  ];

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    if (to === "/equipes" || to.startsWith("/equipes/")) return pathname.startsWith("/equipes");
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <nav
      aria-label={lang === "fr" ? "Accès rapide" : "Quick navigation"}
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-navy/12 bg-background/98 pb-[env(safe-area-inset-bottom)] shadow-[0_-18px_40px_-28px_rgba(7,16,43,0.68)] backdrop-blur-xl lg:hidden"
    >
      {links.map(({ id, label, to, icon: Icon, primary }) => {
        const active = isActive(to);
        return (
          <Link
            key={id}
            to={to}
            aria-current={active ? "page" : undefined}
            className={
              primary
                ? "relative flex min-h-16 min-w-0 touch-manipulation flex-col items-center justify-center gap-1 px-1 text-center"
                : `relative flex min-h-16 min-w-0 touch-manipulation flex-col items-center justify-center gap-1 px-1 text-center text-[10px] font-semibold transition-[color,transform] duration-150 active:scale-[.95] ${active ? "text-sport" : "text-muted-foreground"}`
            }
          >
            {primary ? (
              <>
                <span className={`absolute -top-4 flex size-12 items-center justify-center border-4 border-background bg-sport text-sport-foreground shadow-[0_12px_28px_-12px_rgba(7,16,43,0.6)] transition-transform active:scale-[.94] ${active ? "scale-[1.04]" : ""}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-7 font-display text-[10px] font-extrabold uppercase tracking-[0.08em] text-sport">
                  {label}
                </span>
              </>
            ) : (
              <>
                <span className={`absolute inset-x-4 top-0 h-0.5 transition-colors ${active ? "bg-sport" : "bg-transparent"}`} aria-hidden />
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="max-w-full truncate leading-tight">{label}</span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
