/**
 * Firebase bootstrap for Trackly.
 *
 * The config comes from the Firebase console (project `saed-2dea4`). These values
 * are public by design — they ship in the client bundle; access is controlled by
 * the Firestore security rules, not by hiding the key.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import config from '../../firebase.config.json';

/**
 * Single source of truth: `firebase.config.json` at the repo root, which the
 * Node seeding script (`scripts/seedFirestore.mjs`) reads too — so the app and
 * the seeder can never drift apart.
 */
export const firebaseConfig = config;

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(firebaseApp);

/**
 * Analytics is optional, browser-only, and must never break the app: load it
 * lazily and swallow everything (it is also blocked on file:// origins).
 */
export function initAnalytics(): void {
  import('firebase/analytics')
    .then(async ({ getAnalytics, isSupported }) => {
      try {
        if (await isSupported()) getAnalytics(firebaseApp);
      } catch {
        /* analytics unavailable */
      }
    })
    .catch(() => {
      /* analytics SDK not needed */
    });
}
