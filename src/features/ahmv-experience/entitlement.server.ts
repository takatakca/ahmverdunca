import type { AhmvExperienceSession } from "./session.server";
import { readAhmvExperienceSession } from "./session.server";

type IntrospectionPayload = {
  ok?: boolean;
  access?: {
    active?: boolean;
    product?: string;
    entitlement?: string;
    planCode?: string | null;
    status?: string | null;
    currentPeriodEnd?: string | null;
  };
};

function requiredHttpsUrl(name: string): URL {
  const raw = process.env[name]?.trim() ?? "";
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error(`${name} must use HTTPS.`);
  return url;
}

export async function verifyAhmvEntitlementLive(
  session: AhmvExperienceSession,
): Promise<boolean> {
  const token = process.env["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim() ?? "";
  if (token.length < 32) return false;

  try {
    const response = await fetch(requiredHttpsUrl("TAKATAK_AHMV_INTROSPECT_URL"), {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ identityId: session.identityId }),
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return false;
    const payload = (await response.json()) as IntrospectionPayload;
    return Boolean(
      payload.ok === true &&
        payload.access?.active === true &&
        payload.access.product === "ahmv" &&
        payload.access.entitlement === "ahmv_access",
    );
  } catch {
    // Protected experience fails closed if TAKATAK cannot verify entitlement.
    return false;
  }
}

export async function requireLiveAhmvExperienceSession(
  request: Request,
): Promise<AhmvExperienceSession | null> {
  const session = readAhmvExperienceSession(request);
  if (!session) return null;
  return (await verifyAhmvEntitlementLive(session)) ? session : null;
}
