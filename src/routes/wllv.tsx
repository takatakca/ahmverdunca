import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, ShieldCheck } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/wllv")({
  head: () => ({
    meta: [
      { title: "Hockey AA/BB — WLLV Les Chacals | AHM Verdun" },
      {
        name: "description",
        content:
          "Passerelle AHM Verdun vers le WLLV et les informations officielles du hockey AA/BB.",
      },
      { property: "og:title", content: "Hockey AA/BB — WLLV Les Chacals" },
      {
        property: "og:description",
        content: "Accédez au WLLV et aux informations officielles du hockey double lettre.",
      },
    ],
  }),
  component: WllvPage,
});

function WllvPage() {
  const { t, lang } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow="AA / BB"
        title="WLLV — Les Chacals"
        description={
          lang === "fr"
            ? "Le hockey double lettre demeure géré par le WLLV. AHM Verdun vous donne un accès simple aux bonnes ressources sans recréer cette opération."
            : "Double-letter hockey remains managed by WLLV. AHM Verdun gives families a simple path to the right resources without recreating that operation."
        }
        actions={
          <Button asChild variant="sport">
            <a href={EXTERNAL_LINKS.wllv} target="_blank" rel="noopener noreferrer">
              {t("common.officialSite")} <ExternalLink className="size-4" />
            </a>
          </Button>
        }
      />

      <div className="container-site space-y-10 py-8 md:py-12">
        <section className="grid gap-4 md:grid-cols-2">
          <a
            href={EXTERNAL_LINKS.wllv}
            target="_blank"
            rel="noopener noreferrer"
            className="card-elevated group p-6"
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="size-6 text-sport" aria-hidden />
              <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="heading-card mt-6 group-hover:text-sport">
              {lang === "fr" ? "Site officiel WLLV" : "Official WLLV site"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Structure, camps, équipes et informations administratives du double lettre."
                : "Structure, camps, teams and administrative information for double-letter hockey."}
            </p>
          </a>

          <a
            href={EXTERNAL_LINKS.officialDoubleLetterSchedule}
            target="_blank"
            rel="noopener noreferrer"
            className="card-elevated group p-6"
          >
            <div className="flex items-center justify-between">
              <CalendarDays className="size-6 text-sport" aria-hidden />
              <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="heading-card mt-6 group-hover:text-sport">
              {lang === "fr" ? "Horaires & classements AA/BB" : "AA/BB schedules & standings"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Accès direct aux données sportives officielles."
                : "Direct access to official sport data."}
            </p>
          </a>
        </section>

        <section>
          <SectionHeading
            title={lang === "fr" ? "Ce que fait AHM Verdun ici" : "What AHM Verdun does here"}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                fr: "Orienter",
                en: "Guide",
                frText: "Diriger les familles vers la bonne ressource officielle.",
                enText: "Send families to the correct official resource.",
              },
              {
                fr: "Simplifier",
                en: "Simplify",
                frText: "Éviter de chercher dans plusieurs menus ou vieux liens.",
                enText: "Avoid hunting through multiple menus or old links.",
              },
              {
                fr: "Respecter la source",
                en: "Respect the source",
                frText: "Ne pas dupliquer ni modifier les opérations WLLV.",
                enText: "Do not duplicate or modify WLLV operations.",
              },
            ].map((item) => (
              <div key={item.fr} className="rounded-xl border border-border bg-ice p-5">
                <h3 className="heading-card">{lang === "fr" ? item.fr : item.en}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lang === "fr" ? item.frText : item.enText}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
