import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Confidentialité — AHM Verdun" },
      { name: "description", content: "Principes de confidentialité appliqués à la maquette du site de l'AHM Verdun : aucune donnée personnelle collectée." },
      { property: "og:title", content: "Confidentialité — AHM Verdun" },
      { property: "og:description", content: "Aucune donnée personnelle n'est collectée par cette maquette." },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  {
    title: "Aucune collecte de données",
    body: "Cette maquette de préproduction ne collecte, ne conserve ni ne transmet aucune donnée personnelle. Les formulaires présents sont des démonstrations visuelles.",
  },
  {
    title: "Données des enfants",
    body: "Aucune information personnelle ou médicale concernant un joueur ou une joueuse n'est publiée sur ce site. Les documents sensibles exigeront un espace sécurisé réservé aux personnes autorisées.",
  },
  {
    title: "Photos et vidéos",
    body: "Les photos officielles ne seront publiées qu'après réception des fichiers par l'association et vérification des autorisations parentales.",
  },
  {
    title: "Inscriptions et paiements",
    body: "Les inscriptions et paiements se font exclusivement sur la plateforme officielle Spordle, soumise à ses propres politiques.",
  },
  {
    title: "Liens externes",
    body: "Le site renvoie vers des organismes externes. L'AHM Verdun n'est pas responsable de leurs pratiques de confidentialité.",
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Phase 1" title="Confidentialité" description="Texte préliminaire préparé par GROUPE TAKATAK. La politique définitive devra être approuvée par l'association." />
      <div className="container-site max-w-3xl space-y-8 py-8 md:py-12">
        <DemoNotice kind="info">Document de travail — à valider juridiquement avant publication.</DemoNotice>
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="heading-card">{s.title}</h2>
            <p className="mt-2 text-base text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}
