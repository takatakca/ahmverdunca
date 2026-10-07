import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone, Pause, Sparkles } from "lucide-react";
import { HOUSE_SPONSORS, houseSponsorsForPlacement } from "@/data/house-sponsors";
import { RUNWAY_AD_CREATIVES, type RunwayAdPlacement } from "@/data/runway-ad-creatives";
import { useI18n } from "@/lib/i18n";
import { useDemoMemberMode } from "@/lib/demo-member-mode";
import { TakatakAdSlot } from "@/components/takatak-ad-slot";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useContentOverlayRegistry } from "@/lib/community-content";

const ROTATION_MS = 6500;


function visualPlacementForHouseSlot(placement: string): RunwayAdPlacement {
  const value = placement.toLowerCase();
  if (value.includes("schedule") || value.includes("horaire")) return "schedule";
  if (value.includes("team") || value.includes("equipe")) return "team";
  if (value.includes("gallery") || value.includes("galerie") || value.includes("album")) return "gallery";
  if (value.includes("news") || value.includes("nouvelle")) return "news";
  if (value.includes("arena") || value.includes("arena")) return "arena";
  if (value.includes("partner") || value.includes("partenaire") || value.includes("sponsor")) return "partners";
  return "home";
}

const GROUP_LABELS = {
  takatak: { fr: "Services partenaires", en: "Partner services" },
  hospitality: { fr: "Escapades & loisirs", en: "Getaways & leisure" },
  food: { fr: "Restaurants & gourmandises", en: "Food & treats" },
  local: { fr: "Entreprise locale", en: "Local business" },
} as const;

function HouseSponsorInventory({
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
  const contentRegistry = useContentOverlayRegistry();

  const sequence = useMemo(
    () =>
      houseSponsorsForPlacement(placement, HOUSE_SPONSORS.length).map((sponsor) =>
        (() => {
          const patched = contentRegistry.apply(
            "sponsor",
            `house-sponsor:${sponsor.id}`,
            sponsor as unknown as Record<string, unknown>,
          ) as unknown as typeof sponsor & { website?: string };
          return {
            ...patched,
            href: patched.website ?? patched.href,
          };
        })(),
      ),
    [contentRegistry.overlays, placement],
  );
  const visibleCount = Math.max(1, Math.min(count, sequence.length));
  const sponsors = Array.from({ length: visibleCount }, (_, offset) =>
    sequence[(rotation + offset) % sequence.length]!,
  );
  const visualPlacement = visualPlacementForHouseSlot(placement);
  const creativeSequence = RUNWAY_AD_CREATIVES.filter(
    (creative) => creative.placement === visualPlacement,
  );
  const creativeCount = Math.max(1, Math.min(compact ? 2 : Math.max(2, count), creativeSequence.length));
  const creatives = Array.from({ length: creativeCount }, (_, offset) =>
    creativeSequence[(rotation + offset) % creativeSequence.length]!,
  );

  useEffect(() => {
    if (paused || sequence.length <= visibleCount || typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    if (reduceMotion.matches || mobileViewport.matches) return;

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
      aria-label={lang === "fr" ? "Publicités et promotions" : "Advertising and promotions"}
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
            <span className="ml-2 text-sport-foreground sm:hidden">
              · {lang === "fr" ? "Glissez" : "Swipe"}
            </span>
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

      {creatives.length > 0 && (
        <div className="border-b border-white/10 bg-competition">
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-sport-foreground">
              {lang === "fr" ? "Promotions à découvrir" : "Promotions to explore"}
            </p>
            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/34">
              {lang === "fr" ? "Touchez ou glissez" : "Tap or swipe"}
            </p>
          </div>
          <div className="scrollbar-none flex snap-x snap-mandatory gap-px overflow-x-auto overscroll-x-contain bg-white/10 md:grid md:grid-cols-2 md:overflow-visible">
            {creatives.map((creative) => {
              const overlay = contentRegistry.apply(
                "image",
                `ad-creative:${creative.id}`,
                { imageUrl: creative.path },
              );
              const imageUrl =
                typeof overlay.imageUrl === "string" && overlay.imageUrl
                  ? overlay.imageUrl
                  : creative.path;
              return (
                <div
                  key={creative.id}
                  className="group relative min-w-[86vw] snap-start overflow-hidden bg-navy md:min-w-0"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={lang === "fr" ? "Publicité locale" : "Local advertisement"}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(7,16,43,0.72)_100%)]" />
                    <span className="absolute bottom-2 left-2 border border-white/16 bg-navy-deep/72 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.14em] text-white/72 backdrop-blur">
                      {lang === "fr" ? "Publicité locale" : "Local ad"}
                    </span>
                    <ContentContributionButton
                      resourceType="image"
                      resourceKey={`ad-creative:${creative.id}`}
                      title={lang === "fr" ? "Publicité locale" : "Local advertisement"}
                      snapshot={{ imageUrl }}
                      fields={[
                        {
                          key: "imageUrl",
                          label: { fr: "Nouvelle image", en: "Replacement image" },
                          kind: "image-url",
                          current: imageUrl,
                        },
                      ]}
                      appearance="menu"
                      className="absolute right-2 top-2 z-20"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {creatives.length === 0 && <div
        className={
          compact
            ? "scrollbar-none flex snap-x snap-mandatory gap-px overflow-x-auto overscroll-x-contain bg-white/10 sm:grid sm:grid-cols-2 sm:overflow-visible"
            : "scrollbar-none flex snap-x snap-mandatory gap-px overflow-x-auto overscroll-x-contain bg-white/10 md:grid md:grid-cols-2 md:overflow-visible"
        }
        aria-live="off"
      >
        {sponsors.map((sponsor) => {
          const itemClass = compact
            ? "min-w-[82vw] snap-start sm:min-w-0"
            : "min-w-[82vw] snap-start md:min-w-0";
          const card = (
            <div className={`interactive-surface group relative flex min-h-[150px] h-full flex-col justify-between overflow-hidden bg-competition ${compact ? "p-4" : "p-5 md:p-6"}`}>
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
                    ? "Promotion"
                    : "Promotion"}
                </p>
              </div>
            </div>
          );

          const sponsorCard = sponsor.href ? (
            <a href={sponsor.href} target="_blank" rel="noopener noreferrer" className={`block ${itemClass}`}>
              {card}
            </a>
          ) : (
            <div className={itemClass}>{card}</div>
          );

          return (
            <div key={sponsor.id} className="relative">
              <ContentContributionButton
                resourceType="sponsor"
                resourceKey={`house-sponsor:${sponsor.id}`}
                title={sponsor.name}
                snapshot={sponsor as unknown as Record<string, unknown>}
                fields={[
                  {
                    key: `tagline.${lang}`,
                    label: { fr: "Texte promotionnel", en: "Promotional text" },
                    kind: "textarea",
                    current: sponsor.tagline[lang],
                  },
                  {
                    key: "website",
                    label: { fr: "Lien public", en: "Public link" },
                    kind: "url",
                    current: sponsor.href,
                  },
                ]}
                appearance="menu"
                className="absolute right-2 top-2 z-20"
              />
              {sponsorCard}
            </div>
          );
        })}
      </div>}

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-2">
        <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-white/36">
          {lang === "fr"
            ? "Entreprises et services à découvrir"
            : "Businesses and services to explore"}
        </p>
        <span className="shrink-0 text-[8px] font-bold tabular-nums text-white/38">
          {String(rotation + 1).padStart(2, "0")} / {String(sequence.length).padStart(2, "0")}
        </span>
      </div>
    </aside>
  );
}


type HouseSponsorSlotProps = {
  placement: string;
  className?: string;
  count?: number;
  compact?: boolean;
  network?: boolean;
};

export function HouseSponsorSlot({
  placement,
  className = "",
  count = 2,
  compact = false,
  network = true,
}: HouseSponsorSlotProps) {
  const { isDemoMember } = useDemoMemberMode();
  if (isDemoMember) return null;

  const fallback = (
    <HouseSponsorInventory
      placement={placement}
      className={className}
      count={count}
      compact={compact}
    />
  );

  if (!network) return fallback;

  return (
    <TakatakAdSlot
      placement={placement}
      className={className}
      compact={compact}
      fallback={fallback}
      requireImage
    />
  );
}
