import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { CURRENT_TEAMS } from "@/data/teams";
import { teamVisualForCategory } from "@/data/team-visuals";

type Language = "fr" | "en";

/**
 * The first thing on Horaires: find an official AHMV category by sight.
 * Images from the association library are illustrative, not exact player rosters.
 * Category URLs reuse existing /horaires?team=... filtering and saved preference.
 */
export function ScheduleTeamCarousel({
  lang,
  selectedTeamSlug,
}: {
  lang: Language;
  selectedTeamSlug?: string | undefined;
}) {
  const scroller = useRef<HTMLUListElement>(null);
  const isFrench = lang === "fr";
  const scroll = (direction: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    const firstCard = el.querySelector("li");
    const distance = (firstCard?.getBoundingClientRect().width ?? 260) + 16;
    el.scrollBy({ left: direction * distance * 1.7, behavior: "smooth" });
  };

  return (
    <section data-ahmv-schedule-team-picker aria-labelledby="schedule-choose-team" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8cece3]">
            {isFrench ? "Tout commence ici" : "Start here"}
          </p>
          <h2 id="schedule-choose-team" className="mt-1 font-display text-3xl font-black uppercase leading-[1.02] text-white sm:text-4xl">
            {isFrench ? "Choisissez votre équipe" : "Choose your team"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/80 sm:text-base">
            {isFrench
              ? "Glissez les photos, choisissez une catégorie, puis consultez son horaire."
              : "Swipe the photos, select a category, then see its schedule."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2" aria-label={isFrench ? "Faire défiler les catégories" : "Scroll categories"}>
          <button
            type="button"
            data-ahmv-carousel-prev
            onClick={() => scroll(-1)}
            aria-label={isFrench ? "Catégories précédentes" : "Previous categories"}
            className="grid size-12 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7df4e8]"
          >
            <ChevronLeft aria-hidden="true" className="size-6" />
          </button>
          <button
            type="button"
            data-ahmv-carousel-next
            onClick={() => scroll(1)}
            aria-label={isFrench ? "Catégories suivantes" : "Next categories"}
            className="grid size-12 place-items-center rounded-full border border-[#8bebde]/65 bg-[#187b95] text-white transition-colors hover:bg-[#226d90] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7df4e8]"
          >
            <ChevronRight aria-hidden="true" className="size-6" />
          </button>
        </div>
      </div>

      <ul
        ref={scroller}
        data-ahmv-team-carousel-track
        aria-label={isFrench ? "Catégories de hockey AHMV" : "AHMV hockey categories"}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-3 sm:mx-0 sm:px-0"
      >
        {CURRENT_TEAMS.map((team, index) => {
          const visual = teamVisualForCategory(team.slug);
          const active = team.slug === selectedTeamSlug;
          return (
            <li key={team.slug} className="w-[min(70vw,252px)] shrink-0 snap-start sm:w-[252px]">
              <a
                href={`/horaires?team=${encodeURIComponent(team.slug)}#horaire-publie`}
                aria-current={active ? "page" : undefined}
                data-ahmv-team-category={team.slug}
                className={`group relative flex h-[180px] w-full flex-col justify-end overflow-hidden rounded-[1.35rem] border-2 text-left shadow-[0_18px_36px_-22px_rgba(0,0,0,0.65)] outline-none transition-transform duration-200 hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-[#83eee3] motion-reduce:transition-none sm:h-[198px] ${active ? "border-[#86f8e9]" : "border-white/20 hover:border-white/70"}`}
              >
                {visual ? (
                  <img
                    src={visual.url}
                    alt=""
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.06] motion-reduce:transition-none"
                  />
                ) : (
                  <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(145deg,#2856a8,#181347)]" />
                )}
                <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,.05)_10%,rgba(7,16,43,.25)_48%,rgba(7,16,43,.96)_100%)]" />
                {active && (
                  <span className="absolute right-3 top-3 rounded-full bg-[#98f9ec] px-3 py-1.5 text-xs font-extrabold text-[#0b3543]">
                    {isFrench ? "Choisie" : "Selected"}
                  </span>
                )}
                <span className="relative flex items-end justify-between gap-2 p-4">
                  <span className="min-w-0">
                    <span className="block font-display text-[1.95rem] font-black uppercase leading-none text-white">
                      {team.name[lang]}
                    </span>
                    <span className="mt-1.5 block text-[13px] font-semibold text-white/85">
                      {team.feminine ? (isFrench ? "Hockey féminin" : "Girls hockey") : team.ages[lang]}
                    </span>
                  </span>
                  <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-[#97f7e7] text-[#0c3b50]">
                    <ArrowRight className="size-5" />
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-1 text-xs leading-5 text-white/60">
        {isFrench
          ? "Photos d’ambiance de l’association : elles ne représentent pas nécessairement l’effectif précis d’une catégorie."
          : "Association photos are illustrative and may not show the specific category roster."}
      </p>
    </section>
  );
}
