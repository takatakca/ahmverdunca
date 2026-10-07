import { ArrowRight, BellRing, Mail } from "lucide-react";
import { newsletterSignupUrl } from "@/lib/newsletter";

export function NewsletterInterest({
  lang,
  source,
  arenaSlug,
  teamId,
  compact = false,
}: {
  lang: "fr" | "en";
  source: string;
  arenaSlug?: string;
  teamId?: string;
  compact?: boolean;
}) {
  const signupUrl = newsletterSignupUrl(source, {
    arena: arenaSlug,
    teamId,
  });

  if (!signupUrl) return null;

  return (
    <section className={compact
      ? "border border-white/12 bg-white/[0.025] p-4"
      : "overflow-hidden border border-sport/25 bg-navy-deep text-white"
    }>
      <div className={compact ? "" : "grid lg:grid-cols-[0.7fr_1.3fr]"}>
        <div className={compact ? "" : "competition-panel p-6 text-navy-foreground md:p-8"}>
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-sport-foreground" aria-hidden />
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Infolettre AHM Verdun" : "AHM Verdun newsletter"}
            </p>
          </div>
          <h2 className={compact
            ? "mt-2 font-display text-2xl font-extrabold uppercase leading-[0.9]"
            : "mt-3 font-display text-4xl font-extrabold uppercase leading-[0.9]"
          }>
            {lang === "fr" ? "L’information vient à vous." : "Let the updates come to you."}
          </h2>
          <p className={compact
            ? "mt-2 text-xs leading-relaxed opacity-60"
            : "mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/72"
          }>
            {lang === "fr"
              ? "Horaires, nouvelles, inscriptions et informations utiles pourront être regroupés selon vos préférences et votre consentement."
              : "Schedules, news, registration and useful updates can be grouped according to your preferences and consent."}
          </p>
        </div>

        {!compact && (
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {[
              {
                title: lang === "fr" ? "Vos équipes" : "Your teams",
                body: lang === "fr" ? "Recevez ce qui touche les équipes que vous suivez." : "Receive updates for the teams you follow.",
              },
              {
                title: lang === "fr" ? "Vos arénas" : "Your arenas",
                body: lang === "fr" ? "Suivez les informations pratiques liées aux installations." : "Follow practical facility information.",
              },
              {
                title: lang === "fr" ? "Inscriptions" : "Registration",
                body: lang === "fr" ? "Ne manquez pas une période d’inscription ou une activité publiée." : "Do not miss a registration window or published activity.",
              },
              {
                title: lang === "fr" ? "Consentement centralisé" : "Centralized consent",
                body: lang === "fr" ? "Vos préférences et votre désabonnement restent centralisés et modifiables." : "Your preferences and unsubscribe choices stay centralized and editable.",
              },
            ].map((item) => (
              <article key={item.title} className="bg-competition p-5">
                <BellRing className="size-4 text-sport-foreground" />
                <h3 className="mt-3 font-display text-xl font-extrabold uppercase text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{item.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className={compact ? "mt-4" : "border-t border-white/10 bg-competition p-5 md:px-8"}>
        <a
          href={signupUrl}
          className="premium-control inline-flex min-h-11 items-center gap-3 bg-sport px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
        >
          {lang === "fr" ? "Choisir mes communications" : "Choose my communications"}
          <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
