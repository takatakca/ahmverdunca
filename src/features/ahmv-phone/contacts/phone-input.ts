/**
 * Normalize a caller-supplied North American mobile number collected by DTMF.
 *
 * The raw digits are intentionally never placed in a URL or log field.
 * Twilio submits them in the signed webhook body and the application immediately
 * converts them to E.164 before contact/SMS use.
 */
export function normalizeNanpDtmf(value: string | undefined): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  const tenDigits =
    digits.length === 11 && digits.startsWith("1")
      ? digits.slice(1)
      : digits;

  if (!/^[2-9][0-9]{2}[2-9][0-9]{6}$/.test(tenDigits)) {
    return null;
  }

  return `+1${tenDigits}`;
}
