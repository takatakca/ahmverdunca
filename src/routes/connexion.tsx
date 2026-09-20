import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — AHM Verdun" },
      { name: "description", content: "La connexion des membres de l'AHM Verdun se fait sur la plateforme officielle Spordle." },
      { property: "og:title", content: "Connexion — AHM Verdun" },
      { property: "og:description", content: "Accès membre via la plateforme officielle Spordle." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader eyebrow="Spordle" title={t("reg.loginTitle")} description="Ce site ne gère aucun compte ni mot de passe. L'accès membre se fait uniquement sur la plateforme officielle Spordle." />
      <div className="container-site max-w-2xl space-y-6 py-10 md:py-16">
        <DemoNotice kind="info">
          Aucun identifiant n'est demandé ni conservé par ce site. Vous serez redirigé vers Spordle dans un nouvel onglet.
        </DemoNotice>
        <Button asChild variant="sport" size="lg">
          <a href={EXTERNAL_LINKS.spordleLogin} target="_blank" rel="noopener noreferrer">
            {t("nav.login")} <ExternalLink className="size-4" />
          </a>
        </Button>
      </div>
    </>
  );
}
