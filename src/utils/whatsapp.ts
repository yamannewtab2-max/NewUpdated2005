/**
 * WhatsApp "click to chat" links (https://wa.me).
 * Docs: https://faq.whatsapp.com/5913398998672934
 *   with a number:  https://wa.me/<international number>?text=<urlencoded>
 *   without one:    https://wa.me/?text=<urlencoded>   (WhatsApp shows a contact picker)
 */

/** The institution is in Indonesia, so a local "08xx" number becomes "+62 8xx". */
export const DEFAULT_COUNTRY_CODE = '62';

/**
 * Digits only, in international format: "0812-3456-7890" -> "62812345678".
 * Numbers that already carry a country code are left alone.
 */
export const normalizePhone = (raw?: string | null, countryCode = DEFAULT_COUNTRY_CODE): string => {
  if (raw === null || raw === undefined) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2); // 0062... -> 62...
  if (digits.startsWith('0')) return countryCode + digits.slice(1); // 0812... -> 62812...
  if (digits.startsWith('8')) return countryCode + digits; // 812... -> 62812...
  return digits;
};

/** Build the wa.me link for a student, with or without a saved number. */
export const whatsAppLink = (
  phone: string | null | undefined,
  message: string,
  countryCode = DEFAULT_COUNTRY_CODE
): string => {
  const number = normalizePhone(phone, countryCode);
  const text = encodeURIComponent(message || '');
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
};

/** Pretty form of a saved number, for display: "0812-3456-7890" stays as typed. */
export const displayPhone = (raw?: string | null): string => {
  if (!raw) return '';
  return String(raw).trim();
};
