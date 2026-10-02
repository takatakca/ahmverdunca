import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Mail, PhoneCall, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LogoSlot } from "./logo-slot";

const HIDE_KEY = "ahmv-communications-preview-hidden";
const SESSION_KEY = "ahmv-communications-preview-seen";

export function CommunicationsPreview() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";

  useEffect(() => {
    if (publicLaunch) return;
    if (window.localStorage.getItem(HIDE_KEY) === "1") return;
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [publicLaunch]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open || publicLaunch) return null;

  const dismissForever = () => {
    window.localStorage.setItem(HIDE_KEY, "1");
    setOpen(false);
  };

  const submitPreview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-navy-deep/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="communications-preview-title"
        className="relative max-h-[92dvh] w-full overflow-y-auto border-t-4 border-sport bg-background shadow-2xl sm:max-w-2xl sm:rounded-xl sm:border sm:border-t-4"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="tap-target absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-full bg-navy-deep/8 text-foreground transition-colors hover:bg-navy-deep/12"
          aria-label={lang === "fr" ? "Fermer" : "Close"}
        >
          <X className="size-5" />
        </button>

        <div className="grid md:grid-cols-[0.88fr_1.12fr]">
          <div className="navy-texture flex min-h-44 flex-col justify-between p-6 text-navy-foreground sm:p-8">
            <div className="flex items-center gap-4">
              <LogoSlot size="lg" className="size-20 drop-shadow-[0_10px_28px_rgba(0,0,0,0.32)]" />
              <div>
                <p className="font-display text-2xl font-extrabold uppercase leading-none">AHM Verdun</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-navy-foreground/60">
                  {lang === "fr" ? "Saison 2026–2027" : "2026–2027 season"}
                </p>
              </div>
            </div>

            <div className="mt-8 border-l-2 border-sport pl-4">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Numéro AHMV réservé — service d'information à venir" : "Reserved AHMV number — information service upcoming"}
              </p>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight">{SITE.phoneDisplay}</p>
              <p className="mt-1 text-xs text-navy-foreground/55">+1 581 666 6246</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="eyebrow text-sport">{lang === "fr" ? "Info AHMV" : "AHMV updates"}</p>
            <h2 id="communications-preview-title" className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.92] text-navy">
              {lang === "fr" ? "Restez connecté à AHM Verdun" : "Stay connected to AHM Verdun"}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Horaires, nouvelles et informations importantes directement avec vous."
                : "Schedules, news and important information, delivered directly to you."}
            </p>

            {subscribed ? (
              <div className="mt-6 border-l-4 border-sport bg-ice p-4">
                <p className="font-semibold text-navy">
                  {lang === "fr" ? "Aperçu confirmé." : "Preview confirmed."}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "fr"
                    ? "Aucune inscription réelle n'a été envoyée. Le branchement infolettre viendra après autorisation."
                    : "No real subscription was sent. Newsletter delivery will be connected only after authorization."}
                </p>
              </div>
            ) : (
              <form onSubmit={submitPreview} className="mt-6 space-y-3">
                <label className="block text-sm font-semibold text-navy" htmlFor="communications-preview-email">
                  {lang === "fr" ? "Recevoir les horaires" : "Receive schedules"}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <input
                      id="communications-preview-email"
                      type="email"
                      required
                      placeholder={lang === "fr" ? "votre@courriel.ca" : "you@email.ca"}
                      className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-sport"
                    />
                  </div>
                  <Button type="submit" variant="sport" className="h-11">
                    {lang === "fr" ? "M'inscrire" : "Sign me up"}
                  </Button>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {lang === "fr"
                    ? "Démonstration visuelle seulement — aucune adresse n'est enregistrée ni transmise."
                    : "Visual demo only — no address is stored or transmitted."}
                </p>
              </form>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/horaires" onClick={() => setOpen(false)}>
                  <CalendarDays className="size-4" />
                  {lang === "fr" ? "Voir les horaires maintenant" : "View schedules now"}
                </Link>
              </Button>
              <Button variant="ghost" className="flex-1" onClick={dismissForever}>
                {lang === "fr" ? "Ne plus afficher" : "Don't show again"}
              </Button>
            </div>

            <div className="mt-5 flex items-start gap-2 border-t pt-4 text-xs text-muted-foreground">
              <PhoneCall className="mt-0.5 size-3.5 shrink-0 text-sport" aria-hidden />
              <p>
                {lang === "fr"
                  ? "Le numéro AHMV est réservé. L'expérience téléphonique automatisée n'est pas encore annoncée comme service actif."
                  : "The AHMV number is reserved. Automated phone information is not yet presented as a live service."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
