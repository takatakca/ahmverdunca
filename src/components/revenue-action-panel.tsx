import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, HeartHandshake, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function RevenueActionPanel() {
  const { lang } = useI18n();

  return (
    <section className="border-y border-navy/10 bg-ice">
      <div className="container-site py-10 md:py-14">
        <div className="grid overflow-hidden border border-navy/12 bg-navy/12 lg:grid-cols-2">
          <article className="bg-competition p-6 text-white md:p-8">
            <div className="flex items-center justify-between gap-4">
              <HeartHandshake className="size-7 text-sport-foreground" aria-hidden />
              <span className="border border-white/15 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white/55">
                {lang === "fr" ? "Aucun paiement en ligne" : "No online payment"}
              </span>
            </div>
            <p className="eyebrow mt-7 text-sport-foreground">
              {lang === "fr" ? "Soutien à l’association" : "Support the association"}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9]">
              {lang === "fr" ? "Soutenir AHMV" : "Support AHMV"}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">
              {lang === "fr"
                ? "La contribution en ligne n’est pas activée tant que le bénéficiaire, le processeur, les conditions et la politique de remboursement ne sont pas confirmés. Pour le moment, utilisez uniquement les canaux de contact officiels."
                : "Online contributions remain disabled until the beneficiary, processor, terms and refund policy are confirmed. For now, use official contact channels only."}
            </p>
            <Button asChild variant="outline-light" className="mt-6">
              <Link to="/contact">
                {lang === "fr" ? "Voir les façons de contribuer" : "See ways to contribute"} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </article>

          <article className="bg-background p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <Building2 className="size-7 text-sport" aria-hidden />
              <span className="border border-navy/12 bg-ice px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {lang === "fr" ? "Visibilité locale" : "Local visibility"}
              </span>
            </div>
            <p className="eyebrow mt-7 text-sport">
              {lang === "fr" ? "Commandite & partenariat" : "Sponsorship & partnership"}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] text-navy">
              {lang === "fr" ? "Votre entreprise ici" : "Your business here"}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Découvrez les espaces de visibilité disponibles sur le portail AHMV. Aucune audience, portée ou performance publicitaire n’est inventée : seules les possibilités réellement disponibles sont présentées."
                : "Explore visibility placements available across the AHMV portal. No audience, reach or ad-performance numbers are invented; only real available placements are presented."}
            </p>
            <Button asChild variant="sport" className="mt-6">
              <Link to="/partenaires">
                {lang === "fr" ? "Voir les possibilités" : "View opportunities"} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </article>
        </div>

        <div className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-sport" aria-hidden />
          <p>
            {lang === "fr"
              ? "Ces surfaces sont informatives et non transactionnelles. Elles ne promettent ni reçu fiscal, ni destination de fonds non confirmée."
              : "These surfaces are informational and non-transactional. They promise neither a tax receipt nor any unconfirmed destination of funds."}
          </p>
        </div>
      </div>
    </section>
  );
}
