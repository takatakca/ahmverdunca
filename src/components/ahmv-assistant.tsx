import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Bot, CalendarDays, PhoneCall, Send, Sparkles, Trophy, Users, X } from "lucide-react";
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
      phoneReserved: "Número reservado",
      close: "Cerrar asistente",
      language: "Idioma",
      saved: "Equipo añadido a «Mis equipos».",
    };
  }
  if (ui === "en") {
    return {
      title: "AHMV Assistant",
      subtitle: "Smart guide · validated public data",
      greeting: "Hi. I can find your team, schedule, results, arena or registration. I can also add a team to “My teams”.",
      placeholder: "Ex. Louves results, M11 Coyotes…",
      ask: "Ask",
      quickTeam: "Find my team",
      quickSchedule: "Schedule",
      quickResults: "Results",
      quickMyTeams: "My teams",
      phoneReady: "Call AHMV",
      phoneReserved: "Reserved number",
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
    phoneReserved: "Numéro réservé",
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

  useEffect(() => {
    setAssistantLanguage(readAssistantLanguage(lang));
  }, [lang]);

  useEffect(() => {
    const openAssistant = () => {
      setOpen(true);
      setBookmarkNotice("");
    };
    window.addEventListener("ahmv:assistant-open", openAssistant);
    return () => window.removeEventListener("ahmv:assistant-open", openAssistant);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    if (window.innerWidth < 640) document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const copy = useMemo(() => assistantCopy(assistantLanguage), [assistantLanguage]);

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
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openAssistant}
        className="premium-control fixed bottom-20 left-3 z-40 flex min-h-12 items-center gap-2 border border-sport/40 bg-competition/96 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_50px_-26px_rgba(0,0,0,0.9)] backdrop-blur lg:bottom-4 lg:left-4"
        aria-label={copy.title}
      >
        <span className="relative flex size-8 items-center justify-center border border-white/12 bg-white/[0.04]">
          <Bot className="size-4 text-sport-foreground" />
          <span className="absolute -right-1 -top-1 size-2 animate-pulse rounded-full bg-sport" aria-hidden />
        </span>
        <span className="hidden sm:inline">{copy.title}</span>
        <Sparkles className="size-3.5 text-sport-foreground" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-[115] flex items-end justify-start bg-navy-deep/55 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-end sm:bg-transparent sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ahmv-assistant-title"
            className="w-full max-w-md overflow-hidden border border-white/12 bg-background shadow-[0_32px_90px_-28px_rgba(0,0,0,0.78)]"
          >
            <div className="bg-competition p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center border border-white/12 bg-white/[0.04]">
                    <Bot className="size-5 text-sport-foreground" />
                  </span>
                  <div>
                    <p id="ahmv-assistant-title" className="font-display text-2xl font-extrabold uppercase leading-none">{copy.title}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/42">{copy.subtitle}</p>
                  </div>
                </div>
                <button
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

            <div className="max-h-[62dvh] overflow-y-auto overscroll-contain p-5">
              <div className="border-l-4 border-sport bg-ice p-4">
                <p className="text-sm leading-relaxed text-navy">{reply?.text ?? copy.greeting}</p>
                {bookmarkNotice && (
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-sport">{bookmarkNotice}</p>
                )}
              </div>

              {reply && reply.actions.length > 0 && (
                <div className="mt-3 grid gap-2" aria-live="polite">
                  {reply.actions.map((action, index) => (
                    <a
                      key={`${action.kind}-${action.href}-${index}`}
                      href={action.href}
                      target={action.external ? "_blank" : undefined}
                      rel={action.external ? "noopener noreferrer" : undefined}
                      className="premium-control flex min-h-11 items-center justify-between border border-navy/12 px-4 text-xs font-bold uppercase tracking-[0.08em] text-navy hover:border-sport hover:bg-ice"
                    >
                      <span className="line-clamp-2">{action.label}</span>
                      {action.kind === "results" ? <Trophy className="size-4 shrink-0 text-sport" /> : action.kind === "schedule" ? <CalendarDays className="size-4 shrink-0 text-sport" /> : <Users className="size-4 shrink-0 text-sport" />}
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setInput("M11 Coyotes"); run("M11 Coyotes"); }} className="premium-control border border-navy/12 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-navy">
                  {copy.quickTeam}
                </button>
                <button type="button" onClick={() => { setInput(copy.quickSchedule); run(copy.quickSchedule); }} className="premium-control border border-navy/12 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-navy">
                  {copy.quickSchedule}
                </button>
                <button type="button" onClick={() => { setInput(copy.quickResults); run(copy.quickResults); }} className="premium-control border border-navy/12 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-navy">
                  {copy.quickResults}
                </button>
                <button type="button" onClick={() => { setInput(copy.quickMyTeams); run(copy.quickMyTeams); }} className="premium-control border border-sport/30 bg-sport/5 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-navy">
                  {copy.quickMyTeams}
                </button>
              </div>

              <form onSubmit={submit} className="mt-4">
                <label htmlFor="ahmv-assistant-input" className="sr-only">{copy.ask}</label>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <input
                    id="ahmv-assistant-input"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={copy.placeholder}
                    autoComplete="off"
                    className="h-12 min-w-0 border border-navy/12 bg-background px-3 text-sm outline-none focus:border-sport"
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

              <div className="mt-4 border-t border-navy/10 pt-4">
                {phonePublic ? (
                  <a href={`tel:${phoneE164}`} className="premium-control flex min-h-11 items-center justify-between bg-navy px-4 text-xs font-bold uppercase tracking-[0.1em] text-white">
                    <span className="flex items-center gap-2"><PhoneCall className="size-4 text-sport-foreground" />{copy.phoneReady}</span>
                    <span className="font-mono text-[10px] text-white/58">{phoneDisplay}</span>
                  </a>
                ) : (
                  <div className="flex min-h-11 items-center justify-between border border-navy/12 px-4 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-2"><PhoneCall className="size-4 text-sport" />{copy.phoneReserved}</span>
                    <span className="font-mono text-[10px]">{phoneDisplay}</span>
                  </div>
                )}
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                  {assistantUiLanguage(assistantLanguage) === "fr"
                    ? "Le guide n’invente jamais un horaire ou un résultat officiel. Les liens hockey demeurent la source d’autorité."
                    : assistantUiLanguage(assistantLanguage) === "es"
                      ? "El asistente nunca inventa un horario o resultado oficial. Las fuentes oficiales de hockey siguen siendo la autoridad."
                      : "The guide never invents an official schedule or result. Official hockey sources remain authoritative."}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
