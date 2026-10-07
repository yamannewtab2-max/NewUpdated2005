/**
 * The only Google accounts allowed to touch the Firebase copy of the data.
 *
 * This list is duplicated in the Firestore rules (the actual security boundary);
 * keep the two in sync. It is also public — it ships in the JS bundle — which is
 * fine, since knowing the owner's address grants nothing.
 */
export const ALLOWED_EMAILS = ['musadoank453@gmail.com', 'yamannewtab@gmail.com'];

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.trim().toLowerCase());
}
