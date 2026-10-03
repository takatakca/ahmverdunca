import type { TakatakAhmvCommunicationEvent } from "./events";

type Settings = Record<string, string | undefined>;

export interface TakatakEventPublishResult {
  delivered: boolean;
  skipped: boolean;
  status?: number | undefined;
}

export async function publishTakatakAhmvEvent(
  event: TakatakAhmvCommunicationEvent,
  settings: Settings = process.env,
): Promise<TakatakEventPublishResult> {
  const endpoint = settings["TAKATAK_AHMV_EVENTS_URL"];
  const token = settings["TAKATAK_AHMV_SERVICE_TOKEN"];

  if (!endpoint || !token) {
    return { delivered: false, skipped: true };
  }

  let url: URL;
  try {
    url = new URL(endpoint);
    if (url.protocol !== "https:") {
      throw new Error("TAKATAK events endpoint must use HTTPS");
    }
  } catch {
    return { delivered: false, skipped: true };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(3000),
    });

    return {
      delivered: response.ok,
      skipped: false,
      status: response.status,
    };
  } catch (error) {
    console.error("[AHMV TAKATAK event]", error);
    return {
      delivered: false,
      skipped: false,
    };
  }
}

export async function safePublishTakatakAhmvEvent(
  event: TakatakAhmvCommunicationEvent,
  settings: Settings = process.env,
) {
  try {
    return await publishTakatakAhmvEvent(event, settings);
  } catch (error) {
    console.error("[AHMV TAKATAK event]", error);
    return { delivered: false, skipped: false } satisfies TakatakEventPublishResult;
  }
}
