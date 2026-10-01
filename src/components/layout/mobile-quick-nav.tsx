import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, Menu, Newspaper, Users } from "lucide-react";
import { TEAMS } from "@/data/teams";
import { usePreferredTeam } from "@/lib/team-preference";
import { useI18n } from "@/lib/i18n";

export function MobileQuickNav() {
  const { lang } = useI18n();
  const { preferredTeam } = usePreferredTeam();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const links = [
    { label: lang === "fr" ? "Accueil" : "Home", to: "/" as const, icon: Home },
    { label: lang === "fr" ? "Horaire" : "Schedule", to: "/horaires" as const, icon: CalendarDays },
    { label: lang === "fr" ? "Mon équipe" : "My team", to: preferredTeam && TEAMS.some((team) => team.slug === preferredTeam) ? `/equipes/${preferredTeam}` : "/equipes", icon: Users },
    { label: lang === "fr" ? "Nouvelles" : "News", to: "/nouvelles" as const, icon: Newspaper },
    { label: lang === "fr" ? "Plus" : "More", to: "/ressources" as const, icon: Menu },
  ];

  return <nav aria-label={lang === "fr" ? "Accès rapide" : "Quick navigation"} className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-lg lg:hidden">
    {links.map(({ label, to, icon: Icon }) => <Link key={label} to={to} className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 text-center text-[10px] font-semibold ${pathname === to || (to === "/horaires" && pathname === "/horaires") ? "text-sport" : "text-muted-foreground"}`}>
      <Icon className="size-5 shrink-0" aria-hidden /> <span className="leading-tight">{label}</span>
    </Link>)}
  </nav>;
}