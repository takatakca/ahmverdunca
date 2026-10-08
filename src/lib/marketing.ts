import { createExtendedMarketingAdapters } from "./marketing-extensions";
import { isSafeCampaignSearch } from "./campaign-links";
import { readBrowserPreference, writeBrowserPreference } from "./browser-preferences";

/** Public browser identifiers only. Server API tokens never belong in these settings. */
export interface MarketingConfig {
  ga4: string | null;
  meta: string | null;
  tiktok: string | null;
  googleAds: string | null;
  microsoftUet: string | null;
  adsense: string | null;
  linkedin: string | null;
  pinterest: string | null;
  takatakAds: boolean;
}
export interface MarketingConsentChoice {
  analytics: boolean;
  marketing: boolean;
}
export type MarketingEvent = "registration_link" | "sponsorship_prepare" | "partner_link_copy";
export const MARKETING_SETTINGS_EVENT = "ahmv:marketing-settings";
export const MARKETING_CONSENT_EVENT = "ahmv:marketing-consent-changed";
export const MARKETING_CONSENT_KEY = "ahmv-marketing-consent-v1";
const CONSENT_LIFETIME = 180 * 24 * 60 * 60 * 1000;
const PUBLIC_ORIGIN = "https://ahmverdun.ca";
const EMPTY_CONSENT: MarketingConsentChoice = { analytics: false, marketing: false };
const PUBLIC_PATHS = new Set([
  "/",
  "/horaires",
  "/equipes",
  "/inscriptions",
  "/tournois",
  "/nouvelles",
  "/galerie",
  "/arenas",
  "/wllv",
  "/faq",
  "/ressources",
  "/partenaires",
  "/contact",
  "/confidentialite",
]);
const EVENT_NAMES = new Set<MarketingEvent>([
  "registration_link",
  "sponsorship_prepare",
  "partner_link_copy",
]);
const SECTIONS = new Set(["home", "registration", "partners", "footer", "campaign-kit"]);

export function getMarketingConfig(env: Record<string, unknown>): MarketingConfig {
  const valid = (value: unknown, pattern: RegExp) =>
    typeof value === "string" && pattern.test(value.trim()) ? value.trim() : null;
  return {
    ga4: valid(env["VITE_GA4_MEASUREMENT_ID"], /^G-[A-Z0-9]{4,20}$/),
    meta: valid(env["VITE_META_PIXEL_ID"], /^[1-9]\d{9,19}$/),
    tiktok: valid(env["VITE_TIKTOK_PIXEL_ID"], /^[A-Z0-9]{15,30}$/i),
    googleAds: valid(env["VITE_GOOGLE_ADS_ID"], /^AW-[1-9]\d{5,19}$/),
    microsoftUet: valid(env["VITE_MICROSOFT_UET_ID"], /^[1-9]\d{5,19}$/),
    linkedin: valid(env["VITE_LINKEDIN_PARTNER_ID"], /^[1-9]\d{4,15}$/),
    pinterest: valid(env["VITE_PINTEREST_TAG_ID"], /^[1-9]\d{9,19}$/),
    takatakAds: env["VITE_TAKATAK_ADS_ENABLED"] === "true",
    adsense:
      env["VITE_ADSENSE_ENABLED"] === "true"
        ? valid(env["VITE_ADSENSE_CLIENT"], /^ca-pub-\d{16}$/)
        : null,
  };
}
export function hasMarketingConfig(config: MarketingConfig) {
  return Object.values(config).some(Boolean);
}
export function respectsPrivacySignal(
  browser: Pick<Navigator, "doNotTrack"> & { globalPrivacyControl?: boolean },
) {
  return (
    browser.doNotTrack === "1" ||
    browser.doNotTrack === "yes" ||
    browser.globalPrivacyControl === true
  );
}
export function readMarketingConsent(now = Date.now()): MarketingConsentChoice | null {
  const saved = readBrowserPreference(MARKETING_CONSENT_KEY);
  if (!saved) return null;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as Record<string, unknown>;
    if (
      value["version"] !== 1 ||
      typeof value["expiresAt"] !== "number" ||
      value["expiresAt"] <= now ||
      typeof value["analytics"] !== "boolean" ||
      typeof value["marketing"] !== "boolean"
    )
      return null;
    return { analytics: value["analytics"], marketing: value["marketing"] };
  } catch {
    return null;
  }
}
export function saveMarketingConsent(choice: MarketingConsentChoice, now = Date.now()) {
  // This essential preference is written only after a visitor makes an explicit choice.
  writeBrowserPreference(
    MARKETING_CONSENT_KEY,
    JSON.stringify({
      version: 1,
      expiresAt: now + CONSENT_LIFETIME,
      analytics: choice.analytics === true,
      marketing: choice.marketing === true,
    }),
  );
}

/** Only public directory pages; never individual teams, events, search text or account URLs. */
export function marketingPagePath(input: string): string | null {
  try {
    const url = new URL(input, PUBLIC_ORIGIN);
    if (url.origin !== PUBLIC_ORIGIN || url.username || url.password) return null;
    const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
    return PUBLIC_PATHS.has(path) ? path : null;
  } catch {
    return null;
  }
}
export function marketingEventPayload(path: string, details: unknown = {}) {
  const safePath = marketingPagePath(path);
  if (!safePath) return null;
  const section =
    details && typeof details === "object"
      ? (details as Record<string, unknown>)["section"]
      : undefined;
  return {
    page_path: safePath,
    ...(typeof section === "string" && SECTIONS.has(section) ? { section } : {}),
  };
}

// Official provider queue shapes. Keeping bootstrap here makes absence of consent testable.
type Gtag = (...args: unknown[]) => void;
type MetaPixel = Gtag & {
  callMethod?: Gtag;
  queue: unknown[][];
  push: MetaPixel;
  loaded: boolean;
  version: string;
};
type TikTokQueue = unknown[] & {
  methods: string[];
  _i: Record<string, unknown[]>;
  _t: Record<string, number>;
  _o: Record<string, object>;
  page: Gtag;
  track: Gtag;
  enableCookie: Gtag;
  disableCookie: Gtag;
  grantConsent: Gtag;
  revokeConsent: Gtag;
  instance: (id: string) => unknown[];
};
type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Gtag;
  fbq?: MetaPixel;
  _fbq?: MetaPixel;
  UET?: new (options: { ti: string; q: unknown[]; enableAutoSpaTracking: boolean }) => {
    push: Gtag;
  };
  uetq?: unknown[] | { push: Gtag };
  ttq?: TikTokQueue;
  TiktokAnalyticsObject?: string;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

export interface MarketingController {
  setConsent(choice: MarketingConsentChoice): { requiresReload: boolean };
  pageView(path: string): void;
  event(name: MarketingEvent, details?: unknown): void;
  dispose(): void;
}

export function getCurrentMarketingConsent(): MarketingConsentChoice {
  if (typeof window === "undefined" || respectsPrivacySignal(window.navigator))
    return { ...EMPTY_CONSENT };
  return readMarketingConsent() ?? { ...EMPTY_CONSENT };
}
export function isMarketingPageAllowed(browser: Window = window) {
  return (
    isSafeCampaignSearch(browser.location.search) &&
    (!browser.location.hash ||
      (browser.location.pathname === "/partenaires" && browser.location.hash === "#commandite")) &&
    marketingPagePath(browser.location.pathname) !== null
  );
}

function clearTrackerCookies(browser: Window, group: "analytics" | "marketing") {
  const matches =
    group === "analytics"
      ? /^(_ga(?:_|$)|_gid$|_gat(?:_|$))/
      : /^(_fbp$|_fbc$|_ttp$|ttcsid|_uetmsclkid$|_uetsid$|_uetvid$|_gcl_|__gads$|__gpi$|__eoi$)/;
  let cookie = "";
  try {
    cookie = browser.document.cookie;
  } catch {
    return;
  }
  const names = cookie
    .split(";")
    .map((item) => item.trim().split("=")[0] ?? "")
    .filter((name) => matches.test(name));
  const host = browser.location.hostname;
  const domains = [
    "",
    ...host
      .split(".")
      .map((_, index, parts) => parts.slice(index).join("."))
      .filter((domain) => domain.includes(".")),
  ];
  const pieces = browser.location.pathname.split("/").filter(Boolean);
  const paths = ["/", ...pieces.map((_, index) => `/${pieces.slice(0, index + 1).join("/")}`)];
  for (const name of names)
    for (const domain of domains)
      for (const path of paths) {
        try {
          browser.document.cookie = `${name}=; Max-Age=0; Path=${path};${domain ? ` Domain=${domain};` : ""} SameSite=Lax; Secure`;
        } catch {
          /* Browsers may prohibit cookie access; withdrawal still stops events and reloads. */
        }
      }
}

export function createMarketingController(
  config: MarketingConfig,
  browser: Window,
): MarketingController {
  const global = browser as TrackingWindow;
  const loaded = { ga4: false, meta: false, tiktok: false, googleAds: false, microsoftUet: false };
  let gtagLoaded = false;
  let extensionsLoaded = false;
  const extensions = createExtendedMarketingAdapters(
    { linkedin: config.linkedin, pinterest: config.pinterest },
    browser,
  );
  let consent = { ...EMPTY_CONSENT };
  let disposed = false;
  let lastPage: string | null = null;
  let revoked = false;
  const effectiveChoice = (choice: MarketingConsentChoice) =>
    respectsPrivacySignal(browser.navigator)
      ? { ...EMPTY_CONSENT }
      : { analytics: choice.analytics === true, marketing: choice.marketing === true };
  const safeCurrentPage = () => {
    return isMarketingPageAllowed(browser) ? marketingPagePath(browser.location.pathname) : null;
  };
  const script = (
    provider: "ga4" | "meta" | "tiktok" | "googleAds" | "microsoftUet",
    src: string,
    onload?: () => void,
  ) => {
    const element = browser.document.createElement("script");
    element.async = true;
    element.src = src;
    element.referrerPolicy = "no-referrer";
    element.dataset["ahmvTracker"] = provider;
    if (onload) element.onload = onload;
    browser.document.head.appendChild(element);
  };
  const ensureGtag = (id: string) => {
    if (gtagLoaded) return;
    global.dataLayer = [];
    global.gtag = function (..._args: unknown[]) {
      // Keep the Arguments queue shape required by the official gtag bootstrap.
      // eslint-disable-next-line prefer-rest-params
      global.dataLayer?.push(arguments);
    };
    global.gtag("consent", "default", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing && config.googleAds ? "granted" : "denied",
      ad_user_data: "denied",
      ad_personalization: consent.marketing && config.googleAds ? "granted" : "denied",
    });
    global.gtag("js", new Date());
    script("ga4", `https://www.googletagmanager.com/gtag/js?id=${id}`);
    gtagLoaded = true;
  };
  const load = () => {
    if (disposed || revoked || !safeCurrentPage()) return;
    consent = effectiveChoice(consent);
    if (consent.analytics && config.ga4 && !loaded.ga4) {
      global[`ga-disable-${config.ga4}`] = false;
      ensureGtag(config.ga4);
      global.gtag?.("config", config.ga4, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        ignore_referrer: true,
        page_referrer: "",
        page_location: PUBLIC_ORIGIN + safeCurrentPage(),
        page_title: "AHM Verdun",
      });
      loaded.ga4 = true;
    }
    if (consent.marketing && (config.linkedin || config.pinterest) && !extensionsLoaded) {
      extensions.load();
      extensionsLoaded = true;
    }
    if (consent.marketing && config.googleAds && !loaded.googleAds) {
      ensureGtag(config.googleAds);
      global.gtag?.("config", config.googleAds, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: true,
        ignore_referrer: true,
        page_referrer: "",
        page_location: PUBLIC_ORIGIN + safeCurrentPage(),
        page_title: "AHM Verdun",
      });
      loaded.googleAds = true;
    }
    if (consent.marketing && config.microsoftUet && !loaded.microsoftUet) {
      global.uetq = [["consent", "default", { ad_storage: "granted" }]];
      script("microsoftUet", "https://bat.bing.com/bat.js", () => {
        if (!permitted() || !consent.marketing || !config.microsoftUet || !global.UET) return;
        global.uetq = new global.UET({
          ti: config.microsoftUet,
          q: Array.isArray(global.uetq) ? global.uetq : [],
          enableAutoSpaTracking: false,
        });
      });
      loaded.microsoftUet = true;
    }
    if (consent.marketing && config.meta && !loaded.meta) {
      const fbq: MetaPixel = Object.assign(
        function (...args: unknown[]) {
          if (fbq.callMethod) fbq.callMethod(...args);
          else fbq.queue.push(args);
        },
        {
          queue: [] as unknown[][],
          loaded: true,
          version: "2.0",
          push: null as unknown as MetaPixel,
        },
      );
      fbq.push = fbq;
      global.fbq = fbq;
      global._fbq = fbq;
      fbq("set", "autoConfig", false, config.meta);
      fbq("consent", "grant");
      fbq("init", config.meta);
      script("meta", "https://connect.facebook.net/en_US/fbevents.js");
      loaded.meta = true;
    }
    if (consent.marketing && config.tiktok && !loaded.tiktok) {
      const ttq = [] as unknown as TikTokQueue;
      ttq.methods = [
        "page",
        "track",
        "identify",
        "instances",
        "debug",
        "on",
        "off",
        "once",
        "ready",
        "alias",
        "group",
        "enableCookie",
        "disableCookie",
        "holdConsent",
        "revokeConsent",
        "grantConsent",
      ];
      for (const method of ttq.methods)
        Object.assign(ttq, { [method]: (...args: unknown[]) => ttq.push([method, ...args]) });
      ttq._i = {
        [config.tiktok]: Object.assign([], {
          _u: "https://analytics.tiktok.com/i18n/pixel/events.js",
        }),
      };
      ttq.instance = (id: string) => {
        const instance = ttq._i[id] ?? [];
        for (const method of ttq.methods)
          Object.assign(instance, {
            [method]: (...args: unknown[]) => instance.push([method, ...args]),
          });
        return instance;
      };
      ttq._t = { [config.tiktok]: Date.now() };
      ttq._o = { [config.tiktok]: {} };
      global.TiktokAnalyticsObject = "ttq";
      global.ttq = ttq;
      ttq.grantConsent();
      ttq.enableCookie();
      script(
        "tiktok",
        `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${config.tiktok}&lib=ttq`,
      );
      loaded.tiktok = true;
    }
  };
  const permitted = () =>
    !disposed &&
    !revoked &&
    !respectsPrivacySignal(browser.navigator) &&
    Boolean(safeCurrentPage());
  const controller: MarketingController = {
    setConsent(choice) {
      const next = effectiveChoice(choice);
      const analyticsWithdrawal = loaded.ga4 && consent.analytics && !next.analytics;
      const marketingWithdrawal =
        (loaded.meta ||
          loaded.tiktok ||
          loaded.googleAds ||
          loaded.microsoftUet ||
          extensionsLoaded) &&
        consent.marketing &&
        !next.marketing;
      consent = next;
      if (analyticsWithdrawal || marketingWithdrawal) {
        // SDK listeners cannot be unloaded reliably. The UI reloads after this safe stop.
        revoked = true;
        if (config.ga4) global[`ga-disable-${config.ga4}`] = true;
        global.fbq?.("consent", "revoke");
        global.ttq?.revokeConsent();
        global.ttq?.disableCookie();
        global.uetq?.push("consent", "update", { ad_storage: "denied" });
        extensions.withdraw();
        global.dataLayer?.splice(0);
        for (const element of browser.document.querySelectorAll("script[data-ahmv-tracker]"))
          element.remove();
      }
      if (!next.analytics) clearTrackerCookies(browser, "analytics");
      if (!next.marketing) clearTrackerCookies(browser, "marketing");
      lastPage = null;
      if (gtagLoaded && !revoked)
        global.gtag?.("consent", "update", {
          analytics_storage: next.analytics ? "granted" : "denied",
          ad_storage: next.marketing && config.googleAds ? "granted" : "denied",
          ad_user_data: "denied",
          ad_personalization: next.marketing && config.googleAds ? "granted" : "denied",
        });
      load();
      return { requiresReload: analyticsWithdrawal || marketingWithdrawal };
    },
    pageView(path) {
      const payload = marketingEventPayload(path);
      if (!payload || payload.page_path !== safeCurrentPage() || !permitted()) return;
      load();
      if (lastPage === payload.page_path) return;
      lastPage = payload.page_path;
      if (consent.analytics && loaded.ga4)
        global.gtag?.("event", "page_view", {
          ...payload,
          send_to: config.ga4,
          page_location: PUBLIC_ORIGIN + payload.page_path,
          page_referrer: "",
          page_title: "AHM Verdun",
        });
      if (consent.marketing && loaded.googleAds)
        global.gtag?.("event", "page_view", {
          ...payload,
          send_to: config.googleAds,
          page_location: PUBLIC_ORIGIN + payload.page_path,
          page_referrer: "",
          page_title: "AHM Verdun",
        });
      if (consent.marketing && loaded.microsoftUet)
        global.uetq?.push("event", "page_view", { ...payload, page_path: payload.page_path });
      if (consent.marketing && loaded.meta)
        global.fbq?.("trackSingle", config.meta, "PageView", payload);
      if (consent.marketing && loaded.tiktok) global.ttq?.page(payload);
      if (consent.marketing && extensionsLoaded) extensions.pageView(payload);
    },
    event(name, details) {
      if (!EVENT_NAMES.has(name) || !permitted()) return;
      const payload = marketingEventPayload(browser.location.pathname, details);
      if (!payload) return;
      load();
      if (consent.analytics && loaded.ga4)
        global.gtag?.("event", name, { ...payload, send_to: config.ga4 });
      if (consent.marketing && loaded.googleAds)
        global.gtag?.("event", name, { ...payload, send_to: config.googleAds });
      if (consent.marketing && loaded.microsoftUet) global.uetq?.push("event", name, payload);
      if (consent.marketing && loaded.meta)
        global.fbq?.("trackSingleCustom", config.meta, name, payload);
      if (consent.marketing && loaded.tiktok)
        global.ttq?.track("ClickButton", { ...payload, description: name });
      if (consent.marketing && extensionsLoaded) extensions.event(name, payload);
    },
    dispose() {
      disposed = true;
      extensions.dispose();
    },
  };
  return controller;
}

let currentController: MarketingController | null = null;
export function activateMarketingController(controller: MarketingController | null) {
  currentController = controller;
}
export function trackMarketingEvent(
  name: MarketingEvent,
  details?: { section?: "home" | "registration" | "partners" | "footer" | "campaign-kit" },
) {
  // No contact information, form values, selected teams or free-text labels are accepted.
  currentController?.event(name, details);
}
