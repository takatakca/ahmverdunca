import { afterEach, describe, expect, test } from "bun:test";
import {
  createMarketingController,
  getCurrentMarketingConsent,
  getMarketingConfig,
  hasMarketingConfig,
  marketingEventPayload,
  marketingPagePath,
  readMarketingConsent,
  respectsPrivacySignal,
  saveMarketingConsent,
  MARKETING_CONSENT_KEY,
  type MarketingEvent,
} from "../src/lib/marketing";

// Non-production fixtures. No provider requests are made: script append is a DOM mock.
const configured = () =>
  getMarketingConfig({
    VITE_GA4_MEASUREMENT_ID: "G-TEST123456",
    VITE_META_PIXEL_ID: "123456789012345",
    VITE_TIKTOK_PIXEL_ID: "TEST1234567890ABCDEF",
    VITE_GOOGLE_ADS_ID: "AW-123456789",
    VITE_MICROSOFT_UET_ID: "123456789",
  });
function mockBrowser(initial = "https://ahmverdun.ca/") {
  let url = new URL(initial);
  const scripts: Array<{
    src: string;
    async: boolean;
    referrerPolicy: string;
    dataset: Record<string, string>;
    onload?: () => void;
    removed: boolean;
    remove(): void;
  }> = [];
  const cookies = new Map<string, string>();
  const cookieWrites: string[] = [];
  const preferences = new Map<string, string>();
  let preferenceWrites = 0;
  const document = {
    createElement: () => ({
      src: "",
      async: false,
      referrerPolicy: "",
      dataset: {},
      removed: false,
      remove() {
        this.removed = true;
      },
    }),
    head: { appendChild: (script: (typeof scripts)[number]) => scripts.push(script) },
    querySelectorAll: () => scripts,
  };
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: () => Array.from(cookies, ([key, value]) => `${key}=${value}`).join("; "),
    set(value: string) {
      cookieWrites.push(value);
      const [name] = value.split("=");
      if (value.includes("Max-Age=0") && name) cookies.delete(name);
    },
  });
  const state: Record<string, unknown> = {
    document,
    navigator: { doNotTrack: null, globalPrivacyControl: false },
    localStorage: {
      getItem: (key: string) => preferences.get(key) ?? null,
      setItem: (key: string, value: string) => {
        preferences.set(key, value);
        preferenceWrites++;
      },
      removeItem: (key: string) => preferences.delete(key),
    },
  };
  Object.defineProperty(state, "location", { get: () => url });
  return {
    browser: state as unknown as Window,
    state,
    scripts,
    cookies,
    cookieWrites,
    preferences,
    preferenceWrites: () => preferenceWrites,
    navigate: (next: string) => {
      url = new URL(next, initial);
    },
  };
}
function commands(state: Record<string, unknown>) {
  return ((state["dataLayer"] ?? []) as Array<IArguments | unknown[]>).map((args) =>
    Array.from(args),
  );
}
function activateBrowser(browser: Window) {
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
}
afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("consented marketing adapters", () => {
  test("malformed IDs and absent config are disabled, including attempted script injection", () => {
    const config = getMarketingConfig({
      VITE_GA4_MEASUREMENT_ID: 'G-123" onload=alert(1)',
      VITE_META_PIXEL_ID: "-123",
      VITE_TIKTOK_PIXEL_ID: "https://evil.test",
      VITE_GOOGLE_ADS_ID: "AW-abc",
      VITE_MICROSOFT_UET_ID: "token",
      VITE_LINKEDIN_PARTNER_ID: "secret",
      VITE_PINTEREST_TAG_ID: "abc",
      VITE_ADSENSE_ENABLED: "true",
      VITE_ADSENSE_CLIENT: "ca-pub-1",
    });
    expect(hasMarketingConfig(config)).toBe(false);
    const mock = mockBrowser();
    const controller = createMarketingController(config, mock.browser);
    controller.setConsent({ analytics: true, marketing: true });
    controller.pageView("/");
    expect(mock.scripts).toHaveLength(0);
    expect(commands(mock.state)).toHaveLength(0);
  });
  test("no tracker script, provider queue, cookie or persisted preference before an explicit choice", () => {
    const mock = mockBrowser();
    const controller = createMarketingController(configured(), mock.browser);
    controller.pageView("/");
    controller.event("registration_link", { section: "home" });
    controller.setConsent({ analytics: false, marketing: false });
    expect(mock.scripts).toHaveLength(0);
    expect(commands(mock.state)).toHaveLength(0);
    expect(mock.state["fbq"]).toBeUndefined();
    expect(mock.state["ttq"]).toBeUndefined();
    expect(mock.state["uetq"]).toBeUndefined();
    expect(mock.cookieWrites).toHaveLength(0);
    expect(mock.preferenceWrites()).toBe(0);
  });
  test("analytics consent loads GA4 alone; marketing remains separate and gtag loader is shared", () => {
    const mock = mockBrowser();
    const controller = createMarketingController(configured(), mock.browser);
    controller.setConsent({ analytics: true, marketing: false });
    controller.pageView("/");
    expect(mock.scripts).toHaveLength(1);
    expect(mock.scripts[0]?.src).toContain("googletagmanager.com");
    expect(mock.scripts[0]?.referrerPolicy).toBe("no-referrer");
    expect(mock.state["fbq"]).toBeUndefined();
    expect(commands(mock.state).filter((item) => item[0] === "config")).toEqual([
      [
        "config",
        "G-TEST123456",
        expect.objectContaining({
          send_page_view: false,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          page_referrer: "",
        }),
      ],
    ]);
    controller.setConsent({ analytics: true, marketing: true });
    controller.pageView("/");
    expect(mock.scripts.filter((script) => script.src.includes("googletagmanager"))).toHaveLength(
      1,
    );
    expect(mock.scripts).toHaveLength(4);
    expect(mock.state["fbq"]).toBeDefined();
    expect(mock.state["ttq"]).toBeDefined();
    expect(mock.state["uetq"]).toBeDefined();
  });
  test("marketing-only choice never configures GA4 or grants analytics storage", () => {
    const mock = mockBrowser();
    const controller = createMarketingController(configured(), mock.browser);
    controller.setConsent({ analytics: false, marketing: true });
    controller.pageView("/");
    expect(
      commands(mock.state).some((item) => item[0] === "config" && item[1] === "G-TEST123456"),
    ).toBe(false);
    expect(commands(mock.state).find((item) => item[0] === "consent")?.[2]).toEqual(
      expect.objectContaining({
        analytics_storage: "denied",
        ad_storage: "granted",
        ad_user_data: "denied",
      }),
    );
  });
  test("safe preset campaign URLs work but payloads never include query, hash, contacts, teams or arbitrary properties", () => {
    const mock = mockBrowser(
      "https://ahmverdun.ca/partenaires?utm_source=facebook&utm_medium=social&utm_campaign=commandites-2026-2027#commandite",
    );
    const controller = createMarketingController(configured(), mock.browser);
    controller.setConsent({ analytics: true, marketing: true });
    controller.pageView("/partenaires?email=secret@example.com#private");
    controller.event("sponsorship_prepare", {
      section: "partners",
      email: "secret@example.com",
      phone: "5141234567",
      childName: "PrivateChild",
      team: "TeamPrivate",
      url: "https://ahmverdun.ca/?secret=private",
    });
    controller.event("made_up_event" as MarketingEvent, { section: "partners" });
    const events = commands(mock.state).filter((item) => item[0] === "event");
    expect(events.map((item) => item[1])).toEqual([
      "page_view",
      "page_view",
      "sponsorship_prepare",
      "sponsorship_prepare",
    ]);
    expect(events.find((item) => item[1] === "sponsorship_prepare")?.[2]).toEqual({
      page_path: "/partenaires",
      section: "partners",
      send_to: "G-TEST123456",
    });
    const queues = JSON.stringify([
      commands(mock.state),
      (mock.state["fbq"] as { queue: unknown[] }).queue,
      mock.state["ttq"],
      mock.state["uetq"],
    ]);
    for (const privateValue of [
      "secret@example",
      "5141234567",
      "PrivateChild",
      "TeamPrivate",
      "utm_",
      "#commandite",
      "made_up_event",
    ]) {
      expect(queues).not.toContain(privateValue);
    }
  });
  test("unknown URL parameters, private fragments and individual-team/account/search routes contact no provider", () => {
    for (const url of [
      "/?email=person@example.com",
      "/partenaires#private",
      "/equipes/u11-child-name",
      "/connexion",
      "/recherche?q=child",
    ]) {
      const mock = mockBrowser(`https://ahmverdun.ca${url}`);
      const controller = createMarketingController(configured(), mock.browser);
      controller.setConsent({ analytics: true, marketing: true });
      controller.pageView(mock.browser.location.pathname);
      controller.event("registration_link");
      expect(mock.scripts).toHaveLength(0);
    }
    expect(marketingPagePath("https://unrelated.test/partenaires")).toBeNull();
    expect(marketingPagePath("/equipes/private-team")).toBeNull();
    expect(
      marketingEventPayload("/partenaires?phone=private#secret", { section: "PrivatePerson" }),
    ).toEqual({ page_path: "/partenaires" });
  });
  test("SPA public page views deduplicate and later sensitive navigation emits no events", () => {
    const mock = mockBrowser();
    const controller = createMarketingController(configured(), mock.browser);
    controller.setConsent({ analytics: true, marketing: false });
    controller.pageView("/");
    controller.pageView("/");
    mock.navigate("/inscriptions");
    controller.pageView("/inscriptions");
    mock.navigate("/equipes/private-team");
    controller.pageView("/equipes/private-team");
    mock.navigate("/partenaires?email=private@example.com");
    controller.event("sponsorship_prepare");
    const pageViews = commands(mock.state).filter(
      (item) => item[0] === "event" && item[1] === "page_view",
    );
    expect(pageViews).toHaveLength(2);
    expect(pageViews.map((item) => (item[2] as { page_path: string }).page_path)).toEqual([
      "/",
      "/inscriptions",
    ]);
  });
  test("DNT and GPC override all consent and prevent script loading", () => {
    for (const signal of [
      { doNotTrack: "1" },
      { doNotTrack: "yes" },
      { globalPrivacyControl: true },
    ]) {
      const mock = mockBrowser();
      Object.assign(mock.browser.navigator, signal);
      const controller = createMarketingController(configured(), mock.browser);
      controller.setConsent({ analytics: true, marketing: true });
      controller.pageView("/");
      controller.event("registration_link");
      expect(mock.scripts).toHaveLength(0);
    }
    expect(respectsPrivacySignal({ doNotTrack: "0" })).toBe(false);
  });
  test("withdrawal removes own cookies/scripts and stops subsequent events even if called before reload", () => {
    const mock = mockBrowser();
    const controller = createMarketingController(configured(), mock.browser);
    controller.setConsent({ analytics: true, marketing: true });
    controller.pageView("/");
    for (const name of [
      "_ga",
      "_ga_TEST",
      "_fbp",
      "_fbc",
      "_ttp",
      "ttcsid_TEST",
      "_uetsid",
      "_uetvid",
      "_gcl_au",
      "__gads",
      "__gpi",
      "__eoi",
      "ahmv-lang",
    ])
      mock.cookies.set(name, "value");
    expect(controller.setConsent({ analytics: false, marketing: false })).toEqual({
      requiresReload: true,
    });
    const before = JSON.stringify([
      commands(mock.state),
      (mock.state["fbq"] as { queue: unknown[] }).queue,
      mock.state["ttq"],
      mock.state["uetq"],
    ]);
    controller.event("registration_link");
    controller.pageView("/");
    expect(
      JSON.stringify([
        commands(mock.state),
        (mock.state["fbq"] as { queue: unknown[] }).queue,
        mock.state["ttq"],
        mock.state["uetq"],
      ]),
    ).toBe(before);
    expect(mock.scripts.every((script) => script.removed)).toBe(true);
    expect(Array.from(mock.cookies.keys())).toEqual(["ahmv-lang"]);
    expect(mock.state["ga-disable-G-TEST123456"]).toBe(true);
    expect(mock.cookieWrites.some((write) => write.includes("Domain=ahmverdun.ca"))).toBe(true);
    expect(mock.preferenceWrites()).toBe(0);
  });
  test("a late UET script cannot instantiate after withdrawal or sensitive navigation", () => {
    for (const action of ["withdraw", "private-navigation"]) {
      const mock = mockBrowser();
      const controller = createMarketingController(configured(), mock.browser);
      let instances = 0;
      mock.state["UET"] = class {
        constructor() {
          instances++;
        }
        push() {}
      };
      controller.setConsent({ analytics: false, marketing: true });
      const uetScript = mock.scripts.find((script) => script.src.includes("bat.bing.com"));
      if (action === "withdraw") controller.setConsent({ analytics: false, marketing: false });
      else mock.navigate("/contact?email=private@example.com");
      uetScript?.onload?.();
      expect(instances).toBe(0);
    }
  });
  test("cookie access denial cannot break consent decisions or withdrawal", () => {
    const mock = mockBrowser();
    Object.defineProperty(mock.state["document"], "cookie", {
      get: () => {
        throw new Error("Denied");
      },
    });
    const controller = createMarketingController(configured(), mock.browser);
    expect(() => controller.setConsent({ analytics: false, marketing: false })).not.toThrow();
    expect(() => controller.setConsent({ analytics: true, marketing: false })).not.toThrow();
    expect(controller.setConsent({ analytics: false, marketing: false })).toEqual({
      requiresReload: true,
    });
  });
  test("stored consent expires, malformed preferences fail closed and browser privacy signals still win", () => {
    const mock = mockBrowser();
    activateBrowser(mock.browser);
    expect(readMarketingConsent()).toBeNull();
    saveMarketingConsent({ analytics: true, marketing: false }, 1000);
    expect(mock.preferenceWrites()).toBe(1);
    expect(readMarketingConsent(1001)).toEqual({ analytics: true, marketing: false });
    expect(readMarketingConsent(1000 + 181 * 24 * 60 * 60 * 1000)).toBeNull();
    mock.preferences.set(MARKETING_CONSENT_KEY, "bad-json");
    expect(readMarketingConsent(1001)).toBeNull();
    saveMarketingConsent({ analytics: true, marketing: true });
    Object.assign(mock.browser.navigator, { globalPrivacyControl: true });
    expect(getCurrentMarketingConsent()).toEqual({ analytics: false, marketing: false });
  });
});
