import { readBrowserPreference, writeBrowserPreference } from "@/lib/browser-preferences";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  MapPin,
  Megaphone,
  Navigation,
  Trophy,
} from "lucide-react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import { OFFICIAL_WEEK_ACTIVITIES } from "@/data/official-week";
import { officialWeekActivityMatchesPublicTeam } from "@/lib/official-schedule-team";
import { ARENAS, arenaDirectionsTargetForVenue } from "@/data/arenas";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { useDemoMemberMode } from "@/lib/demo-member-mode";

type Lang = "fr" | "en";
type PanelId = "follow" | "arena" | "partner";

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
  const [active, setActive] = useState<PanelId>("follow");
  const [follow, setFollow] = useState<string[]>([]);

  const matchingActivities = useMemo(
    () => OFFICIAL_WEEK_ACTIVITIES.filter((item) => officialWeekActivityMatchesPublicTeam(item, team)),
    [team],
  );
  const nextActivity = matchingActivities[0];

  useEffect(() => {
    setFollow(readFollow(team.legacyScheduleTeamId));
  }, [team.legacyScheduleTeamId]);

  const panels = useMemo<PanelId[]>(
    () => (isDemoMember ? ["follow", "arena"] : ["follow", "arena", "partner"]),
    [isDemoMember],
  );

  useEffect(() => {
    if (!panels.includes(active)) setActive("follow");
  }, [active, panels]);

  const toggleFollow = (key: string) => {
    setFollow((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      writeBrowserPreference(`ahmv-follow-${team.legacyScheduleTeamId}`, JSON.stringify(next));
      return next;
    });
  };

  const tabs = [
    { id: "follow" as const, icon: Bell, fr: "Mes raccourcis", en: "My shortcuts" },
    { id: "arena" as const, icon: MapPin, fr: "Aréna", en: "Arena" },
    ...(!isDemoMember ? [{ id: "partner" as const, icon: Megaphone, fr: "Partenaire", en: "Partner" }] : []),
  ];

  const arenas = nextActivity
    ? [
        {
          name: nextActivity.venue,
          address: arenaDirectionsTargetForVenue(nextActivity.venue),
          hint: lang === "fr" ? "Prochaine activité publiée" : "Next published activity",
        },
        {
          name: ARENAS[0]?.name ?? "Auditorium de Verdun",
          address: ARENAS[0]?.address ?? "4110 boulevard LaSalle, Montréal",
          hint: lang === "fr" ? "Aréna AHMV" : "AHMV arena",
        },
      ]
    : ARENAS.slice(0, 2).map((arena) => ({
        name: arena.name,
        address: arena.address,
        hint: lang === "fr" ? "Aréna AHMV" : "AHMV arena",
      }));

  return (
    <section className="overflow-hidden border border-white/12 bg-navy-deep text-white shadow-[0_24px_70px_-58px_rgba(0,0,0,0.88)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-competition px-4 py-3 md:px-5">
        <div>
          <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Outils équipe" : "Team tools"}</p>
          <p className="mt-1 max-w-[18rem] truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-white/48">
            {team.name}
          </p>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/42">
          {lang === "fr" ? "Touchez pour ouvrir" : "Tap to open"}
        </span>
      </div>

      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-white/10 bg-navy-deep p-2">
        {tabs.map(({ id, icon: Icon, fr, en }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={
              active === id
                ? "premium-control flex min-h-10 shrink-0 items-center gap-2 bg-sport px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
                : "premium-control flex min-h-10 shrink-0 items-center gap-2 border border-white/10 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white/58 hover:bg-white/[0.05] hover:text-white"
            }
            aria-pressed={active === id}
          >
            <Icon className="size-3.5" />
            {lang === "fr" ? fr : en}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-200">
        {active === "follow" && (
          <div className="grid md:grid-cols-[0.72fr_1.28fr]">
            <div className="competition-panel border-b border-white/10 p-5 text-white md:border-b-0 md:border-r md:p-6">
              <Bell className="size-5 text-sport-foreground" />
              <p className="mt-5 font-display text-3xl font-extrabold uppercase leading-[0.88]">
                {lang === "fr" ? "Mes raccourcis" : "My shortcuts"}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/58">
                {lang === "fr"
                  ? "Choisissez ce que vous voulez retrouver plus vite quand vous revenez sur cette équipe."
                  : "Choose what you want to find faster when you return to this team."}
              </p>
            </div>

            <div className="grid gap-px bg-white/10 sm:grid-cols-3">
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
                    className={`flex min-h-[150px] flex-col justify-between p-5 text-left transition-colors ${enabled ? "bg-sport/12" : "bg-navy hover:bg-white/[0.045]"}`}
                    aria-pressed={enabled}
                  >
                    <Icon className={enabled ? "size-5 text-sport-foreground" : "size-5 text-white/62"} />
                    <span>
                      <span className="block font-display text-2xl font-extrabold uppercase leading-none text-white">
                        {lang === "fr" ? fr : en}
                      </span>
                      <span className={`mt-2 block text-[8px] font-bold uppercase tracking-[0.12em] ${enabled ? "text-sport-foreground" : "text-white/38"}`}>
                        {enabled
                          ? (lang === "fr" ? "Ajouté" : "Added")
                          : (lang === "fr" ? "Ajouter" : "Add")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {active === "arena" && (
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {arenas.map((arena) => (
              <article key={`${arena.name}-${arena.address}`} className="flex min-h-[220px] flex-col bg-navy p-5 text-white md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <Navigation className="size-5 text-sport-foreground" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-white/38">{arena.hint}</span>
                </div>
                <p className="mt-5 font-display text-2xl font-extrabold uppercase leading-[0.9] text-white">{arena.name}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/52">{arena.address}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <a href={googleDirections(arena.address)} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 bg-sport px-3 text-[8px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
                    Google Maps
                  </a>
                  <a href={wazeDirections(arena.address)} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 border border-white/16 px-3 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                    Waze
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {active === "partner" && !isDemoMember && (
          <HouseSponsorSlot placement={`team-smart-${team.legacyScheduleTeamId}`} count={1} />
        )}
      </div>
    </section>
  );
}
