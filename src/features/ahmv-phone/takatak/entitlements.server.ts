export interface TakatakPhoneEntitlementRequest {
  tenant: "ahmverdun";
  phoneE164: string;
  capability: string;
}

export interface TakatakPhoneEntitlementResponse {
  identityId?: string | undefined;
  active: boolean;
  planCode?: string | undefined;
  expiresAt?: string | undefined;
}

function validFutureIso(value: unknown, now = new Date()) {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || parsed <= now.getTime()) return null;
  return new Date(parsed).toISOString();
}

/**
 * Server-to-server TAKATAK entitlement boundary.
 * AHMV never mints paid access locally; active access must be time-bounded.
 */
export async function resolveTakatakPhoneEntitlement(
  request: TakatakPhoneEntitlementRequest,
  settings: Record<string, string | undefined> = process.env,
): Promise<TakatakPhoneEntitlementResponse | null> {
  const endpoint = settings["TAKATAK_AHMV_ENTITLEMENT_URL"]?.trim();
  const token = settings["TAKATAK_AHMV_SERVICE_TOKEN"]?.trim();
  if (!endpoint || !token) return null;

  let url: URL;
  try {
    url = new URL(endpoint);
    if (url.protocol !== "https:") {
      throw new Error("TAKATAK entitlement endpoint must use HTTPS");
    }
  } catch {
    throw new Error("TAKATAK entitlement endpoint must be a valid HTTPS URL");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) return null;

  const raw = (await response.json()) as Record<string, unknown>;
  if (typeof raw["active"] !== "boolean") return null;

  const identityId =
    typeof raw["identityId"] === "string"
      ? raw["identityId"].slice(0, 256)
      : undefined;
  const planCode =
    typeof raw["planCode"] === "string"
      ? raw["planCode"].slice(0, 128)
      : undefined;

  if (raw["active"] === false) {
    return {
      active: false,
      identityId,
      planCode,
    };
  }

  const expiresAt = validFutureIso(raw["expiresAt"]);
  if (!expiresAt) return null;

  return {
    active: true,
    identityId,
    planCode,
    expiresAt,
  };
}
