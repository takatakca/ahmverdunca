import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { EventCard } from "@/components/event-list";
import { Button } from "@/components/ui/button";
import { SCHEDULE, SCHEDULE_META, DEMO_TODAY, type EventType, type EventStatus } from "@/data/schedule";
import { TEAMS } from "@/data/teams";
import { ARENAS } from "@/data/arenas";
import { formatDate, useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/translations";

export const Route = createFileRoute("/horaires")({
  validateSearch: (search: Record<string, unknown>) => ({ team: typeof search.team === "string" && TEAMS.some((item) => item.slug === search.team) ? search.team : undefined }),
  head: () => ({
    meta: [
      { title: "Horaires — AHM Verdun" },
      { name: "description", content: "Entraînements, matchs et événements de l'AHM Verdun par semaine, avec filtres par équipe, aréna et type d'activité." },
      { property: "og:title", content: "Horaires — AHM Verdun" },
      { property: "og:description", content: "Consultez les activités de la semaine par équipe et par aréna." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SchedulePage,
});

const TYPES: EventType[] = ["practice", "game", "event", "tryout"];
const STATUSES: EventStatus[] = ["confirmed", "modified", "cancelled", "pending"];

/** Monday of the week containing the given ISO date. */
function weekStart(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function SchedulePage() {
  const { t, l, lang } = useI18n();
  const { team: selectedTeam } = Route.useSearch();
  const [start, setStart] = useState(() => weekStart(DEMO_TODAY));
  const [team, setTeam] = useState(selectedTeam ?? "all");
  const [category, setCategory] = useState("all");
  const [arena, setArena] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  // Finder navigation can change the query while this page stays mounted.
  useEffect(() => { setTeam(selectedTeam ?? "all"); setCategory(selectedTeam ?? "all"); }, [selectedTeam]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)), [start]);

  const events = useMemo(
    () =>
      SCHEDULE.filter(
        (e) =>
          e.date >= start &&
          e.date <= addDays(start, 6) &&
          (team === "all" || e.teamSlug === team) &&
           (category === "all" || e.teamSlug === category) &&
          (arena === "all" || e.arenaSlug === arena) &&
           (type === "all" || e.type === type) &&
           (status === "all" || e.status === status),
      ),
    [start, team, category, arena, type, status],
  );

  const selectClass =
    "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";

  return (
    <>
       <PageHeader eyebrow={t("common.demoData")} title={t("schedule.title")} description={t("schedule.subtitle")} />

      <div className="container-site py-8 md:py-12">
        <DemoNotice className="mb-6">{t("schedule.demoNotice")}</DemoNotice>

        {/* Week navigation */}
         <div className="grid gap-3 border-b border-border pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
           <div className="min-w-0">
             <p className="eyebrow text-sport">{t("schedule.today")}</p>
             <p className="mt-1 font-display text-2xl font-bold uppercase leading-tight">
               {formatDate(start, lang, { day: "numeric", month: "short" })} — {formatDate(addDays(start, 6), lang, { day: "numeric", month: "short", year: "numeric" })}
             </p>
           </div>
           <div className="grid grid-cols-[auto_1fr_auto] gap-2 sm:flex">
             <Button variant="outline" size="sm" aria-label={t("schedule.prevWeek")} title={t("schedule.prevWeek")} onClick={() => setStart(addDays(start, -7))}>
               <ChevronLeft className="size-4" /><span className="hidden sm:inline">{t("schedule.prevWeek")}</span>
             </Button>
             <Button variant="outline" size="sm" className="min-w-0" onClick={() => setStart(weekStart(DEMO_TODAY))}>{t("schedule.today")}</Button>
             <Button variant="outline" size="sm" aria-label={t("schedule.nextWeek")} title={t("schedule.nextWeek")} onClick={() => setStart(addDays(start, 7))}>
               <span className="hidden sm:inline">{t("schedule.nextWeek")}</span><ChevronRight className="size-4" />
             </Button>
           </div>
         </div>

        {/* Filters */}
         <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="block">
            <span className="eyebrow mb-1.5 block text-muted-foreground">{t("schedule.team")}</span>
            <select className={selectClass} value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="all">{t("common.all")}</option>
              {TEAMS.map((tm) => <option key={tm.slug} value={tm.slug}>{l(tm.name)}</option>)}
            </select>
          </label>
           <label className="block">
             <span className="eyebrow mb-1.5 block text-muted-foreground">{t("common.category")}</span>
             <select className={selectClass} value={category} onChange={(e) => { setCategory(e.target.value); setTeam("all"); }}>
               <option value="all">{t("common.all")}</option>
               {TEAMS.map((tm) => <option key={tm.slug} value={tm.slug}>{tm.code === "F" ? l(tm.name) : tm.code}</option>)}
             </select>
           </label>
          <label className="block">
            <span className="eyebrow mb-1.5 block text-muted-foreground">{t("schedule.arena")}</span>
            <select className={selectClass} value={arena} onChange={(e) => setArena(e.target.value)}>
              <option value="all">{t("common.all")}</option>
              {ARENAS.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow mb-1.5 block text-muted-foreground">{t("schedule.type")}</span>
            <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">{t("common.all")}</option>
              {TYPES.map((ty) => <option key={ty} value={ty}>{t(`type.${ty}` as TranslationKey)}</option>)}
            </select>
          </label>
           <label className="block">
             <span className="eyebrow mb-1.5 block text-muted-foreground">{t("schedule.status")}</span>
             <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
               <option value="all">{t("common.all")}</option>
               {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
             </select>
           </label>
          <div className="flex items-end">
             <Button variant="secondary" className="w-full" onClick={() => { setTeam("all"); setCategory("all"); setArena("all"); setType("all"); setStatus("all"); }}>
              <RotateCcw className="size-4" /> {t("common.reset")}
            </Button>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {events.length} {t("schedule.count")} · {t("schedule.version")} {SCHEDULE_META.version} · {t("schedule.lastModified")} {formatDate(SCHEDULE_META.lastModified, lang)}
        </p>

         {/* Chronological mobile list; the same events appear in a seven-day desktop week. */}
         <div className="mt-8 space-y-8 lg:hidden">
          {events.length === 0 && <p className="text-muted-foreground">{t("schedule.noEventsWeek")}</p>}
          {days.map((day) => {
            const dayEvents = events.filter((e) => e.date === day);
            if (dayEvents.length === 0) return null;
            return (
              <section key={day}>
                <h2 className="mb-3 border-b border-border pb-2 font-display text-lg font-bold uppercase tracking-wide">
                  {formatDate(day, lang)}
                </h2>
                <div className="space-y-3">
                  {dayEvents.map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            );
          })}
        </div>
         <div className="mt-8 hidden lg:grid lg:grid-cols-7 lg:gap-2" aria-label={lang === "fr" ? "Semaine complète" : "Full week"}>
           {days.map((day) => {
             const dayEvents = events.filter((e) => e.date === day);
             return <section key={day} className="min-w-0 border-l border-border pl-2 first:border-l-0 first:pl-0">
               <h2 className="min-h-14 border-b border-border pb-2 font-display text-lg font-bold uppercase leading-tight">{formatDate(day, lang, { weekday: "long", day: "numeric", month: "short" })}</h2>
               <div className="mt-3 space-y-2">{dayEvents.length ? dayEvents.map((e) => <EventCard key={e.id} event={e} compact />) : <p className="text-xs text-muted-foreground">{t("schedule.noEvents")}</p>}</div>
             </section>;
           })}
         </div>
      </div>
    </>
  );
}
