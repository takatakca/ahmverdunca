/** Preserve the Montreal publication day from an explicit offset-aware source timestamp. */
export function montrealPublicationDate(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value))
    return undefined;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return undefined;
  const sourceDay = value.slice(0, 10);
  const sourceDate = new Date(`${sourceDay}T12:00:00Z`);
  if (!Number.isFinite(sourceDate.getTime()) || sourceDate.toISOString().slice(0, 10) !== sourceDay)
    return undefined;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
