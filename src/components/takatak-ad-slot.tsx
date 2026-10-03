import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { TAKATAK_ADS_CONFIG } from "@/lib/monetization";
import { useI18n } from "@/lib/i18n";

type TakatakAd = {
  campaignId: string;
  creativeId: string;
  placementId: string;
  headline: string;
  body: string | null;
  callToAction: string | null;
  destinationUrl: string;
  imageUrl: string | null;
  label: "Publicité" | "Advertisement";
  trackingToken: string | null;
  trackingEnabled: boolean;
};

type ServeResponse = {
  ok: boolean;
  filled: boolean;
  ad: TakatakAd | null;
};

const PLACEMENT_MAP: Array<[RegExp, string]> = [
  [/^home-main$|^home-/i, "home-main-01"],
  [/schedule|horaire/i, "schedule-inline-01"],
  [/^team-|teams-|equipe/i, "team-inline-01"],
  [/story-|newsroom|nouvelle/i, "news-inline-01"],
  [/album-|gallery|galerie/i, "gallery-inline-01"],
];

export function takatakPlacementCode(placement: string): string {
  for (const [pattern, code] of PLACEMENT_MAP) {
    if (pattern.test(placement)) return code;
  }
  return "site-inline-01";
}

function deviceClass(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1100) return "tablet";
  return "desktop";
}

async function emitEvent(
  ad: TakatakAd,
  eventType: "impression" | "click",
  locale: string,
): Promise<void> {
  if (!ad.trackingEnabled || !ad.trackingToken) return;

  try {
    await fetch(`${TAKATAK_ADS_CONFIG.origin}/api/ads/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      cache: "no-store",
      keepalive: eventType === "click",
      body: JSON.stringify({
        trackingToken: ad.trackingToken,
        eventType,
        context: {
          locale,
          device: deviceClass(),
        },
      }),
    });
  } catch {
    // Tracking must never block navigation or break AHMV rendering.
  }
}

export function TakatakAdSlot({
  placement,
  className = "",
  compact = false,
  fallback = null,
}: {
  placement: string;
  className?: string;
  compact?: boolean;
  fallback?: ReactNode;
}) {
  const { lang } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<
    { kind: "loading" | "empty" } | { kind: "filled"; ad: TakatakAd }
  >({ kind: "loading" });

  const placementCode = useMemo(
    () => takatakPlacementCode(placement),
    [placement],
  );

  useEffect(() => {
    if (!TAKATAK_ADS_CONFIG.enabled) {
      setState({ kind: "empty" });
      return;
    }

    const controller = new AbortController();

    void fetch(`${TAKATAK_ADS_CONFIG.origin}/api/ads/serve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        publisherCode: TAKATAK_ADS_CONFIG.publisherCode,
        placementCode,
        context: {
          locale: lang,
          device: deviceClass(),
        },
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("serve_failed");
        return (await response.json()) as ServeResponse;
      })
      .then((payload) => {
        if (!payload.filled || !payload.ad) {
          setState({ kind: "empty" });
          return;
        }
        setState({ kind: "filled", ad: payload.ad });
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }
        setState({ kind: "empty" });
      });

    return () => controller.abort();
  }, [lang, placementCode]);

  useEffect(() => {
    if (state.kind !== "filled" || !rootRef.current) return;

    const ad = state.ad;
    const target = rootRef.current;
    let timer: number | null = null;
    let sent = false;

    if (!("IntersectionObserver" in window)) {
      void emitEvent(ad, "impression", lang);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || sent) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (timer === null) {
            timer = window.setTimeout(() => {
              sent = true;
              observer.disconnect();
              void emitEvent(ad, "impression", lang);
            }, 1000);
          }
          return;
        }

        if (timer !== null) {
          window.clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [lang, state]);

  if (state.kind !== "filled") {
    return state.kind === "empty" ? <>{fallback}</> : null;
  }

  const { ad } = state;

  return (
    <aside
      ref={rootRef}
      className={`overflow-hidden border border-navy/10 bg-background ${className}`}
      aria-label={lang === "fr" ? "Publicité" : "Advertisement"}
      data-takatak-ad-placement={placementCode}
    >
      <a
        href={ad.destinationUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="group block"
        onClick={() => {
          void emitEvent(ad, "click", lang);
        }}
      >
        {ad.imageUrl ? (
          <div className="relative overflow-hidden bg-competition">
            <img
              src={ad.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="strict-origin-when-cross-origin"
              className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.015] ${
                compact ? "aspect-[12/4.4]" : "aspect-[12/5.2]"
              }`}
            />
            <span className="absolute left-3 top-3 border border-white/15 bg-navy-deep/80 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
              {ad.label}
            </span>
          </div>
        ) : (
          <div className={compact ? "p-4" : "p-5 md:p-6"}>
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {ad.label}
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-none text-navy">
              {ad.headline}
            </p>
            {ad.body ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {ad.body}
              </p>
            ) : null}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-navy/10 px-4 py-3">
          <div className="min-w-0">
            {ad.imageUrl ? (
              <p className="truncate font-display text-lg font-extrabold uppercase text-navy">
                {ad.headline}
              </p>
            ) : null}
            {ad.callToAction ? (
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-sport">
                {ad.callToAction}
              </p>
            ) : null}
          </div>
          <ExternalLink className="size-4 shrink-0 text-sport" aria-hidden />
        </div>
      </a>
    </aside>
  );
}
