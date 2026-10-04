function configuredNewsletterUrl() {
  const raw = import.meta.env["VITE_TAKATAK_NEWSLETTER_URL"]?.trim() ?? "";
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

export function newsletterSignupUrl(
  source: string,
  context: Record<string, string | undefined> = {},
) {
  const url = configuredNewsletterUrl();
  if (!url) return undefined;

  url.searchParams.set("source", source);
  url.searchParams.set("brand", "ahmverdun");
  for (const [key, value] of Object.entries(context)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export const NEWSLETTER_FRONTEND_READY = Boolean(configuredNewsletterUrl());
