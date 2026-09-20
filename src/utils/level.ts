/** Level helpers shared by the student views. */

/**
 * Levels are stored as strings ("Level 3"), but data written by earlier builds
 * can hold a bare number (3). Never call .match on the raw value — coerce first,
 * otherwise one student with a numeric level crashes the whole view.
 */
const rawLevel = (level?: string | number | null): string => {
  if (level === null || level === undefined) return '';
  return String(level).trim();
};

/** "Level 3" / 3 / "3" -> "3"; missing or unknown -> "–" */
export const levelNumber = (level?: string | number | null): string => {
  const raw = rawLevel(level);
  if (!raw) return '–';
  const match = raw.match(/(\d+)/);
  return match ? match[1] : '–';
};

/** Normalise any stored level into the canonical "Level N" string. */
export const normalizeLevel = (level?: string | number | null): string | undefined => {
  const num = levelNumber(level);
  if (num === '–') {
    const raw = rawLevel(level);
    return raw ? raw : undefined;
  }
  return `Level ${num}`;
};

/** Badge colour classes for a level — accepts "Level 3" or the bare number 3. */
export const levelBadgeColor = (level?: string | number | null): string => {
  switch (levelNumber(level)) {
    case '0':
      // the new intake — printed as "ت" in the dormitory roster
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
