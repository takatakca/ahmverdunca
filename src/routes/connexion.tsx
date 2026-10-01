import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — AHM Verdun" },
      { name: "description", content: "Point d'accès AHM Verdun : futur portail GROUPE TAKATAK et accès à la plateforme officielle Spordle." },
      { property: "og:title", content: "Connexion — AHM Verdun" },
      { property: "og:description", content: "Accès aux services AHM Verdun et à la plateforme officielle de hockey." },
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
            ? "Le portail GROUPE TAKATAK servira aux préférences, communications et suivis. Spordle demeure la plateforme officielle pour l’inscription hockey."
            : "The GROUPE TAKATAK portal will handle preferences, communications and follow-up. Spordle remains the official hockey registration platform."
        }
      />

      <div className="container-site max-w-4xl space-y-8 py-10 md:py-16">
        <DemoNotice kind="info">
          {lang === "fr"
            ? "Le portail membre GROUPE TAKATAK n’est pas encore branché dans cette maquette. Aucun compte parent n’est créé ici pour le moment."
            : "The GROUPE TAKATAK member portal is not connected in this prototype yet. No parent account is created here at this time."}
        </DemoNotice>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="card-elevated p-6 md:p-7">
            <ShieldCheck className="size-7 text-sport" aria-hidden />
            <p className="eyebrow mt-6 text-sport">GROUPE TAKATAK</p>
            <h2 className="heading-section mt-2">
              {lang === "fr" ? "Portail AHMV" : "AHMV portal"}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {lang === "fr"
                ? "À venir : infolettres, préférences de communication, rappels et services numériques AHM Verdun dans un accès central."
                : "Coming soon: newsletters, communication preferences, reminders and AHM Verdun digital services in one central access point."}
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/contact">
                {lang === "fr" ? "Besoin d’aide" : "Need help"} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </section>

          <section className="competition-panel rounded-xl p-6 text-navy-foreground md:p-7">
            <p className="eyebrow text-sport-foreground">Spordle</p>
            <h2 className="heading-section mt-2">
              {lang === "fr" ? "Inscription hockey" : "Hockey registration"}
            </h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              {lang === "fr"
                ? "Pour compléter une inscription hockey officielle, utilisez la plateforme Spordle."
                : "To complete an official hockey registration, use the Spordle platform."}
            </p>
            <Button asChild variant="sport" size="lg" className="mt-6">
              <a href={EXTERNAL_LINKS.spordleLogin} target="_blank" rel="noopener noreferrer">
                {lang === "fr" ? "Accéder à Spordle" : "Open Spordle"} <ExternalLink className="size-4" />
              </a>
            </Button>
          </section>
        </div>

        <section>
          <SectionHeading title={lang === "fr" ? "Vous voulez inscrire un enfant?" : "Want to register a child?"} />
          <Button asChild variant="outline">
            <Link to="/inscriptions">
              {lang === "fr" ? "Voir le parcours d’inscription" : "View registration flow"} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}
