import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — AHM Verdun" },
      {
        name: "description",
        content:
          "Accès aux services officiels utilisés par l'AHM Verdun. GROUPE TAKATAK ne gère pas les comptes hockey ni les opérations de l'association.",
      },
      { property: "og:title", content: "Connexion — AHM Verdun" },
      {
        property: "og:description",
        content:
          "Accédez à la plateforme officielle utilisée pour les services membres et l'inscription hockey.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t, lang } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Accès membres" : "Member access"}
        title={t("reg.loginTitle")}
        description={
          lang === "fr"
            ? "Les comptes hockey et les opérations membres restent dans les plateformes déjà établies par l'association. GROUPE TAKATAK intervient uniquement pour le marketing, l'infolettre et l'information générale."
            : "Hockey accounts and member operations remain in the association's established platforms. GROUPE TAKATAK is limited to marketing, newsletters and general information."
        }
      />

      <div className="container-site max-w-3xl space-y-8 py-10 md:py-16">
        <DemoNotice kind="info">
          {lang === "fr"
            ? "Aucun compte AHM Verdun n'est créé ou géré par GROUPE TAKATAK sur ce site."
            : "No AHM Verdun member account is created or managed by GROUPE TAKATAK on this site."}
        </DemoNotice>

        <section className="competition-panel rounded-xl p-6 text-navy-foreground md:p-8">
          <p className="eyebrow text-sport-foreground">Spordle</p>
          <h2 className="heading-section mt-2">
            {lang === "fr" ? "Accès officiel hockey" : "Official hockey access"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75">
            {lang === "fr"
              ? "Utilisez la plateforme officielle pour l'inscription hockey et les services membres qui y sont déjà gérés."
              : "Use the official platform for hockey registration and the member services already managed there."}
          </p>
          <Button asChild variant="sport" size="lg" className="mt-6">
            <a href={EXTERNAL_LINKS.spordleLogin} target="_blank" rel="noopener noreferrer">
              {lang === "fr" ? "Accéder à Spordle" : "Open Spordle"} <ExternalLink className="size-4" />
            </a>
          </Button>
        </section>

        <section>
          <SectionHeading
            title={lang === "fr" ? "Recevoir les nouvelles AHMV" : "Receive AHMV updates"}
            description={
              lang === "fr"
                ? "Les communications générales, infolettres et campagnes pourront être gérées par GROUPE TAKATAK avec consentement."
                : "General communications, newsletters and campaigns can be managed by GROUPE TAKATAK with consent."
            }
          />
          <Button asChild variant="outline">
            <Link to="/inscriptions">
              {lang === "fr" ? "Voir les informations d'inscription" : "View registration information"}{" "}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}
