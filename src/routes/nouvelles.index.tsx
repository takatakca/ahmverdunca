import { createFileRoute } from "@tanstack/react-router";

import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { NewsCentre } from "@/components/news/news-centre";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/nouvelles/")({
  head: () => ({
    links: canonicalLink("/nouvelles"),
    meta: [
      { title: "Nouvelles et communiqués — AHM Verdun" },
      {
        name: "description",
        content:
          "Toutes les nouvelles AHM Verdun au même endroit : communiqués, équipes, Facebook, communauté et futures sources sociales.",
      },
      {
        property: "og:title",
        content: "Centre Nouvelles AHM Verdun",
      },
      {
        property: "og:description",
        content:
          "Un fil unique pour les nouvelles officielles, les équipes et les publications sociales AHM Verdun.",
      },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { lang } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={
          lang === "fr"
            ? "Centre Nouvelles · AHM Verdun"
            : "News Centre · AHM Verdun"
        }
        title={lang === "fr" ? "Nouvelles" : "News"}
        description={
          lang === "fr"
            ? "Un seul fil pour les communiqués officiels, les nouvelles d’équipes et les publications sociales. Filtrez par équipe, source, période et statut."
            : "One feed for official releases, team news and social posts. Filter by team, source, period and status."
        }
      />

      <div className="container-site pt-8 md:pt-11">
        <HouseSponsorSlot placement="newsroom" compact />
      </div>

      <NewsCentre />
    </>
  );
}
