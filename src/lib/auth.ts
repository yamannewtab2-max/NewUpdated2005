/**
 * Google sign-in for Trackly, gating the Firebase copy of the data.
 *
 * Only the accounts listed below may read or write Firestore — enforced twice:
 * here (so an outsider sees a clear "not allowed" instead of silent failures)
 * and in the Firestore rules, which are the real boundary (the client-side check
 * is a courtesy, never the protection).
 *
 * SDK access is dynamic, so `firebase/auth` never lands in the first paint.
 */
import { isAllowedEmail } from './allowedEmails';

export interface AuthUser {
  email: string | null;
  allowed: boolean;
}

async function authModule() {
  const [{ firebaseApp }, auth] = await Promise.all([import('./firebase'), import('firebase/auth')]);
  return { firebaseApp, ...auth };
}

/** Subscribe to sign-in state. Returns the unsubscribe function. */
export async function watchAuth(cb: (user: AuthUser | null) => void): Promise<() => void> {
  const { firebaseApp, getAuth, onAuthStateChanged } = await authModule();
  return onAuthStateChanged(
    getAuth(firebaseApp),
    (u) => cb(u ? { email: (u.email || '').toLowerCase() || null, allowed: isAllowedEmail(u.email) } : null),
    (err) => {
      console.warn('[auth] state error', err);
      cb(null);
    },
  );
}

/**
 * Opens the Google account chooser. Throws `not-allowed` for other accounts.
 * Returns null when the browser handed off to a full-page redirect (mobile and
 * in-app browsers block popups) — the page is navigating, so the caller must not
 * show a success toast.
 */
export async function signInWithGoogle(): Promise<AuthUser | null> {
  const { firebaseApp, getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } = await authModule();
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let cred;
  try {
    cred = await signInWithPopup(auth, provider);
  } catch (e) {
    const code = String((e as { code?: string })?.code || '');
    // Phones (and in-app browsers) refuse popups: fall back to a full redirect,
    // which signs in through onAuthStateChanged when the browser comes back.
    const popupUnusable =
      code.includes('popup-blocked') ||
      code.includes('operation-not-supported-in-this-environment') ||
      code.includes('popup-not-supported');
    if (!popupUnusable) throw e;
    await signInWithRedirect(auth, provider);
    return null;
  }

  const email = (cred.user.email || '').toLowerCase() || null;
  if (!isAllowedEmail(email)) {
    await signOut(auth);
    throw new Error('not-allowed');
  }
  return { email, allowed: true };
}

export async function signOutUser(): Promise<void> {
  const { firebaseApp, getAuth, signOut } = await authModule();
  await signOut(getAuth(firebaseApp));
}
