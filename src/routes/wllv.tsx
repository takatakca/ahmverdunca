import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/wllv")({
  head: () => ({
    meta: [
      { title: "Hockey AA/BB — WLLV Les Chacals | AHM Verdun" },
      { name: "description", content: "Le hockey AA/BB des joueurs de Verdun se joue avec le WLLV (Les Chacals). Information et lien vers le site officiel." },
      { property: "og:title", content: "Hockey AA/BB — WLLV Les Chacals" },
      { property: "og:description", content: "Information sur le hockey AA/BB régional pour les joueurs de Verdun." },
    ],
  }),
  component: WllvPage,
});

function WllvPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow="AA / BB"
        title="WLLV — Les Chacals"
        description="Le volet AA/BB des joueurs et joueuses de la région est géré par le WLLV. L'AHM Verdun oriente les familles vers le site officiel du WLLV."
        actions={
          <Button asChild variant="sport">
            <a href={EXTERNAL_LINKS.wllv} target="_blank" rel="noopener noreferrer">{t("common.officialSite")} <ExternalLink className="size-4" /></a>
          </Button>
        }
      />
      <div className="container-site space-y-8 py-8 md:py-12">
        <DemoNotice kind="info">
          Structure, calendriers et modalités de sélection AA/BB doivent être confirmés par le WLLV et l'association. Aucune information n'a été inventée ici.
        </DemoNotice>
        <section>
          <SectionHeading title="Ce que vous trouverez sur le site du WLLV" />
          <ul className="max-w-2xl list-disc space-y-2 pl-5 text-base text-muted-foreground">
            <li>Camps de sélection et calendrier des essais</li>
            <li>Structure des équipes AA et BB</li>
            <li>Coordonnées des responsables de la ligue</li>
          </ul>
        </section>
      </div>
    </>
  );
}
