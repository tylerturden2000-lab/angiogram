/**
 * useUser.js
 * ──────────────────────────────────────────────────────────────
 * Derives a consistent { email, name, initials } object from
 * the auth context + localStorage fallbacks.
 *
 * Consumed by Dashboard and any component that needs user info.
 */

import { useAuth } from '../../../../features/auth/services';

/**
 * Pure helper — kept separate so it can be unit-tested without
 * the React context layer.
 *
 * @param {object|null} authUser - raw value from useAuth()
 * @returns {{ email: string, name: string, initials: string }}
 */
export const deriveUser = (authUser) => {
  let email = authUser?.email || authUser?.username || authUser?.user?.email;
  let name  = authUser?.name  || authUser?.fullName  || authUser?.user?.name;

  // Fallback to localStorage
  if (!email) {
    try {
      const stored = JSON.parse(
        localStorage.getItem('user') || localStorage.getItem('authUser') || 'null'
      );
      if (stored) {
        email = stored.email || stored.username;
        name  = name || stored.name || stored.fullName;
      }
    } catch { /* ignore parse errors */ }
  }

  email = email || 'user@neurealm.io';
  name  = name  || email
    .split('@')[0]
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const initials = (name || email)
    .split(/[\s._]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || email.slice(0, 2).toUpperCase();

  return { email, name, initials };
};

/**
 * Hook: returns the derived user object for the currently
 * authenticated user.
 */
const useUser = () => {
  const auth = useAuth();
  return deriveUser(auth?.user || auth);
};

export default useUser;
