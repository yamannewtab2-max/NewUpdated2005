/**
 * Two-way bridge between the app state and Firestore.
 *
 * Rules that keep it predictable:
 *  - Cloud wins on load **only if the cloud already has data**. The first device
 *    to run against an empty cloud uploads what it has (i.e. the real roster and
 *    whatever payments are on that device) and becomes the source of truth.
 *  - Writes are debounced and de-duplicated per key, so a burst of edits costs
 *    one write, and re-applying a cloud value never bounces straight back up.
 *  - Nothing here can throw into the UI: localStorage remains the app's own
 *    persistence, the cloud is an extra copy that survives a cleared browser.
 */
import { loadCloudState, loadCloudStateWithTimeout, saveCloudState } from './cloudStore';

/** Keys that live in the cloud. Device-local preferences (language, currency) stay local. */
export const SYNCED_KEYS = [
  'mahjas',
  'rooms',
  'students',
  'studentGroups',
  'groups',
  'payments',
  'monthlyPayments',
  'monthlyDues',
  'paymentEntries',
  'notePresets',
] as const;

export type SyncedKey = (typeof SYNCED_KEYS)[number];

export type CloudStatus = 'loading' | 'signedOut' | 'denied' | 'downloaded' | 'seeded' | 'offline';

const WRITE_DEBOUNCE_MS = 600;

const timers = new Map<SyncedKey, ReturnType<typeof setTimeout>>();
/** Last value known to be identical in the cloud (either just loaded or just written). */
const lastSynced = new Map<string, string>();

function fingerprint(value: unknown): string {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return `__unserialisable__${Math.random()}`;
  }
}

/** Mark a value as already present in the cloud, without writing it. */
export function markSynced(key: string, value: unknown): void {
  lastSynced.set(key, fingerprint(value));
}

/** Queue a key for writing, skipping values the cloud already has. */
export function queueCloudWrite(key: SyncedKey, value: unknown): void {
  const fp = fingerprint(value);
  if (lastSynced.get(key) === fp) return;
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      void saveCloudState(key, value).then((ok) => {
        if (ok) lastSynced.set(key, fp);
      });
    }, WRITE_DEBOUNCE_MS),
  );
}

export interface BootstrapResult {
  status: CloudStatus;
  /** Keys that were replaced by cloud values (the caller applies them). */
  applied: Record<string, unknown>;
}

/**
 * Upload a full snapshot, key by key, unconditionally. Used both to seed an
 * empty cloud and by the explicit "upload this device's data" action, which is
 * the escape hatch when the cloud holds a stale copy.
 */
export async function pushCloudState(snapshot: Record<string, unknown>): Promise<CloudStatus> {
  let uploaded = 0;
  for (const key of SYNCED_KEYS) {
    const value = snapshot[key];
    if (value === undefined) continue;
    const saved = await saveCloudState(key, value);
    if (saved) {
      uploaded += 1;
      markSynced(key, value);
    }
  }
  return uploaded > 0 ? 'seeded' : 'offline';
}

/**
 * Decide where the truth is: pull the cloud when it has data, push the local
 * snapshot up when the cloud is reachable but empty, and do nothing at all when
 * the cloud could not be read (never overwrite data that may exist up there).
 */
export async function bootstrapCloud(localSnapshot: Record<string, unknown>): Promise<BootstrapResult> {
  const { ok, data: cloud } = await loadCloudStateWithTimeout();

  if (cloud) {
    const applied: Record<string, unknown> = {};
    for (const key of SYNCED_KEYS) {
      const value = cloud[key];
      if (value === undefined) continue;
      applied[key] = value;
      markSynced(key, value);
    }
    if (Object.keys(applied).length > 0) return { status: 'downloaded', applied };
    // Cloud read worked but held nothing usable → fall through and seed it.
  } else if (!ok) {
    return { status: 'offline', applied: {} };
  }

  return { status: await pushCloudState(localSnapshot), applied: {} };
}
