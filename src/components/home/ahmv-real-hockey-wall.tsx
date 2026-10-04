import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ChevronRight, Images, Users } from "lucide-react";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";
import { useI18n } from "@/lib/i18n";
import { MediaLuxuryViewer } from "@/components/media/media-luxury-viewer";

const MEDIA = [
  uploadedAhmvMediaById(35),
  uploadedAhmvMediaById(50),
  uploadedAhmvMediaById(52),
  uploadedAhmvMediaById(53),
].filter((media): media is NonNullable<typeof media> => Boolean(media));

export function AhmvRealHockeyWall() {
  const { lang, l } = useI18n();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const actions = [
    {
      to: "/equipes" as const,
      number: "01",
      icon: Users,
      fr: "Mini-sites d'équipes",
      en: "Team mini-sites",
      frBody: "Chaque catégorie mène vers son univers, ses équipes et ses accès officiels.",
      enBody: "Each category leads to its own hub, teams and official access points.",
    },
    {
      to: "/nouvelles" as const,
      number: "02",
      icon: BookOpen,
      fr: "Nouvelles & blogue",
      en: "News & stories",
      frBody: "Les annonces, histoires et informations importantes de l'association.",
      enBody: "Association announcements, stories and important information.",
    },
    {
      to: "/galerie" as const,
      number: "03",
      icon: Images,
      fr: "Photos réelles",
      en: "Real photography",
      frBody: "Tournois, équipes, trophées, bénévoles et souvenirs AHMV.",
      enBody: "Tournaments, teams, trophies, volunteers and AHMV memories.",
    },
    {
      to: "/contact" as const,
      number: "04",
      icon: Users,
      fr: "Devenir bénévole",
      en: "Volunteer",
      frBody: "Donner un coup de main au hockey mineur et à la communauté de Verdun.",
      enBody: "Help minor hockey and the Verdun community.",
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-navy/10 bg-competition text-white">
      <div className="absolute inset-0 technical-grid opacity-20" aria-hidden />
      <div className="absolute -right-[8vw] top-10 select-none font-display text-[clamp(8rem,24vw,24rem)] font-extrabold uppercase leading-[0.7] tracking-[-0.07em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)]" aria-hidden>
        AHMV
      </div>

      <div className="relative grid lg:grid-cols-[0.86fr_1.14fr]">
        <div className="flex min-h-[470px] flex-col justify-center px-5 py-10 sm:px-8 md:px-10 lg:min-h-[650px] lg:px-12 xl:pl-[max(3rem,calc((100vw-80rem)/2))]">
          <div className="flex flex-wrap gap-2">
            {[
              lang === "fr" ? "Mini-sites" : "Mini-sites",
              lang === "fr" ? "Blogue" : "News",
              lang === "fr" ? "Galerie" : "Gallery",
              lang === "fr" ? "Bénévoles" : "Volunteers",
            ].map((label) => (
              <span key={label} className="border border-white/14 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/58">
                {label}
              </span>
            ))}
          </div>

          <p className="eyebrow mt-7 text-sport-foreground">
            {lang === "fr" ? "AHM Verdun · Le vrai hockey de chez nous" : "AHM Verdun · Real local hockey"}
          </p>
          <h2 className="mt-3 max-w-[10ch] font-display text-[clamp(3.7rem,7.4vw,7.8rem)] font-extrabold uppercase leading-[0.79] tracking-[-0.05em]">
            {lang === "fr" ? "Verdun. En vrai." : "Verdun. For real."}
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/68 md:text-base">
            {lang === "fr"
              ? "Le site met maintenant les vraies équipes, les jeunes, les entraîneurs, les bénévoles et les moments AHMV au premier plan. Les images proviennent de la médiathèque AHMV et des archives validées de l’association."
              : "The site now puts real teams, players, coaches, volunteers and AHMV moments first. Images come from the AHMV media library and the association’s validated archives."}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              to="/galerie"
              className="premium-control inline-flex min-h-12 items-center gap-2 bg-sport px-5 font-display text-xs font-extrabold uppercase tracking-[0.12em] text-sport-foreground"
            >
              <Images className="size-4" />
              {lang === "fr" ? "Voir les photos" : "See the photos"}
            </Link>
            <Link
              to="/equipes"
              className="premium-control inline-flex min-h-12 items-center gap-2 border border-white/18 px-5 font-display text-xs font-extrabold uppercase tracking-[0.12em] text-white hover:border-sport"
            >
              {lang === "fr" ? "Trouver mon équipe" : "Find my team"}
              <ArrowRight className="size-4 text-sport-foreground" />
            </Link>
          </div>
        </div>

        <div className="relative min-w-0 bg-white/10">
          <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 border border-white/15 bg-navy-deep/72 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white/72 backdrop-blur sm:hidden">
            {lang === "fr" ? "Glissez" : "Swipe"} <ChevronRight className="size-3 text-sport-foreground" aria-hidden />
          </div>

          <div className="scrollbar-none flex min-h-[370px] snap-x snap-mandatory gap-px overflow-x-auto overscroll-x-contain scroll-px-3 sm:grid sm:min-h-[600px] sm:grid-cols-2 sm:grid-rows-2 sm:overflow-visible lg:min-h-[650px]">
            {MEDIA.map((media, index) => (
              <button
                key={media.url}
                type="button"
                onClick={() => {
                  setViewerIndex(index);
                  setViewerOpen(true);
                }}
                className={`group relative min-w-[84vw] snap-start overflow-hidden bg-navy text-left sm:min-w-0 ${index === 0 ? "sm:row-span-2" : ""}`}
                aria-label={
                  lang === "fr"
                    ? `Agrandir ${media.label.fr}`
                    : `Enlarge ${media.label.en}`
                }
              >
                <img
                  src={media.url}
                  alt={lang === "fr" ? media.alt.fr : media.alt.en}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(7,16,43,0.80)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/62">
                    {l(media.categoryLabel)} · {lang === "fr" ? "Photo réelle AHMV" : "Real AHMV photo"}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
                    {l(media.label)} <Images className="size-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-site">
          <div className="scrollbar-none flex snap-x snap-mandatory gap-px overflow-x-auto overscroll-x-contain bg-white/10 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {actions.map(({ to, number, icon: Icon, fr, en, frBody, enBody }) => (
            <Link
              key={number}
              to={to}
              className="interactive-surface group flex min-h-[138px] min-w-[76vw] snap-start flex-col bg-competition p-5 hover:bg-white/[0.045] sm:min-w-0"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-extrabold uppercase tracking-[0.16em] text-sport-foreground">{number}</span>
                <Icon className="size-5 text-white/35 transition-colors group-hover:text-sport-foreground" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-extrabold uppercase leading-[0.9] text-white">
                {lang === "fr" ? fr : en}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-white/48">{lang === "fr" ? frBody : enBody}</p>
              <ArrowRight className="mt-auto size-4 translate-y-2 text-sport-foreground transition-transform group-hover:translate-x-1 group-hover:translate-y-2" />
            </Link>
          ))}
          </div>
        </div>
      </div>
      <MediaLuxuryViewer
        items={MEDIA}
        open={viewerOpen}
        initialIndex={viewerIndex}
        lang={lang}
        onOpenChange={setViewerOpen}
      />
    </section>
  );
}
