type RuntimeSettings = Record<string, string | undefined>;

/** Read server configuration when a request arrives, never from Vite's client build. */
export function getAhmvContentRuntimeConfig(settings: RuntimeSettings = process.env) {
  const enabled = settings["TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED"] === "true";
  const rawOrigin = settings["TAKATAK_CONTENT_ORIGIN"]?.trim() || "https://takatak.ca";
  const token = settings["TAKATAK_AHMV_CONTENT_TOKEN"]?.trim() ?? "";

  let origin: URL | undefined;
  try {
    const candidate = new URL(rawOrigin);
    if (candidate.protocol === "https:") origin = candidate;
  } catch {
    origin = undefined;
  }

  return {
    enabled,
    origin,
    token,
    ready: enabled && Boolean(origin) && token.length >= 32,
  };
}
