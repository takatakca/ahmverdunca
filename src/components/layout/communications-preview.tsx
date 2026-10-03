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
    }, 320);

    return () => window.clearTimeout(timer);
  }, [publicLaunch]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
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
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-navy-deep/80 backdrop-blur-md sm:items-center sm:p-5"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="communications-preview-title"
        className="relative grid max-h-[100dvh] w-full overflow-hidden bg-background shadow-[0_40px_100px_-30px_rgba(0,0,0,0.65)] sm:max-h-[92dvh] sm:max-w-5xl sm:grid-cols-[1.05fr_0.95fr] sm:border sm:border-white/10"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="tap-target absolute right-3 top-3 z-30 inline-flex items-center justify-center rounded-full border border-white/15 bg-navy-deep/55 text-white backdrop-blur-md transition-colors hover:bg-navy-deep/75"
          aria-label={lang === "fr" ? "Fermer" : "Close"}
        >
          <X className="size-5" />
        </button>

        <div className="relative min-h-[42dvh] overflow-hidden bg-navy-deep p-6 text-navy-foreground sm:min-h-[640px] sm:p-8 md:p-10">
          <div className="arena-light" aria-hidden />
          <div className="light-beam left-[6%]" aria-hidden />
          <div className="light-beam left-[58%] [animation-delay:2.6s]" aria-hidden />
          <div className="ice-grain absolute inset-0 opacity-40" aria-hidden />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,15,39,0.08)_0%,rgba(6,15,39,0.72)_68%,rgba(6,15,39,0.96)_100%)]" aria-hidden />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between gap-4 pr-12">
              <div className="flex items-center gap-4">
                <LogoSlot size="lg" className="size-20 drop-shadow-[0_16px_30px_rgba(0,0,0,0.38)] sm:size-24" />
                <div>
                  <p className="font-display text-2xl font-extrabold uppercase leading-none sm:text-3xl">AHM Verdun</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-foreground/55">
                    {lang === "fr" ? "Hockey mineur · Verdun" : "Minor hockey · Verdun"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Numéro AHMV réservé" : "Reserved AHMV number"}
              </p>
              <p className="mt-3 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.025em]">
                1 (581)<br />
                666-6AHM
              </p>
              <p className="mt-3 text-sm font-semibold tracking-[0.1em] text-navy-foreground/60">+1 581 666 6246</p>

              <div className="mt-6 border-l-2 border-sport pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sport-foreground">
                  {lang === "fr" ? "Service d'information à venir" : "Information service upcoming"}
                </p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-navy-foreground/60">
                  {lang === "fr"
                    ? "Le numéro est réservé pour la future expérience d'information AHMV. Il n'est pas présenté comme un service automatisé actif."
                    : "The number is reserved for the future AHMV information experience. It is not presented as a live automated service."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[58dvh] overflow-y-auto p-6 sm:max-h-none sm:p-8 md:p-10">
          <p className="eyebrow text-sport">{lang === "fr" ? "Info AHMV" : "AHMV updates"}</p>
          <h2
            id="communications-preview-title"
            className="mt-3 max-w-[10ch] font-display text-5xl font-extrabold uppercase leading-[0.84] tracking-[-0.03em] text-navy sm:text-6xl"
          >
            {lang === "fr" ? "Restez connecté" : "Stay connected"}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {lang === "fr"
              ? "Horaires, nouvelles et informations importantes d'AHM Verdun, réunis dans une expérience simple pour les familles."
              : "Schedules, news and important AHM Verdun information, brought together in a simple family experience."}
          </p>

          <div className="mt-7 border-y border-navy/10 py-5">
            <p className="eyebrow text-muted-foreground">{lang === "fr" ? "Priorité parent" : "Parent priority"}</p>
            <p className="mt-2 font-display text-2xl font-extrabold uppercase text-navy">
              {lang === "fr" ? "Recevoir les horaires" : "Receive schedules"}
            </p>

            {subscribed ? (
              <div className="mt-4 border-l-4 border-sport bg-ice p-4">
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
              <form onSubmit={submitPreview} className="mt-4">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <input
                    id="communications-preview-email"
                    type="email"
                    required
                    placeholder={lang === "fr" ? "votre@courriel.ca" : "you@email.ca"}
                    className="h-12 w-full border border-input bg-background pl-10 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-sport"
                  />
                </div>
                <Button type="submit" variant="sport" size="lg" className="mt-3 w-full justify-between">
                  <span>{lang === "fr" ? "M'inscrire" : "Sign me up"}</span>
                  <ArrowRightIcon />
                </Button>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {lang === "fr"
                    ? "Démonstration visuelle seulement — aucune adresse n'est enregistrée ni transmise."
                    : "Visual demo only — no address is stored or transmitted."}
                </p>
              </form>
            )}
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline" size="lg">
              <Link to="/horaires" onClick={() => setOpen(false)}>
                <CalendarDays className="size-4" />
                {lang === "fr" ? "Voir les horaires" : "View schedules"}
              </Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={dismissForever}>
              {lang === "fr" ? "Ne plus afficher" : "Don't show again"}
            </Button>
          </div>

          <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
            <PhoneCall className="mt-0.5 size-3.5 shrink-0 text-sport" aria-hidden />
            <p>
              {lang === "fr"
                ? "Canal de communication en démonstration. Aucune donnée n'est enregistrée."
                : "Communication channel shown as a demo. No data is stored."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
