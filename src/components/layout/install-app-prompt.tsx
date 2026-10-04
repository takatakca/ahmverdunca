import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "ahmv-install-prompt-dismissed";

export function InstallAppPrompt() {
  const { lang } = useI18n();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");

    const onBeforeInstallPrompt = (rawEvent: Event) => {
      rawEvent.preventDefault();
      setEvent(rawEvent as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!event || dismissed) return;

    const timer = window.setTimeout(() => {
      if (document.body.style.overflow === "hidden") return;
      if (document.querySelector('[aria-controls="mobile-menu"][aria-expanded="true"]')) return;
      if (document.querySelector("[data-ahmv-attention-surface]")) return;
      setReady(true);
    }, 24000);

    return () => window.clearTimeout(timer);
  }, [dismissed, event]);

  useEffect(() => {
    const suppress = () => setReady(false);
    window.addEventListener("ahmv:navigation-open", suppress);
    window.addEventListener("ahmv:assistant-open", suppress);
    return () => {
      window.removeEventListener("ahmv:navigation-open", suppress);
      window.removeEventListener("ahmv:assistant-open", suppress);
    };
  }, []);


  if (!event || dismissed || !ready) return null;

  const install = async () => {
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") {
      setReady(false);
      setEvent(null);
    }
  };

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setReady(false);
    setDismissed(true);
  };

  return (
    <aside data-ahmv-attention-surface="install-app" className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-xl border border-sport/35 bg-competition p-4 text-white shadow-[0_24px_70px_-34px_rgba(7,16,43,0.9)] lg:bottom-6 lg:left-6 lg:right-auto lg:m-0 lg:w-[380px]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center bg-sport text-sport-foreground">
          <Download className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-sport-foreground">
            {lang === "fr" ? "Accès rapide téléphone" : "Quick phone access"}
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-[0.9]">
            {lang === "fr" ? "Installer AHM Verdun" : "Install AHM Verdun"}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/58">
            {lang === "fr"
              ? "Ajoutez le portail à votre écran d’accueil pour retrouver horaires, équipes et arénas plus vite."
              : "Add the portal to your home screen for faster access to schedules, teams and arenas."}
          </p>
          <button
            type="button"
            onClick={install}
            className="premium-control mt-4 inline-flex min-h-10 items-center gap-2 bg-sport px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
          >
            <Download className="size-3.5" />
            {lang === "fr" ? "Installer" : "Install"}
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="premium-control flex size-8 shrink-0 items-center justify-center border border-white/14 text-white/65"
          aria-label={lang === "fr" ? "Fermer" : "Close"}
        >
          <X className="size-4" />
        </button>
      </div>
    </aside>
  );
}
