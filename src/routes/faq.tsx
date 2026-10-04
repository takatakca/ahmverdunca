import { canonicalLink } from "@/lib/seo";
import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { Search, XCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { VoiceSearchButton } from "@/components/voice-search-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ, FAQ_TOPICS } from "@/data/faq";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-CA")
    .trim();
}

export const Route = createFileRoute("/faq")({
  head: () => ({
    links: canonicalLink("/faq"),
    meta: [
      { title: "Questions fréquentes — AHM Verdun" },
      { name: "description", content: "Réponses aux questions des familles : inscriptions, horaires, annulations, équipement, arénas et bénévolat." },
      { property: "og:title", content: "Questions fréquentes — AHM Verdun" },
      { property: "og:description", content: "Les réponses aux questions les plus fréquentes des familles." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t, l, lang } = useI18n();
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";
  const visibleFaq = publicLaunch ? FAQ.filter((item) => item.validated) : FAQ;
  const visibleTopics = FAQ_TOPICS.filter((topicItem) =>
    visibleFaq.some((item) => item.topic === topicItem.id),
  );
  const search = useRouterState({ select: (state) => state.location.search }) as Record<string, unknown>;
  const requestedItem =
    typeof search["item"] === "string" && visibleFaq.some((item) => item.id === search["item"])
      ? search["item"]
      : "";
  const [topic, setTopic] = useState("all");
  const [q, setQ] = useState("");
  const [openItem, setOpenItem] = useState(requestedItem);

  useEffect(() => {
    if (!requestedItem) return;
    setTopic("all");
    setQ("");
    setOpenItem(requestedItem);
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(requestedItem)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [requestedItem]);

  const list = visibleFaq.filter(
    (f) =>
      (topic === "all" || f.topic === topic) &&
      (normalizeSearch(q) === "" || normalizeSearch(`${l(f.question)} ${l(f.answer)}`).includes(normalizeSearch(q))),
  );

  return (
    <>
      <PageHeader
        eyebrow={l({ fr: "Aide aux familles", en: "Family help" })}
        title={t("nav.faq")}
        description={l({
          fr: "Réponses rapides sur les inscriptions, horaires, arénas, hockey féminin, entraîneurs et ressources.",
          en: "Quick answers about registration, schedules, arenas, girls' hockey, coaches and resources.",
        })}
      />
      <div className="container-site py-8 md:py-12">
        <section className="mb-7 grid gap-px overflow-hidden border border-navy/12 bg-navy/12 sm:grid-cols-[1fr_auto]">
          <div className="bg-navy p-6 text-white md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Centre d’aide familles" : "Family help centre"}</p>
            <p className="mt-3 max-w-2xl font-display text-3xl font-extrabold uppercase leading-[0.9] sm:text-4xl">
              {lang === "fr" ? "Cherchez. Trouvez. Repartez avec la bonne réponse." : "Search. Find. Leave with the right answer."}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
              {lang === "fr"
                ? "Recherche texte ou vocale, sujets filtrés et accès vers les pages de référence lorsqu’une réponse demande plus de détails."
                : "Text or voice search, filtered topics and direct access to reference pages when an answer needs more detail."}
            </p>
          </div>
          <div className="flex min-w-48 flex-col justify-center bg-competition p-6 text-white md:p-8">
            <p className="font-display text-6xl font-extrabold tracking-[-0.05em] text-white">{String(visibleFaq.length).padStart(2, "0")}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.17em] text-white/42">
              {lang === "fr" ? "réponses disponibles" : "answers available"}
            </p>
          </div>
        </section>
        <section className="mb-6 grid overflow-hidden border border-navy/12 bg-competition text-white lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative min-h-[220px] overflow-hidden sm:min-h-[280px]">
            <img
              src={OFFICIAL_MEDIA.practiceCoach.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.practiceCoach.alt.fr : OFFICIAL_MEDIA.practiceCoach.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.88))]" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Besoin d’une réponse maintenant?" : "Need an answer now?"}</p>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.88]">
                {lang === "fr" ? "Commencez par une question simple." : "Start with one simple question."}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center p-5 md:p-7">
            <p className="text-sm leading-relaxed text-white/62">
              {lang === "fr"
                ? "Horaire, inscription, aréna, équipement ou bénévolat : la recherche ci-dessous filtre immédiatement les réponses validées."
                : "Schedule, registration, arena, equipment or volunteering: the search below immediately filters validated answers."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link to="/horaires" className="premium-control flex min-h-11 items-center justify-center border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                {lang === "fr" ? "Horaires" : "Schedules"}
              </Link>
              <Link to="/contact" className="premium-control flex min-h-11 items-center justify-center bg-sport px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
                {lang === "fr" ? "Contact" : "Contact"}
              </Link>
            </div>
          </div>
        </section>

        <HouseSponsorSlot placement="faq-help" count={1} compact className="mb-6" />

        <div className="mb-6 border border-white/12 bg-navy-deep p-5 text-white">
          <p className="eyebrow text-sport-foreground">
            {lang === "fr" ? "Réponses rapides" : "Quick answers"}
          </p>
          <p className="mt-2 text-sm text-white/55">
            {lang === "fr"
              ? publicLaunch
                ? "Les réponses affichées ici s'appuient uniquement sur des informations actuellement validées."
                : "Les réponses validées s'appuient sur les ressources actuellement publiées. Les éléments encore à confirmer sont identifiés en préproduction."
              : publicLaunch
                ? "Answers shown here rely only on currently validated information."
                : "Validated answers rely on currently published resources. Items still awaiting confirmation are identified in pre-production."}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <span className="sr-only">{t("common.search")}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/38" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search.placeholder")}
              className="h-12 w-full border border-white/14 bg-navy-deep pl-11 pr-11 text-base text-white placeholder:text-white/34 outline-none transition-colors focus:border-sport"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="premium-control absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center text-white/42 hover:bg-white/[0.06] hover:text-white"
                aria-label={lang === "fr" ? "Effacer la recherche" : "Clear search"}
              >
                <XCircle className="size-4" aria-hidden />
              </button>
            ) : null}
          </label>
          <VoiceSearchButton onTranscript={setQ} />
        </div>

        {q.trim() ? (
          <p className="mt-3 text-sm font-semibold text-muted-foreground" aria-live="polite">
            {lang === "fr"
              ? `${list.length} réponse${list.length === 1 ? "" : "s"} trouvée${list.length === 1 ? "" : "s"}`
              : `${list.length} answer${list.length === 1 ? "" : "s"} found`}
          </p>
        ) : null}

        <div className="scrollbar-none -mx-1 my-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Tous les sujets", en: "All topics" } }, ...visibleTopics].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={topic === c.id}
              onClick={() => setTopic(c.id)}
              className={cn(
                "premium-control shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
                topic === c.id ? "border-sport bg-sport text-sport-foreground" : "border-input hover:bg-secondary",
              )}
            >
              {l(c.label)}
            </button>
          ))}
        </div>

        {list.length === 0 && <p className="text-muted-foreground">{t("common.noResults")}</p>}
        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
          className="w-full"
        >
          {list.map((f) => (
            <AccordionItem key={f.id} id={f.id} value={f.id} className="scroll-mt-28">
              <AccordionTrigger className="text-left font-display text-lg font-bold uppercase">{l(f.question)}</AccordionTrigger>
              <AccordionContent>
                <p className="text-base text-foreground/90">{l(f.answer)}</p>
                {!f.validated && (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    {lang === "fr"
                      ? "Cette procédure doit encore être confirmée par l'association."
                      : "This procedure still needs confirmation from the association."}
                  </p>
                )}
                {f.sourcePath && (
                  <Link to={f.sourcePath} className="mt-3 inline-block text-sm font-semibold text-sport hover:underline">
                    {t("common.seeAll")}
                  </Link>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
