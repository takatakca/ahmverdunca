import { createHmac, timingSafeEqual } from "node:crypto";

export const AHMV_EXPERIENCE_COOKIE = "__Host-ahmv_experience";

export type AhmvExperienceSession = {
  v: 1;
  identityId: string;
  displayName: string | null;
  product: "ahmv";
  entitlement: "ahmv_access";
  planCode: string | null;
  exp: number;
};

function sessionSecret(): string {
  const value = process.env["AHMV_EXPERIENCE_SESSION_SECRET"]?.trim() ?? "";
  if (value.length < 32) {
    throw new Error("AHMV_EXPERIENCE_SESSION_SECRET must contain at least 32 characters.");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function encodeAhmvExperienceSession(
  input: Omit<AhmvExperienceSession, "v">,
): string {
  const payload: AhmvExperienceSession = { v: 1, ...input };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function decodeAhmvExperienceSession(
  value: string | null | undefined,
): AhmvExperienceSession | null {
  if (!value) return null;
  const [encoded, signature, extra] = value.split(".");
  if (!encoded || !signature || extra || !safeEqual(sign(encoded), signature)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<AhmvExperienceSession>;

    if (
      payload.v !== 1 ||
      typeof payload.identityId !== "string" ||
      payload.product !== "ahmv" ||
      payload.entitlement !== "ahmv_access" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }

    return {
      v: 1,
      identityId: payload.identityId,
      displayName: typeof payload.displayName === "string" ? payload.displayName : null,
      product: "ahmv",
      entitlement: "ahmv_access",
      planCode: typeof payload.planCode === "string" ? payload.planCode : null,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function readAhmvExperienceSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${AHMV_EXPERIENCE_COOKIE}=`));
  if (!cookie) return null;
  return decodeAhmvExperienceSession(
    decodeURIComponent(cookie.slice(AHMV_EXPERIENCE_COOKIE.length + 1)),
  );
}

export function ahmvExperienceSetCookie(
  session: Omit<AhmvExperienceSession, "v">,
): string {
  const value = encodeAhmvExperienceSession(session);
  const maxAge = Math.max(1, Math.floor((session.exp - Date.now()) / 1000));
  return [
    `${AHMV_EXPERIENCE_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

export function ahmvExperienceClearCookie(): string {
  return [
    `${AHMV_EXPERIENCE_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}
