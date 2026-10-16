import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useSeniors } from '@/controllers/seniors/senior-context';
import { useAuth } from '@/controllers/auth/auth-context';
import { useSeniorLink } from '@/controllers/linking/link-context';
import type { LinkCode } from '@/models/linking';
import { CHRONIC_CONDITIONS, RELATIONSHIPS } from '@/models/seniors/form-model';
import type { Senior } from '@/models/seniors/types';

export function useAddMoreSeniorController() {
  const { user } = useAuth();
  const { profiles } = useSeniors();
  const { getProfileLinkStatus, issueCode } = useSeniorLink();
  const [linkProfile, setLinkProfile] = useState<Senior | null>(null);
  const [linkCode, setLinkCode] = useState<LinkCode>();
  const [linkError, setLinkError] = useState<string>();
  const { created } = useLocalSearchParams<{ created?: string }>();
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
      isLinked: user?.role === 'family' && profile.ownerId === user.id && getProfileLinkStatus(profile.id),
      relationshipLabel,
      conditionsLabel: conditions.length ? conditions.join(' · ') : 'Chưa thêm thông tin bệnh nền',
    };
  });

  const openLinkCode = (profile: Senior, forceNew = false) => {
    setLinkProfile(profile);
    setLinkError(undefined);
    setLinkCode(undefined);
    try {
      if (!getProfileLinkStatus(profile.id)) setLinkCode(issueCode(profile.id, forceNew));
    } catch (cause) {
      setLinkError(cause instanceof Error ? cause.message : 'Chưa thể tạo mã liên kết.');
    }
  };

  return {
    profileCards, showCreatedNotice: created === '1', openCreateSenior,
    linkProfile, linkCode, linkError,
    linked: linkProfile && user?.role === 'family' && linkProfile.ownerId === user.id ? getProfileLinkStatus(linkProfile.id) : false,
    openLinkCode, closeLinkCode: () => setLinkProfile(null),
    regenerateCode: () => { if (linkProfile) openLinkCode(linkProfile, true); },
  };
}
