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
