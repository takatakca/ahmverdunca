import { canonicalLink } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    links: canonicalLink("/confidentialite"),
    meta: [
      { title: "Confidentialité — AHM Verdun" },
      {
        name: "description",
        content:
          "Principes de protection des renseignements personnels pour la nouvelle expérience numérique AHM Verdun.",
      },
      { property: "og:title", content: "Confidentialité — AHM Verdun" },
      {
        property: "og:description",
        content: "Protection des renseignements, données des jeunes, médias et services externes.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();

  const sections =
    lang === "fr"
      ? [
          {
            title: "Données des jeunes",
            body: "Le site public ne doit pas publier de renseignements personnels ou médicaux concernant un joueur ou une joueuse. Les données sensibles doivent rester dans les systèmes autorisés prévus à cette fin.",
          },
          {
            title: "Photos et vidéos",
            body: "Les médias mettant en scène des mineurs doivent être publiés seulement lorsque les fichiers et les autorisations applicables ont été validés par l'association.",
          },
          {
            title: "Inscriptions et paiements",
            body: "Les inscriptions, paiements et opérations hockey sont dirigés vers les plateformes officielles concernées, notamment Spordle. Le site AHM Verdun n'a pas vocation à recréer ces opérations.",
          },
          {
            title: "Marketing et infolettres",
            body: "Les futurs outils de marketing, d'information générale et d'infolettre gérés avec GROUPE TAKATAK devront utiliser des consentements explicites et des mécanismes de désabonnement appropriés avant leur activation.",
          },
          {
            title: "Publicité et soutien au développement",
            body: "Les espaces publicitaires et les contributions volontaires au développement numérique restent désactivés tant qu’ils ne sont pas configurés et approuvés. Lorsqu’ils sont activés, le bénéficiaire doit être affiché clairement et les technologies publicitaires doivent respecter les exigences de consentement applicables.",
          },
          {
            title: "Liens externes",
            body: "Les liens vers Spordle, WLLV, Hockey Québec, Hockey Canada et d'autres organismes ouvrent leurs propres services et politiques. Les familles doivent consulter ces politiques lorsqu'elles utilisent ces plateformes.",
          },
        ]
      : [
          {
            title: "Youth data",
            body: "The public site must not publish personal or medical information about a player. Sensitive data must remain in authorized systems intended for that purpose.",
          },
          {
            title: "Photos and videos",
            body: "Media featuring minors should only be published after the files and applicable permissions have been validated by the association.",
          },
          {
            title: "Registration and payments",
            body: "Registration, payments and hockey operations are directed to the relevant official platforms, including Spordle. The AHM Verdun site is not intended to recreate those operations.",
          },
          {
            title: "Marketing and newsletters",
            body: "Future marketing, general-information and newsletter tools managed with GROUPE TAKATAK must use explicit consent and appropriate unsubscribe mechanisms before activation.",
          },
          {
            title: "Advertising and development support",
            body: "Advertising placements and voluntary digital-development contributions remain disabled until configured and approved. When enabled, the beneficiary must be clearly disclosed and advertising technologies must follow applicable consent requirements.",
          },
          {
            title: "External links",
            body: "Links to Spordle, WLLV, Hockey Québec, Hockey Canada and other organizations open their own services and policies. Families should review those policies when using those platforms.",
          },
        ];

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Protection des renseignements" : "Privacy protection"}
        title={lang === "fr" ? "Confidentialité" : "Privacy"}
        description={
          lang === "fr"
            ? "Principes de protection intégrés à la nouvelle expérience AHM Verdun. La politique juridique définitive devra être approuvée par l'association avant le lancement."
            : "Privacy principles built into the new AHM Verdun experience. The final legal policy must be approved by the association before launch."
        }
      />

      <div className="container-site max-w-4xl py-8 md:py-12">
        <div className="mb-8 rounded-xl border border-border bg-ice p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-sport" aria-hidden />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Cette page décrit l'approche de conception actuelle et ne remplace pas une politique de confidentialité officiellement adoptée."
                : "This page describes the current design approach and does not replace an officially adopted privacy policy."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="card-elevated p-6">
              <h2 className="heading-card">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
