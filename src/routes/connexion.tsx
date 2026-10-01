import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Mail } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Services hockey — AHM Verdun" },
      {
        name: "description",
        content:
          "Accédez aux services hockey officiels de l'AHM Verdun. Les communications numériques restent distinctes des opérations hockey.",
      },
      { property: "og:title", content: "Services hockey — AHM Verdun" },
      {
        property: "og:description",
        content: "Accès simple vers la plateforme officielle utilisée pour l'inscription et les services hockey.",
      },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const { lang } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Accès officiel" : "Official access"}
        title={lang === "fr" ? "Services hockey" : "Hockey services"}
        description={
          lang === "fr"
            ? "AHM Verdun conserve ses outils hockey déjà établis. Le site vous dirige simplement vers le bon service."
            : "AHM Verdun keeps its established hockey tools. This site simply sends you to the right service."
        }
        actions={
          <Button asChild variant="sport" size="lg">
            <a href={EXTERNAL_LINKS.spordleLogin} target="_blank" rel="noopener noreferrer">
              {lang === "fr" ? "Ouvrir Spordle" : "Open Spordle"} <ExternalLink className="size-4" />
            </a>
          </Button>
        }
      />

      <div className="container-site max-w-5xl space-y-10 py-8 md:py-12">
        <div className="rounded-xl border border-border bg-ice p-5">
          <p className="eyebrow text-sport">
            {lang === "fr" ? "Le bon service, tout de suite" : "The right service, right away"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "fr"
              ? "Pour les inscriptions et services membres hockey, utilisez Spordle. Pour l'information générale et les communications AHMV, restez sur ce site."
              : "For hockey registration and member services, use Spordle. For general AHMV information and communications, stay on this site."}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="competition-panel rounded-xl p-6 text-navy-foreground md:p-8">
            <p className="eyebrow text-sport-foreground">Spordle</p>
            <h2 className="heading-section mt-2">
              {lang === "fr" ? "Inscription et accès hockey" : "Registration and hockey access"}
            </h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              {lang === "fr"
                ? "Pour les services membres déjà gérés dans Spordle, continuez sur la plateforme officielle. Pour une nouvelle inscription AHMV, utilisez la page Inscriptions du site."
                : "For member services already managed in Spordle, continue to the official platform. For a new AHMV registration, use this site's Registration page."}
            </p>
            <Button asChild variant="sport" size="lg" className="mt-6">
              <a href={EXTERNAL_LINKS.spordleLogin} target="_blank" rel="noopener noreferrer">
                {lang === "fr" ? "Continuer vers Spordle" : "Continue to Spordle"} <ExternalLink className="size-4" />
              </a>
            </Button>
          </section>

          <section className="card-elevated p-6 md:p-8">
            <Mail className="size-7 text-sport" aria-hidden />
            <p className="eyebrow mt-6 text-sport">{lang === "fr" ? "Communications" : "Communications"}</p>
            <h2 className="heading-section mt-2">
              {lang === "fr" ? "Communications AHMV" : "AHMV communications"}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Les infolettres, nouvelles générales, campagnes et préférences de communication seront gérées séparément des opérations hockey."
                : "Newsletters, general updates, campaigns and communication preferences will be managed separately from hockey operations."}
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/contact">
                {lang === "fr" ? "Contacter l'association" : "Contact the association"} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </section>
        </div>

        <section>
          <SectionHeading
            title={lang === "fr" ? "Vous voulez inscrire un enfant?" : "Want to register a child?"}
            description={
              lang === "fr"
                ? "Consultez d'abord l'information AHMV, puis poursuivez sur le service officiel."
                : "Review the AHMV information first, then continue to the official service."
            }
          />
          <Button asChild variant="outline">
            <Link to="/inscriptions">
              {lang === "fr" ? "Voir les inscriptions" : "View registration information"} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}
