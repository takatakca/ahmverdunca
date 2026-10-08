import { describe, expect, test } from "bun:test";
import { createExtendedMarketingAdapters } from "../src/lib/marketing-extensions";

type QueueCall = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  queue?: unknown[][];
  version?: string;
};
type TestWindow = Window & {
  lintrk?: QueueCall;
  pintrk?: QueueCall;
  _linkedin_partner_id?: string;
  _linkedin_data_partner_ids?: string[];
};
const CONFIG = { linkedin: "1234567", pinterest: "1234567890123" };

function fakeBrowser(url = "https://ahmverdun.ca/partenaires") {
  const scripts: Array<{ src: string; dataset: Record<string, string>; removed: boolean }> = [];
  const cookieWrites: string[] = [];
  const location = new URL(url);
  const navigator = { doNotTrack: null as string | null, globalPrivacyControl: false };
  const document = {
    createElement() {
      const script = {
        src: "",
        dataset: {} as Record<string, string>,
        removed: false,
        remove() {
          this.removed = true;
        },
      };
      return script;
    },
    head: {
      appendChild(script: (typeof scripts)[number]) {
        scripts.push(script);
      },
    },
    get cookie() {
      return "li_fat_id=linkedin; _pin_unauth=pinterest; _derived_epik=epik; ahmv-team=keep";
    },
    set cookie(value: string) {
      cookieWrites.push(value);
    },
  };
  return {
    browser: { document, location, navigator } as unknown as TestWindow,
    location,
    navigator,
    scripts,
    cookieWrites,
  };
}

describe("additional consent-controlled marketing adapters", () => {
  test("missing and malformed public identifiers load no third-party SDK", () => {
    for (const config of [
      { linkedin: null, pinterest: null },
      { linkedin: "0", pinterest: "not-a-public-id" },
      { linkedin: "12345?email=someone@example.com", pinterest: "javascript:alert(1)" },
      { linkedin: "-1234567", pinterest: "0012345678901" },
    ]) {
      const { browser, scripts } = fakeBrowser();
      const adapters = createExtendedMarketingAdapters(config, browser);
      adapters.load();
      adapters.pageView({ page_path: "/partenaires" });
      adapters.event("sponsorship_prepare", { page_path: "/partenaires" });
      expect(scripts).toHaveLength(0);
      expect(browser.lintrk).toBeUndefined();
      expect(browser.pintrk).toBeUndefined();
      expect(adapters.withdraw()).toBe(false);
    }
  });

  test("official provider bootstrap queues retain only public IDs and load once", () => {
    const { browser, scripts } = fakeBrowser();
    const adapters = createExtendedMarketingAdapters(CONFIG, browser);
    adapters.load();
    adapters.load();
    expect(scripts.map((script) => script.src)).toEqual([
      "https://snap.licdn.com/li.lms-analytics/insight.min.js",
      "https://s.pinimg.com/ct/core.js",
    ]);
    expect(scripts.map((script) => script.dataset["ahmvTracker"])).toEqual([
      "linkedin",
      "pinterest",
    ]);
    expect(browser._linkedin_partner_id).toBe(CONFIG.linkedin);
    expect(browser._linkedin_data_partner_ids).toEqual([CONFIG.linkedin]);
    expect(browser.lintrk?.q).toEqual([]);
    expect(browser.pintrk?.version).toBe("3.0");
    expect(browser.pintrk?.queue).toEqual([["load", CONFIG.pinterest]]);
  });

  test("page views deduplicate and generic clicks never become fabricated conversions or contact matching", () => {
    const { browser, location } = fakeBrowser();
    const adapters = createExtendedMarketingAdapters(CONFIG, browser);
    const payload = {
      page_path: "/partenaires",
      section: "partners",
      email: "parent@example.com",
      team: "M11",
      phone: "5145551212",
    };
    adapters.pageView(payload);
    adapters.pageView(payload);
    adapters.event("sponsorship_prepare", payload);
    adapters.event("Purchase", payload);
    adapters.event("registration_link", {
      page_path: "/partenaires",
      section: "parent@example.com",
    });
    location.pathname = "/inscriptions";
    adapters.pageView({ page_path: "/inscriptions" });
    expect(browser.pintrk?.queue).toEqual([
      ["load", CONFIG.pinterest],
      ["page", { page_path: "/partenaires" }],
      [
        "track",
        "custom",
        { event_name: "sponsorship_prepare", page_path: "/partenaires", section: "partners" },
      ],
      ["track", "custom", { event_name: "registration_link", page_path: "/partenaires" }],
      ["page", { page_path: "/inscriptions" }],
    ]);
    expect(browser.lintrk?.q).toEqual([]);
    expect(JSON.stringify(browser.pintrk?.queue)).not.toContain("parent@example.com");
    expect(JSON.stringify(browser.pintrk?.queue)).not.toContain("5145551212");
  });

  test("private routes, URL personal data and global privacy signals prevent loading", () => {
    for (const url of [
      "https://ahmverdun.ca/equipes/m11-a",
      "https://ahmverdun.ca/partenaires?email=parent@example.com",
      "https://ahmverdun.ca/partenaires#parent@example.com",
    ]) {
      const { browser, scripts } = fakeBrowser(url);
      const adapters = createExtendedMarketingAdapters(CONFIG, browser);
      adapters.load();
      adapters.pageView({ page_path: "/partenaires" });
      expect(scripts).toHaveLength(0);
    }
    for (const signal of ["dnt", "gpc"]) {
      const { browser, navigator, scripts } = fakeBrowser();
      if (signal === "dnt") navigator.doNotTrack = "1";
      else navigator.globalPrivacyControl = true;
      createExtendedMarketingAdapters(CONFIG, browser).load();
      expect(scripts).toHaveLength(0);
    }
  });

  test("payload query text, unrelated routes and unknown sections are filtered before transmission", () => {
    const { browser } = fakeBrowser();
    const adapters = createExtendedMarketingAdapters(CONFIG, browser);
    adapters.load();
    for (const path of [
      "/partenaires?email=parent@example.com",
      "/equipes/m11-a",
      "/contact",
      "https://other.example/partenaires",
    ]) {
      adapters.pageView({ page_path: path });
      adapters.event("sponsorship_prepare", { page_path: path });
    }
    expect(browser.pintrk?.queue).toEqual([["load", CONFIG.pinterest]]);
  });

  test("withdrawal clears queues, removes scripts and tracker cookies, and signals SDK reload", () => {
    const { browser, scripts, cookieWrites } = fakeBrowser();
    const adapters = createExtendedMarketingAdapters(CONFIG, browser);
    adapters.pageView({ page_path: "/partenaires" });
    const savedPinterestQueue = browser.pintrk;
    expect(adapters.withdraw()).toBe(true);
    expect(scripts.every((script) => script.removed)).toBe(true);
    expect(
      cookieWrites.some(
        (cookie) => cookie.startsWith("li_fat_id=;") && cookie.includes("Domain=ahmverdun.ca;"),
      ),
    ).toBe(true);
    expect(
      cookieWrites.some(
        (cookie) => cookie.startsWith("_pin_unauth=;") && cookie.includes("Path=/partenaires;"),
      ),
    ).toBe(true);
    expect(cookieWrites.some((cookie) => cookie.startsWith("ahmv-team="))).toBe(false);
    expect(browser._linkedin_data_partner_ids).toEqual([]);
    expect(browser._linkedin_partner_id).toBeUndefined();
    adapters.load();
    adapters.pageView({ page_path: "/partenaires" });
    adapters.event("sponsorship_prepare", { page_path: "/partenaires" });
    savedPinterestQueue?.("page");
    browser.pintrk?.("page");
    expect(browser.pintrk?.queue).toEqual([]);
    expect(savedPinterestQueue?.queue).toEqual([]);
    expect(scripts).toHaveLength(2);
    expect(adapters.withdraw()).toBe(false);
  });

  test("disposing blocks future work without claiming an executed SDK can be unloaded", () => {
    const { browser, scripts } = fakeBrowser();
    const adapters = createExtendedMarketingAdapters(CONFIG, browser);
    adapters.load();
    adapters.dispose();
    adapters.pageView({ page_path: "/partenaires" });
    adapters.event("sponsorship_prepare", { page_path: "/partenaires" });
    expect(browser.pintrk?.queue).toEqual([["load", CONFIG.pinterest]]);
    expect(scripts.every((script) => !script.removed)).toBe(true);
    expect(adapters.withdraw()).toBe(true);
  });

  test("browser-denied cookie access does not prevent queue and script withdrawal", () => {
    const { browser, scripts } = fakeBrowser();
    Object.defineProperty(browser.document, "cookie", {
      get() {
        throw new Error("Cookie access denied");
      },
      set() {
        throw new Error("Cookie access denied");
      },
    });
    const adapters = createExtendedMarketingAdapters(CONFIG, browser);
    adapters.pageView({ page_path: "/partenaires" });
    expect(adapters.withdraw()).toBe(true);
    expect(browser.pintrk?.queue).toEqual([]);
    expect(scripts.every((script) => script.removed)).toBe(true);
  });
});
