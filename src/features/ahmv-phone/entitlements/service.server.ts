import type { AhmvPhoneContact } from "../contacts/store.server";
import {
  canUse,
  localEntitlement,
  type AhmvEntitlement,
  type AhmvPhoneCapability,
} from "./access";
import { resolveTakatakPhoneEntitlement } from "../takatak/entitlements.server";

type Settings = Record<string, string | undefined>;

export async function resolvePhoneEntitlement(
  contact: AhmvPhoneContact | null,
  capability: AhmvPhoneCapability,
  settings: Settings = process.env,
): Promise<AhmvEntitlement> {
  const local = contact
    ? localEntitlement(
        contact.accessTier,
        contact.trialExpiresAt,
        new Date(),
        contact.premiumExpiresAt,
      )
    : localEntitlement("guest");

  if (canUse(local, capability) || !contact) return local;

  const remote = await resolveTakatakPhoneEntitlement(
    {
      tenant: "ahmverdun",
      phoneE164: contact.phoneE164,
      capability,
    },
    settings,
  );

  return remote?.active
    ? localEntitlement("premium", undefined, new Date(), remote.expiresAt)
    : local;
}

export function memberActivationUrl(settings: Settings = process.env) {
  const fallback = "https://takatak.ca/login?next=%2Fdashboard%2Fhockey";
  const value = settings["TAKATAK_AHMV_MEMBER_URL"] ?? fallback;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}
