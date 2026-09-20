/**
 * Amount inputs: show thousand separators while typing so long numbers stay
 * readable ("50000" -> "50,000" / "50.000"), and read them back as numbers.
 * Only digits are kept — the amounts in this app are whole units.
 */

/** Locale used for digit grouping, following the selected currency. */
export const amountLocale = (currency: string): string => {
  if (currency === 'IDR') return 'id-ID'; // 50.000
  if (currency === 'EUR') return 'de-DE'; // 50.000
  return 'en-US'; // 50,000
};

/** Group the digits of whatever the user typed. */
export const groupDigits = (raw: string, locale: string): string => {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const value = Number(digits);
  if (!Number.isFinite(value)) return '';
  return value.toLocaleString(locale);
};

/** Read a grouped (or plain) string back into a number. */
export const parseGroupedAmount = (raw: string): number => {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return 0;
  const value = Number(digits);
  return Number.isFinite(value) ? value : 0;
};
