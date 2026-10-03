import { useEffect, useMemo, useState } from "react";
import { Bot, CalendarDays, Coffee, Globe2, PhoneCall, Sparkles, Users, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useAhmvPhoneStatus } from "@/lib/use-ahmv-phone-status";
import { Button } from "@/components/ui/button";
import { LogoSlot } from "./logo-slot";
import { DEVELOPMENT_SUPPORT } from "@/lib/monetization";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { usePreferredTeam } from "@/lib/team-preference";
import { publicTeamHubUrl } from "@/data/team-directory";
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
      eyebrow: "AHMV · Verdun",
      title: "Tu hockey. Todo aquí.",
      body: "Equipos, horarios, resultados, arenas y noticias en una experiencia simple.",
      chooseTeams: "Mis equipos",
      schedules: "Horarios",
      assistant: "Asistente",
      phoneReady: "Llamar AHMV",
      phoneReserved: "Número reservado",
      language: "Idioma",
      otherLanguages: "Más",
      never: "No mostrar de nuevo",
      support: "Apoyar el sitio",
    };
  }

  if (ui === "en") {
    return {
      eyebrow: "AHMV · Verdun",
      title: "Your hockey. All here.",
      body: "Teams, schedules, results, arenas and news in one simple experience.",
      chooseTeams: "My teams",
      schedules: "Schedules",
      assistant: "Assistant",
      phoneReady: "Call AHMV",
      phoneReserved: "Reserved number",
      language: "Language",
      otherLanguages: "More",
      never: "Don't show again",
      support: "Support the site",
    };
  }

  return {
    eyebrow: "AHMV · Verdun",
    title: "Votre hockey. Tout ici.",
    body: "Équipes, horaires, résultats, arénas et nouvelles dans une expérience simple.",
    chooseTeams: "Mes équipes",
    schedules: "Horaires",
    assistant: "Assistant",
    phoneReady: "Appeler AHMV",
    phoneReserved: "Numéro réservé",
    language: "Langue",
    otherLanguages: "Plus",
    never: "Ne plus afficher",
    support: "Soutenir le site",
  };
}

export function CommunicationsPreview() {
  const { lang, setLang } = useI18n();
  const { phonePublic, phoneDisplay, phoneE164 } = useAhmvPhoneStatus();
  const { selectedTeams } = usePreferredTeam();
  const primaryTeam = selectedTeams[0];
  const [open, setOpen] = useState(false);
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
    }, 2600);

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

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-navy-deep/48 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:items-center sm:p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="communications-preview-title"
        className="relative w-full max-w-[520px] overflow-hidden border border-white/12 bg-background shadow-[0_28px_80px_-36px_rgba(0,0,0,0.8)]"
      >
        <div className="relative h-[106px] overflow-hidden bg-competition sm:h-[128px]">
          <img
            src={OFFICIAL_MEDIA.practiceGoalie.url}
            alt={lang === "fr" ? OFFICIAL_MEDIA.practiceGoalie.alt.fr : OFFICIAL_MEDIA.practiceGoalie.alt.en}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,43,0.94)_0%,rgba(7,16,43,0.62)_54%,rgba(7,16,43,0.20)_100%)]" />
          <div className="relative flex h-full items-end gap-3 p-4 pr-14 text-white sm:p-5 sm:pr-16">
            <LogoSlot className="size-11 sm:size-12" />
            <div>
              <p className="eyebrow text-sport-foreground">{copy.eyebrow}</p>
              <h2
                id="communications-preview-title"
                className="mt-1 max-w-[14ch] font-display text-2xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-3xl"
              >
                {copy.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="premium-control absolute right-2.5 top-2.5 flex size-9 items-center justify-center border border-white/20 bg-navy-deep/72 text-white backdrop-blur"
            aria-label={assistantUiLanguage(assistantLanguage) === "fr" ? "Fermer" : assistantUiLanguage(assistantLanguage) === "es" ? "Cerrar" : "Close"}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto p-4 sm:max-h-[470px] sm:p-5">
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">{copy.body}</p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Button asChild variant="sport" className="h-auto min-h-[58px] flex-col gap-1 px-2 py-2.5">
              {primaryTeam ? (
                <a href={publicTeamHubUrl(primaryTeam)} onClick={() => setOpen(false)}>
                  <Users className="size-4" />
                  <span className="max-w-full truncate text-[9px] uppercase tracking-[0.08em]">
                    {primaryTeam.name}
                  </span>
                </a>
              ) : (
                <Link to="/equipes" onClick={() => setOpen(false)}>
                  <Users className="size-4" />
                  <span className="text-[9px] uppercase tracking-[0.08em]">{copy.chooseTeams}</span>
                </Link>
              )}
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-[58px] flex-col gap-1 px-2 py-3">
              <Link to="/horaires" onClick={() => setOpen(false)}>
                <CalendarDays className="size-4 text-sport" />
                <span className="text-[9px] uppercase tracking-[0.08em]">{copy.schedules}</span>
              </Link>
            </Button>
            <button
              type="button"
              onClick={launchAssistant}
              className="premium-control flex min-h-[58px] flex-col items-center justify-center gap-1 border border-sport/35 bg-competition px-2 py-3 text-white"
            >
              <Bot className="size-4 text-sport-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-[0.08em]">{copy.assistant}</span>
            </button>
          </div>

          <div className="mt-4">
            {phonePublic ? (
              <a
                href={`tel:${phoneE164}`}
                className="premium-control flex min-h-11 items-center justify-between border border-sport/30 bg-sport/8 px-3 text-navy"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center bg-sport text-sport-foreground">
                    <PhoneCall className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-sport">{copy.phoneReady}</span>
                    <span className="mt-0.5 block font-display text-lg font-extrabold uppercase leading-none">{phoneDisplay}</span>
                  </span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-sport">1 clic</span>
              </a>
            ) : (
              <div className="flex min-h-11 items-center justify-between border border-navy/10 bg-ice px-3 text-navy">
                <span className="flex items-center gap-3">
                  <PhoneCall className="size-4 text-sport" />
                  <span>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{copy.phoneReserved}</span>
                    <span className="mt-0.5 block font-display text-lg font-extrabold uppercase leading-none">{phoneDisplay}</span>
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-navy/10 pt-3">
            <Globe2 className="size-4 text-sport" />
            <span className="mr-1 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{copy.language}</span>
            {ASSISTANT_LANGUAGE_OPTIONS.slice(0, 3).map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => chooseLanguage(option.code)}
                className={assistantLanguage === option.code
                  ? "premium-control min-h-8 border border-sport bg-sport/10 px-3 text-[9px] font-bold uppercase text-sport"
                  : "premium-control min-h-8 border border-navy/10 px-3 text-[9px] font-bold uppercase text-navy"}
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
              className="h-8 min-w-24 border border-navy/10 bg-background px-2 text-[9px] font-bold uppercase text-navy outline-none"
              aria-label={copy.otherLanguages}
            >
              <option value="">+ {copy.otherLanguages}</option>
              {ASSISTANT_LANGUAGE_OPTIONS.slice(3).map((option) => (
                <option key={option.code} value={option.code}>{option.nativeLabel}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={dismissForever}
              className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground hover:text-navy"
            >
              {copy.never}
            </button>

            {supportAvailable && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("ahmv:support-open")));
                }}
                className="premium-control inline-flex min-h-9 items-center gap-2 border border-sport/25 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-navy"
              >
                <Coffee className="size-3.5 text-sport" />
                {copy.support}
                <Sparkles className="size-3 text-sport" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
