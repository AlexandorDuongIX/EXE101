import { useSeniorLink } from '@/controllers/linking/link-context';

export function useSeniorHomeController() {
  const { linkedSenior } = useSeniorLink();
  return { dashboard: { user: {
    name: linkedSenior?.fullName ?? '',
    initials: linkedSenior?.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase(),
  } } };
}
