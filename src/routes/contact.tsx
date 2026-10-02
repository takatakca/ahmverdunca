import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  HandHeart,
  Mail,
  MapPin,
  Megaphone,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    links: canonicalLink("/contact"),
    meta: [
      { title: "Contact — AHM Verdun" },
      {
        name: "description",
        content:
          "Joindre l'Association du hockey mineur de Verdun : information générale, horaires, bénévolat, commandites et services officiels.",
      },
      { property: "og:title", content: "Contact — AHM Verdun" },
      {
        property: "og:description",
        content: "Coordonnées et points de contact de l'Association du hockey mineur de Verdun.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t, lang } = useI18n();
  const showPlannedServices = import.meta.env["VITE_PUBLIC_INDEXING"] !== "true";
  const showPhone = showPlannedServices || SITE.phonePublic;

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Nous joindre" : "Get in touch"}
        title={t("contact.title")}
        description={
          lang === "fr"
            ? "Choisissez le bon accès selon votre besoin. Les opérations hockey restent dans leurs systèmes officiels; le site simplifie le chemin pour les familles."
            : "Choose the right access point for your need. Hockey operations remain in their official systems; this site simply makes the path easier for families."
        }
        actions={
          showPhone ? (
            <Button asChild variant="sport">
              <a href={`tel:${SITE.phoneE164}`}>
                <PhoneCall className="size-4" />
                {SITE.phoneDisplay}
              </a>
            </Button>
          ) : undefined
        }
      />

      <div className="container-site space-y-12 py-8 md:py-12">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link to="/horaires" className="card-elevated group p-6">
            <CalendarDays className="size-6 text-sport" aria-hidden />
            <h2 className="heading-card mt-5 group-hover:text-sport">
              {lang === "fr" ? "Horaires" : "Schedules"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Horaire hebdomadaire AHMV et liens vers les calendriers sportifs officiels."
                : "AHMV weekly schedule and links to official sport calendars."}
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sport">
              {lang === "fr" ? "Ouvrir" : "Open"} <ArrowRight className="size-3.5" />
            </span>
          </Link>

          <Link to="/inscriptions" className="card-elevated group p-6">
            <ShieldCheck className="size-6 text-sport" aria-hidden />
            <h2 className="heading-card mt-5 group-hover:text-sport">
              {lang === "fr" ? "Inscriptions" : "Registration"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Information AHMV puis redirection vers Spordle pour l'inscription officielle."
                : "AHMV information followed by redirection to Spordle for official registration."}
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sport">
              {lang === "fr" ? "Continuer" : "Continue"} <ArrowRight className="size-3.5" />
            </span>
          </Link>

          <Link to="/entraineurs" className="card-elevated group p-6">
            <HandHeart className="size-6 text-sport" aria-hidden />
            <h2 className="heading-card mt-5 group-hover:text-sport">
              {lang === "fr" ? "Entraîneurs & bénévoles" : "Coaches & volunteers"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Formations, ressources et accès publiés par l'association."
                : "Training, resources and access published by the association."}
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sport">
              {lang === "fr" ? "Voir les ressources" : "View resources"} <ArrowRight className="size-3.5" />
            </span>
          </Link>

          <Link to="/partenaires" className="card-elevated group p-6">
            <Megaphone className="size-6 text-sport" aria-hidden />
            <h2 className="heading-card mt-5 group-hover:text-sport">
              {lang === "fr" ? "Commandites" : "Sponsorships"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Partenaires actuels, visibilité et demandes de commandite."
                : "Current partners, visibility and sponsorship inquiries."}
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sport">
              {lang === "fr" ? "Voir les partenaires" : "View partners"} <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </section>

        <section className="rounded-xl border border-border bg-ice p-5 md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Opérations & bénévolat" : "Operations & volunteering"}
            </p>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {lang === "fr"
                ? "Pour les rôles opérationnels et de recrutement actuellement publiés par l’AHM Verdun, utilisez le contact fonctionnel ci-dessous."
                : "For operational and recruitment roles currently published by AHM Verdun, use the functional contact below."}
            </p>
          </div>
          <Button asChild variant="outline" className="mt-4 shrink-0 md:mt-0">
            <a href={`mailto:${SITE.operationsEmail}`}>
              <Mail className="size-4" />
              {SITE.operationsEmail}
            </a>
          </Button>
        </section>

        {(showPhone || showPlannedServices) && (
          <section className={showPlannedServices && showPhone ? "grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" : "grid gap-6"}>
          {showPhone && (
            <div className="competition-panel rounded-xl p-6 text-navy-foreground md:p-8">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Téléphone AHMV" : "AHMV phone"}
              </p>
              <a
                href={`tel:${SITE.phoneE164}`}
                className="mt-4 inline-flex items-center gap-3 font-display text-4xl font-extrabold tracking-tight hover:text-sport-foreground md:text-5xl"
              >
                <PhoneCall className="size-7 shrink-0 text-sport-foreground" aria-hidden />
                {SITE.phoneDisplay}
              </a>
              <p className="mt-4 max-w-2xl text-sm text-navy-foreground/70">
                {showPlannedServices
                  ? lang === "fr"
                    ? "Numéro AHMV réservé pour l'information générale. L'assistance vocale automatisée sera offerte seulement lorsqu'elle aura été officiellement activée."
                    : "AHMV number reserved for general information. Automated voice assistance will be offered only after it has been officially activated."
                  : lang === "fr"
                    ? "Appelez ce numéro pour l'information générale AHMV."
                    : "Call this number for general AHMV information."}
              </p>
            </div>
          )}

          {showPlannedServices && (
            <div className="card-elevated p-6 md:p-8">
              <BellRing className="size-6 text-sport" aria-hidden />
              <h2 className="heading-card mt-5">
                {lang === "fr" ? "Info générale & infolettre" : "General info & newsletter"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {lang === "fr"
                  ? "Nouvelles générales, événements, campagnes, commanditaires et infolettres pourront être regroupés ici. Les résultats, classements et opérations hockey demeurent dans les services officiels."
                  : "General news, events, campaigns, sponsors and newsletters can be brought together here. Scores, standings and hockey operations remain in official services."}
              </p>
              <div className="mt-5 rounded-lg border border-border bg-ice px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {lang === "fr" ? "Activation après approbation de l'association" : "Activation after association approval"}
              </div>
            </div>
          )}
          </section>
        )}
        <section>
          <SectionHeading
            eyebrow={lang === "fr" ? "Coordonnées" : "Contact details"}
            title={lang === "fr" ? "Association du hockey mineur de Verdun" : "Verdun Minor Hockey Association"}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-ice p-5">
              <p className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sport" aria-hidden />
                {SITE.city}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-ice p-5">
              <p className="text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Le courriel général officiel et l'adresse postale seront publiés seulement après confirmation par l'AHM Verdun."
                  : "The official general email and mailing address will be published only after confirmation by AHM Verdun."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
