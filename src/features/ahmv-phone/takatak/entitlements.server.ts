export interface TakatakPhoneEntitlementRequest {
  tenant: "ahmverdun";
  phoneE164: string;
  capability: string;
}

export interface TakatakPhoneEntitlementResponse {
  identityId?: string;
  active: boolean;
  planCode?: string;
  expiresAt?: string;
}

/**
 * Boundary only. AHMV does not mint paid access.
 * Replace with the authenticated tenant-scoped TAKATAK API when that endpoint is available.
 */
export async function resolveTakatakPhoneEntitlement(
  request: TakatakPhoneEntitlementRequest,
  settings: Record<string, string | undefined> = process.env,
): Promise<TakatakPhoneEntitlementResponse | null> {
  const endpoint = settings["TAKATAK_AHMV_ENTITLEMENT_URL"];
  const token = settings["TAKATAK_AHMV_SERVICE_TOKEN"];
  if (!endpoint || !token) return null;
  const url = new URL(endpoint);
  if (url.protocol !== "https:") throw new Error("TAKATAK entitlement endpoint must use HTTPS");
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) return null;
  const value = (await response.json()) as TakatakPhoneEntitlementResponse;
  return typeof value.active === "boolean" ? value : null;
}
