import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent, type TouchEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Images, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaViewerItem = {
  url: string;
  sourceUrl?: string;
  alt: { fr: string; en: string };
  label?: { fr: string; en: string };
  categoryLabel?: { fr: string; en: string };
};

type MediaLuxuryViewerProps = {
  items: readonly MediaViewerItem[];
  open: boolean;
  initialIndex?: number;
  lang: "fr" | "en";
  onOpenChange: (open: boolean) => void;
};

export function MediaLuxuryViewer({
  items,
  open,
  initialIndex = 0,
  lang,
  onOpenChange,
}: MediaLuxuryViewerProps) {
  const safeInitialIndex = Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0));
  const [index, setIndex] = useState(safeInitialIndex);
  const [zoomed, setZoomed] = useState(false);
  // Zoom focus in percent of the image box: where the viewer tapped, then wherever they pan.
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const handingFocusAway = useRef(false);
  const current = items[index];

  useEffect(() => {
    if (!open) return;
    setIndex(safeInitialIndex);
    setZoomed(false);
  }, [open, safeInitialIndex]);

  useEffect(() => {
    if (!zoomed) setOrigin({ x: 50, y: 50 });
  }, [zoomed, index]);

  /** Maps a screen point to the untransformed image box so panning stays stable while scaled. */
  const originFromPoint = (clientX: number, clientY: number) => {
    const image = imageRef.current;
    const frame = image?.offsetParent;
    if (!image || !(frame instanceof HTMLElement) || !image.offsetWidth || !image.offsetHeight) {
      return { x: 50, y: 50 };
    }
    const box = frame.getBoundingClientRect();
    const clamp = (value: number) => Math.min(100, Math.max(0, value));
    return {
      x: clamp(((clientX - box.left - image.offsetLeft) / image.offsetWidth) * 100),
      y: clamp(((clientY - box.top - image.offsetTop) / image.offsetHeight) * 100),
    };
  };

  const toggleZoomAt = (event: MouseEvent<HTMLButtonElement>) => {
    if (zoomed) {
      setZoomed(false);
      return;
    }
    // Keyboard activation reports no pointer position (detail 0): zoom the centre.
    setOrigin(event.detail === 0 ? { x: 50, y: 50 } : originFromPoint(event.clientX, event.clientY));
    setZoomed(true);
  };

  const panWithPointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (zoomed && event.pointerType === "mouse") setOrigin(originFromPoint(event.clientX, event.clientY));
  };

  const panWithTouch = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (zoomed && touch) setOrigin(originFromPoint(touch.clientX, touch.clientY));
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (["ArrowLeft", "ArrowRight", "+", "=", "-"].includes(event.key)) event.preventDefault();
      if (event.key === "ArrowLeft") {
        setZoomed(false);
        setIndex((value) => (value - 1 + items.length) % items.length);
      }
      if (event.key === "ArrowRight") {
        setZoomed(false);
        setIndex((value) => (value + 1) % items.length);
      }
      if (event.key === "+" || event.key === "=") setZoomed(true);
      if (event.key === "-") setZoomed(false);
    };
    const closeForAnotherSurface = () => {
      handingFocusAway.current = true;
      onOpenChange(false);
    };
    const surfaces = ["ahmv:navigation-open", "ahmv:assistant-open", "ahmv:welcome-open", "ahmv:install-open"];
    window.addEventListener("keydown", onKeyDown);
    surfaces.forEach((surface) => window.addEventListener(surface, closeForAnotherSurface));
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      surfaces.forEach((surface) => window.removeEventListener(surface, closeForAnotherSurface));
    };
  }, [items.length, onOpenChange, open]);

  useEffect(() => {
    if (!open || items.length < 2) return;
    const previous = items[(index - 1 + items.length) % items.length];
    const next = items[(index + 1) % items.length];

    [previous, next].forEach((item) => {
      if (!item) return;
      const preload = new Image();
      preload.src = item.url;
    });
  }, [index, items, open]);

  useEffect(() => {
    if (!open) return;
    thumbnailRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [index, open]);

  const countLabel = useMemo(
    () =>
      lang === "fr"
        ? `${index + 1} sur ${items.length}`
        : `${index + 1} of ${items.length}`,
    [index, items.length, lang],
  );

  if (!open || !current || items.length === 0) return null;

  const goPrevious = () => {
    setZoomed(false);
    setIndex((value) => (value - 1 + items.length) % items.length);
  };

  const goNext = () => {
    setZoomed(false);
    setIndex((value) => (value + 1) % items.length);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (zoomed) return;
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (zoomed || touchStartX.current == null || touchStartY.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx > 0) goPrevious();
    else goNext();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[400] bg-navy-deep/90" />
        <DialogPrimitive.Content
      className="fixed inset-0 z-[410] bg-navy-deep/96 text-white outline-none backdrop-blur-xl"
      data-ahmv-attention-surface="media-viewer"
      aria-modal="true"
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        handingFocusAway.current = false;
        closeButtonRef.current?.focus();
      }}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        if (!handingFocusAway.current && returnFocusRef.current?.isConnected) returnFocusRef.current.focus({ preventScroll: true });
      }}
    >
      <DialogPrimitive.Description className="sr-only">{countLabel} · {lang === "fr" ? "Utilisez les flèches pour changer de photo et les boutons pour agrandir ou fermer." : "Use the arrows to change photos and the buttons to zoom or close."}</DialogPrimitive.Description>
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-navy-deep/82 px-3 py-3 backdrop-blur-xl sm:px-5">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground">
            {current.categoryLabel
              ? lang === "fr"
                ? current.categoryLabel.fr
                : current.categoryLabel.en
              : lang === "fr"
                ? "Médiathèque AHMV"
                : "AHMV media"}
          </p>
          <DialogPrimitive.Title className="mt-1 truncate font-display text-lg font-extrabold uppercase leading-none sm:text-xl">
            {current.label
              ? lang === "fr"
                ? current.label.fr
                : current.label.en
              : lang === "fr"
                ? "Photo AHMV"
                : "AHMV photo"}
          </DialogPrimitive.Title>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 sm:inline">
            {countLabel}
          </span>
          <button
            type="button"
            onClick={() => setZoomed((value) => !value)}
            className="premium-control inline-flex size-10 items-center justify-center border border-white/14 bg-white/[0.04] text-white hover:border-sport"
            aria-label={
              zoomed
                ? lang === "fr"
                  ? "Réduire l’image"
                  : "Zoom out"
                : lang === "fr"
                  ? "Agrandir l’image"
                  : "Zoom in"
            }
          >
            {zoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            ref={closeButtonRef}
            className="premium-control inline-flex size-10 items-center justify-center border border-white/14 bg-white/[0.04] text-white hover:border-sport"
            aria-label={lang === "fr" ? "Fermer" : "Close"}
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-[calc(136px+env(safe-area-inset-bottom))] top-[65px] flex items-center justify-center overflow-auto px-2 py-3 sm:bottom-[calc(128px+env(safe-area-inset-bottom))] sm:px-6 sm:py-5"
        onTouchStart={handleTouchStart}
        onTouchMove={panWithTouch}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={toggleZoomAt}
          onPointerMove={panWithPointer}
          className={cn(
            "relative flex h-full max-h-full w-full max-w-[1500px] items-center justify-center overflow-hidden outline-none",
            zoomed ? "cursor-zoom-out touch-none" : "cursor-zoom-in",
          )}
          aria-label={
            zoomed
              ? lang === "fr"
                ? "Réduire l’image"
                : "Zoom out image"
              : lang === "fr"
                ? "Agrandir l’image"
                : "Zoom image"
          }
        >
          <img
            ref={imageRef}
            key={current.url}
            src={current.url}
            alt={lang === "fr" ? current.alt.fr : current.alt.en}
            decoding="async"
            className={cn(
              "max-h-full max-w-full select-none object-contain shadow-[0_30px_100px_-35px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300",
              zoomed && "scale-[2.2]",
            )}
            style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            draggable={false}
          />
        </button>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrevious}
            className="premium-control absolute left-2 top-1/2 z-30 hidden size-12 -translate-y-1/2 items-center justify-center border border-white/16 bg-navy-deep/74 text-white backdrop-blur hover:border-sport sm:flex"
            aria-label={lang === "fr" ? "Image précédente" : "Previous image"}
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="premium-control absolute right-2 top-1/2 z-30 hidden size-12 -translate-y-1/2 items-center justify-center border border-white/16 bg-navy-deep/74 text-white backdrop-blur hover:border-sport sm:flex"
            aria-label={lang === "fr" ? "Image suivante" : "Next image"}
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy-deep/90 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-white/8">
          <span
            className="block h-full bg-sport transition-[width] duration-300"
            style={{ width: `${((index + 1) / items.length) * 100}%` }}
            aria-hidden
          />
        </div>
        <div className="mb-2 flex items-center justify-between gap-3 px-3 sm:px-5">
          <div className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/52">
            <Images className="size-3.5 text-sport-foreground" />
            <span className="sm:hidden">{countLabel}</span>
            <span className="hidden sm:inline">
              {lang === "fr"
                ? "Glissez horizontalement · touchez l’image pour zoomer"
                : "Swipe horizontally · tap the image to zoom"}
            </span>
          </div>
          {items.length > 1 && (
          <div className="flex gap-1 sm:hidden">
            <button
              type="button"
              onClick={goPrevious}
              className="premium-control inline-flex size-9 items-center justify-center border border-white/14 text-white"
              aria-label={lang === "fr" ? "Précédente" : "Previous"}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="premium-control inline-flex size-9 items-center justify-center border border-white/14 text-white"
              aria-label={lang === "fr" ? "Suivante" : "Next"}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          )}
        </div>

        <div className="scrollbar-none flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-3 sm:px-5">
          {items.map((item, itemIndex) => (
            <button
              key={`${item.url}-${itemIndex}`}
              ref={(node) => {
                thumbnailRefs.current[itemIndex] = node;
              }}
              type="button"
              onClick={() => {
                setIndex(itemIndex);
                setZoomed(false);
              }}
              className={cn(
                "relative h-16 w-24 shrink-0 snap-center overflow-hidden border bg-navy sm:h-20 sm:w-28",
                itemIndex === index
                  ? "border-sport ring-1 ring-sport"
                  : "border-white/10 opacity-55 hover:opacity-90",
              )}
              aria-label={
                lang === "fr"
                  ? `Afficher l’image ${itemIndex + 1}`
                  : `Show image ${itemIndex + 1}`
              }
            >
              <img
                src={item.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
