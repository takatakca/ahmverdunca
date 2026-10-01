import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, PhoneCall } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AHM Verdun" },
      { name: "description", content: "Joindre l'Association du hockey mineur de Verdun : information générale, bénévolat, commandites et accès aux services officiels." },
      { property: "og:title", content: "Contact — AHM Verdun" },
      { property: "og:description", content: "Coordonnées et points de contact de l'Association du hockey mineur de Verdun." },
    ],
  }),
  component: ContactPage,
});

const SUBJECTS = [
  { fr: "Inscriptions", en: "Registration" },
  { fr: "Horaires", en: "Schedules" },
  { fr: "Bénévolat", en: "Volunteering" },
  { fr: "Zone entraîneurs", en: "Coaches' zone" },
  { fr: "Commandites", en: "Sponsorships" },
  { fr: "Autre", en: "Other" },
];

function ContactPage() {
  const { t, lang } = useI18n();
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Nous joindre" : "Get in touch"}
        title={t("contact.title")}
        description={
          lang === "fr"
            ? "Trouvez rapidement le bon point de contact. Le courriel général officiel sera affiché seulement après validation par l'association."
            : "Find the right contact point quickly. The official general email will be displayed only after association validation."
        }
      />

      <div className="container-site grid gap-10 py-8 md:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <DemoNotice kind="connect" className="mb-6">
            {lang === "fr"
              ? "Le formulaire est en démonstration et n'envoie encore aucun message. Utilisez les accès officiels ci-contre lorsque votre demande concerne le hockey."
              : "The form is currently a demo and does not send messages yet. Use the official access points shown here when your request concerns hockey."}
          </DemoNotice>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <label className="block">
              <span className="eyebrow mb-1.5 block text-muted-foreground">
                {lang === "fr" ? "Nom" : "Name"}
              </span>
              <input
                required
                autoComplete="name"
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base"
              />
            </label>

            <label className="block">
              <span className="eyebrow mb-1.5 block text-muted-foreground">
                {lang === "fr" ? "Courriel" : "Email"}
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base"
              />
            </label>

            <label className="block">
              <span className="eyebrow mb-1.5 block text-muted-foreground">
                {lang === "fr" ? "Sujet" : "Subject"}
              </span>
              <select className="h-11 w-full rounded-md border border-input bg-background px-3 text-base">
                {SUBJECTS.map((subject) => (
                  <option key={subject.fr}>{lang === "fr" ? subject.fr : subject.en}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="eyebrow mb-1.5 block text-muted-foreground">
                {lang === "fr" ? "Message" : "Message"}
              </span>
              <textarea
                required
                rows={5}
                className="w-full rounded-md border border-input bg-background p-3 text-base"
              />
            </label>

            <Button type="submit" variant="sport" size="lg">
              {lang === "fr" ? "Envoyer (démonstration)" : "Send (demo)"}
            </Button>

            {sent && (
              <p
                role="status"
                className="rounded-md border border-demo/40 bg-demo-soft px-4 py-3 text-sm text-demo-foreground"
              >
                {lang === "fr"
                  ? "Démonstration : le message n'a pas été envoyé et aucune donnée n'est enregistrée."
                  : "Demo: the message was not sent and no data was stored."}
              </p>
            )}
          </form>
        </div>

        <aside className="space-y-6">
          <div className="card-elevated p-5">
            <SectionHeading
              title={lang === "fr" ? "Association" : "Association"}
              className="mb-3"
            />
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sport" aria-hidden />
              {SITE.city}
            </p>
            <a
              href={`tel:${SITE.phoneE164}`}
              className="mt-4 flex items-center gap-2 font-display text-2xl font-bold text-navy hover:text-sport"
            >
              <PhoneCall className="size-5 text-sport" aria-hidden />
              {SITE.phoneDisplay}
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              {lang === "fr"
                ? "Assistant vocal automatisé : intégration à venir. Le numéro est déjà réservé."
                : "Automated voice assistant: integration coming later. The number is already reserved."}
            </p>
            <p className="mt-3 text-sm italic text-muted-foreground">
              {lang === "fr"
                ? "Adresse postale et courriel général officiels à valider."
                : "Official mailing address and general email still need validation."}
            </p>
          </div>

          <div className="card-elevated p-5">
            <SectionHeading
              title={lang === "fr" ? "Inscriptions hockey" : "Hockey registration"}
              className="mb-3"
            />
            <p className="text-sm text-muted-foreground">
              {lang === "fr"
                ? "Consultez l'information AHM Verdun, puis continuez vers le système officiel."
                : "Review the AHM Verdun information, then continue to the official system."}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/inscriptions">
                {lang === "fr" ? "Voir les inscriptions" : "View registration"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="card-elevated p-5">
            <SectionHeading
              title={lang === "fr" ? "Commandites" : "Sponsorships"}
              className="mb-3"
            />
            <p className="text-sm text-muted-foreground">
              {lang === "fr"
                ? "Découvrez les partenaires actuels et le futur espace de visibilité commanditaire."
                : "Discover current partners and the future sponsorship visibility space."}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/partenaires">
                {lang === "fr" ? "Voir les partenaires" : "View partners"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
