import { useState, type ReactNode } from "react";
import { ZoomIn } from "lucide-react";
import {
  MediaLuxuryViewer,
  type MediaViewerItem,
} from "@/components/media/media-luxury-viewer";
import { cn } from "@/lib/utils";

type MediaZoomTriggerProps = {
  items: readonly MediaViewerItem[];
  initialIndex?: number;
  lang: "fr" | "en";
  children: ReactNode;
  className?: string;
  hint?: boolean;
  label?: string;
};

export function MediaZoomTrigger({
  items,
  initialIndex = 0,
  lang,
  children,
  className,
  hint = true,
  label,
}: MediaZoomTriggerProps) {
  const [open, setOpen] = useState(false);
  const item = items[initialIndex] ?? items[0];

  if (!item) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-sport focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep",
          className,
        )}
        aria-label={
          label ??
          (lang === "fr"
            ? `Agrandir ${item.label?.fr ?? item.alt.fr}`
            : `Enlarge ${item.label?.en ?? item.alt.en}`)
        }
      >
        {children}
        {hint && (
          <span className="pointer-events-none absolute right-3 top-3 z-20 inline-flex min-h-9 items-center gap-2 border border-white/18 bg-navy-deep/72 px-2.5 text-[8px] font-bold uppercase tracking-[0.13em] text-white opacity-90 backdrop-blur transition-[opacity,transform] duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100">
            <ZoomIn className="size-3.5 text-sport-foreground" />
            {lang === "fr" ? "Agrandir" : "Zoom"}
          </span>
        )}
      </button>

      <MediaLuxuryViewer
        items={items}
        open={open}
        initialIndex={initialIndex}
        lang={lang}
        onOpenChange={setOpen}
      />
    </>
  );
}
