import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { VoiceSearchButton } from "@/components/voice-search-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ, FAQ_TOPICS } from "@/data/faq";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  head: () => ({
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
  const search = useRouterState({ select: (state) => state.location.search }) as Record<string, unknown>;
  const requestedItem =
    typeof search["item"] === "string" && FAQ.some((item) => item.id === search["item"])
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

  const list = FAQ.filter(
    (f) =>
      (topic === "all" || f.topic === topic) &&
      (q.trim() === "" || `${l(f.question)} ${l(f.answer)}`.toLowerCase().includes(q.toLowerCase())),
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
        <div className="mb-6 rounded-xl border border-border bg-ice p-5">
          <p className="eyebrow text-sport">
            {lang === "fr" ? "Réponses rapides" : "Quick answers"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "fr"
              ? "Les réponses validées s'appuient sur les ressources actuellement publiées. Lorsqu'une procédure dépend encore de l'association, elle est clairement indiquée."
              : "Validated answers rely on currently published resources. When a procedure still depends on the association, that is clearly indicated."}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("common.search")}
            className="h-12 w-full rounded-md border border-input bg-background px-4 text-base"
          />
          <VoiceSearchButton onTranscript={setQ} />
        </div>

        <div className="scrollbar-none -mx-1 my-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Tous les sujets", en: "All topics" } }, ...FAQ_TOPICS].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setTopic(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
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
