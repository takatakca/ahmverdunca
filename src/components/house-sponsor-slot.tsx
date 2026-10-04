import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone, Pause, Sparkles } from "lucide-react";
import { HOUSE_SPONSORS, houseSponsorsForPlacement } from "@/data/house-sponsors";
import { useI18n } from "@/lib/i18n";
import { useDemoMemberMode } from "@/lib/demo-member-mode";

const ROTATION_MS = 6500;

const GROUP_LABELS = {
  takatak: { fr: "Écosystème TAKATAK", en: "TAKATAK ecosystem" },
  hospitality: { fr: "Escapades & loisirs", en: "Getaways & leisure" },
  food: { fr: "Restaurants & gourmandises", en: "Food & treats" },
  local: { fr: "Entreprise locale", en: "Local business" },
} as const;

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
      className={`overflow-hidden border border-navy/12 bg-navy-deep text-white ${className}`}
      aria-label={lang === "fr" ? "Publicités et promotions maison" : "House advertising and promotions"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Megaphone className="size-3.5 text-sport-foreground" aria-hidden />
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/56">
            {lang === "fr" ? "Découvertes locales" : "Local discoveries"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-1 hidden items-center gap-1 text-[8px] font-bold uppercase tracking-[0.14em] text-sport-foreground sm:inline-flex">
            {paused ? <Pause className="size-3" /> : <Sparkles className="size-3" />}
            {paused
              ? (lang === "fr" ? "Pause" : "Paused")
              : (lang === "fr" ? "Rotation auto" : "Auto rotation")}
          </span>
          <button
            type="button"
            onClick={() => move(-1)}
            className="premium-control flex size-8 items-center justify-center border border-white/12 bg-white/[0.04] text-white hover:border-sport"
            aria-label={lang === "fr" ? "Publicité précédente" : "Previous advertisement"}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="premium-control flex size-8 items-center justify-center border border-white/12 bg-white/[0.04] text-white hover:border-sport"
            aria-label={lang === "fr" ? "Publicité suivante" : "Next advertisement"}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div
        className={compact ? "grid gap-px bg-white/10 sm:grid-cols-2" : "grid gap-px bg-white/10 md:grid-cols-2"}
        aria-live="off"
      >
        {sponsors.map((sponsor) => {
          const card = (
            <div className={`interactive-surface group relative flex min-h-[150px] flex-col justify-between overflow-hidden bg-competition ${compact ? "p-4" : "p-5 md:p-6"}`}>
              <div className="pointer-events-none absolute -right-8 -top-10 font-display text-[7rem] font-extrabold uppercase leading-none text-white/[0.025]" aria-hidden>
                {sponsor.short}
              </div>

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-sport-foreground">
                    {GROUP_LABELS[sponsor.group][lang]}
                  </p>
                  <p className={`mt-2 font-display font-extrabold uppercase leading-[0.9] text-white ${compact ? "text-2xl" : "text-3xl"}`}>
                    {sponsor.name}
                  </p>
                </div>
                {sponsor.href && (
                  <span className="flex size-9 shrink-0 items-center justify-center border border-white/12 bg-white/[0.04] text-sport-foreground transition-colors group-hover:border-sport">
                    <ExternalLink className="size-4" aria-hidden />
                  </span>
                )}
              </div>

              <div className="relative mt-5 border-t border-white/10 pt-3">
                <p className="text-[11px] leading-relaxed text-white/58">{sponsor.tagline[lang]}</p>
                <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.13em] text-white/34">
                  {lang === "fr"
                    ? "Annonce textuelle — aucun faux logo utilisé"
                    : "Text advertisement — no simulated logo used"}
                </p>
              </div>
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

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-2">
        <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-white/36">
          {lang === "fr"
            ? "Inventaire local · les logos officiels sont affichés seulement lorsqu’ils sont fournis ou vérifiés."
            : "Local inventory · official logos appear only when supplied or verified."}
        </p>
        <span className="shrink-0 text-[8px] font-bold tabular-nums text-white/38">
          {String(rotation + 1).padStart(2, "0")} / {String(sequence.length).padStart(2, "0")}
        </span>
      </div>
    </aside>
  );
}
