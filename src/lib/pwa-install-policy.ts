export const INSTALL_DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type InstallMode = "installed" | "native" | "ios" | "browser-guide";

export function getInstallMode({
  installed,
  nativeAvailable,
  ios,
}: {
  installed: boolean;
  nativeAvailable: boolean;
  ios: boolean;
}): InstallMode {
  if (installed) return "installed";
  if (nativeAvailable) return "native";
  return ios ? "ios" : "browser-guide";
}

export function isInstallDismissalRecent(value: string | null, now = Date.now()) {
  const dismissedAt = Number(value);
  return Number.isFinite(dismissedAt)
    && dismissedAt > 0
    && dismissedAt <= now
    && now - dismissedAt < INSTALL_DISMISS_TTL_MS;
}

/** Automatic offers require a browser capability; manual help is always available. */
export function shouldOfferAutomaticInstall(mode: InstallMode, dismissed: boolean) {
  return !dismissed && (mode === "native" || mode === "ios");
}
