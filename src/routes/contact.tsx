import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AHM Verdun" },
      { name: "description", content: "Joindre l'Association du hockey mineur de Verdun : sujets de demande, bénévolat et coordonnées à valider." },
      { property: "og:title", content: "Contact — AHM Verdun" },
      { property: "og:description", content: "Formulaire de contact de démonstration et coordonnées de l'association." },
    ],
  }),
  component: ContactPage,
});

const SUBJECTS = ["Inscriptions", "Horaires", "Bénévolat", "Zone entraîneurs", "Commandites", "Autre"];

function ContactPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHeader eyebrow={t("common.toValidate")} title={t("contact.title")} description="Formulaire de démonstration. Aucune adresse courriel officielle n'est affichée tant qu'elle n'est pas confirmée par l'association." />
      <div className="container-site grid gap-10 py-8 md:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <DemoNotice kind="connect" className="mb-6">
            Ce formulaire n'envoie aucun message : l'acheminement des courriels sera branché lors d'une phase suivante, après approbation.
          </DemoNotice>

          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          >
            <label className="block">
              <span className="eyebrow mb-1.5 block text-muted-foreground">Nom</span>
              <input required className="h-11 w-full rounded-md border border-input bg-background px-3 text-base" />
            </label>
            <label className="block">
              <span className="eyebrow mb-1.5 block text-muted-foreground">Courriel</span>
              <input type="email" required className="h-11 w-full rounded-md border border-input bg-background px-3 text-base" />
            </label>
            <label className="block">
              <span className="eyebrow mb-1.5 block text-muted-foreground">Sujet</span>
              <select className="h-11 w-full rounded-md border border-input bg-background px-3 text-base">
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="eyebrow mb-1.5 block text-muted-foreground">Message</span>
              <textarea required rows={5} className="w-full rounded-md border border-input bg-background p-3 text-base" />
            </label>
            <Button type="submit" variant="sport" size="lg">Envoyer (démonstration)</Button>
            {sent && (
              <p role="status" className="rounded-md border border-demo/40 bg-demo-soft px-4 py-3 text-sm text-demo-foreground">
                Démonstration : le message n'a pas été envoyé. Aucune donnée n'est enregistrée.
              </p>
            )}
          </form>
        </div>

        <aside className="space-y-6">
          <div className="card-elevated p-5">
            <SectionHeading title="Association" className="mb-3" />
            <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 size-4 shrink-0 text-sport" aria-hidden /> {SITE.city}</p>
            <p className="mt-3 text-sm italic text-muted-foreground">Adresse postale, téléphone et courriel officiels à fournir.</p>
          </div>
          <div className="card-elevated p-5">
            <SectionHeading title="Inscriptions" className="mb-3" />
            <p className="text-sm text-muted-foreground">Commencez par le parcours AHM Verdun avant de continuer vers l'inscription hockey officielle.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/inscriptions">{t("reg.cta")} <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
