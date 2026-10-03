import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone, Pause, Sparkles } from "lucide-react";
import { HOUSE_SPONSORS, houseSponsorsForPlacement } from "@/data/house-sponsors";
import { useI18n } from "@/lib/i18n";
import { useDemoMemberMode } from "@/lib/demo-member-mode";

const ROTATION_MS = 6500;

export function HouseSponsorSlot({
  placement,
  className = "",
  count = 2,
  compact = false,
}: {
  placement: string;
  className?: string;
  count?: number;
  compact?: boolean;
}) {
  const { lang } = useI18n();
  const { isDemoMember } = useDemoMemberMode();
  const [rotation, setRotation] = useState(0);
  const [paused, setPaused] = useState(false);

  const sequence = useMemo(
    () => houseSponsorsForPlacement(placement, HOUSE_SPONSORS.length),
    [placement],
  );
  const visibleCount = Math.max(1, Math.min(count, sequence.length));
  const sponsors = Array.from({ length: visibleCount }, (_, offset) =>
    sequence[(rotation + offset) % sequence.length]!,
  );

  useEffect(() => {
    if (paused || sequence.length <= visibleCount || typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const timer = window.setInterval(
      () => setRotation((current) => (current + visibleCount) % sequence.length),
      ROTATION_MS,
    );

    return () => window.clearInterval(timer);
  }, [paused, sequence.length, visibleCount]);

  if (isDemoMember) return null;

  const move = (direction: -1 | 1) => {
    setRotation((current) => {
      const next = current + direction * visibleCount;
      return ((next % sequence.length) + sequence.length) % sequence.length;
    });
  };

  return (
    <aside
      className={`overflow-hidden border border-navy/10 bg-background ${className}`}
      aria-label={lang === "fr" ? "Publicités et promotions maison" : "House advertising and promotions"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-navy/10 bg-ice px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Megaphone className="size-3.5 text-sport" aria-hidden />
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {lang === "fr" ? "Promotion maison" : "House promotion"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-1 hidden items-center gap-1 text-[8px] font-bold uppercase tracking-[0.14em] text-sport sm:inline-flex">
            {paused ? <Pause className="size-3" /> : <Sparkles className="size-3" />}
            {paused
              ? (lang === "fr" ? "Pause" : "Paused")
              : (lang === "fr" ? "Rotation auto" : "Auto rotation")}
          </span>
          <button
            type="button"
            onClick={() => move(-1)}
            className="premium-control flex size-8 items-center justify-center border border-navy/10 bg-background text-navy hover:border-sport"
            aria-label={lang === "fr" ? "Publicité précédente" : "Previous advertisement"}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="premium-control flex size-8 items-center justify-center border border-navy/10 bg-background text-navy hover:border-sport"
            aria-label={lang === "fr" ? "Publicité suivante" : "Next advertisement"}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div
        className={compact ? "grid gap-px bg-navy/10 sm:grid-cols-2" : "grid gap-px bg-navy/10 md:grid-cols-2"}
        aria-live="off"
      >
        {sponsors.map((sponsor) => {
          const card = sponsor.creative ? (
            <div className="premium-depth group relative overflow-hidden bg-competition">
              <img
                src={sponsor.creative}
                alt={`${sponsor.name} — ${sponsor.tagline[lang]}`}
                loading="lazy"
                decoding="async"
                className={`premium-depth-media w-full object-cover transition-[transform,filter,opacity] duration-700 group-hover:scale-[1.018] ${compact ? "aspect-[12/4.4]" : "aspect-[12/5.2]"}`}
              />
              <span className="absolute left-3 top-3 border border-white/15 bg-navy-deep/72 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.16em] text-white/78 backdrop-blur">
                {lang === "fr" ? "Publicité" : "Advertisement"}
              </span>
              {sponsor.href && (
                <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center border border-white/20 bg-navy-deep/72 text-white backdrop-blur">
                  <ExternalLink className="size-4" aria-hidden />
                </span>
              )}
            </div>
          ) : (
            <div className={`group flex min-w-0 items-center gap-4 bg-background ${compact ? "p-3" : "p-4 md:p-5"}`}>
              <div className={`flex shrink-0 items-center justify-center border border-sport/25 bg-competition font-display font-extrabold uppercase text-sport-foreground ${compact ? "size-10 text-sm" : "size-14 text-lg"}`}>
                {sponsor.short}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-display font-extrabold uppercase leading-none text-navy ${compact ? "text-lg" : "text-2xl"}`}>
                  {sponsor.name}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {sponsor.tagline[lang]}
                </p>
              </div>
              {sponsor.href && <ExternalLink className="size-3.5 shrink-0 text-sport" aria-hidden />}
            </div>
          );

          return sponsor.href ? (
            <a key={sponsor.id} href={sponsor.href} target="_blank" rel="noopener noreferrer" className="block">
              {card}
            </a>
          ) : (
            <div key={sponsor.id}>{card}</div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-navy/10 px-4 py-2">
        <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          {lang === "fr"
            ? "Inventaire maison rotatif · remplaçable par AdSense ou commanditaire officiel."
            : "Rotating house inventory · replaceable by AdSense or an official sponsor."}
        </p>
        <span className="shrink-0 text-[8px] font-bold tabular-nums text-muted-foreground">
          {String(rotation + 1).padStart(2, "0")} / {String(sequence.length).padStart(2, "0")}
        </span>
      </div>
    </aside>
  );
}
