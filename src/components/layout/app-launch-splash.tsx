import { readBrowserPreference, writeBrowserPreference } from "@/lib/browser-preferences";
import { useEffect, useRef, useState } from "react";
import { AHMV_LOGO_URL } from "@/components/layout/logo-slot";

const SESSION_KEY = "ahmv-app-launch-splash-v2";
const SPLASH_ARTWORK_URL = "/branding/ahmv-app-splash-2026.webp";

function isStandaloneApp() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches
    || navigatorWithStandalone.standalone === true;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AppLaunchSplash() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Show a short hockey launch on the website and in the installed application.
    // The session preference prevents a replay on internal navigation.
    if (readBrowserPreference(SESSION_KEY, "sessionStorage") === "1") return;

    writeBrowserPreference(SESSION_KEY, "1", "sessionStorage");
    setVisible(true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const reduced = prefersReducedMotion();
    const duration = reduced ? 250 : isStandaloneApp() ? 1450 : 950;
    const startedAt = performance.now();

    const animate = (now: number) => {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setProgress(Math.min(100, Math.round(eased * 100)));

      if (elapsed < 1) {
        frameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      const leaveDelay = reduced ? 80 : 220;
      window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => {
          setVisible(false);
          document.body.style.overflow = previousOverflow;
        }, reduced ? 40 : 300);
      }, leaveDelay);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Ouverture de l’application AHM Verdun"
      className={[
        "fixed inset-0 z-[1000] overflow-hidden bg-navy-deep text-white transition-opacity duration-300",
        leaving ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <img
        src={SPLASH_ARTWORK_URL}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full scale-[1.035] object-cover object-center"
        decoding="sync"
        fetchPriority="high"
      />

      <div className="absolute inset-0 bg-navy-deep/10" />
      <div className="absolute inset-x-0 top-[22%] h-[16%] bg-gradient-to-b from-transparent to-navy-deep" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-navy-deep" />
      <div className="absolute inset-0 technical-grid text-white/10" />
      <div className="pointer-events-none absolute inset-x-0 top-[38%] h-px bg-sport/25" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-[38%] size-[min(58vw,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sport/20" aria-hidden />

      <div className="relative flex min-h-[100dvh] flex-col items-center justify-between px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] text-center">
        <div className="flex w-full max-w-md justify-center pt-2">
          <span className="relative inline-flex size-24 items-center justify-center sm:size-28">
            <span className="absolute inset-2 rounded-full bg-sport/25 blur-2xl" aria-hidden="true" />
            <img
              src={AHMV_LOGO_URL}
              alt="Association du hockey mineur de Verdun"
              width={1024}
              height={1024}
              className="relative size-full object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.55)]"
              decoding="sync"
            />
          </span>
        </div>

        <div className="w-full max-w-lg pb-3">
          <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-sport-foreground/85">
            AHM Verdun
          </p>
          <h1 className="mt-2 font-display text-[clamp(2.35rem,10vw,4.6rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.035em] text-white">
            Bienvenue à l’Association de hockey mineur de Verdun
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-relaxed text-white/74 sm:text-base">
            Là où les jeunes grandissent, patinent et croient en leurs rêves.
          </p>

          <div className="mt-8">
            <div className="mb-2 flex items-end justify-between gap-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/48">
                Chargement
              </span>
              <span className="font-display text-3xl font-extrabold tabular-nums text-white">
                {progress}%
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="relative h-2 overflow-hidden border border-white/20 bg-white/10"
            >
              <div
                className="absolute inset-y-0 left-0 bg-sport shadow-[0_0_24px_rgba(255,255,255,0.2)] transition-[width] duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
              <div className="ahmv-motion-sheen" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2 size-6 rounded-full border-[3px] border-white/70 bg-navy-deep shadow-[0_1px_14px_rgba(255,255,255,0.38)] transition-[left] duration-75"
                style={{ left: `clamp(0px, calc(${progress}% - 12px), calc(100% - 24px))` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[8px] font-bold uppercase tracking-[0.16em] text-white/35">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
