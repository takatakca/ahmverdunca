import { Link, useRouterState } from "@tanstack/react-router";
import { Bot, CalendarDays, Home, Newspaper, Search, Users } from "lucide-react";
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
    { id: "schedule", label: lang === "fr" ? "Horaire" : "Schedule", to: "/horaires" as const, icon: CalendarDays },
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
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t border-white/10 bg-navy-deep/96 pb-[env(safe-area-inset-bottom)] text-white shadow-[0_-18px_44px_-24px_rgba(0,0,0,0.88)] backdrop-blur-xl lg:hidden"
    >
      {links.map(({ id, label, to, icon: Icon }) => {
        const active = isActive(to);
        return (
          <Link
            key={id}
            to={to}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-16 min-w-0 touch-manipulation flex-col items-center justify-center gap-1 px-1 text-center text-[9px] font-bold uppercase tracking-[0.06em] transition-[color,transform] duration-150 active:scale-[.95] ${active ? "text-sport-foreground" : "text-white/52"}`}
          >
            <span className={`absolute inset-x-4 top-0 h-0.5 transition-colors ${active ? "bg-sport" : "bg-transparent"}`} aria-hidden />
            <span className={`flex size-8 items-center justify-center transition-colors ${active ? "bg-sport/12" : ""}`}>
              <Icon className="size-5 shrink-0" aria-hidden />
            </span>
            <span className="max-w-full truncate leading-tight">{label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        aria-label={lang === "fr" ? "Assistant AHMV" : "AHMV Assistant"}
        aria-haspopup="dialog"
        aria-controls="ahmv-assistant-dialog"
        data-ahmv-assistant-trigger="mobile"
        onClick={(event) => {
          window.dispatchEvent(new CustomEvent("ahmv:navigation-open"));
          window.dispatchEvent(new CustomEvent("ahmv:assistant-open", { detail: { returnFocus: event.currentTarget } }));
        }}
        className="relative flex min-h-16 min-w-0 touch-manipulation flex-col items-center justify-center gap-1 px-1 text-center text-[9px] font-bold uppercase tracking-[0.06em] text-white/70 transition-[color,transform] duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sport active:scale-[.95]"
      >
        <span className="flex size-8 items-center justify-center">
          <Bot className="size-5 shrink-0" aria-hidden />
        </span>
        <span className="max-w-full truncate leading-tight">Assistant</span>
      </button>
    </nav>
  );
}
