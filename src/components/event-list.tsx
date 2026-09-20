import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { useI18n, type TranslationKeyless } from "@/lib/i18n-types";
import type { ScheduleEvent } from "@/data/schedule";
import { getArena } from "@/data/arenas";
import { getTeam } from "@/data/teams";
import { cn } from "@/lib/utils";

const statusStyle: Record<ScheduleEvent["status"], string> = {
  confirmed: "bg-status-confirmed-soft text-status-confirmed",
  modified: "bg-status-modified-soft text-status-modified",
  cancelled: "bg-status-cancelled-soft text-status-cancelled",
  pending: "bg-status-pending-soft text-status-pending",
};

export function EventCard({ event }: { event: ScheduleEvent }) {
  const { t, l } = useI18n();
  const arena = getArena(event.arenaSlug);
  const team = getTeam(event.teamSlug);

  return (
    <article
      className={cn(
        "card-elevated stripe-sport flex flex-col gap-3 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between",
        event.status === "cancelled" && "opacity-80",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-lg font-bold tabular-nums">
            {event.start} – {event.end}
          </span>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", statusStyle[event.status])}>
            {t(`status.${event.status}` as TranslationKeyless)}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
            {t(`type.${event.type}` as TranslationKeyless)}
          </span>
        </div>
        <h3 className="heading-card mt-1.5 truncate">
          {team ? l(team.name) : event.teamSlug}
          {event.opponent && <span className="text-muted-foreground"> · {event.opponent}</span>}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {arena?.name ?? event.arenaSlug}
            {event.rink ? ` — ${event.rink}` : ""}
          </span>
        </p>
        {event.note && <p className="mt-1.5 text-sm italic text-demo-foreground">{l(event.note)}</p>}
      </div>
      <div className="flex shrink-0 gap-2">
        {team && (
          <Link
            to="/equipes/$slug"
            params={{ slug: team.slug }}
            className="inline-flex items-center rounded-md border border-input px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary"
          >
            {t("common.viewTeam")}
          </Link>
        )}
        {arena && (
          <Link
            to="/arenas/$slug"
            params={{ slug: arena.slug }}
            className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary"
          >
            <Clock className="size-3.5" aria-hidden />
            {t("common.viewArena")}
          </Link>
        )}
      </div>
    </article>
  );
}
