import { useState } from "react";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const FEATURE_IDS = [39, 16, 26, 37] as const;

export function HomeCreativeRail() {
  const { lang, l } = useI18n();
  const media = FEATURE_IDS
    .map((id) => uploadedAhmvMediaById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-competition py-5 text-white md:py-6">
      <div className="technical-grid absolute inset-0 opacity-20" aria-hidden />
      <div className="arena-light opacity-20" aria-hidden />
      <div className="container-site relative">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "À découvrir · AHM Verdun" : "Discover · AHM Verdun"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold uppercase leading-none sm:text-3xl">
              {lang === "fr" ? "Les informations qui comptent maintenant." : "What matters right now."}
            </h2>
          </div>
          <Link
            to="/nouvelles"
            className="premium-control hidden min-h-10 items-center gap-2 border border-white/18 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white hover:border-sport sm:inline-flex"
          >
            {lang === "fr" ? "Toutes les nouvelles" : "All news"} <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="scrollbar-none flex snap-x gap-2 overflow-x-auto pb-1">
          {media.map((item, index) => {
            const isFlipped = flipped === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isFlipped}
                aria-label={
                  lang === "fr"
                    ? `Voir le détail du média AHMV ${index + 1}`
                    : `View AHMV media detail ${index + 1}`
                }
                onClick={() => setFlipped((current) => current === item.id ? null : item.id)}
                className="ahmv-flip-card group min-w-[72vw] snap-start text-left sm:min-w-[320px] lg:min-w-0 lg:flex-1"
              >
                <span className={cn("ahmv-flip-card__inner block aspect-video", isFlipped && "is-flipped")}>
                  <span className="ahmv-flip-face premium-depth relative block size-full overflow-hidden border border-white/12 bg-navy">
                    <img
                      src={item.url}
                      alt={lang === "fr" ? item.alt.fr : item.alt.en}
                      loading="lazy"
                      decoding="async"
                      className="premium-depth-media absolute inset-0 size-full object-cover"
                    />
                    <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(7,16,43,0.9)_100%)]" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 border border-white/20 bg-navy/72 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                      <Sparkles className="size-3 text-sport-foreground" />
                      {l(item.categoryLabel)}
                    </span>
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-3 py-3">
                      <span>
                        <span className="block font-display text-xl font-extrabold uppercase leading-[0.9] text-white">
                          {l(item.label)}
                        </span>
                        <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.13em] text-white/52">
                          {lang === "fr" ? "Média AHMV authentique" : "Authentic AHMV media"}
                        </span>
                      </span>
                      <RotateCcw className="size-3.5 shrink-0 text-sport-foreground" aria-hidden />
                    </span>
                  </span>

                  <span className="ahmv-flip-face ahmv-flip-back block size-full border border-sport/40 bg-[linear-gradient(135deg,var(--color-navy)_0%,var(--color-competition)_100%)] p-4 text-white">
                    <span className="flex size-full flex-col justify-between">
                      <span>
                        <span className="eyebrow text-sport-foreground">{l(item.categoryLabel)}</span>
                        <span className="mt-2 block font-display text-2xl font-extrabold uppercase leading-[0.9]">
                          {l(item.label)}
                        </span>
                        <span className="mt-3 block text-xs leading-relaxed text-white/62">
                          {lang === "fr"
                            ? item.alt.fr
                            : item.alt.en}
                        </span>
                      </span>
                      <span className="flex items-center justify-between border-t border-white/12 pt-3 text-[9px] font-bold uppercase tracking-[0.12em]">
                        <span className="text-white/52">AHMV · Verdun</span>
                        <span className="inline-flex items-center gap-1 text-sport-foreground">
                          {lang === "fr" ? "Retour" : "Back"} <RotateCcw className="size-3" />
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
