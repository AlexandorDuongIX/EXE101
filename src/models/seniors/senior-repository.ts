import type { AuthUser } from '../auth/types';

import { normalizeSeniorForm, type SeniorFormValues } from './form-model';
import type { CreateSeniorInput, Senior } from './types';

export interface SeniorRepository {
  list(): readonly Senior[];
  create(input: CreateSeniorInput): Promise<Senior>;
}

function copySenior(profile: Senior): Senior {
  return { ...profile, chronicConditions: [...profile.chronicConditions] };
}

function validateAndNormalizeInput(input: CreateSeniorInput): CreateSeniorInput {
  if (
    !input ||
    typeof input.fullName !== 'string' ||
    typeof input.birthYear !== 'number' ||
    !Number.isInteger(input.birthYear) ||
    typeof input.relationship !== 'string' ||
    (input.relationshipOther !== undefined && typeof input.relationshipOther !== 'string') ||
    (input.avatarUri !== undefined && typeof input.avatarUri !== 'string') ||
    !Array.isArray(input.chronicConditions) ||
    input.chronicConditions.some((value) => typeof value !== 'string') ||
    (input.chronicConditionOther !== undefined && typeof input.chronicConditionOther !== 'string') ||
    (input.medicalNotes !== undefined && typeof input.medicalNotes !== 'string') ||
    typeof input.isPrimarySosContact !== 'boolean'
  ) {
    throw new Error('Thông tin hồ sơ không hợp lệ. Vui lòng kiểm tra và thử lại.');
  }
  const formValues: SeniorFormValues = {
    fullName: input.fullName,
    birthYear: String(input.birthYear),
    relationship: input.relationship,
    relationshipOther: input.relationshipOther ?? '',
    avatarUri: input.avatarUri,
    chronicConditions: input.chronicConditions,
    chronicConditionOther: input.chronicConditionOther ?? '',
    medicalNotes: input.medicalNotes ?? '',
    isPrimarySosContact: input.isPrimarySosContact,
  };
  return normalizeSeniorForm(formValues);
}

// Session-memory demo repository. It deliberately has no storage, HTTP, or analytics.
// A production repository must derive ownership from a server-authenticated session.
export function createDemoSeniorRepository(getCurrentUser: () => AuthUser | null): SeniorRepository {
  let profiles: Senior[] = [];
  let nextId = 0;
  const instanceId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const pending = new Map<string, Promise<Senior>>();

  function requireFamilyUser(): AuthUser {
    const user = getCurrentUser();
    if (!user || user.role !== 'family') {
      throw new Error('Vui lòng đăng nhập bằng tài khoản Con cái để quản lý hồ sơ người thân.');
    }
    return user;
  }

  return {
    list() {
      const user = getCurrentUser();
      if (!user || user.role !== 'family') return [];
      return profiles.filter((profile) => profile.ownerId === user.id).map(copySenior);
    },
    create(input) {
      let user: AuthUser;
      let normalized: CreateSeniorInput;
      try {
        user = requireFamilyUser();
        normalized = validateAndNormalizeInput(input);
      } catch (error) {
        return Promise.reject(error);
      }
      const key = JSON.stringify([user.id, normalized]);
      const existing = pending.get(key);
      if (existing) return existing.then(copySenior);

      const request = Promise.resolve().then(() => {
        const currentUser = requireFamilyUser();
        if (currentUser !== user) {
          throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng thử lại.');
        }
        const profile: Senior = {
          ...normalized,
          chronicConditions: [...normalized.chronicConditions],
          id: `demo-senior:${instanceId}:${++nextId}`,
          ownerId: currentUser.id,
          createdAt: new Date().toISOString(),
        };
        profiles = [...profiles, profile];
        return profile;
      });
      pending.set(key, request);
      return request.finally(() => pending.delete(key)).then(copySenior);
    },
  };
}
