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
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { useI18n } from "@/lib/i18n";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { useAhmvPhoneStatus } from "@/lib/use-ahmv-phone-status";

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
  const { phonePublic, phoneDisplay, phoneE164 } = useAhmvPhoneStatus();
  const showPhone = phonePublic;

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
          phonePublic ? (
            <Button asChild variant="sport">
              <a href={`tel:${phoneE164}`}>
                <PhoneCall className="size-4" />
                {phoneDisplay}
              </a>
            </Button>
          ) : undefined
        }
      />

      <div className="container-site space-y-12 py-8 md:py-12">
        <section className="grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[380px]">
            <img src={OFFICIAL_MEDIA.volunteerArchive.url} alt={lang === "fr" ? OFFICIAL_MEDIA.volunteerArchive.alt.fr : OFFICIAL_MEDIA.volunteerArchive.alt.en} loading="eager" decoding="async" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.86))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Une association · plusieurs besoins" : "One association · many needs"}</p>
              <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-5xl">
                {lang === "fr" ? "Trouvez le bon chemin dès le départ." : "Find the right path from the start."}
              </h2>
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Accès rapide" : "Quick access"}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              {lang === "fr" ? "Horaires, inscriptions, bénévolat, commandites ou information générale : utilisez la bonne porte pour obtenir une réponse plus rapidement." : "Schedules, registration, volunteering, sponsorships or general information: use the right entry point to get an answer faster."}
            </p>
            {phonePublic && <a href={`tel:${phoneE164}`} className="mt-6 font-display text-3xl font-extrabold text-white">{phoneDisplay}</a>}
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link to="/horaires" className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40">
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

          <Link to="/inscriptions" className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40">
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

          <Link to="/entraineurs" className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40">
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

          <Link to="/partenaires" className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40">
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

        <section className="border border-navy/12 bg-ice p-5 md:flex md:items-center md:justify-between md:gap-6">
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
            <div className="competition-panel border border-navy/12 p-6 text-navy-foreground md:p-8">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Téléphone AHMV" : "AHMV phone"}
              </p>
              {phonePublic ? (
                <a
                  href={`tel:${phoneE164}`}
                  className="mt-4 inline-flex items-center gap-3 font-display text-4xl font-extrabold tracking-tight hover:text-sport-foreground md:text-5xl"
                >
                  <PhoneCall className="size-7 shrink-0 text-sport-foreground" aria-hidden />
                  {phoneDisplay}
                </a>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <PhoneCall className="size-7 shrink-0 text-sport-foreground" aria-hidden />
                  <span className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{phoneDisplay}</span>
                  <span className="border border-sport-foreground/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sport-foreground">
                    {lang === "fr" ? "Réservé · activation à venir" : "Reserved · activation upcoming"}
                  </span>
                </div>
              )}
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
            <div className="border border-navy/12 bg-background p-6 md:p-8">
              <BellRing className="size-6 text-sport" aria-hidden />
              <h2 className="heading-card mt-5">
                {lang === "fr" ? "Services d’information à venir" : "Information services coming later"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {lang === "fr"
                  ? "Les futurs canaux d’information, dont l’infolettre et l’assistance téléphonique, seront affichés ici seulement après activation officielle par l’association."
                  : "Future information channels, including newsletter and phone assistance, will appear here only after official activation by the association."}
              </p>
            </div>
          )}
          </section>
        )}
        <HouseSponsorSlot placement="contact-path" count={1} compact />

        <section>
          <SectionHeading
            eyebrow={lang === "fr" ? "Coordonnées" : "Contact details"}
            title={lang === "fr" ? "Association du hockey mineur de Verdun" : "Verdun Minor Hockey Association"}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-navy/12 bg-ice p-5">
              <p className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sport" aria-hidden />
                {SITE.city}
              </p>
            </div>
            <div className="border border-navy/12 bg-ice p-5">
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
