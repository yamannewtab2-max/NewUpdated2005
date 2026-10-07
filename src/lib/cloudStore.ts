/**
 * Firestore persistence for Trackly.
 *
 * Shape: collection `trackly_state`, one document per storage key, each holding
 * `{ value: <the same JSON the app keeps in localStorage>, updatedAt }`.
 * One doc per key (rather than one big doc) so a single payment entry does not
 * rewrite the 195-student roster, and so the per-document size limit never bites.
 *
 * The SDK is imported **dynamically**: the Firebase bundle is ~450 kB, and on a
 * phone over mobile data it must not sit in the first paint. It loads with the
 * first cloud read, right after the app is already on screen.
 *
 * Everything here is FAIL-SOFT: the app is fully usable from localStorage, so a
 * missing or disabled Firestore means "no cloud sync", never a broken screen.
 */
export const CLOUD_COLLECTION = 'trackly_state';

/** Firestore rejects `undefined` values, so normalise through JSON first. */
function toStorable(value: unknown): unknown {
  if (value === undefined) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

/** Late-bound handles to the Firebase SDK (kept out of the initial chunk). */
async function firestore() {
  const [{ db }, fs] = await Promise.all([import('./firebase'), import('firebase/firestore')]);
  return { db, ...fs };
}

/**
 * The Firestore web SDK keeps a failed channel open and retries with backoff, so
 * a project with Firestore disabled/offline can leave a read pending for minutes.
 * The UI must never sit on "checking…": bound the read and treat a timeout as
 * "no cloud", while the real read keeps going in the background.
 */
const READ_TIMEOUT_MS = 12_000;

export async function loadCloudStateWithTimeout(): Promise<{ ok: boolean; data: Record<string, unknown> | null }> {
  const timeout = new Promise<{ ok: boolean; data: Record<string, unknown> | null }>((resolve) =>
    setTimeout(() => resolve({ ok: false, data: null }), READ_TIMEOUT_MS),
  );
  return Promise.race([loadCloudState(), timeout]);
}

/** Read every synced key. `ok:false` means the read itself failed (offline / rules),
 *  which is different from "the cloud is empty" — the caller must not overwrite on it. */
export async function loadCloudState(): Promise<{ ok: boolean; data: Record<string, unknown> | null }> {
  try {
    const { db, collection, getDocs } = await firestore();
    const snap = await getDocs(collection(db, CLOUD_COLLECTION));
    if (snap.empty) return { ok: true, data: null };
    const out: Record<string, unknown> = {};
    snap.forEach((d) => {
      const value = (d.data() as { value?: unknown })?.value;
      if (value !== undefined) out[d.id] = value;
    });
    return { ok: true, data: Object.keys(out).length > 0 ? out : null };
  } catch (e) {
    console.warn('[cloud] load failed — staying on local data', e);
    return { ok: false, data: null };
  }
}

/** Write one key. Returns false instead of throwing when the cloud rejects it. */
export async function saveCloudState(key: string, value: unknown): Promise<boolean> {
  try {
    const { db, doc, setDoc, serverTimestamp } = await firestore();
    await setDoc(
      doc(db, CLOUD_COLLECTION, key),
      { value: toStorable(value), updatedAt: serverTimestamp() },
      { merge: true },
    );
    return true;
  } catch (e) {
    console.warn(`[cloud] save failed for "${key}"`, e);
    return false;
  }
}
