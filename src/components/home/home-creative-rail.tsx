import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { runwayCreativesForPlacement } from "@/data/runway-ad-creatives";
import { useI18n } from "@/lib/i18n";

export function HomeCreativeRail() {
  const { lang } = useI18n();
  const creatives = runwayCreativesForPlacement("home", 4);

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-competition py-5 text-white md:py-6">
      <div className="technical-grid absolute inset-0 opacity-20" aria-hidden />
      <div className="arena-light opacity-20" aria-hidden />
      <div className="container-site relative">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Créatives locales · aperçu" : "Local creatives · preview"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold uppercase leading-none sm:text-3xl">
              {lang === "fr" ? "Le réseau publicitaire prend vie." : "The ad network comes alive."}
            </h2>
          </div>
          <Link
            to="/partenaires"
            className="premium-control hidden min-h-10 items-center gap-2 border border-white/18 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white hover:border-sport sm:inline-flex"
          >
            {lang === "fr" ? "Voir les créatives" : "See creatives"} <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="scrollbar-none flex snap-x gap-2 overflow-x-auto pb-1">
          {creatives.map((creative, index) => (
            <figure
              key={creative.id}
              className="premium-depth group relative min-w-[72vw] snap-start overflow-hidden border border-white/12 bg-navy sm:min-w-[320px] lg:min-w-0 lg:flex-1"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={creative.path}
                  alt={lang === "fr" ? `Aperçu publicitaire ${index + 1}` : `Advertising preview ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="premium-depth-media absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,rgba(7,16,43,0.86)_100%)]" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 border border-white/20 bg-navy/72 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                  <Sparkles className="size-3 text-sport-foreground" />
                  {lang === "fr" ? "Aperçu" : "Preview"}
                </span>
                <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/72">
                    16:9 · {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
                    {lang === "fr" ? "Classification en cours" : "Classification in progress"}
                  </span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
