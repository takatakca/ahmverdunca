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
      if (transcript) onTranscript(transcript);
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
