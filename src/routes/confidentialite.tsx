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
            body: "Les outils optionnels de mesure d’audience et de publicité restent désactivés jusqu’à leur configuration et votre accord. Vous pouvez choisir séparément ces catégories, tout refuser ou retirer votre choix depuis les préférences du pied de page. Le site respecte les signaux DNT et GPC du navigateur. L’abonnement à une infolettre relève d’un consentement distinct et de son mécanisme de désabonnement.",
          },
          {
            title: "Préférences et événements",
            body: "Le choix de confidentialité est conservé pendant 180 jours. Les événements explicites du site utilisent des pages et actions publiques prédéfinies; ils excluent les noms, coordonnées, valeurs des formulaires et équipes choisies. Après accord, les plateformes configurées peuvent recevoir votre adresse IP et utiliser leurs propres cookies. Le retrait arrête les événements et recharge la page lorsqu’un outil tiers était déjà chargé.",
          },
          {
            title: "Publicité et soutien au développement",
            body: "Des espaces promotionnels locaux peuvent être affichés dans le portail lorsqu’un inventaire autorisé est disponible. Ils sont présentés séparément du contenu officiel. Toute technologie publicitaire tierce nécessitant un consentement doit respecter les exigences applicables avant son activation.",
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
            body: "Optional analytics and advertising tools remain off until they are configured and you agree. You can choose these categories separately, decline all or withdraw through the footer preferences. The site respects browser DNT and GPC signals. Newsletter subscriptions require separate consent and their own unsubscribe mechanism.",
          },
          {
            title: "Preferences and events",
            body: "Your privacy choice is retained for 180 days. Explicit website events use predefined public pages and actions; names, contact details, form values and selected teams are excluded. After consent, configured platforms may receive your IP address and use their own cookies. Withdrawal stops events and reloads the page if a third-party tool had already loaded.",
          },
          {
            title: "Advertising and development support",
            body: "Local promotional placements may appear in the portal when authorized inventory is available. They are presented separately from official content. Any third-party advertising technology that requires consent must meet applicable consent requirements before activation.",
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

      <div className="container-site max-w-4xl py-8 text-white md:py-12">
        <div className="mb-8 border border-white/12 bg-competition p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-sport-foreground" aria-hidden />
            <p className="text-sm leading-relaxed text-white/58">
              {lang === "fr"
                ? "Cette page décrit l'approche de conception actuelle et ne remplace pas une politique de confidentialité officiellement adoptée."
                : "This page describes the current design approach and does not replace an officially adopted privacy policy."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="interactive-surface border border-white/12 bg-navy-deep p-6 text-white">
              <h2 className="heading-card text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
