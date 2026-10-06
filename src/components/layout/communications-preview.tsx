import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bot, CalendarDays, Coffee, Globe2, PhoneCall, Sparkles, Users, X } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useAhmvPhoneStatus } from "@/lib/use-ahmv-phone-status";
import { Button } from "@/components/ui/button";
import { AlertStatus } from "./alert-status";
import { LogoSlot } from "./logo-slot";
import { DEVELOPMENT_SUPPORT } from "@/lib/monetization";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { usePreferredTeam } from "@/lib/team-preference";
import { publicTeamHubUrl } from "@/data/team-directory";
import { startWelcomeAutoOpen, welcomeEnabled } from "@/lib/welcome-policy";
import {
  ASSISTANT_LANGUAGE_OPTIONS,
  assistantUiLanguage,
  readAssistantLanguage,
  saveAssistantLanguage,
  type AssistantLanguageCode,
} from "@/lib/assistant-language";

const COMMUNICATIONS_PREVIEW_ENABLED = welcomeEnabled(
  import.meta.env["VITE_COMMUNICATIONS_PREVIEW_ENABLED"],
);

const HIDE_KEY = "ahmv-communications-preview-hidden";
const SESSION_KEY = "ahmv-communications-preview-seen";

function readSuppression(kind: "localStorage" | "sessionStorage", key: string) {
  try {
    return window[kind].getItem(key) === "1";
  } catch {
    return false;
  }
}

function rememberSuppression(kind: "localStorage" | "sessionStorage", key: string) {
  try {
    window[kind].setItem(key, "1");
  } catch {
    // Welcome navigation remains available when optional storage is blocked.
  }
}

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
    language: "Langue",
    otherLanguages: "Plus",
    never: "Ne plus afficher",
    support: "Soutenir le site",
  };
}

export function CommunicationsPreview() {
  if (!COMMUNICATIONS_PREVIEW_ENABLED) return null;
  return <EnabledCommunicationsPreview />;
}

function EnabledCommunicationsPreview() {
  const { lang, setLang } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { phonePublic, phoneDisplay, phoneE164 } = useAhmvPhoneStatus();
  const { selectedTeams } = usePreferredTeam();
  const primaryTeam = selectedTeams[0];
  const [open, setOpen] = useState(false);
  const shownThisMount = useRef(false);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const [assistantLanguage, setAssistantLanguage] = useState<AssistantLanguageCode>(lang);
  const copy = useMemo(() => popupCopy(assistantLanguage), [assistantLanguage]);
  const supportAvailable =
    DEVELOPMENT_SUPPORT.enabled &&
    (DEVELOPMENT_SUPPORT.customUrl || DEVELOPMENT_SUPPORT.tiers.some((tier) => Boolean(tier.url)));

  const openWelcome = useCallback(() => {
    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    shownThisMount.current = true;
    rememberSuppression("sessionStorage", SESSION_KEY);
    setOpen(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      setAssistantLanguage(readAssistantLanguage(lang));
    } catch {
      setAssistantLanguage(lang);
    }
  }, [lang]);

  useEffect(() => {
    const closeForNavigation = () => {
      setOpen(false);
    };
    window.addEventListener("ahmv:welcome-open", openWelcome);
    window.addEventListener("ahmv:navigation-open", closeForNavigation);
    window.addEventListener("ahmv:assistant-open", closeForNavigation);

    return () => {
      window.removeEventListener("ahmv:welcome-open", openWelcome);
      window.removeEventListener("ahmv:navigation-open", closeForNavigation);
      window.removeEventListener("ahmv:assistant-open", closeForNavigation);
    };
  }, [openWelcome]);

  useEffect(() => {
    return startWelcomeAutoOpen(
      () => ({
        hidden: readSuppression("localStorage", HIDE_KEY),
        sessionSeen: shownThisMount.current || readSuppression("sessionStorage", SESSION_KEY),
        attentionBusy: document.body.style.overflow === "hidden"
          || Boolean(document.querySelector('[aria-controls="mobile-menu"][aria-expanded="true"]'))
          || Boolean(document.querySelector('[data-ahmv-attention-surface], [role="dialog"][aria-modal="true"]')),
      }),
      openWelcome,
      { set: (callback, delay) => window.setTimeout(callback, delay), clear: (id) => window.clearTimeout(id) },
    );
  }, [openWelcome]);

  const dismissForever = () => {
    rememberSuppression("localStorage", HIDE_KEY);
    setOpen(false);
  };

  const chooseLanguage = (code: AssistantLanguageCode) => {
    setAssistantLanguage(code);
    try {
      saveAssistantLanguage(code);
    } catch {
      // The language choice still applies to this visit without persistent storage.
    }
    if (code === "fr" || code === "en") setLang(code);
  };

  const launchAssistant = () => {
    setOpen(false);
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("ahmv:assistant-open"));
    });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[310] bg-navy-deep/48 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
        data-ahmv-attention-surface="communications-dialog"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButton.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (previouslyFocused.current?.isConnected) previouslyFocused.current.focus();
        }}
        className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-1/2 z-[320] flex max-h-[calc(100dvh-1rem-env(safe-area-inset-bottom))] w-[calc(100%-1rem)] max-w-[520px] -translate-x-1/2 flex-col overflow-hidden border border-white/12 bg-navy-deep text-white shadow-[0_28px_80px_-36px_rgba(0,0,0,0.9)] outline-none sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
      >
        <div className="flex shrink-0 items-start bg-competition pt-2 text-white">
          <div className="min-w-0 flex-1"><AlertStatus language={assistantUiLanguage(assistantLanguage)} /></div>
          <button
            ref={closeButton}
            type="button"
            onClick={() => setOpen(false)}
            className="premium-control mr-2 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20"
            aria-label={assistantUiLanguage(assistantLanguage) === "fr" ? "Fermer" : assistantUiLanguage(assistantLanguage) === "es" ? "Cerrar" : "Close"}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="relative shrink-0 h-[106px] overflow-hidden bg-competition sm:h-[128px]">
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
              <DialogPrimitive.Title
                className="mt-1 max-w-[14ch] font-display text-2xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-3xl"
              >
                {copy.title}
              </DialogPrimitive.Title>
            </div>
          </div>

        </div>

        <div className="min-h-0 overflow-y-auto bg-navy-deep p-4 sm:max-h-[470px] sm:p-5">
          <DialogPrimitive.Description className="max-w-xl text-xs leading-relaxed text-white/58">{copy.body}</DialogPrimitive.Description>

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
            <Button asChild variant="outline-light" className="h-auto min-h-[58px] flex-col gap-1 px-2 py-3">
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

          {phonePublic && <div className="mt-4">
              <a
                href={`tel:${phoneE164}`}
                className="premium-control flex min-h-11 items-center justify-between border border-sport/35 bg-sport/10 px-3 text-white"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center bg-sport text-sport-foreground">
                    <PhoneCall className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-sport-foreground">{copy.phoneReady}</span>
                    <span className="mt-0.5 block font-display text-lg font-extrabold uppercase leading-none">{phoneDisplay}</span>
                  </span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground">1 clic</span>
              </a>
          </div>}

          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-3">
            <Globe2 className="size-4 text-sport-foreground" />
            <span className="mr-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/42">{copy.language}</span>
            {ASSISTANT_LANGUAGE_OPTIONS.slice(0, 3).map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => chooseLanguage(option.code)}
                className={assistantLanguage === option.code
                  ? "premium-control min-h-8 border border-sport bg-sport/10 px-3 text-[9px] font-bold uppercase text-sport"
                  : "premium-control min-h-8 border border-white/12 px-3 text-[9px] font-bold uppercase text-white/62 hover:border-sport hover:text-white"}
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
              className="h-8 min-w-24 border border-white/12 bg-competition px-2 text-[9px] font-bold uppercase text-white outline-none"
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
              className="min-h-10 text-[9px] font-bold uppercase tracking-[0.12em] text-white/60 hover:text-white"
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
                className="premium-control inline-flex min-h-10 items-center gap-2 border border-sport/25 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white"
              >
                <Coffee className="size-3.5 text-sport" />
                {copy.support}
                <Sparkles className="size-3 text-sport" />
              </button>
            )}
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
