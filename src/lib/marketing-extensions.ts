import { isSafeCampaignSearch } from "./campaign-links";

type TrackerCall = (...args: unknown[]) => void;
type LinkedInTracker = TrackerCall & { q: unknown[][] };
type PinterestTracker = TrackerCall & { queue: unknown[][]; version: string };
type ExtendedTrackingWindow = Window & {
  _linkedin_partner_id?: string;
  _linkedin_data_partner_ids?: string[];
  lintrk?: LinkedInTracker;
  pintrk?: PinterestTracker;
};

export interface ExtendedMarketingConfig {
  linkedin: string | null;
  pinterest: string | null;
}
export interface ExtendedMarketingPayload {
  page_path: string;
  section?: string;
}
export interface ExtendedMarketingAdapters {
  load(): void;
  pageView(payload: ExtendedMarketingPayload): void;
  event(name: string, payload: ExtendedMarketingPayload): void;
  /** True means an SDK was loaded and a reload is required to unload it. */
  withdraw(): boolean;
  dispose(): void;
}

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
const EVENTS = new Set(["registration_link", "sponsorship_prepare", "partner_link_copy"]);
const SECTIONS = new Set(["home", "registration", "partners", "footer", "campaign-kit"]);

function publicId(value: unknown, pattern: RegExp) {
  return typeof value === "string" && pattern.test(value.trim()) ? value.trim() : null;
}

function clearExtensionCookies(browser: Window) {
  // Third-party cookies cannot be removed here; withdrawing requires a reload.
  try {
    const cookiePattern =
      /^(?:li_fat_id|_pin_unauth|_derived_epik|_epik|_pinterest_sess|_pinterest_ct)$/;
    const names = browser.document.cookie
      .split(";")
      .map((item) => item.trim().split("=")[0] ?? "")
      .filter((name) => cookiePattern.test(name));
    const domains = [
      "",
      ...browser.location.hostname
        .split(".")
        .map((_, index, parts) => parts.slice(index).join("."))
        .filter((domain) => domain.includes(".")),
    ];
    const pieces = browser.location.pathname.split("/").filter(Boolean);
    const paths = ["/", ...pieces.map((_, index) => `/${pieces.slice(0, index + 1).join("/")}`)];
    for (const name of names)
      for (const domain of domains)
        for (const path of paths) {
          browser.document.cookie = `${name}=; Max-Age=0; Path=${path};${domain ? ` Domain=${domain};` : ""} SameSite=Lax; Secure`;
        }
  } catch {
    // Cookie access can be denied by the browser. Revocation still stops our queues.
  }
}

/** Called by the consent controller only after explicit marketing consent. */
export function createExtendedMarketingAdapters(
  config: ExtendedMarketingConfig,
  browser: Window,
): ExtendedMarketingAdapters {
  const global = browser as ExtendedTrackingWindow;
  const linkedin = publicId(config.linkedin, /^[1-9]\d{4,15}$/);
  const pinterest = publicId(config.pinterest, /^[1-9]\d{9,19}$/);
  const scripts: HTMLScriptElement[] = [];
  let linkedinLoaded = false;
  let pinterestLoaded = false;
  let withdrawn = false;
  let disposed = false;
  let lastPinterestPage: string | null = null;

  const permitted = () => {
    const navigator = browser.navigator as Navigator & { globalPrivacyControl?: boolean };
    const path = browser.location.pathname.replace(/\/$/, "") || "/";
    return (
      !withdrawn &&
      !disposed &&
      navigator.doNotTrack !== "1" &&
      navigator.doNotTrack !== "yes" &&
      navigator.globalPrivacyControl !== true &&
      PUBLIC_PATHS.has(path) &&
      isSafeCampaignSearch(browser.location.search) &&
      (!browser.location.hash ||
        (path === "/partenaires" && browser.location.hash === "#commandite"))
    );
  };
  const safePayload = (payload: ExtendedMarketingPayload): ExtendedMarketingPayload | null => {
    if (!payload || !PUBLIC_PATHS.has(payload.page_path)) return null;
    const currentPath = browser.location.pathname.replace(/\/$/, "") || "/";
    if (payload.page_path !== currentPath) return null;
    // Copy only approved fields; form/contact data and arbitrary event details are discarded.
    return {
      page_path: payload.page_path,
      ...(typeof payload.section === "string" && SECTIONS.has(payload.section)
        ? { section: payload.section }
        : {}),
    };
  };
  const appendScript = (provider: "linkedin" | "pinterest", src: string) => {
    const element = browser.document.createElement("script");
    element.async = true;
    element.src = src;
    element.referrerPolicy = "no-referrer";
    element.dataset["ahmvTracker"] = provider;
    browser.document.head.appendChild(element);
    scripts.push(element);
  };

  const adapters: ExtendedMarketingAdapters = {
    load() {
      if (!permitted()) return;
      if (linkedin && !linkedinLoaded) {
        global._linkedin_partner_id = linkedin;
        global._linkedin_data_partner_ids ??= [];
        if (!global._linkedin_data_partner_ids.includes(linkedin))
          global._linkedin_data_partner_ids.push(linkedin);
        if (!global.lintrk) {
          const lintrk: LinkedInTracker = Object.assign(
            (...args: unknown[]) => {
              if (permitted()) lintrk.q.push(args);
            },
            { q: [] as unknown[][] },
          );
          global.lintrk = lintrk;
        }
        appendScript("linkedin", "https://snap.licdn.com/li.lms-analytics/insight.min.js");
        linkedinLoaded = true;
      }
      if (pinterest && !pinterestLoaded) {
        if (!global.pintrk) {
          const pintrk: PinterestTracker = Object.assign(
            (...args: unknown[]) => {
              if (permitted()) pintrk.queue.push(args);
            },
            { queue: [] as unknown[][], version: "3.0" },
          );
          global.pintrk = pintrk;
        }
        // No enhanced matching, email address or inferred conversion is configured.
        global.pintrk("load", pinterest);
        appendScript("pinterest", "https://s.pinimg.com/ct/core.js");
        pinterestLoaded = true;
      }
    },
    pageView(payload) {
      const safe = safePayload(payload);
      if (!safe || !permitted()) return;
      adapters.load();
      if (pinterestLoaded && lastPinterestPage !== safe.page_path) {
        global.pintrk?.("page", { page_path: safe.page_path });
        lastPinterestPage = safe.page_path;
      }
      // LinkedIn Insight records its initial page view when its SDK loads.
      // SPA conversions require a verified operator conversion ID; none is invented here.
    },
    event(name, payload) {
      const safe = safePayload(payload);
      if (!EVENTS.has(name) || !safe || !permitted()) return;
      adapters.load();
      if (pinterestLoaded) global.pintrk?.("track", "custom", { event_name: name, ...safe });
      // LinkedIn conversions stay disabled until the operator configures conversion IDs.
    },
    withdraw() {
      const requiresReload = linkedinLoaded || pinterestLoaded;
      withdrawn = true;
      for (const element of scripts) element.remove();
      scripts.splice(0);
      if (linkedinLoaded) {
        global.lintrk?.q?.splice(0);
        global.lintrk = Object.assign(() => undefined, { q: [] as unknown[][] });
        global._linkedin_data_partner_ids = (global._linkedin_data_partner_ids ?? []).filter(
          (id) => id !== linkedin,
        );
        if (global._linkedin_partner_id === linkedin) delete global._linkedin_partner_id;
      }
      if (pinterestLoaded) {
        global.pintrk?.queue?.splice(0);
        global.pintrk = Object.assign(() => undefined, {
          queue: [] as unknown[][],
          version: "3.0",
        });
      }
      clearExtensionCookies(browser);
      linkedinLoaded = false;
      pinterestLoaded = false;
      return requiresReload;
    },
    dispose() {
      disposed = true;
    },
  };
  return adapters;
}
