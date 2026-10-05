import { Download, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

const DISMISS_KEY = "ahmv-install-prompt-dismissed";
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const INITIAL_DELAY_MS = 6000;
const RETRY_MS = 2500;

function isStandalone() {
  const navigatorWithStandalone = navigator as NavigatorWithStandalone;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIosLike() {
  const ua = navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function attentionSurfaceOpen() {
  if (document.body.style.overflow === "hidden") return true;
  if (document.querySelector('[aria-controls="mobile-menu"][aria-expanded="true"]')) return true;
  return Boolean(document.querySelector("[data-ahmv-attention-surface]"));
}

export function InstallAppPrompt() {
  const { lang } = useI18n();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [manualInstallAvailable, setManualInstallAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setDismissed(true);
      return;
    }

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || "0");
    const recentlyDismissed =
      Number.isFinite(dismissedAt) &&
      dismissedAt > 0 &&
      Date.now() - dismissedAt < DISMISS_TTL_MS;

    if (!recentlyDismissed) {
      window.localStorage.removeItem(DISMISS_KEY);
    }

    setDismissed(recentlyDismissed);
    setManualInstallAvailable(isIosLike());

    const onBeforeInstallPrompt = (rawEvent: Event) => {
      rawEvent.preventDefault();
      setEvent(rawEvent as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setReady(false);
      setEvent(null);
      setManualInstallAvailable(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    const canOfferInstall = Boolean(event) || manualInstallAvailable;
    if (!canOfferInstall || dismissed || ready) return;

    let retryTimer: number | undefined;

    const attemptShow = () => {
      if (attentionSurfaceOpen()) return;
      setReady(true);
    };

    const initialTimer = window.setTimeout(() => {
      attemptShow();
      retryTimer = window.setInterval(attemptShow, RETRY_MS);
    }, INITIAL_DELAY_MS);

    return () => {
      window.clearTimeout(initialTimer);
      if (retryTimer !== undefined) window.clearInterval(retryTimer);
    };
  }, [dismissed, event, manualInstallAvailable, ready]);

  useEffect(() => {
    const suppress = () => {
      setReady(false);
      setShowInstructions(false);
    };
    window.addEventListener("ahmv:navigation-open", suppress);
    window.addEventListener("ahmv:assistant-open", suppress);
    return () => {
      window.removeEventListener("ahmv:navigation-open", suppress);
      window.removeEventListener("ahmv:assistant-open", suppress);
    };
  }, []);

  const canOfferInstall = Boolean(event) || manualInstallAvailable;
  if (!canOfferInstall || dismissed || !ready) return null;

  const install = async () => {
    if (!event) {
      setShowInstructions(true);
      return;
    }

    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") {
      setReady(false);
      setEvent(null);
    }
  };

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setReady(false);
    setDismissed(true);
    setShowInstructions(false);
  };

  const manualMode = manualInstallAvailable && !event;

  return (
    <aside
      data-ahmv-attention-surface="install-app"
      className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-xl border border-sport/35 bg-competition p-4 text-white shadow-[0_24px_70px_-34px_rgba(7,16,43,0.9)] lg:bottom-6 lg:left-6 lg:right-auto lg:m-0 lg:w-[380px]"
    >
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
            {manualMode
              ? lang === "fr"
                ? "Sur iPhone ou iPad, ajoutez AHM Verdun à l’écran d’accueil depuis le menu Partager."
                : "On iPhone or iPad, add AHM Verdun to your Home Screen from the Share menu."
              : lang === "fr"
                ? "Ajoutez le portail à votre écran d’accueil pour retrouver horaires, équipes et arénas plus vite."
                : "Add the portal to your home screen for faster access to schedules, teams and arenas."}
          </p>

          {showInstructions && manualMode && (
            <div className="mt-3 border border-white/12 bg-white/[0.05] p-3 text-xs leading-relaxed text-white/72">
              <p className="flex items-center gap-2 font-semibold text-white">
                <Share2 className="size-4 text-sport-foreground" />
                {lang === "fr" ? "Partager → Sur l’écran d’accueil → Ajouter" : "Share → Add to Home Screen → Add"}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={install}
            className="premium-control mt-4 inline-flex min-h-10 items-center gap-2 bg-sport px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
          >
            {manualMode ? <Share2 className="size-3.5" /> : <Download className="size-3.5" />}
            {manualMode
              ? lang === "fr"
                ? "Comment installer"
                : "How to install"
              : lang === "fr"
                ? "Installer"
                : "Install"}
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
