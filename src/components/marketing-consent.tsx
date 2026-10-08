import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "../lib/i18n";
import {
  activateMarketingController,
  createMarketingController,
  getMarketingConfig,
  hasMarketingConfig,
  MARKETING_CONSENT_EVENT,
  MARKETING_SETTINGS_EVENT,
  readMarketingConsent,
  respectsPrivacySignal,
  saveMarketingConsent,
  type MarketingConsentChoice,
  type MarketingController,
} from "../lib/marketing";

const config = getMarketingConfig(import.meta.env);

export function MarketingConsent() {
  const { lang } = useI18n();
  const location = useLocation();
  const controller = useRef<MarketingController | null>(null);
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [choice, setChoice] = useState<MarketingConsentChoice>({
    analytics: false,
    marketing: false,
  });
  const analyticsAvailable = Boolean(config.ga4);
  const marketingAvailable = Boolean(
    config.meta ||
    config.tiktok ||
    config.googleAds ||
    config.microsoftUet ||
    config.linkedin ||
    config.pinterest ||
    config.adsense ||
    config.takatakAds,
  );
  const providers = [
    config.meta && "Meta",
    config.tiktok && "TikTok",
    config.googleAds && "Google Ads",
    config.microsoftUet && "Microsoft",
    config.linkedin && "LinkedIn",
    config.pinterest && "Pinterest",
    config.adsense && "AdSense",
    config.takatakAds && "TAKATAK ADS",
  ]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    if (!hasMarketingConfig(config)) return;
    const instance = createMarketingController(config, window);
    controller.current = instance;
    activateMarketingController(instance);
    const signal = respectsPrivacySignal(navigator);
    const saved = readMarketingConsent();
    setBlocked(signal);
    setChoice(
      signal
        ? { analytics: false, marketing: false }
        : (saved ?? { analytics: false, marketing: false }),
    );
    instance.setConsent(saved ?? { analytics: false, marketing: false });
    instance.pageView(window.location.pathname);
    const showSettings = () => {
      const privacySignal = respectsPrivacySignal(navigator);
      setBlocked(privacySignal);
      setChoice(
        privacySignal
          ? { analytics: false, marketing: false }
          : (readMarketingConsent() ?? { analytics: false, marketing: false }),
      );
      setOpen(true);
    };
    window.addEventListener(MARKETING_SETTINGS_EVENT, showSettings);
    // Use the existing attention policy: do not interrupt forms or another dialog.
    let timer: number | undefined;
    if (!saved && !signal) {
      const offer = () => {
        if (readMarketingConsent() || respectsPrivacySignal(navigator)) return;
        const busy =
          document.querySelector(
            '[data-ahmv-attention-surface], [role="dialog"][aria-modal="true"], [aria-controls="mobile-menu"][aria-expanded="true"]',
          ) ||
          document.body.style.overflow === "hidden" ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
        if (busy) timer = window.setTimeout(offer, 1000);
        else setOpen(true);
      };
      timer = window.setTimeout(offer, 800);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener(MARKETING_SETTINGS_EVENT, showSettings);
      instance.dispose();
      activateMarketingController(null);
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    controller.current?.pageView(location.pathname);
  }, [location.pathname, location.searchStr, location.hash]);

  const save = (requested: MarketingConsentChoice) => {
    const next = respectsPrivacySignal(navigator)
      ? { analytics: false, marketing: false }
      : requested;
    saveMarketingConsent(next);
    setChoice(next);
    const result = controller.current?.setConsent(next);
    window.dispatchEvent(new Event(MARKETING_CONSENT_EVENT));
    setOpen(false);
    if (result?.requiresReload) window.location.reload();
    else controller.current?.pageView(window.location.pathname);
  };

  if (!hasMarketingConfig(config)) return null;
  const buttonClass =
    "min-h-11 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-navy-deep/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          data-ahmv-attention-surface="marketing-consent"
          className="fixed inset-x-3 bottom-3 z-[81] mx-auto max-h-[90dvh] max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-navy-deep p-5 text-white shadow-2xl sm:bottom-6 sm:p-6"
        >
          <DialogPrimitive.Close
            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
            aria-label={lang === "fr" ? "Fermer les préférences" : "Close preferences"}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </DialogPrimitive.Close>
          <DialogPrimitive.Title className="pr-10 font-display text-2xl font-bold">
            {lang === "fr" ? "Vos préférences de confidentialité" : "Your privacy choices"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-white/70">
            {lang === "fr"
              ? "Les outils optionnels restent désactivés jusqu’à votre accord. Vous pouvez changer vos choix dans le pied de page."
              : "Optional tools stay off until you agree. You can change your choices in the footer."}
          </DialogPrimitive.Description>
          {blocked && (
            <p role="status" className="mt-4 rounded-xl border border-white/20 p-3 text-sm">
              {lang === "fr"
                ? "Votre navigateur demande de ne pas être suivi (DNT ou GPC). Les outils de mesure et de publicité restent désactivés."
                : "Your browser requests no tracking (DNT or GPC). Analytics and advertising tools remain off."}
            </p>
          )}
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 p-3 text-sm">
              <span className="font-semibold">
                {lang === "fr" ? "Fonctionnement du site" : "Website essentials"}
              </span>
              <span className="ml-2 text-xs text-white/60">
                {lang === "fr" ? "Toujours actif" : "Always on"}
              </span>
              <p className="mt-1 text-white/60">
                {lang === "fr"
                  ? "Langue, équipes choisies et vos préférences de confidentialité."
                  : "Language, selected teams and your privacy choices."}
              </p>
            </div>
            {analyticsAvailable && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 accent-sport"
                  checked={choice.analytics}
                  disabled={blocked}
                  onChange={(event) =>
                    setChoice((current) => ({ ...current, analytics: event.target.checked }))
                  }
                />
                <span className="text-sm">
                  <span className="block font-semibold">
                    {lang === "fr" ? "Mesure d’audience" : "Audience analytics"}
                  </span>
                  <span className="mt-1 block text-white/60">
                    {lang === "fr"
                      ? "Google Analytics : fréquentation des pages publiques, sans données de formulaire ni sélection d’équipe."
                      : "Google Analytics: visits to public pages, without form data or selected teams."}
                  </span>
                </span>
              </label>
            )}
            {marketingAvailable && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 accent-sport"
                  checked={choice.marketing}
                  disabled={blocked}
                  onChange={(event) =>
                    setChoice((current) => ({ ...current, marketing: event.target.checked }))
                  }
                />
                <span className="text-sm">
                  <span className="block font-semibold">
                    {lang === "fr" ? "Publicité et campagnes" : "Advertising and campaigns"}
                  </span>
                  <span className="mt-1 block text-white/60">
                    {lang === "fr"
                      ? `${providers} : mesure et personnalisation des campagnes. Ces fournisseurs peuvent utiliser leurs propres cookies et recevoir votre adresse IP.`
                      : `${providers}: campaign measurement and personalization. These providers may use their own cookies and receive your IP address.`}
                  </span>
                </span>
              </label>
            )}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              className={buttonClass}
              onClick={() => save({ analytics: false, marketing: false })}
            >
              {lang === "fr" ? "Tout refuser" : "Decline all"}
            </button>
            <button type="button" className={buttonClass} onClick={() => save(choice)}>
              {lang === "fr" ? "Enregistrer" : "Save choices"}
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={blocked}
              onClick={() => save({ analytics: analyticsAvailable, marketing: marketingAvailable })}
            >
              {lang === "fr" ? "Tout accepter" : "Allow all"}
            </button>
          </div>
          <a
            href="/confidentialite"
            className="mt-3 inline-flex min-h-11 items-center text-sm text-white/65 underline underline-offset-4"
          >
            {lang === "fr" ? "Confidentialité" : "Privacy"}
          </a>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
