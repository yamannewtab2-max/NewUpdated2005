/** Level helpers shared by the student views. */

/**
 * Levels are stored as strings ("Kelas 3"), but data written by earlier builds can
 * hold a bare number (3) or the older "Level 3" wording. Never call .match on the raw
 * value — coerce first, otherwise one student with a numeric level crashes the view.
 */

/** The preparatory intake — printed as "ت" in the dormitory roster, i.e. level 0. */
export const LEVEL_TAMHIDI = 'Kelas Tamhidi';

/** The levels a student can be in, in order. */
export const levelLabels = (): string[] => [
  LEVEL_TAMHIDI,
  'Kelas 1',
  'Kelas 2',
  'Kelas 3',
  'Kelas 4',
];

const rawLevel = (level?: string | number | null): string => {
  if (level === null || level === undefined) return '';
  return String(level).trim();
};

/** "Kelas 3" / "Level 3" / 3 / "3" -> "3"; "Kelas Tamhidi" -> "0"; missing -> "–" */
export const levelNumber = (level?: string | number | null): string => {
  const raw = rawLevel(level);
  if (!raw) return '–';
  const match = raw.match(/(\d+)/);
  if (match) return match[1];
  if (/tamhidi|تمهيدي/i.test(raw)) return '0';
  return '–';
};

/** The canonical label of any stored level value. */
export const levelLabel = (level?: string | number | null): string | undefined => {
  const raw = rawLevel(level);
  if (!raw) return undefined;
  const num = levelNumber(raw);
  if (num === '0') return LEVEL_TAMHIDI;
  if (num !== '–') return `Kelas ${num}`;
  return raw; // a custom label the user typed
};

/** Normalise any stored level into its canonical label ("Level 3" -> "Kelas 3"). */
export const normalizeLevel = (level?: string | number | null): string | undefined =>
  levelLabel(level);

/** Badge colour classes for a level — accepts "Kelas 3", "Level 3" or the bare number 3. */
export const levelBadgeColor = (level?: string | number | null): string => {
  switch (levelNumber(level)) {
    case '0':
      // the Tamhidi intake — printed as "ت" in the dormitory roster
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case '1':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case '2':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case '3':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case '4':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case '5':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
