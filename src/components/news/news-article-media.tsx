import { useState } from "react";
import { Images, ZoomIn } from "lucide-react";
import { FittedImage } from "@/components/media/fitted-image";
import { MediaLuxuryViewer, type MediaViewerItem } from "@/components/media/media-luxury-viewer";

export function NewsArticleMedia({
  items,
  ownImage,
  category,
  lang,
}: {
  items: readonly MediaViewerItem[];
  ownImage: boolean;
  category: string;
  lang: "fr" | "en";
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const primary = items[0];
  if (!primary) return null;
  const openMedia = (selectedIndex: number, trigger: HTMLButtonElement) => {
    trigger.focus({ preventScroll: true });
    setIndex(selectedIndex);
    setOpen(true);
  };
  return (
    <>
      <button
        type="button"
        onClick={(event) => openMedia(0, event.currentTarget)}
        className="group relative block aspect-[16/8] w-full overflow-hidden bg-navy text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sport"
        aria-haspopup="dialog"
        aria-label={lang === "fr" ? `Agrandir ${primary.alt.fr}` : `Enlarge ${primary.alt.en}`}
      >
        {ownImage ? (
          <FittedImage src={primary.url} alt={primary.alt[lang]} loading="eager" />
        ) : (
          <img src={primary.url} alt={primary.alt[lang]} loading="eager" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
        )}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.05),rgba(7,16,43,0.64))]" />
        <span className="absolute right-3 top-3 inline-flex min-h-9 items-center gap-2 border border-white/20 bg-navy-deep/80 px-3 text-[9px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur">
          <ZoomIn className="size-4 text-sport-foreground" aria-hidden />
          {lang === "fr" ? "Agrandir" : "Zoom"}{items.length > 1 ? ` · ${items.length}` : ""}
        </span>
        <span className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5 md:p-7">
          <span className="block text-[8px] font-bold uppercase tracking-[0.15em] text-white/75 sm:text-[9px]">{lang === "fr" ? "Média AHMV associé à la nouvelle" : "AHMV media related to this update"}</span>
          <span className="mt-1 block font-display text-xl font-extrabold uppercase leading-none sm:text-2xl">{category}</span>
        </span>
      </button>
      {items.length > 1 && (
        <section className="border-t border-white/10 bg-navy-deep p-3 sm:p-4" aria-label={lang === "fr" ? "Photos de cette publication" : "Photos from this update"}>
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/75"><Images className="size-4 text-sport-foreground" aria-hidden />{items.length} {lang === "fr" ? "photos · touchez pour agrandir" : "photos · tap to enlarge"}</p>
          <div className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {items.map((item, itemIndex) => (
              <button key={item.url} type="button" onClick={(event) => openMedia(itemIndex, event.currentTarget)} className="relative aspect-[4/3] w-28 shrink-0 snap-start overflow-hidden border border-white/20 outline-none hover:border-sport focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sport sm:w-36" aria-haspopup="dialog" aria-label={lang === "fr" ? `Agrandir la photo ${itemIndex + 1} sur ${items.length}` : `Enlarge photo ${itemIndex + 1} of ${items.length}`}>
                <FittedImage src={item.url} alt={item.alt[lang]} />
                <span className="absolute bottom-1 right-1 border border-white/20 bg-navy-deep/80 px-1.5 py-0.5 text-[9px] font-bold text-white">{itemIndex + 1}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      <MediaLuxuryViewer items={items} open={open} initialIndex={index} lang={lang} onOpenChange={setOpen} />
    </>
  );
}
