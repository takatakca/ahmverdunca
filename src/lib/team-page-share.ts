/**
 * Share a PUBLIC team microsite only. This helper must never form private
 * TeamLinkt deep links, player identifiers, invite tokens or tracking URLs.
 */
const EXACT_TEAM_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function publicTeamShareUrl(origin: string, teamSlug: string): string | null {
  if (!EXACT_TEAM_SLUG.test(teamSlug) || teamSlug.length > 80) return null;

  try {
    const parsed = new URL(origin);
    if (!["https:", "http:"].includes(parsed.protocol)) return null;
    if (parsed.username || parsed.password) return null;
    if (parsed.hostname === "") return null;

    // Use only the normalized origin: avoid retaining an incoming query,
    // hash, URL path, secret, or third-party parameter.
    return new URL(`/equipes/${teamSlug}`, parsed.origin).href;
  } catch {
    return null;
  }
}

export type TeamShareOutcome = "shared" | "copied" | "manual" | "cancelled";

export interface TeamShareBrowser {
  share?: (data: { title: string; text: string; url: string }) => Promise<void>;
  clipboard?: { writeText: (value: string) => Promise<void> };
}

/**
 * Only call this inside a direct user click, so native share retains
 * transient user activation. Never report successful sharing on cancellation.
 */
export async function sharePublicTeamPage(
  browser: TeamShareBrowser,
  info: { title: string; text: string; url: string },
): Promise<TeamShareOutcome> {
  if (typeof browser.share === "function") {
    try {
      await browser.share(info);
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "cancelled";
      // Other failures should use a safe copy/manual fallback.
    }
  }

  if (typeof browser.clipboard?.writeText === "function") {
    try {
      await browser.clipboard.writeText(info.url);
      return "copied";
    } catch {
      // Clipboard may be denied on insecure contexts or private browsers.
    }
  }

  return "manual";
}
