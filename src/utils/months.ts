/** Month-key helpers. A month key is always 'YYYY-MM'. */

export const monthKeyOf = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const currentMonthKey = (): string => monthKeyOf(new Date());

const MONTH_NAMES: Record<'en' | 'id', string[]> = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  id: [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ],
};

/** '2026-09' -> 'September 2026' (or 'September 2026' in id). */
export const monthLabel = (key: string, lang: 'en' | 'id' = 'en'): string => {
  const [year, month] = key.split('-').map(Number);
  const names = MONTH_NAMES[lang] ?? MONTH_NAMES.en;
  const name = names[(month || 1) - 1] ?? key;
  return `${name} ${year}`;
};

/** Short label, e.g. 'Sep 2026'. */
export const monthLabelShort = (key: string, lang: 'en' | 'id' = 'en'): string =>
  monthLabel(key, lang).slice(0, 3) + ' ' + (key.split('-')[1] ? key.split('-')[0] : '');

export const daysInMonth = (key: string): number => {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

export const dayOfMonth = (key: string, today = new Date()): number =>
  monthKeyOf(today) === key ? today.getDate() : daysInMonth(key);

/** Days remaining in the month; 0 once the month is over. */
export const daysLeftInMonth = (key: string, today = new Date()): number => {
  const nowKey = monthKeyOf(today);
  if (key < nowKey) return 0;
  if (key > nowKey) return daysInMonth(key);
  return Math.max(0, daysInMonth(key) - today.getDate());
};

export const isCurrentMonth = (key: string): boolean => key === currentMonthKey();

export const isPastMonth = (key: string): boolean => key < currentMonthKey();

export const shiftMonth = (key: string, delta: number): string => {
  const [year, month] = key.split('-').map(Number);
  return monthKeyOf(new Date(year, month - 1 + delta, 1));
};

/** Ascending list of the last `count` month keys, ending at `endKey`. */
export const lastMonths = (count: number, endKey = currentMonthKey()): string[] => {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) out.push(shiftMonth(endKey, -i));
  return out;
};

/** First day of the next month — when the dashboard counter rolls over. */
export const nextResetDate = (today = new Date()): Date =>
  new Date(today.getFullYear(), today.getMonth() + 1, 1);
