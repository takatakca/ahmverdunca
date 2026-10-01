import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface SpeechAlternativeLike {
  transcript: string;
}

interface SpeechResultLike {
  [index: number]: SpeechAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: SpeechResultLike;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type VoiceWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

const CATEGORY_WORDS: Array<[string, string]> = [
  ["vingt deux", "22"],
  ["twenty two", "22"],
  ["dix huit", "18"],
  ["eighteen", "18"],
  ["dix sept", "17"],
  ["seventeen", "17"],
  ["quinze", "15"],
  ["fifteen", "15"],
  ["treize", "13"],
  ["thirteen", "13"],
  ["douze", "12"],
  ["twelve", "12"],
  ["onze", "11"],
  ["eleven", "11"],
  ["neuf", "9"],
  ["nine", "9"],
  ["sept", "7"],
  ["seven", "7"],
  ["cinq", "5"],
  ["five", "5"],
];

export function normalizeVoiceTranscript(value: string) {
  let result = value.trim().replace(/-/g, " ");

  for (const [word, number] of CATEGORY_WORDS) {
    const pattern = new RegExp(`\\b(?:m|u|under)\\s*${word}\\b`, "gi");
    result = result.replace(pattern, `M${number}`);
  }

  result = result
    .replace(/\b(?:m|u)\s*(\d{1,2})\b/gi, "M$1")
    .replace(/\bunder\s*(\d{1,2})\b/gi, "M$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return result;
}

export function VoiceSearchButton({
  onTranscript,
  compact = false,
}: {
  onTranscript: (text: string) => void;
  compact?: boolean;
}) {
  const { lang } = useI18n();
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const voiceWindow = window as VoiceWindow;
    setSupported(Boolean(voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition));

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  if (!supported) return null;

  const startListening = () => {
    const voiceWindow = window as VoiceWindow;
    const Recognition = voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition;
    if (!Recognition || listening) return;

    const recognition = new Recognition();
    recognition.lang = lang === "fr" ? "fr-CA" : "en-CA";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) onTranscript(normalizeVoiceTranscript(transcript));
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "icon" : "default"}
      onClick={startListening}
      aria-pressed={listening}
      aria-label={
        listening
          ? (lang === "fr" ? "Écoute en cours" : "Listening")
          : (lang === "fr" ? "Rechercher avec la voix" : "Search by voice")
      }
      title={
        listening
          ? (lang === "fr" ? "Parlez maintenant…" : "Speak now…")
          : (lang === "fr" ? "Recherche vocale" : "Voice search")
      }
      className={listening ? "border-sport text-sport" : undefined}
    >
      {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
      {!compact && (
        <span>{listening ? (lang === "fr" ? "J'écoute…" : "Listening…") : (lang === "fr" ? "Voix" : "Voice")}</span>
      )}
    </Button>
  );
}
