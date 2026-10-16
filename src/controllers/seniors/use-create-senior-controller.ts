import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import { useAuth } from '@/controllers/auth/auth-context';
import {
  createEmptySeniorForm,
  normalizeSeniorForm,
  type SeniorFormErrors,
  type SeniorFormValues,
  toggleChronicCondition,
  validateSeniorForm,
} from '@/models/seniors/form-model';
import type { SeniorRelationship } from '@/models/seniors/types';

import { releaseSeniorAvatarUri } from './senior-avatar-resource';
import { useSeniors } from './senior-context';

export function useCreateSeniorAccessController() {
  const { user } = useAuth();

  if (!user) return { redirectHref: '/login' as const, userId: undefined };
  if (user.role !== 'family') {
    return {
      redirectHref: user.role === 'senior' ? '/senior-home' as const : '/login' as const,
      userId: undefined,
    };
  }

  return { redirectHref: undefined, userId: user.id };
}

type CreateSeniorControllerOptions = {
  onValidationFailed?: () => void;
};

export function useCreateSeniorController({
  onValidationFailed,
}: CreateSeniorControllerOptions = {}) {
  const { createSenior } = useSeniors();
  const [values, setValues] = useState<SeniorFormValues>(createEmptySeniorForm);
  const [fieldErrors, setFieldErrors] = useState<SeniorFormErrors>({});
  const [showValidationNotice, setShowValidationNotice] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const inFlight = useRef(false);
  const avatarBusy = useRef(false);
  const mounted = useRef(true);
  const profileCreated = useRef(false);
  const draftAvatar = useRef<string | undefined>(undefined);
  const disabled = loading || pickingAvatar;

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      if (!inFlight.current && !profileCreated.current) {
        releaseSeniorAvatarUri(draftAvatar.current);
      }
    };
  }, []);

  const updateFields = (patch: Partial<SeniorFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setSubmitError(undefined);
    setShowValidationNotice(false);
    setFieldErrors((current) => {
      const next = { ...current };
      for (const field of Object.keys(patch) as (keyof SeniorFormValues)[]) {
        delete next[field];
      }
      return next;
    });
  };

  const changeBirthYear = (birthYear: string) => {
    updateFields({ birthYear: birthYear.replace(/[^0-9]/g, '').slice(0, 4) });
  };

  const changeRelationship = (relationship: SeniorRelationship) => {
    updateFields({
      relationship,
      relationshipOther: relationship === 'other' ? values.relationshipOther : '',
    });
  };

  const changeCondition = (value: string) => {
    const chronicConditions = toggleChronicCondition(values.chronicConditions, value);
    updateFields({
      chronicConditions,
      chronicConditionOther: chronicConditions.includes('other') ? values.chronicConditionOther : '',
    });
  };

  const changeAvatarBusy = (busy: boolean) => {
    avatarBusy.current = busy;
    setPickingAvatar(busy);
  };

  const changeAvatar = (avatarUri?: string) => {
    draftAvatar.current = avatarUri;
    updateFields({ avatarUri });
  };

  const leaveForm = () => {
    if (inFlight.current || avatarBusy.current) return;
    Keyboard.dismiss();
    router.replace('/family-home');
  };

  const handleSubmit = async () => {
    if (inFlight.current || avatarBusy.current || profileCreated.current) return;

    Keyboard.dismiss();
    const errors = validateSeniorForm(values);
    setFieldErrors(errors);
    setSubmitError(undefined);

    if (Object.keys(errors).length > 0) {
      setShowValidationNotice(true);
      onValidationFailed?.();
      return;
    }

    inFlight.current = true;
    setLoading(true);
    setShowValidationNotice(false);

    try {
      await createSenior(normalizeSeniorForm(values));
      profileCreated.current = true;
      if (mounted.current) {
        router.replace({ pathname: '/add-more-senior', params: { created: '1' } });
      }
    } catch {
      if (mounted.current) {
        setSubmitError('Chưa thể tạo hồ sơ. Thông tin bạn đã nhập vẫn được giữ lại. Vui lòng thử lại.');
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        if (!profileCreated.current) setLoading(false);
      } else if (!profileCreated.current) {
        releaseSeniorAvatarUri(draftAvatar.current);
      }
    }
  };

  return {
    values,
    fieldErrors,
    showValidationNotice,
    submitError,
    loading,
    disabled,
    updateFields,
    changeBirthYear,
    changeRelationship,
    changeCondition,
    changeAvatarBusy,
    changeAvatar,
    leaveForm,
    handleSubmit,
  };
}
