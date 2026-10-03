import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Bot, CalendarDays, Coffee, Globe2, Mail, PhoneCall, Sparkles, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useAhmvPhoneStatus } from "@/lib/use-ahmv-phone-status";
import { Button } from "@/components/ui/button";
import { LogoSlot } from "./logo-slot";
import { DEVELOPMENT_SUPPORT } from "@/lib/monetization";
import {
  ASSISTANT_LANGUAGE_OPTIONS,
  assistantUiLanguage,
  readAssistantLanguage,
  saveAssistantLanguage,
  type AssistantLanguageCode,
} from "@/lib/assistant-language";

const HIDE_KEY = "ahmv-communications-preview-hidden";
const SESSION_KEY = "ahmv-communications-preview-seen";

function popupCopy(language: AssistantLanguageCode) {
  const ui = assistantUiLanguage(language);

  if (ui === "es") {
    return {
      eyebrow: "Bienvenido a AHMV",
      title: "Tu hockey. Tus equipos. Todo aquí.",
      body: "Horarios, resultados, arenas, noticias y mini-sitios de equipos en una experiencia simple para las familias.",
      chooseTeams: "Elegir mis equipos",
      schedules: "Ver horarios",
      assistant: "Preguntar al asistente",
      newsletter: "Recibir novedades",
      emailPlaceholder: "tu@correo.ca",
      signup: "Inscribirme",
      demo: "Vista previa solamente — ningún correo se guarda ni se transmite.",
      phoneReady: "Toca para llamar ahora",
      phoneReserved: "Número reservado · activación final pendiente",
      fullSite: "Sitio completo: FR / EN · asistencia multilingüe en evolución",
      language: "Idioma",
      otherLanguages: "Otros idiomas",
      never: "No mostrar de nuevo",
      support: "Apoyar el desarrollo del sitio",
    };
  }

  if (ui === "en") {
    return {
      eyebrow: "Welcome to AHMV",
      title: "Your hockey. Your teams. All here.",
      body: "Schedules, results, arenas, news and team mini-sites in one simple family experience.",
      chooseTeams: "Choose my teams",
      schedules: "View schedules",
      assistant: "Ask the assistant",
      newsletter: "Receive updates",
      emailPlaceholder: "you@email.ca",
      signup: "Sign me up",
      demo: "Preview only — no email address is stored or transmitted.",
      phoneReady: "Tap to call now",
      phoneReserved: "Reserved number · final activation pending",
      fullSite: "Full site: FR / EN · multilingual assistance is expanding",
      language: "Language",
      otherLanguages: "Other languages",
      never: "Don't show again",
      support: "Support site development",
    };
  }

  return {
    eyebrow: "Bienvenue à l’AHMV",
    title: "Votre hockey. Vos équipes. Tout ici.",
    body: "Horaires, résultats, arénas, nouvelles et mini-sites d’équipes dans une expérience simple pour les familles.",
    chooseTeams: "Choisir mes équipes",
    schedules: "Voir les horaires",
    assistant: "Demander à l’assistant",
    newsletter: "Recevoir les nouvelles",
    emailPlaceholder: "votre@courriel.ca",
    signup: "M’inscrire",
    demo: "Aperçu seulement — aucune adresse n’est enregistrée ni transmise.",
    phoneReady: "Touchez pour appeler maintenant",
    phoneReserved: "Numéro réservé · activation finale en attente",
    fullSite: "Site complet : FR / EN · assistance multilingue en expansion",
    language: "Langue",
    otherLanguages: "Autres langues",
    never: "Ne plus afficher",
    support: "Soutenir le développement du site",
  };
}

export function CommunicationsPreview() {
  const { lang, setLang } = useI18n();
  const { phonePublic, phoneDisplay, phoneE164 } = useAhmvPhoneStatus();
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [assistantLanguage, setAssistantLanguage] = useState<AssistantLanguageCode>(lang);
  const copy = useMemo(() => popupCopy(assistantLanguage), [assistantLanguage]);
  const supportAvailable =
    DEVELOPMENT_SUPPORT.enabled &&
    (DEVELOPMENT_SUPPORT.customUrl || DEVELOPMENT_SUPPORT.tiers.some((tier) => Boolean(tier.url)));

  useEffect(() => {
    setAssistantLanguage(readAssistantLanguage(lang));
  }, [lang]);

  useEffect(() => {
    const closeForNavigation = () => setOpen(false);
    window.addEventListener("ahmv:navigation-open", closeForNavigation);
    window.addEventListener("ahmv:assistant-open", closeForNavigation);

    return () => {
      window.removeEventListener("ahmv:navigation-open", closeForNavigation);
      window.removeEventListener("ahmv:assistant-open", closeForNavigation);
    };
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(HIDE_KEY) === "1") return;
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;

    const timer = window.setTimeout(() => {
      if (document.body.style.overflow === "hidden") return;
      if (document.querySelector('[aria-controls="mobile-menu"][aria-expanded="true"]')) return;
      setOpen(true);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, []);

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

  if (!open) return null;

  const dismissForever = () => {
    window.localStorage.setItem(HIDE_KEY, "1");
    setOpen(false);
  };

  const submitPreview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  const chooseLanguage = (code: AssistantLanguageCode) => {
    setAssistantLanguage(code);
    saveAssistantLanguage(code);
    if (code === "fr" || code === "en") setLang(code);
  };

  const launchAssistant = () => {
    setOpen(false);
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("ahmv:assistant-open"));
    });
  };

  const phoneBlock = phonePublic ? (
    <a
      href={`tel:${phoneE164}`}
      className="group block border border-sport/35 bg-sport/10 p-4 transition-colors hover:bg-sport/15"
    >
      <div className="flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-sport" aria-hidden />
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport">
          {copy.phoneReady}
        </p>
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-none text-navy">
        {phoneDisplay}
      </p>
      <p className="mt-2 font-mono text-[10px] text-muted-foreground">{phoneE164}</p>
    </a>
  ) : (
    <div className="border border-navy/12 bg-ice p-4">
      <div className="flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-sport" aria-hidden />
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport">
          {copy.phoneReserved}
        </p>
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-none text-navy">
        {phoneDisplay}
      </p>
      <p className="mt-2 font-mono text-[10px] text-muted-foreground">{phoneE164}</p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center overflow-hidden bg-navy-deep/72 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:p-5"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="communications-preview-title"
        className="relative grid max-h-[min(92dvh,760px)] w-full max-w-[calc(100vw-1rem)] overflow-hidden border border-white/10 bg-background shadow-[0_32px_90px_-28px_rgba(0,0,0,0.76)] sm:max-w-5xl sm:grid-cols-[0.9fr_1.1fr]"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="tap-target absolute right-2 top-2 z-40 inline-flex size-11 items-center justify-center border border-white/25 bg-navy-deep/90 text-white shadow-lg backdrop-blur-md transition-transform active:scale-95 sm:right-3 sm:top-3"
          aria-label={assistantUiLanguage(assistantLanguage) === "fr" ? "Fermer" : assistantUiLanguage(assistantLanguage) === "es" ? "Cerrar" : "Close"}
        >
          <X className="size-5" />
        </button>

        <div className="relative hidden min-h-[610px] overflow-hidden bg-navy-deep p-8 text-navy-foreground sm:block md:p-10">
          <div className="arena-light" aria-hidden />
          <div className="light-beam left-[6%]" aria-hidden />
          <div className="light-beam left-[58%] [animation-delay:2.6s]" aria-hidden />
          <div className="ice-grain absolute inset-0 opacity-40" aria-hidden />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,15,39,0.05)_0%,rgba(6,15,39,0.70)_66%,rgba(6,15,39,0.98)_100%)]" aria-hidden />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center gap-4 pr-12">
              <LogoSlot size="lg" className="size-24 drop-shadow-[0_16px_30px_rgba(0,0,0,0.38)]" />
              <div>
                <p className="font-display text-3xl font-extrabold uppercase leading-none">AHM Verdun</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-foreground/55">
                  Leafs · Louves · Verdun
                </p>
              </div>
            </div>

            <div className="mt-auto pt-12">
              <div className="flex items-center gap-2">
                <PhoneCall className="size-5 text-sport-foreground" />
                <p className="eyebrow text-sport-foreground">
                  {phonePublic ? copy.phoneReady : copy.phoneReserved}
                </p>
              </div>
              {phonePublic ? (
                <a href={`tel:${phoneE164}`} className="mt-4 block font-display text-[clamp(3rem,6vw,5.6rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.04em] text-white transition-colors hover:text-sport-foreground">
                  1 (581)<br />666-6AHM
                </a>
              ) : (
                <p className="mt-4 font-display text-[clamp(3rem,6vw,5.6rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.04em] text-white">
                  1 (581)<br />666-6AHM
                </p>
              )}
              <p className="mt-3 font-mono text-xs tracking-[0.12em] text-white/52">+1 581 666 6246</p>

              <div className="mt-7 border-l-2 border-sport pl-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sport-foreground">
                  <Sparkles className="size-4" /> {copy.assistant}
                </p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/58">
                  {copy.body}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[min(92dvh,760px)] overflow-y-auto overscroll-contain p-5 pr-5 pt-14 sm:max-h-none sm:p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-2 border-b border-navy/10 pb-4">
            <Globe2 className="size-4 text-sport" />
            <span className="mr-1 text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {copy.language}
            </span>
            {ASSISTANT_LANGUAGE_OPTIONS.slice(0, 3).map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => chooseLanguage(option.code)}
                className={assistantLanguage === option.code
                  ? "premium-control min-h-9 border border-sport bg-sport/10 px-3 text-[10px] font-bold uppercase text-sport"
                  : "premium-control min-h-9 border border-navy/12 px-3 text-[10px] font-bold uppercase text-navy"}
              >
                {option.code.toUpperCase()}
              </button>
            ))}
            <select
              value={ASSISTANT_LANGUAGE_OPTIONS.slice(3).some((option) => option.code === assistantLanguage) ? assistantLanguage : ""}
              onChange={(event) => {
                const code = event.target.value as AssistantLanguageCode;
                if (code) chooseLanguage(code);
              }}
              className="h-9 min-w-32 border border-navy/12 bg-background px-2 text-[10px] font-bold uppercase text-navy outline-none"
              aria-label={copy.otherLanguages}
            >
              <option value="">+ {copy.otherLanguages}</option>
              {ASSISTANT_LANGUAGE_OPTIONS.slice(3).map((option) => (
                <option key={option.code} value={option.code}>{option.nativeLabel}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 sm:hidden">{phoneBlock}</div>

          <p className="eyebrow mt-5 text-sport">{copy.eyebrow}</p>
          <h2
            id="communications-preview-title"
            className="mt-2 max-w-[12ch] font-display text-4xl font-extrabold uppercase leading-[0.84] tracking-[-0.035em] text-navy sm:text-5xl"
          >
            {copy.title}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {copy.body}
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
            {copy.fullSite}
          </p>

          <button
            type="button"
            onClick={launchAssistant}
            className="premium-control mt-5 flex min-h-14 w-full items-center justify-between border border-sport/30 bg-competition px-4 text-left text-white hover:bg-navy-deep"
          >
            <span className="flex items-center gap-3">
              <span className="relative flex size-9 items-center justify-center border border-white/12 bg-white/[0.04]">
                <Bot className="size-4 text-sport-foreground" />
                <span className="absolute -right-1 -top-1 size-2 animate-pulse rounded-full bg-sport" />
              </span>
              <span>
                <span className="block font-display text-lg font-extrabold uppercase leading-none">{copy.assistant}</span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-white/38">Texte · voix · équipes · résultats</span>
              </span>
            </span>
            <Sparkles className="size-5 text-sport-foreground" />
          </button>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button asChild variant="sport" size="lg" className="justify-between">
              <Link to="/equipes" onClick={() => setOpen(false)}>
                {copy.chooseTeams}
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="justify-between">
              <Link to="/horaires" onClick={() => setOpen(false)}>
                <span className="flex items-center gap-2"><CalendarDays className="size-4" />{copy.schedules}</span>
                <ArrowRightIcon />
              </Link>
            </Button>
          </div>

          <div className="mt-5 border-y border-navy/10 py-5">
            <p className="eyebrow text-muted-foreground">{copy.newsletter}</p>

            {subscribed ? (
              <div className="mt-4 border-l-4 border-sport bg-ice p-4">
                <p className="font-semibold text-navy">✓</p>
                <p className="mt-1 text-sm text-muted-foreground">{copy.demo}</p>
              </div>
            ) : (
              <form onSubmit={submitPreview} className="mt-4">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <input
                    id="communications-preview-email"
                    type="email"
                    required
                    placeholder={copy.emailPlaceholder}
                    className="h-12 w-full border border-input bg-background pl-10 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-sport"
                  />
                </div>
                <Button type="submit" variant="outline" size="lg" className="mt-2 w-full justify-between">
                  <span>{copy.signup}</span>
                  <ArrowRightIcon />
                </Button>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{copy.demo}</p>
              </form>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" size="sm" onClick={dismissForever} className="justify-start">
              {copy.never}
            </Button>
            {supportAvailable && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("ahmv:support-open")));
                }}
                className="premium-control flex min-h-10 flex-1 items-center justify-between border border-sport/30 bg-sport/5 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-navy hover:border-sport"
              >
                <span className="flex items-center gap-2">
                  <Coffee className="size-4 text-sport" />
                  {copy.support}
                </span>
                <span className="text-sport">{DEVELOPMENT_SUPPORT.beneficiary}</span>
              </button>
            )}
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
