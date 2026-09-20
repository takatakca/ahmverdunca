import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
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
  const { t, l } = useI18n();
  const [topic, setTopic] = useState("all");
  const [q, setQ] = useState("");
  const list = FAQ.filter(
    (f) =>
      (topic === "all" || f.topic === topic) &&
      (q.trim() === "" || `${l(f.question)} ${l(f.answer)}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageHeader eyebrow={t("common.toValidate")} title={t("nav.faq")} description="Les réponses ci-dessous constituent la base de connaissances du site. Certaines seront précisées par l'association." />
      <div className="container-site py-8 md:py-12">
        <DemoNotice kind="info" className="mb-6">
          Les réponses marquées « à préciser » attendent le texte officiel de l'association.
        </DemoNotice>

        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search.placeholder")}
          aria-label={t("common.search")}
          className="h-12 w-full rounded-md border border-input bg-background px-4 text-base"
        />

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
        <Accordion type="single" collapsible className="w-full">
          {list.map((f) => (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger className="text-left font-display text-lg font-bold uppercase">{l(f.question)}</AccordionTrigger>
              <AccordionContent>
                <p className="text-base text-foreground/90">{l(f.answer)}</p>
                {!f.validated && <p className="mt-2 text-xs italic text-demo-foreground">Réponse à préciser par l'association.</p>}
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
