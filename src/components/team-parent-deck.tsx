import { readBrowserPreference, writeBrowserPreference } from "@/lib/browser-preferences";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Megaphone,
  Navigation,
  Radio,
  Trophy,
} from "lucide-react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import { legacyTeamScheduleUrl, officialTeamResultsUrl } from "@/data/team-directory";
import { OFFICIAL_WEEK_ACTIVITIES, OFFICIAL_WEEK_META } from "@/data/official-week";
import { officialWeekActivityMatchesPublicTeam } from "@/lib/official-schedule-team";
import { ARENAS, arenaDirectionsTargetForVenue } from "@/data/arenas";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { useDemoMemberMode } from "@/lib/demo-member-mode";

type Lang = "fr" | "en";
type PanelId = "game" | "practice" | "arena" | "follow" | "partner";

function googleDirections(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function wazeDirections(destination: string) {
  return `https://www.waze.com/ul?q=${encodeURIComponent(destination)}&navigate=yes`;
}

function readFollow(teamId: string) {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(readBrowserPreference(`ahmv-follow-${teamId}`) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function TeamParentDeck({
  team,
  lang,
}: {
  team: PublicTeamDirectoryEntry;
  lang: Lang;
}) {
  const { isDemoMember } = useDemoMemberMode();
  const [active, setActive] = useState<PanelId>("game");
  const [follow, setFollow] = useState<string[]>([]);

  const matchingActivities = useMemo(
    () => OFFICIAL_WEEK_ACTIVITIES.filter((item) => officialWeekActivityMatchesPublicTeam(item, team)),
    [team],
  );

  const practice = matchingActivities.find((item) =>
    /pratique|hockey sur mesure|wllv/i.test(item.activity),
  ) ?? matchingActivities[0];

  useEffect(() => {
    setFollow(readFollow(team.legacyScheduleTeamId));
  }, [team.legacyScheduleTeamId]);

  const panels = useMemo<PanelId[]>(
    () => (isDemoMember ? ["game", "practice", "arena", "follow"] : ["game", "practice", "arena", "follow", "partner"]),
    [isDemoMember],
  );

  useEffect(() => {
    if (!panels.includes(active)) setActive("game");
  }, [active, panels]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActive((current) => {
        const index = panels.indexOf(current);
        return panels[(index + 1) % panels.length] ?? "game";
      });
    }, 9000);

    return () => window.clearInterval(timer);
  }, [panels]);

  const toggleFollow = (key: string) => {
    setFollow((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      writeBrowserPreference(`ahmv-follow-${team.legacyScheduleTeamId}`, JSON.stringify(next));
      return next;
    });
  };

  const tabs = [
    { id: "game" as const, icon: Trophy, fr: "Partie", en: "Game" },
    { id: "practice" as const, icon: Clock3, fr: "Pratique", en: "Practice" },
    { id: "arena" as const, icon: MapPin, fr: "Aréna", en: "Arena" },
    { id: "follow" as const, icon: Bell, fr: "Suivi", en: "Follow" },
    ...(!isDemoMember ? [{ id: "partner" as const, icon: Megaphone, fr: "Partenaire", en: "Partner" }] : []),
  ];

  return (
    <section className="overflow-hidden border border-navy/12 bg-background shadow-[0_24px_70px_-58px_rgba(7,16,43,0.8)]">
      <div className="flex items-center justify-between gap-3 border-b border-navy/10 bg-ice px-4 py-3 md:px-5">
        <div>
          <p className="eyebrow text-sport">{lang === "fr" ? "Tableau parent" : "Parent dashboard"}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {team.name}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 border border-navy/10 bg-background px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <Radio className="size-3 text-sport" />
          {lang === "fr" ? "Interface adaptative" : "Adaptive interface"}
        </span>
      </div>

      <div className="scrollbar-none flex overflow-x-auto border-b border-navy/10 bg-background p-2">
        {tabs.map(({ id, icon: Icon, fr, en }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={
              active === id
                ? "premium-control flex min-h-10 shrink-0 items-center gap-2 bg-navy px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white"
                : "premium-control flex min-h-10 shrink-0 items-center gap-2 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-navy hover:bg-ice"
            }
            aria-pressed={active === id}
          >
            <Icon className={active === id ? "size-3.5 text-sport-foreground" : "size-3.5 text-sport"} />
            {lang === "fr" ? fr : en}
          </button>
        ))}
      </div>

      <div className="min-h-[255px] animate-in fade-in duration-300">
        {active === "game" && (
          <div className="grid min-h-[255px] md:grid-cols-[1.15fr_0.85fr]">
            <div className="competition-panel p-5 text-white md:p-6">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Prochaine partie" : "Next game"}</p>
              <h3 className="mt-3 max-w-[13ch] font-display text-3xl font-extrabold uppercase leading-[0.88] md:text-4xl">
                {lang === "fr" ? "Horaire officiel de l’équipe" : "Official team schedule"}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                {lang === "fr"
                  ? "La carte ouvrira automatiquement la prochaine partie dès que le flux temps réel sera branché. Aujourd’hui, elle mène directement à la source publique de cette équipe."
                  : "This card will automatically show the next game once the live feed is connected. Today it links directly to the team’s public source."}
              </p>
              <a
                href={legacyTeamScheduleUrl(team)}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-control mt-6 inline-flex min-h-11 items-center gap-2 bg-sport px-4 text-[9px] font-bold uppercase tracking-[0.13em] text-sport-foreground"
              >
                <CalendarDays className="size-4" />
                {lang === "fr" ? "Ouvrir les prochaines games" : "Open upcoming games"}
              </a>
            </div>
            <div className="flex flex-col justify-between p-5 md:p-6">
              <div>
                <p className="eyebrow text-sport">{lang === "fr" ? "Résultats" : "Results"}</p>
                <p className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.9] text-navy">
                  {lang === "fr" ? "Scores & classement" : "Scores & standings"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {lang === "fr" ? "Même identifiant public d’équipe, sans ressaisie manuelle." : "Same public team identifier, without manual re-entry."}
                </p>
              </div>
              <a
                href={officialTeamResultsUrl(team)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-between border-t border-navy/10 pt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-sport"
              >
                {lang === "fr" ? "Voir résultats officiels" : "View official results"}
                <ChevronRight className="size-4" />
              </a>
            </div>
          </div>
        )}

        {active === "practice" && (
          <div className="grid min-h-[255px] md:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-ice p-5 md:p-6">
              <p className="eyebrow text-sport">{lang === "fr" ? "Glace / pratique" : "Ice / practice"}</p>
              {practice ? (
                <>
                  <p className="mt-3 font-display text-4xl font-extrabold uppercase leading-none text-navy">{practice.start}</p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.1em] text-navy">{practice.date}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{practice.activity} · {practice.group}</p>
                </>
              ) : (
                <>
                  <p className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.9] text-navy">
                    {lang === "fr" ? "Horaire équipe" : "Team schedule"}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {lang === "fr" ? "Aucune pratique exacte n’est inférée si elle n’est pas publiée." : "No exact practice is inferred when it is not published."}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col justify-between p-5 md:p-6">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {lang === "fr" ? "Dernière grille AHMV intégrée" : "Latest integrated AHMV grid"}
                </p>
                <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-[0.92] text-navy">{OFFICIAL_WEEK_META.title}</p>
                {practice && (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                    <MapPin className="size-4 text-sport" /> {practice.venue}
                  </p>
                )}
              </div>
              <a
                href={OFFICIAL_WEEK_META.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-between border-t border-navy/10 pt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-sport"
              >
                {lang === "fr" ? "Voir le document AHMV" : "View AHMV document"}
                <ChevronRight className="size-4" />
              </a>
            </div>
          </div>
        )}

        {active === "arena" && (
          <div className="grid gap-px bg-navy/10 sm:grid-cols-2">
            {(practice
              ? [
                  {
                    name: practice.venue,
                    address: arenaDirectionsTargetForVenue(practice.venue),
                  },
                  {
                    name: ARENAS[0]?.name ?? "Auditorium de Verdun",
                    address: ARENAS[0]?.address ?? "4110 boulevard LaSalle, Montréal",
                  },
                ]
              : ARENAS.slice(0, 2).map((arena) => ({ name: arena.name, address: arena.address }))
            ).map((arena) => (
              <article key={`${arena.name}-${arena.address}`} className="flex min-h-[255px] flex-col bg-background p-5 md:p-6">
                <Navigation className="size-5 text-sport" />
                <p className="mt-5 font-display text-2xl font-extrabold uppercase leading-[0.9] text-navy">{arena.name}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{arena.address}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <a href={googleDirections(arena.address)} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 border border-navy/12 px-3 text-[8px] font-bold uppercase tracking-[0.12em] text-navy">
                    Google Maps
                  </a>
                  <a href={wazeDirections(arena.address)} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 border border-navy/12 px-3 text-[8px] font-bold uppercase tracking-[0.12em] text-navy">
                    Waze
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {active === "follow" && (
          <div className="grid min-h-[255px] md:grid-cols-[0.78fr_1.22fr]">
            <div className="competition-panel p-5 text-white md:p-6">
              <Bell className="size-5 text-sport-foreground" />
              <p className="mt-5 font-display text-3xl font-extrabold uppercase leading-[0.88]">
                {lang === "fr" ? "Suivre cette équipe" : "Follow this team"}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/58">
                {lang === "fr"
                  ? "Ces préférences restent uniquement dans ce navigateur. Aucun courriel, SMS ou push n’est envoyé."
                  : "These preferences stay only in this browser. No email, SMS or push is sent."}
              </p>
            </div>
            <div className="grid gap-px bg-navy/10 sm:grid-cols-3">
              {[
                { key: "schedule", fr: "Horaires", en: "Schedules", icon: CalendarDays },
                { key: "results", fr: "Résultats", en: "Results", icon: Trophy },
                { key: "news", fr: "Nouvelles", en: "News", icon: Bell },
              ].map(({ key, fr, en, icon: Icon }) => {
                const enabled = follow.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleFollow(key)}
                    className={`flex min-h-[190px] flex-col justify-between p-5 text-left transition-colors ${enabled ? "bg-sport/10" : "bg-background hover:bg-ice"}`}
                    aria-pressed={enabled}
                  >
                    <Icon className={enabled ? "size-5 text-sport" : "size-5 text-navy"} />
                    <span>
                      <span className="block font-display text-2xl font-extrabold uppercase leading-none text-navy">{lang === "fr" ? fr : en}</span>
                      <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {enabled ? (lang === "fr" ? "Préférence activée" : "Preference enabled") : (lang === "fr" ? "Activer la préférence" : "Enable preference")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {active === "partner" && !isDemoMember && (
          <HouseSponsorSlot placement={`team-smart-${team.legacyScheduleTeamId}`} count={1} />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-navy/10 bg-ice px-4 py-2.5">
        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {isDemoMember
            ? (lang === "fr" ? "Mode Member · la publicité est retirée et remplacée par les outils parent." : "Member mode · advertising is removed and replaced by parent tools.")
            : (lang === "fr" ? "Mode visiteur · outils + partenaire en rotation." : "Visitor mode · tools + partner rotate together.")}
        </p>
        <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-sport">
          {panels.indexOf(active) + 1}/{panels.length}
        </span>
      </div>
    </section>
  );
}
