import { useEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Megaphone,
  Pause,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { HOUSE_SPONSORS, houseSponsorsForPlacement } from "@/data/house-sponsors";
import { RUNWAY_AD_CREATIVES, type RunwayAdPlacement } from "@/data/runway-ad-creatives";
import { useI18n } from "@/lib/i18n";
import { useDemoMemberMode } from "@/lib/demo-member-mode";
import { TakatakAdSlot } from "@/components/takatak-ad-slot";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useContentOverlayRegistry } from "@/lib/community-content";

const ROTATION_MS = 6500;

function AdArtwork({ src, alt, zoomed = false }: { src: string; alt: string; zoomed?: boolean }) {
  const crop = RUNWAY_AD_CREATIVES.find((creative) => creative.path === src)?.displayCrop;
  return (
    <div
      data-ad-artwork
      className={`relative overflow-hidden ${zoomed ? "w-[1600px] max-w-none" : "w-full"}`}
      style={{ aspectRatio: crop ? `${crop.width} / ${crop.height - crop.top}` : "16 / 9" }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-contain"
        style={
          crop
            ? { height: "auto", transform: `translateY(-${(crop.top / crop.height) * 100}%)` }
            : undefined
        }
      />
    </div>
  );
}

function visualPlacementForHouseSlot(placement: string): RunwayAdPlacement {
  const value = placement.toLowerCase();
  if (value.includes("schedule") || value.includes("horaire")) return "schedule";
  if (value.includes("team") || value.includes("equipe")) return "team";
  if (value.includes("gallery") || value.includes("galerie") || value.includes("album"))
    return "gallery";
  if (value.includes("news") || value.includes("nouvelle")) return "news";
  if (value.includes("arena") || value.includes("arena")) return "arena";
  if (value.includes("partner") || value.includes("partenaire") || value.includes("sponsor"))
    return "partners";
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
  const [manualPause, setManualPause] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const previewTrigger = useRef<HTMLButtonElement | null>(null);
  const selectedAdvertiser = RUNWAY_AD_CREATIVES.find(
    (creative) => creative.path === selectedImage,
  )?.advertiser;
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
  const visualPlacement = visualPlacementForHouseSlot(placement);
  const creativeSequence = RUNWAY_AD_CREATIVES.filter(
    (creative) => creative.placement === visualPlacement,
  );
  const creativeCount = Math.max(
    1,
    Math.min(compact ? 2 : Math.max(2, count), creativeSequence.length),
  );
  const inventoryLength = creativeSequence.length || sequence.length;
  const pageSize = creativeSequence.length ? creativeCount : visibleCount;
  const firstItem = rotation % inventoryLength;
  const sponsors = Array.from(
    { length: visibleCount },
    (_, offset) => sequence[(firstItem + offset) % sequence.length]!,
  );
  const creatives = Array.from(
    { length: creativeCount },
    (_, offset) => creativeSequence[(firstItem + offset) % creativeSequence.length]!,
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    const update = () => setMotionAllowed(!reduceMotion.matches && !mobileViewport.matches);
    update();
    reduceMotion.addEventListener("change", update);
    mobileViewport.addEventListener("change", update);
    return () => {
      reduceMotion.removeEventListener("change", update);
      mobileViewport.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!motionAllowed || paused || manualPause || selectedImage || inventoryLength <= pageSize)
      return;

    const timer = window.setInterval(
      () => setRotation((current) => (current + pageSize) % inventoryLength),
      ROTATION_MS,
    );

    return () => window.clearInterval(timer);
  }, [paused, manualPause, selectedImage, motionAllowed, inventoryLength, pageSize]);

  if (isDemoMember) return null;

  const move = (direction: -1 | 1) => {
    setRotation((current) => {
      const next = current + direction * pageSize;
      return ((next % inventoryLength) + inventoryLength) % inventoryLength;
    });
  };

  return (
    <aside
      className={`overflow-hidden rounded-2xl border border-white/12 bg-navy-deep text-white ${className}`}
      aria-label={lang === "fr" ? "Publicités et promotions" : "Advertising and promotions"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.035] px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Megaphone className="size-4 shrink-0 text-sport-foreground" aria-hidden />
          <p className="text-xs font-semibold text-white/85">
            {lang === "fr" ? "Découvertes locales" : "Local discoveries"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {motionAllowed && (
            <button
              type="button"
              onClick={() => setManualPause((current) => !current)}
              className="hidden size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sport md:inline-flex"
              aria-label={
                manualPause
                  ? lang === "fr"
                    ? "Reprendre la rotation"
                    : "Resume rotation"
                  : lang === "fr"
                    ? "Mettre la rotation en pause"
                    : "Pause rotation"
              }
              aria-pressed={manualPause}
            >
              {manualPause ? (
                <Play className="size-4" aria-hidden />
              ) : (
                <Pause className="size-4" aria-hidden />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => move(-1)}
            className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sport"
            aria-label={lang === "fr" ? "Publicité précédente" : "Previous advertisement"}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sport"
            aria-label={lang === "fr" ? "Publicité suivante" : "Next advertisement"}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {creatives.length > 0 && (
        <div className="border-b border-white/10 bg-competition">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <p className="text-xs font-semibold text-sport-foreground">
              {lang === "fr" ? "Promotions à découvrir" : "Promotions to explore"}
            </p>
            <p className="text-xs text-white/65">
              {lang === "fr" ? "Touchez pour agrandir" : "Tap to enlarge"}
            </p>
          </div>
          <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-3 pb-3 md:grid md:grid-cols-2 md:overflow-visible">
            {creatives.map((creative) => {
              const overlay = contentRegistry.apply("image", `ad-creative:${creative.id}`, {
                imageUrl: creative.path,
              });
              const imageUrl =
                typeof overlay.imageUrl === "string" && overlay.imageUrl
                  ? overlay.imageUrl
                  : creative.path;
              const advertiser = imageUrl === creative.path ? creative.advertiser : null;
              const imageLabel = `${lang === "fr" ? "Publicité" : "Advertisement"}${advertiser ? ` — ${advertiser}` : ""}`;
              const crop = imageUrl === creative.path ? creative.displayCrop : undefined;
              return (
                <div
                  key={creative.id}
                  className="group relative w-[calc(100%_-_1rem)] shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-navy md:w-auto"
                >
                  <div
                    className="relative overflow-hidden"
                    style={{
                      aspectRatio: crop ? `${crop.width} / ${crop.height - crop.top}` : "16 / 9",
                    }}
                  >
                    <button
                      type="button"
                      className="absolute inset-0 size-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-sport"
                      onClick={(event) => {
                        previewTrigger.current = event.currentTarget;
                        setSelectedImage(imageUrl);
                        setZoomed(false);
                      }}
                      aria-label={`${lang === "fr" ? "Agrandir cette publicité" : "Enlarge this advertisement"}${advertiser ? ` — ${advertiser}` : ""}`}
                    >
                      <AdArtwork src={imageUrl} alt={imageLabel} />
                    </button>
                  </div>
                  {advertiser && (
                    <p className="px-3 pt-3 text-sm font-semibold text-white">{advertiser}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-white/75">
                    <span>{lang === "fr" ? "Publicité" : "Advertisement"}</span>
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
                      className="size-11 shrink-0 rounded-lg border-white/10 bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        previewTrigger.current = event.currentTarget;
                        setSelectedImage(imageUrl);
                        setZoomed(false);
                      }}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sport"
                    >
                      <ZoomIn className="hidden size-4 shrink-0 sm:block" aria-hidden />{" "}
                      {lang === "fr" ? "Agrandir" : "Enlarge"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {creatives.length === 0 && (
        <div
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
              <div
                className={`interactive-surface group relative flex min-h-[150px] h-full flex-col justify-between overflow-hidden bg-competition ${compact ? "p-4" : "p-5 md:p-6"}`}
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-10 font-display text-[7rem] font-extrabold uppercase leading-none text-white/[0.025]"
                  aria-hidden
                >
                  {sponsor.short}
                </div>

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-sport-foreground">
                      {GROUP_LABELS[sponsor.group][lang]}
                    </p>
                    <p
                      className={`mt-2 font-display font-extrabold uppercase leading-[0.9] text-white ${compact ? "text-2xl" : "text-3xl"}`}
                    >
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
                  <p className="text-[11px] leading-relaxed text-white/58">
                    {sponsor.tagline[lang]}
                  </p>
                  <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.13em] text-white/34">
                    {lang === "fr" ? "Promotion" : "Promotion"}
                  </p>
                </div>
              </div>
            );

            const sponsorCard = sponsor.href ? (
              <a
                href={sponsor.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`block ${itemClass}`}
              >
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
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-2">
        <p className="text-xs text-white/65">
          {lang === "fr"
            ? "Entreprises et services à découvrir"
            : "Businesses and services to explore"}
        </p>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-white/75">
          {String(firstItem + 1).padStart(2, "0")} / {String(inventoryLength).padStart(2, "0")}
        </span>
      </div>
      <DialogPrimitive.Root
        open={Boolean(selectedImage)}
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm" />
          <DialogPrimitive.Content
            data-ahmv-attention-surface="advertisement-preview"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              previewTrigger.current?.focus();
            }}
            className="fixed left-1/2 top-1/2 z-[81] max-h-[calc(100dvh_-_1.5rem)] w-[calc(100%_-_1.5rem)] max-w-6xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/20 bg-navy-deep p-3 text-white shadow-2xl sm:p-5"
          >
            <DialogPrimitive.Title className="pr-12 text-lg font-semibold">
              {`${lang === "fr" ? "Publicité" : "Advertisement"}${selectedAdvertiser ? ` — ${selectedAdvertiser}` : ""}`}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1 pr-12 text-sm text-white/70">
              {lang === "fr"
                ? "Consultez le visuel et ses coordonnées en grand format."
                : "View the image and its contact details in full size."}
            </DialogPrimitive.Description>
            <DialogPrimitive.Close
              className="absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-xl hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sport"
              aria-label={lang === "fr" ? "Fermer la publicité" : "Close advertisement"}
            >
              <X className="size-5" aria-hidden />
            </DialogPrimitive.Close>
            <div
              className="mt-4 max-h-[65dvh] overflow-auto rounded-xl border border-white/10 bg-black/30"
              tabIndex={0}
              role="region"
              aria-label={
                lang === "fr"
                  ? "Visuel publicitaire, défilement disponible avec le zoom"
                  : "Advertisement image, scrollable when zoomed"
              }
            >
              {selectedImage && (
                <AdArtwork
                  src={selectedImage}
                  alt={`${lang === "fr" ? "Publicité" : "Advertisement"}${selectedAdvertiser ? ` — ${selectedAdvertiser}` : ""}`}
                  zoomed={zoomed}
                />
              )}
            </div>
            <button
              type="button"
              aria-pressed={zoomed}
              onClick={() => setZoomed((current) => !current)}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sport"
            >
              {zoomed ? (
                <ZoomOut className="size-4" aria-hidden />
              ) : (
                <ZoomIn className="size-4" aria-hidden />
              )}
              {zoomed
                ? lang === "fr"
                  ? "Taille adaptée"
                  : "Fit image"
                : lang === "fr"
                  ? "Zoom sur le visuel"
                  : "Zoom into image"}
            </button>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
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
