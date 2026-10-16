import type { AuthUser } from '../../models/auth/types';

// Call only from a successful login callback. This function does not redirect on render.
export function getLoginDestination(
  user: AuthUser,
  hasSeniorProfile: boolean
): '/create-senior' | '/family-home' | '/senior-home' | null {
  if (user.role === 'family') return hasSeniorProfile ? '/family-home' : '/create-senior';
  if (user.role === 'senior') return '/senior-home';
  return null;
}
