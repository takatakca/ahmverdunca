import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, HeartHandshake, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function RevenueActionPanel() {
  const { lang } = useI18n();

  return (
    <section className="border-y border-white/10 bg-navy-deep text-white">
      <div className="container-site py-10 md:py-14">
        <div className="grid gap-px overflow-hidden border border-white/15 bg-white/10 lg:grid-cols-2">
          <article className="bg-competition p-6 text-white md:p-8">
            <div className="flex items-center justify-between gap-4">
              <HeartHandshake className="size-7 text-sport-foreground" aria-hidden />
              <span className="border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white/75">
                {lang === "fr" ? "Aucun paiement en ligne" : "No online payment"}
              </span>
            </div>
            <p className="eyebrow mt-7 text-sport-foreground">
              {lang === "fr" ? "Soutien à l’association" : "Support the association"}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9]">
              {lang === "fr" ? "Soutenir AHMV" : "Support AHMV"}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">
              {lang === "fr"
                ? "Contactez AHMV pour connaître les façons de contribuer et les démarches à suivre avec l’association."
                : "Contact AHMV to learn how you can contribute and what steps to take with the association."}
            </p>
            <Button asChild variant="outline-light" className="mt-6 h-auto min-h-11 w-full justify-between whitespace-normal py-3 text-left sm:w-auto">
              <Link to="/contact">
                {lang === "fr" ? "Voir les façons de contribuer" : "See ways to contribute"} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </article>

          <article className="bg-navy p-6 text-white md:p-8">
            <div className="flex items-center justify-between gap-4">
              <Building2 className="size-7 text-sport-foreground" aria-hidden />
              <span className="border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white/75">
                {lang === "fr" ? "Visibilité locale" : "Local visibility"}
              </span>
            </div>
            <p className="eyebrow mt-7 text-sport-foreground">
              {lang === "fr" ? "Commandite & partenariat" : "Sponsorship & partnership"}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] text-white">
              {lang === "fr" ? "Votre entreprise ici" : "Your business here"}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">
              {lang === "fr"
                ? "Découvrez les options de visibilité du portail AHMV et contactez l’association pour discuter d’un format et d’une période."
                : "Explore visibility options on the AHMV portal and contact the association to discuss a format and dates."}
            </p>
            <Button asChild variant="sport" className="mt-6 h-auto min-h-11 w-full justify-between whitespace-normal py-3 text-left sm:w-auto">
              <Link to="/partenaires">
                {lang === "fr" ? "Voir les possibilités" : "View opportunities"} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </article>
        </div>

        <div className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-white/65">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-sport-foreground" aria-hidden />
          <p>
            {lang === "fr"
              ? "Les modalités de toute contribution ou commandite sont à confirmer directement avec l’association."
              : "Confirm the terms of any contribution or sponsorship directly with the association."}
          </p>
        </div>
      </div>
    </section>
  );
}
