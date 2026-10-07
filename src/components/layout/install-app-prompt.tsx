import { CircleCheck, Download, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { getInstallMode, isInstallDismissalRecent, shouldOfferAutomaticInstall } from "@/lib/pwa-install-policy";
import { usePwaInstalled } from "@/lib/use-pwa-installed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type HelpLanguage = "fr" | "en" | "es";
const DISMISS_KEY = "ahmv-install-prompt-dismissed";
const INITIAL_DELAY_MS = 6000;
const RETRY_MS = 2500;

function isIosLike() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function attentionSurfaceOpen() {
  return document.body.style.overflow === "hidden"
    || Boolean(document.querySelector('[aria-controls="mobile-menu"][aria-expanded="true"]'))
    || Boolean(document.querySelector('[data-ahmv-attention-surface], [role="dialog"][aria-modal="true"]'));
}

function installCopy(language: HelpLanguage) {
  if (language === "es") return {
    title: "Instalar AHM Verdun",
    installedTitle: "AHM Verdun ya está instalado",
    body: "Añade este sitio a tu pantalla de inicio o a tus aplicaciones para encontrar equipos y horarios más rápido.",
    installed: "Abre AHM Verdun desde su icono en la pantalla de inicio o en tus aplicaciones. Ya tienes acceso al mismo sitio.",
    native: "Tu navegador ofrece la instalación. Pulsa el botón y confirma en la ventana del navegador.",
    accepted: "Solicitud de instalación aceptada. El navegador termina de añadir el sitio; después, busca el icono de AHM Verdun.",
    failed: "El navegador no ha iniciado la instalación. Usa las opciones de su menú que se indican abajo.",
    iosTitle: "iPhone / iPad · Safari",
    iosSteps: ["Abre ahmverdun.ca en Safari.", "Pulsa Compartir y elige Añadir a pantalla de inicio.", "Confirma el nombre AHM Verdun y pulsa Añadir."],
    androidTitle: "Android · Chrome",
    androidSteps: ["Abre ahmverdun.ca en Chrome.", "En el menú ⋮, busca Añadir a pantalla de inicio o Instalar, si aparece.", "Sigue la confirmación del navegador."],
    desktopTitle: "Ordenador · Chrome",
    desktopSteps: ["Abre ahmverdun.ca en Chrome.", "En el menú ⋮, busca Transmitir, guardar y compartir → Instalar página como aplicación, si aparece.", "Confirma la instalación en el navegador."],
    fallback: "Si no aparece ninguna opción de instalación, abre el sitio en un navegador compatible. También puedes guardarlo en tus favoritos.",
    install: "Instalar con el navegador",
    busy: "Esperando al navegador…",
    close: "Cerrar",
    how: "Cómo instalar",
    apple: "Ayuda de Apple",
    chrome: "Ayuda de Chrome",
  };
  if (language === "en") return {
    title: "Install AHM Verdun",
    installedTitle: "AHM Verdun is already installed",
    body: "Add this website to your Home Screen or apps for faster access to teams and schedules.",
    installed: "Open AHM Verdun from its icon on your Home Screen or in your apps. You already have access to the same website.",
    native: "Your browser offers installation. Use the button and confirm in the browser window.",
    accepted: "Installation request accepted. Your browser is finishing adding the site; then look for the AHM Verdun icon.",
    failed: "Your browser did not start installation. You can use the menu options below.",
    iosTitle: "iPhone / iPad · Safari",
    iosSteps: ["Open ahmverdun.ca in Safari.", "Tap Share and choose Add to Home Screen.", "Confirm the AHM Verdun name and tap Add."],
    androidTitle: "Android · Chrome",
    androidSteps: ["Open ahmverdun.ca in Chrome.", "In the ⋮ menu, look for Add to Home Screen or Install, if available.", "Follow the browser confirmation."],
    desktopTitle: "Computer · Chrome",
    desktopSteps: ["Open ahmverdun.ca in Chrome.", "In the ⋮ menu, look for Cast, save, and share → Install page as app, if available.", "Confirm installation in the browser."],
    fallback: "If no installation option appears, open the site in a compatible browser. You can also save it as a bookmark.",
    install: "Install with your browser",
    busy: "Waiting for the browser…",
    close: "Close",
    how: "How to install",
    apple: "Apple instructions",
    chrome: "Chrome instructions",
  };
  return {
    title: "Installer AHM Verdun",
    installedTitle: "AHM Verdun est déjà installé",
    body: "Ajoutez ce site à votre écran d’accueil ou à vos applications pour retrouver équipes et horaires plus vite.",
    installed: "Ouvrez AHM Verdun depuis son icône sur l’écran d’accueil ou parmi vos applications. Vous avez déjà accès au même site.",
    native: "Votre navigateur propose l’installation. Utilisez le bouton puis confirmez dans la fenêtre du navigateur.",
    accepted: "Demande d’installation acceptée. Le navigateur termine l’ajout du site; retrouvez ensuite l’icône AHM Verdun.",
    failed: "Le navigateur n’a pas lancé l’installation. Vous pouvez utiliser les options de son menu ci-dessous.",
    iosTitle: "iPhone / iPad · Safari",
    iosSteps: ["Ouvrez ahmverdun.ca dans Safari.", "Touchez Partager, puis Sur l’écran d’accueil.", "Confirmez le nom AHM Verdun et touchez Ajouter."],
    androidTitle: "Android · Chrome",
    androidSteps: ["Ouvrez ahmverdun.ca dans Chrome.", "Dans le menu ⋮, cherchez Ajouter à l’écran d’accueil ou Installer, si proposé.", "Suivez la confirmation du navigateur."],
    desktopTitle: "Ordinateur · Chrome",
    desktopSteps: ["Ouvrez ahmverdun.ca dans Chrome.", "Dans le menu ⋮, cherchez Caster, enregistrer et partager → Installer la page en tant qu’application, si proposé.", "Confirmez l’installation dans le navigateur."],
    fallback: "Si aucune option d’installation n’apparaît, ouvrez le site dans un navigateur compatible. Vous pouvez aussi l’enregistrer dans vos favoris.",
    install: "Installer avec le navigateur",
    busy: "En attente du navigateur…",
    close: "Fermer",
    how: "Comment installer",
    apple: "Instructions Apple",
    chrome: "Instructions Chrome",
  };
}

export function InstallAppPrompt() {
  const { lang } = useI18n();
  const installed = usePwaInstalled();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [ios, setIos] = useState(false);
  const [ready, setReady] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpLanguage, setHelpLanguage] = useState<HelpLanguage>(lang);
  const [installing, setInstalling] = useState(false);
  const [requestAccepted, setRequestAccepted] = useState(false);
  const [failed, setFailed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const handingFocusAway = useRef(false);
  const mode = getInstallMode({ installed, nativeAvailable: Boolean(event), ios });
  const automaticAvailable = shouldOfferAutomaticInstall(mode, dismissed);
  const copy = installCopy(helpLanguage);
  const automaticCopy = installCopy(lang);

  useEffect(() => {
    setIos(isIosLike());
    try {
      const recent = isInstallDismissalRecent(window.localStorage.getItem(DISMISS_KEY));
      setDismissed(recent);
      if (!recent) window.localStorage.removeItem(DISMISS_KEY);
    } catch {
      setDismissed(false);
    }
    const onBeforeInstallPrompt = (rawEvent: Event) => {
      rawEvent.preventDefault();
      setEvent(rawEvent as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setReady(false);
      setEvent(null);
      setRequestAccepted(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!automaticAvailable || ready || helpOpen) return;
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
  }, [automaticAvailable, ready, helpOpen]);

  useEffect(() => {
    const openHelp = (request: Event) => {
      const detail = (request as CustomEvent<{ returnFocus?: unknown; language?: unknown }>).detail;
      const opener = detail?.returnFocus instanceof HTMLElement ? detail.returnFocus : document.activeElement;
      returnFocusRef.current = opener instanceof HTMLElement && opener !== document.body && !opener.closest('[role="dialog"]') ? opener : null;
      handingFocusAway.current = false;
      setHelpLanguage(detail?.language === "es" || detail?.language === "en" || detail?.language === "fr" ? detail.language : lang);
      setReady(false);
      setDismissed(true); // A manual request replaces this visit's automatic offer.
      setFailed(false);
      setHelpOpen(true);
    };
    const suppress = () => {
      handingFocusAway.current = true;
      setReady(false);
      setHelpOpen(false);
    };
    window.addEventListener("ahmv:install-open", openHelp);
    window.addEventListener("ahmv:navigation-open", suppress);
    window.addEventListener("ahmv:assistant-open", suppress);
    window.addEventListener("ahmv:welcome-open", suppress);
    return () => {
      window.removeEventListener("ahmv:install-open", openHelp);
      window.removeEventListener("ahmv:navigation-open", suppress);
      window.removeEventListener("ahmv:assistant-open", suppress);
      window.removeEventListener("ahmv:welcome-open", suppress);
    };
  }, [lang]);

  const openHelp = () => window.dispatchEvent(new CustomEvent("ahmv:install-open"));
  const install = async () => {
    if (!event) { openHelp(); return; }
    if (installing) return;
    setInstalling(true);
    setFailed(false);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      setRequestAccepted(choice.outcome === "accepted");
    } catch {
      if (!helpOpen) openHelp();
      setFailed(true);
    } finally {
      setEvent(null); // A browser install event can be prompted only once.
      setReady(false);
      setDismissed(true);
      setInstalling(false);
      if (helpOpen) closeButtonRef.current?.focus();
    }
  };
  const dismiss = () => {
    try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* Optional preference storage. */ }
    setReady(false);
    setDismissed(true);
  };

  return (
    <>
      {automaticAvailable && ready && !helpOpen && (
        <aside data-ahmv-attention-surface="install-app" className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-xl border border-sport/35 bg-competition p-4 text-white shadow-[0_24px_70px_-34px_rgba(7,16,43,0.9)] lg:bottom-6 lg:left-6 lg:right-auto lg:m-0 lg:w-[380px]">
          <div className="flex items-start gap-3">
            <Download className="mt-1 size-5 shrink-0 text-sport-foreground" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-extrabold uppercase leading-[0.9]">{automaticCopy.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/65">{automaticCopy.body}</p>
              <button type="button" onClick={install} disabled={installing} className="premium-control mt-4 inline-flex min-h-10 items-center gap-2 bg-sport px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground disabled:opacity-60">
                {mode === "ios" ? <Share2 className="size-3.5" /> : <Download className="size-3.5" />}
                {installing ? automaticCopy.busy : mode === "ios" ? automaticCopy.how : automaticCopy.install}
              </button>
            </div>
            <button type="button" onClick={dismiss} className="premium-control flex size-10 shrink-0 items-center justify-center border border-white/14 text-white/70" aria-label={automaticCopy.close}><X className="size-4" /></button>
          </div>
        </aside>
      )}
      <DialogPrimitive.Root open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[310] bg-navy-deep/55 backdrop-blur-sm" />
          <DialogPrimitive.Content
            data-ahmv-attention-surface="install-help"
            aria-modal="true"
            onOpenAutoFocus={(focusEvent) => { focusEvent.preventDefault(); closeButtonRef.current?.focus(); }}
            onCloseAutoFocus={(focusEvent) => {
              focusEvent.preventDefault();
              if (handingFocusAway.current) return;
              const target = returnFocusRef.current?.isConnected
                ? returnFocusRef.current
                : document.querySelector<HTMLElement>('[data-ahmv-welcome-trigger], [aria-controls="mobile-menu"]');
              target?.focus({ preventScroll: true });
            }}
            className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-1/2 z-[320] flex max-h-[calc(100dvh-1rem-env(safe-area-inset-bottom))] w-[calc(100%-1rem)] max-w-lg -translate-x-1/2 flex-col overflow-hidden border border-white/15 bg-navy-deep text-white shadow-2xl outline-none sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-competition p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                {mode === "installed" ? <CircleCheck className="size-6 shrink-0 text-emerald-300" aria-hidden /> : <Download className="size-6 shrink-0 text-sport-foreground" aria-hidden />}
                <DialogPrimitive.Title className="font-display text-2xl font-extrabold uppercase leading-none">{mode === "installed" ? copy.installedTitle : copy.title}</DialogPrimitive.Title>
              </div>
              <button ref={closeButtonRef} type="button" onClick={() => setHelpOpen(false)} className="premium-control flex size-11 shrink-0 items-center justify-center border border-white/20" aria-label={copy.close}><X className="size-4" /></button>
            </div>
            <div className="min-h-0 overflow-y-auto p-4 text-sm leading-relaxed sm:p-5">
              <DialogPrimitive.Description className="text-white/75">{mode === "installed" ? copy.installed : copy.body}</DialogPrimitive.Description>
              {requestAccepted && mode !== "installed" && <p role="status" className="mt-4 border-l-2 border-sport pl-3 text-white/80">{copy.accepted}</p>}
              {failed && <p role="status" className="mt-4 border-l-2 border-amber-300 pl-3 text-amber-100">{copy.failed}</p>}
              {mode === "native" && (
                <div className="mt-4 border border-sport/30 bg-sport/10 p-4">
                  <p className="text-white/80">{copy.native}</p>
                  <button type="button" onClick={install} disabled={installing} className="premium-control mt-3 inline-flex min-h-11 items-center gap-2 bg-sport px-4 text-xs font-bold uppercase text-sport-foreground disabled:opacity-60"><Download className="size-4" />{installing ? copy.busy : copy.install}</button>
                </div>
              )}
              {mode !== "installed" && (
                <div className="mt-5 space-y-4">
                  {(ios ? [{ title: copy.iosTitle, steps: copy.iosSteps }] : [{ title: copy.androidTitle, steps: copy.androidSteps }, { title: copy.desktopTitle, steps: copy.desktopSteps }]).map((guide) => (
                    <section key={guide.title} className="border border-white/12 p-4">
                      <h3 className="font-bold text-white">{guide.title}</h3>
                      <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs text-white/75">{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                    </section>
                  ))}
                  <p className="text-xs text-white/60">{copy.fallback}</p>
                  <p className="break-all text-xs font-semibold text-sport-foreground">{SITE.domain}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
                    <a href="https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{copy.apple}</a>
                    <a href="https://support.google.com/chrome/answer/9658361" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{copy.chrome}</a>
                  </div>
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
