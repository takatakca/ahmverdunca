import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bot, CalendarDays, Mic, PhoneCall, Send, Sparkles, Trophy, Users, X } from "lucide-react";
import { VoiceSearchButton } from "@/components/voice-search-button";
import { Button } from "@/components/ui/button";
import { buildAssistantReply, type AssistantReply } from "@/lib/ahmv-assistant";
import {
  ASSISTANT_LANGUAGE_OPTIONS,
  assistantUiLanguage,
  readAssistantLanguage,
  saveAssistantLanguage,
  speechLocaleForAssistant,
  type AssistantLanguageCode,
} from "@/lib/assistant-language";
import { useI18n } from "@/lib/i18n";
import { useAhmvPhoneStatus } from "@/lib/use-ahmv-phone-status";
import { usePreferredTeam } from "@/lib/team-preference";

const ASSISTANT_NUDGE_ENABLED =
  import.meta.env["VITE_ASSISTANT_NUDGE_ENABLED"] === "true";

function assistantCopy(language: AssistantLanguageCode) {
  const ui = assistantUiLanguage(language);
  if (ui === "es") {
    return {
      title: "Asistente AHMV",
      subtitle: "Guía inteligente · datos públicos validados",
      greeting: "Hola. Puedo encontrar tu equipo, horario, resultados, arena o inscripción. También puedo añadir un equipo a «Mis equipos».",
      placeholder: "Ej. resultados Louves, M11 Coyotes…",
      ask: "Preguntar",
      quickTeam: "Encontrar mi equipo",
      quickSchedule: "Horario",
      quickResults: "Resultados",
      quickMyTeams: "Mis equipos",
      phoneReady: "Llamar AHMV",
      close: "Cerrar asistente",
      language: "Idioma",
      saved: "Equipo añadido a «Mis equipos».",
    };
  }
  if (ui === "en") {
    return {
      title: "AHMV Assistant",
      subtitle: "Smart guide · text or voice · validated public data",
      greeting: "Hi. I can find your team, schedule, results, arena or registration. I can also add a team to “My teams”.",
      placeholder: "Ex. Louves results, M11 Coyotes…",
      ask: "Ask",
      quickTeam: "Find my team",
      quickSchedule: "Schedule",
      quickResults: "Results",
      quickMyTeams: "My teams",
      phoneReady: "Call AHMV",
      close: "Close assistant",
      language: "Language",
      saved: "Team added to “My teams”.",
    };
  }
  return {
    title: "Assistant AHMV",
    subtitle: "Guide intelligent · données publiques validées",
    greeting: "Salut. Je peux trouver votre équipe, horaire, résultats, aréna ou inscription. Je peux aussi ajouter une équipe à « Mes équipes ».",
    placeholder: "Ex. résultats Louves, M11 Coyotes…",
    ask: "Demander",
    quickTeam: "Trouver mon équipe",
    quickSchedule: "Horaire",
    quickResults: "Résultats",
    quickMyTeams: "Mes équipes",
    phoneReady: "Appeler AHMV",
    close: "Fermer l’assistant",
    language: "Langue",
    saved: "Équipe ajoutée à « Mes équipes ».",
  };
}

export function AhmvAssistant() {
  const { lang } = useI18n();
  const { phonePublic, phoneDisplay, phoneE164 } = useAhmvPhoneStatus();
  const { isTeamSelected, selectedTeamIds, toggleSelectedTeam } = usePreferredTeam();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [assistantLanguage, setAssistantLanguage] = useState<AssistantLanguageCode>(lang);
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [bookmarkNotice, setBookmarkNotice] = useState("");
  const [showNudge, setShowNudge] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const handingFocusAway = useRef(false);

  const showAssistant = useCallback((returnFocus?: HTMLElement | null) => {
    const opener = returnFocus ?? document.activeElement;
    returnFocusRef.current = opener instanceof HTMLElement && opener !== document.body && !opener.closest('[role="dialog"]')
      ? opener
      : triggerRef.current;
    handingFocusAway.current = false;
    setOpen(true);
    setShowNudge(false);
    setBookmarkNotice("");
    try {
      window.sessionStorage.setItem("ahmv-assistant-nudge-seen", "1");
    } catch {
      // Session storage is optional; the assistant must still open.
    }
  }, []);

  useEffect(() => {
    setAssistantLanguage(readAssistantLanguage(lang));
  }, [lang]);

  useEffect(() => {
    if (!ASSISTANT_NUDGE_ENABLED) return;

    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem("ahmv-assistant-nudge-seen") === "1";
    } catch {
      alreadySeen = false;
    }
    if (alreadySeen) return;

    const timer = window.setTimeout(() => {
      setShowNudge(true);
    }, 4200);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showNudge) return;

    const timer = window.setTimeout(() => {
      setShowNudge(false);
      try {
        window.sessionStorage.setItem("ahmv-assistant-nudge-seen", "1");
      } catch {
        // Session storage is optional.
      }
    }, 5800);

    return () => window.clearTimeout(timer);
  }, [showNudge]);



  useEffect(() => {
    const openAssistant = (event: Event) => {
      const detail = (event as CustomEvent<{ returnFocus?: unknown }>).detail;
      showAssistant(detail?.returnFocus instanceof HTMLElement ? detail.returnFocus : undefined);
    };
    const closeForAnotherSurface = () => {
      handingFocusAway.current = true;
      setOpen(false);
      setShowNudge(false);
    };
    window.addEventListener("ahmv:assistant-open", openAssistant);
    window.addEventListener("ahmv:welcome-open", closeForAnotherSurface);
    window.addEventListener("ahmv:install-open", closeForAnotherSurface);
    window.addEventListener("ahmv:navigation-open", closeForAnotherSurface);
    return () => {
      window.removeEventListener("ahmv:assistant-open", openAssistant);
      window.removeEventListener("ahmv:welcome-open", closeForAnotherSurface);
      window.removeEventListener("ahmv:install-open", closeForAnotherSurface);
      window.removeEventListener("ahmv:navigation-open", closeForAnotherSurface);
    };
  }, [showAssistant]);

  const copy = useMemo(() => assistantCopy(assistantLanguage), [assistantLanguage]);

  const nudgeCopy = useMemo(() => {
    const ui = assistantUiLanguage(assistantLanguage);
    if (ui === "es") return { title: "¿Necesitas ayuda?", body: "Habla al micrófono. Puedo encontrar equipo, horario, resultados o arena.", action: "Hablar" };
    if (ui === "en") return { title: "Need help?", body: "Talk to the mic. I can find a team, schedule, results or arena.", action: "Talk" };
    return { title: "Besoin d’aide?", body: "Parlez au micro. Je peux trouver équipe, horaire, résultats ou aréna.", action: "Parler" };
  }, [assistantLanguage]);

  const dismissNudge = () => {
    setShowNudge(false);
    try {
      window.sessionStorage.setItem("ahmv-assistant-nudge-seen", "1");
    } catch {
      // Session storage is optional.
    }
  };


  const chooseLanguage = (code: AssistantLanguageCode) => {
    setAssistantLanguage(code);
    saveAssistantLanguage(code);
    setReply(null);
    setBookmarkNotice("");
  };

  const run = (raw: string) => {
    const query = raw.trim();
    if (!query) return;

    const next = buildAssistantReply(query, assistantLanguage, { selectedTeamIds });
    setReply(next);
    setBookmarkNotice("");

    if (next.bookmarkTeamId && !isTeamSelected(next.bookmarkTeamId)) {
      toggleSelectedTeam(next.bookmarkTeamId);
      setBookmarkNotice(copy.saved);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    run(input);
  };

  const openAssistant = () => {
    window.dispatchEvent(new CustomEvent("ahmv:navigation-open"));
    showAssistant();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      {ASSISTANT_NUDGE_ENABLED && showNudge && !open && (
        <aside
          data-ahmv-attention-surface="assistant-nudge"
          className="rise fixed bottom-36 left-3 z-40 w-[min(19rem,calc(100vw-1.5rem))] border border-sport/45 bg-competition/97 p-3 text-white shadow-[0_22px_65px_-28px_rgba(0,0,0,0.95)] backdrop-blur lg:bottom-20 lg:left-4"
          aria-label={nudgeCopy.title}
        >
          <button
            type="button"
            onClick={dismissNudge}
            className="absolute right-2 top-2 flex size-8 items-center justify-center border border-white/10 text-white/55 transition hover:border-white/25 hover:text-white"
            aria-label={copy.close}
          >
            <X className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={openAssistant}
            className="group flex w-full items-start gap-3 pr-9 text-left"
          >
            <span className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center border border-white/12 bg-white/[0.05]">
              <Bot className="size-5 text-sport-foreground" />
              <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-sport text-white shadow-lg">
                <Mic className="size-3" aria-hidden />
              </span>
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xl font-extrabold uppercase leading-none">{nudgeCopy.title}</span>
              <span className="mt-1.5 block text-xs leading-relaxed text-white/62">{nudgeCopy.body}</span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-sport-foreground">
                <Mic className="size-3.5" aria-hidden />
                {nudgeCopy.action}
                <Sparkles className="size-3" aria-hidden />
              </span>
            </span>
          </button>
        </aside>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={openAssistant}
        className="premium-control fixed bottom-20 left-3 z-40 flex min-h-12 items-center gap-2 border border-sport/55 bg-competition/96 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_50px_-22px_rgba(0,0,0,0.95)] backdrop-blur lg:bottom-4 lg:left-4"
        aria-label={copy.title}
      >
        <span className="relative flex size-8 items-center justify-center border border-white/12 bg-white/[0.04]">
          <Bot className="size-4 text-sport-foreground" />
          <span className="absolute -right-1 -top-1 size-2 animate-pulse rounded-full bg-sport" aria-hidden />
        </span>
        <span className="hidden sm:inline">{copy.title}</span>
        <span className="inline-flex items-center gap-1 border-l border-white/12 pl-2 text-[8px] font-bold uppercase tracking-[0.12em] text-white/65">
          <Mic className="size-3.5 text-sport-foreground" aria-hidden />
          <span className="hidden md:inline">{assistantUiLanguage(assistantLanguage) === "fr" ? "Parler" : assistantUiLanguage(assistantLanguage) === "es" ? "Hablar" : "Talk"}</span>
        </span>
        <Sparkles className="size-3.5 text-sport-foreground" aria-hidden />
      </button>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay asChild>
          <div className="fixed inset-0 z-[115] flex items-end justify-start bg-navy-deep/55 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-end sm:bg-transparent sm:p-4">
            <DialogPrimitive.Content
              data-ahmv-attention-surface="assistant-dialog"
              aria-modal="true"
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                closeButtonRef.current?.focus();
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                if (handingFocusAway.current) return;
                const target = returnFocusRef.current?.isConnected ? returnFocusRef.current : triggerRef.current;
                target?.focus();
              }}
              className="w-full max-w-md overflow-hidden border border-white/12 bg-navy-deep text-white shadow-[0_32px_90px_-28px_rgba(0,0,0,0.78)] outline-none"
            >
            <div className="bg-competition p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center border border-white/12 bg-white/[0.04]">
                    <Bot className="size-5 text-sport-foreground" />
                  </span>
                  <div>
                    <DialogPrimitive.Title className="font-display text-2xl font-extrabold uppercase leading-none">{copy.title}</DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/42">{copy.subtitle}</DialogPrimitive.Description>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="premium-control flex size-11 shrink-0 items-center justify-center border border-white/15"
                  aria-label={copy.close}
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.15em] text-white/38">{copy.language}</span>
                {ASSISTANT_LANGUAGE_OPTIONS.slice(0, 3).map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => chooseLanguage(option.code)}
                    className={assistantLanguage === option.code
                      ? "premium-control min-h-9 shrink-0 border border-sport bg-sport/12 px-3 text-[10px] font-bold uppercase text-sport-foreground"
                      : "premium-control min-h-9 shrink-0 border border-white/12 px-3 text-[10px] font-bold uppercase text-white/65"}
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
                  className="h-9 min-w-28 border border-white/12 bg-competition px-2 text-[10px] font-bold uppercase text-white/70 outline-none"
                  aria-label={copy.language}
                >
                  <option value="">+ LANG</option>
                  {ASSISTANT_LANGUAGE_OPTIONS.slice(3).map((option) => (
                    <option key={option.code} value={option.code}>{option.nativeLabel}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="max-h-[62dvh] overflow-y-auto overscroll-contain bg-navy-deep p-5">
              <div className="border-l-4 border-sport bg-competition p-4">
                <p className="text-sm leading-relaxed text-white/78">{reply?.text ?? copy.greeting}</p>
                {bookmarkNotice && (
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-sport-foreground">{bookmarkNotice}</p>
                )}
              </div>

              {reply && reply.actions.length > 0 && (
                <div className="mt-3 grid gap-2" aria-live="polite">
                  {reply.actions.map((action, index) => (
                    <a
                      key={`${action.kind}-${action.href}-${index}`}
                      href={action.href}
                      onClick={() => { if (!action.external) setOpen(false); }}
                      target={action.external ? "_blank" : undefined}
                      rel={action.external ? "noopener noreferrer" : undefined}
                      className="premium-control flex min-h-11 items-center justify-between border border-white/12 bg-navy px-4 text-xs font-bold uppercase tracking-[0.08em] text-white/74 hover:border-sport hover:bg-white/[0.05] hover:text-white"
                    >
                      <span className="line-clamp-2">{action.label}</span>
                      {action.kind === "results" ? <Trophy className="size-4 shrink-0 text-sport-foreground" /> : action.kind === "schedule" ? <CalendarDays className="size-4 shrink-0 text-sport-foreground" /> : <Users className="size-4 shrink-0 text-sport-foreground" />}
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setInput("M11 Coyotes"); run("M11 Coyotes"); }} className="premium-control border border-white/12 bg-white/[0.03] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-white/68 hover:border-sport hover:text-white">
                  {copy.quickTeam}
                </button>
                <button type="button" onClick={() => { setInput(copy.quickSchedule); run(copy.quickSchedule); }} className="premium-control border border-navy/12 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-navy">
                  {copy.quickSchedule}
                </button>
                <button type="button" onClick={() => { setInput(copy.quickResults); run(copy.quickResults); }} className="premium-control border border-navy/12 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-navy">
                  {copy.quickResults}
                </button>
                <button type="button" onClick={() => { setInput(copy.quickMyTeams); run(copy.quickMyTeams); }} className="premium-control border border-sport/35 bg-sport/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-sport-foreground">
                  {copy.quickMyTeams}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 border-l-2 border-sport bg-sport/10 px-3 py-2 text-[10px] font-semibold text-white/72">
                <Mic className="size-4 shrink-0 text-sport-foreground" aria-hidden />
                <span>{assistantUiLanguage(assistantLanguage) === "fr" ? "Vous pouvez parler directement au micro pour trouver une équipe, un horaire, un résultat ou une aréna." : assistantUiLanguage(assistantLanguage) === "es" ? "Puedes hablar directamente al micrófono para encontrar un equipo, horario, resultado o arena." : "You can speak directly into the microphone to find a team, schedule, result or arena."}</span>
              </div>

              <form onSubmit={submit} className="mt-3">
                <label htmlFor="ahmv-assistant-input" className="sr-only">{copy.ask}</label>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <input
                    id="ahmv-assistant-input"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={copy.placeholder}
                    autoComplete="off"
                    className="h-12 min-w-0 border border-white/12 bg-competition px-3 text-sm text-white placeholder:text-white/34 outline-none focus:border-sport"
                  />
                  <VoiceSearchButton
                    compact
                    recognitionLocale={speechLocaleForAssistant(assistantLanguage)}
                    onTranscript={(transcript) => {
                      setInput(transcript);
                      run(transcript);
                    }}
                  />
                  <Button type="submit" variant="sport" size="icon" className="size-12" aria-label={copy.ask}>
                    <Send className="size-4" />
                  </Button>
                </div>
              </form>

              <div className="mt-4 border-t border-white/10 pt-4">
                {phonePublic ? (
                  <a href={`tel:${phoneE164}`} className="premium-control flex min-h-11 items-center justify-between bg-navy px-4 text-xs font-bold uppercase tracking-[0.1em] text-white">
                    <span className="flex items-center gap-2"><PhoneCall className="size-4 text-sport-foreground" />{copy.phoneReady}</span>
                    <span className="font-mono text-[10px] text-white/58">{phoneDisplay}</span>
                  </a>
                ) : null}
                <p className="mt-2 text-[10px] leading-relaxed text-white/42">
                  {assistantUiLanguage(assistantLanguage) === "fr"
                    ? "Pour les heures et résultats, le guide vous dirige vers les liens hockey officiels."
                    : assistantUiLanguage(assistantLanguage) === "es"
                      ? "Para horarios y resultados, el asistente te dirige a las fuentes oficiales de hockey."
                      : "For times and results, the guide points you to the official hockey links."}
                </p>
              </div>
            </div>
            </DialogPrimitive.Content>
          </div>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
