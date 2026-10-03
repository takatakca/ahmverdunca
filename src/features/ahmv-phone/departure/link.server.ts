import { createHmac, timingSafeEqual } from "node:crypto";

type Settings = Record<string, string | undefined>;

const DEFAULT_TTL_SECONDS = 24 * 60 * 60;
const MAX_TTL_SECONDS = 7 * 24 * 60 * 60;

function secret(settings: Settings) {
  const value = settings["AHMV_DEPARTURE_LINK_SECRET"]?.trim();
  return value && value.length >= 32 ? value : null;
}

function signature(eventId: string, expires: number, key: string) {
  return createHmac("sha256", key)
    .update(`${eventId}.${expires}`, "utf8")
    .digest("hex")
    .slice(0, 32);
}

export function createSignedDepartureLink(
  eventId: string,
  settings: Settings = process.env,
  now = new Date(),
  ttlSeconds = DEFAULT_TTL_SECONDS,
) {
  if (settings["AHMV_SMART_DEPARTURE_ENABLED"] !== "true") return null;
  const key = secret(settings);
  if (!key || !eventId.trim()) return null;

  const ttl =
    Number.isInteger(ttlSeconds) &&
    ttlSeconds >= 60 &&
    ttlSeconds <= MAX_TTL_SECONDS
      ? ttlSeconds
      : DEFAULT_TTL_SECONDS;

  const expires = Math.floor(now.getTime() / 1000) + ttl;
  const sig = signature(eventId, expires, key);
  const url = new URL("https://ahmverdun.ca/api/ahmv/departure");
  url.searchParams.set("event", eventId);
  url.searchParams.set("exp", String(expires));
  url.searchParams.set("sig", sig);
  return url.toString();
}

export function validateDepartureLink(
  input: {
    eventId: string;
    expires: string;
    signature: string;
  },
  settings: Settings = process.env,
  now = new Date(),
) {
  const key = secret(settings);
  if (!key || settings["AHMV_SMART_DEPARTURE_ENABLED"] !== "true") {
    return false;
  }

  const expires = Number(input.expires);
  const nowSeconds = Math.floor(now.getTime() / 1000);
  if (
    !input.eventId ||
    !Number.isInteger(expires) ||
    expires <= nowSeconds ||
    expires > nowSeconds + MAX_TTL_SECONDS ||
    !/^[a-f0-9]{32}$/i.test(input.signature)
  ) {
    return false;
  }

  const expected = Buffer.from(
    signature(input.eventId, expires, key),
    "utf8",
  );
  const supplied = Buffer.from(input.signature.toLowerCase(), "utf8");

  return (
    expected.length === supplied.length &&
    timingSafeEqual(expected, supplied)
  );
}
