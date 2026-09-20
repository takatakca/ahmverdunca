import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { EventCard } from "@/components/event-list";
import { Button } from "@/components/ui/button";
import { SCHEDULE, SCHEDULE_META, DEMO_TODAY, type EventType } from "@/data/schedule";
import { TEAMS } from "@/data/teams";
import { ARENAS } from "@/data/arenas";
import { formatDate, useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/translations";

export const Route = createFileRoute("/horaires")({
  head: () => ({
    meta: [
      { title: "Horaires — AHM Verdun" },
      { name: "description", content: "Entraînements, matchs et événements de l'AHM Verdun par semaine, avec filtres par équipe, aréna et type d'activité." },
      { property: "og:title", content: "Horaires — AHM Verdun" },
      { property: "og:description", content: "Consultez les activités de la semaine par équipe et par aréna." },
    ],
  }),
  component: SchedulePage;
});

const TYPES: EventType[] = ["practice", "game", "event", "tryout"];

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
  const [start, setStart] = useState(() => weekStart(DEMO_TODAY));
  const [team, setTeam] = useState("all");
  const [arena, setArena] = useState("all");
  const [type, setType] = useState("all");

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)), [start]);

  const events = useMemo(
    () =>
      SCHEDULE.filter(
        (e) =>
          e.date >= start &&
          e.date <= addDays(start, 6) &&
          (team === "all" || e.teamSlug === team) &&
          (arena === "all" || e.arenaSlug === arena) &&
          (type === "all" || e.type === type),
      ),
    [start, team, arena, type],
  );

  const selectClass =
    "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";

  return (
    <>
      <PageHeader eyebrow={t("common.demoData")} title={t("schedule.title")} description={t("schedule.subtitle")} />

      <div className="container-site py-8 md:py-12">
        <DemoNotice className="mb-6">{t("schedule.demoNotice")}</DemoNotice>

        {/* Week navigation */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl font-bold uppercase">
            {t("schedule.weekOf")} {formatDate(start, lang, { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setStart(addDays(start, -7))}>
              <ChevronLeft className="size-4" /> {t("schedule.prevWeek")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStart(weekStart(DEMO_TODAY))}>
              {t("schedule.today")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStart(addDays(start, 7))}>
              {t("schedule.nextWeek")} <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="eyebrow mb-1.5 block text-muted-foreground">{t("schedule.team")}</span>
            <select className={selectClass} value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="all">{t("common.all")}</option>
              {TEAMS.map((tm) => <option key={tm.slug} value={tm.slug}>{l(tm.name)}</option>)}
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
          <div className="flex items-end">
            <Button variant="secondary" className="w-full" onClick={() => { setTeam("all"); setArena("all"); setType("all"); }}>
              <RotateCcw className="size-4" /> {t("common.reset")}
            </Button>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {events.length} {t("schedule.count")} · {t("schedule.version")} {SCHEDULE_META.version} · {t("schedule.lastModified")} {formatDate(SCHEDULE_META.lastModified, lang)}
        </p>

        {/* Days */}
        <div className="mt-8 space-y-8">
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
      </div>
    </>
  );
}
