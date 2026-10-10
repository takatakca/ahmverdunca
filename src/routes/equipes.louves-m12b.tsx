import { createFileRoute } from "@tanstack/react-router";
import { PremiumTeamMicrosite } from "@/components/team-premium-microsite";
import { LOUVES_M12B_MICROSITE } from "@/data/team-microsites";
import { useI18n } from "@/lib/i18n";
import { canonicalLink } from "@/lib/seo";

/**
 * Intentionally independent from the legacy 2025 M12 A Louves team ID.
 * Exact TeamLinkt M12B provider mapping is still awaiting the manager.
 */
export const Route = createFileRoute("/equipes/louves-m12b")({
  head: () => ({
    links: canonicalLink("/equipes/louves-m12b"),
    meta: [
      { title: "Louves M12B — Espace équipe | AHM Verdun" },
      {
        name: "description",
        content: "Louves M12B de Verdun : horaires AHMV, galerie hockey féminin, documents et outils de communication dans un espace équipe accueillant et sécurisé.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Louves M12B — AHM Verdun" },
      {
        property: "og:description",
        content: "L’espace des Louves M12B : les ressources utiles de l’équipe au même endroit.",
      },
      { property: "og:image", content: "/images/teams/louves-m12b-crest.webp" },
    ],
  }),
  component: LouvesM12BRoute,
});

function LouvesM12BRoute() {
  const { lang } = useI18n();
  return <PremiumTeamMicrosite site={LOUVES_M12B_MICROSITE} lang={lang} />;
}
