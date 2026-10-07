import { describe, expect, test } from "bun:test";
import {
  getInstallMode,
  INSTALL_DISMISS_TTL_MS,
  isInstallDismissalRecent,
  shouldOfferAutomaticInstall,
} from "../src/lib/pwa-install-policy";

describe("AHMV installation capability and dismissal", () => {
  test("an installed site never offers a second automatic installation", () => {
    const mode = getInstallMode({ installed: true, nativeAvailable: true, ios: true });
    expect(mode).toBe("installed");
    expect(shouldOfferAutomaticInstall(mode, false)).toBe(false);
  });

  test("native installation is offered only with the browser event", () => {
    expect(getInstallMode({ installed: false, nativeAvailable: true, ios: false })).toBe("native");
    const noEvent = getInstallMode({ installed: false, nativeAvailable: false, ios: false });
    expect(noEvent).toBe("browser-guide");
    expect(shouldOfferAutomaticInstall(noEvent, false)).toBe(false);
  });

  test("iPhone and iPad retain manual Share instructions without a native event", () => {
    const mode = getInstallMode({ installed: false, nativeAvailable: false, ios: true });
    expect(mode).toBe("ios");
    expect(shouldOfferAutomaticInstall(mode, false)).toBe(true);
  });

  test("automatic dismissal expires exactly after 14 days", () => {
    const dismissedAt = Date.parse("2026-10-06T16:00:00Z");
    expect(isInstallDismissalRecent(String(dismissedAt), dismissedAt + INSTALL_DISMISS_TTL_MS - 1)).toBe(true);
    expect(isInstallDismissalRecent(String(dismissedAt), dismissedAt + INSTALL_DISMISS_TTL_MS)).toBe(false);
  });

  test("a recent dismissal suppresses automatic offers while leaving manual help available", () => {
    const modes = [
      getInstallMode({ installed: false, nativeAvailable: true, ios: false }),
      getInstallMode({ installed: false, nativeAvailable: false, ios: true }),
      getInstallMode({ installed: false, nativeAvailable: false, ios: false }),
    ];
    expect(modes).toEqual(["native", "ios", "browser-guide"]);
    expect(modes.every((mode) => !shouldOfferAutomaticInstall(mode, true))).toBe(true);
  });

  test("missing, malformed and future dismissal values do not hide installation indefinitely", () => {
    const now = Date.parse("2026-10-06T16:00:00Z");
    for (const value of [null, "", "1x", "NaN", "Infinity", "-1", "0", String(now + 1)]) {
      expect(isInstallDismissalRecent(value, now)).toBe(false);
    }
  });
});

// Browser preferences must not turn optional persistence into a site failure.
describe("browser preference storage resilience", () => {
  test("blocked storage retains preferences for the current page and permits reset", async () => {
    const { readBrowserPreference, writeBrowserPreference, removeBrowserPreference } = await import("../src/lib/browser-preferences");
    const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
    const denied = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("SecurityError"); }, removeItem() { throw new Error("SecurityError"); } };
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: denied, sessionStorage: denied } });
    try {
      expect(readBrowserPreference("blocked-language")).toBeNull();
      writeBrowserPreference("blocked-language", "en");
      expect(readBrowserPreference("blocked-language")).toBe("en");
      expect(readBrowserPreference("blocked-language", "sessionStorage")).toBeNull();
      removeBrowserPreference("blocked-language");
      expect(readBrowserPreference("blocked-language")).toBeNull();
      writeBrowserPreference("blocked-splash", "1", "sessionStorage");
      expect(readBrowserPreference("blocked-splash", "sessionStorage")).toBe("1");
      removeBrowserPreference("blocked-splash", "sessionStorage");
    } finally {
      if (previous) Object.defineProperty(globalThis, "window", previous);
      else Reflect.deleteProperty(globalThis, "window");
    }
  });

  test("quota failure does not revert to an older persisted value", async () => {
    const { readBrowserPreference, writeBrowserPreference, removeBrowserPreference } = await import("../src/lib/browser-preferences");
    const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
    const quota = { getItem() { return "fr"; }, setItem() { throw new Error("QuotaExceededError"); }, removeItem() { throw new Error("SecurityError"); } };
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: quota } });
    try {
      expect(readBrowserPreference("quota-language")).toBe("fr");
      writeBrowserPreference("quota-language", "en");
      expect(readBrowserPreference("quota-language")).toBe("en");
      removeBrowserPreference("quota-language");
      expect(readBrowserPreference("quota-language")).toBeNull();
    } finally {
      if (previous) Object.defineProperty(globalThis, "window", previous);
      else Reflect.deleteProperty(globalThis, "window");
    }
  });

  test("SSR does not read or retain browser preferences", async () => {
    const { readBrowserPreference, writeBrowserPreference } = await import("../src/lib/browser-preferences");
    const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
    Reflect.deleteProperty(globalThis, "window");
    try {
      writeBrowserPreference("server-only-test", "en");
      expect(readBrowserPreference("server-only-test")).toBeNull();
    } finally {
      if (previous) Object.defineProperty(globalThis, "window", previous);
    }
  });
});
