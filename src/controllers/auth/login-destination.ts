import { DEMO_FORCE_CREATE_SENIOR_AFTER_CHILD_LOGIN } from '../../config/demo-flags';

import type { AuthUser } from '../../models/auth/types';

// Call only from a successful login callback. This function does not redirect on render.
export function getLoginDestination(
  user: AuthUser,
  forceCreate = DEMO_FORCE_CREATE_SENIOR_AFTER_CHILD_LOGIN
): '/create-senior' | '/family-home' | '/senior-home' | null {
  if (user.role === 'family') return forceCreate ? '/create-senior' : '/family-home';
  if (user.role === 'senior') return '/senior-home';
  return null;
}
