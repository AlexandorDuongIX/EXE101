import { router, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/controllers/auth/auth-context';
import { useSeniors } from '@/controllers/seniors/senior-context';
import { CHRONIC_CONDITIONS, RELATIONSHIPS } from '@/models/seniors/form-model';

export function useFamilyHomeController() {
  const { user, logout } = useAuth();
  const { profiles } = useSeniors();
  const { created } = useLocalSearchParams<{ created?: string }>();
  const redirectHref: '/senior-home' | '/login' | null = !user || user.role !== 'family'
    ? user?.role === 'senior' ? '/senior-home' : '/login'
    : null;

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const openCreateSenior = () => router.push('/create-senior');

  const profileCards = profiles.map((profile) => {
    const relationshipLabel = profile.relationship === 'other'
      ? profile.relationshipOther
      : RELATIONSHIPS.find((item) => item.value === profile.relationship)?.label;
    const conditions = profile.chronicConditions.map((value) =>
      CHRONIC_CONDITIONS.find((item) => item.value === value)?.label ?? value
    );
    if (profile.chronicConditionOther) conditions.push(profile.chronicConditionOther);

    return {
      ...profile,
      relationshipLabel,
      conditionsLabel: conditions.length ? conditions.join(' · ') : 'Chưa thêm thông tin bệnh nền',
    };
  });

  return { redirectHref, profileCards, showCreatedNotice: created === '1', handleLogout, openCreateSenior };
}
