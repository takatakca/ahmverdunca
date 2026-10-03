export type MarketingConsentCommand =
  | { kind: "marketing-opt-in" }
  | { kind: "marketing-opt-out" };

export function parseMarketingConsentCommand(
  query: string,
): MarketingConsentCommand | null {
  const normalized = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

  if (
    /^(OFFRES|PROMO|MARKETING) (OUI|YES)$/.test(normalized) ||
    /^(OFFERS) YES$/.test(normalized)
  ) {
    return { kind: "marketing-opt-in" };
  }

  if (
    /^(OFFRES|PROMO|MARKETING) (NON|NO)$/.test(normalized) ||
    /^(OFFERS) NO$/.test(normalized)
  ) {
    return { kind: "marketing-opt-out" };
  }

  return null;
}
