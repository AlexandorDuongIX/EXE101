import type { AuthUser } from '../auth/types';

import { normalizeHealthReadingInput, normalizeSymptomEntryInput } from './health-model';
import type { HealthReading, HealthRepository, HealthSenior, SymptomEntry } from './types';

// Session-memory demo only. Production authentication and recipient ACLs belong on the server.
export function createHealthRepository(
  getCurrentUser: () => AuthUser | null,
  getOwnedSeniors: () => readonly HealthSenior[],
  getLinkedSeniorId: () => string | undefined,
): HealthRepository {
  let readings: HealthReading[] = [];
  let symptoms: SymptomEntry[] = [];
  let nextId = 0;
  const instanceId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  function requireFamilyUser(): AuthUser {
    const user = getCurrentUser();
    if (!user || user.role !== 'family') throw new Error('Vui lòng đăng nhập bằng tài khoản Con cái để ghi nhận sức khỏe.');
    return user;
  }

  function requireOwnedSenior(user: AuthUser, seniorId: string) {
    if (!getOwnedSeniors().some((senior) => senior.id === seniorId && senior.ownerId === user.id)) {
      throw new Error('Vui lòng chọn người thân trong danh sách gia đình của bạn.');
    }
  }

  function visible<T extends { seniorId: string; ownerId: string }>(records: readonly T[]): T[] {
    const user = getCurrentUser();
    if (!user) return [];
    if (user.role === 'family') return records.filter((record) => record.ownerId === user.id);
    if (user.role === 'senior') {
      const seniorId = getLinkedSeniorId();
      return seniorId ? records.filter((record) => record.seniorId === seniorId) : [];
    }
    return [];
  }

  return {
    listReadings: () => visible(readings).map((reading) => ({ ...reading })),
    listSymptoms: () => visible(symptoms).map((entry) => ({ ...entry, symptoms: [...entry.symptoms] })),
    createReading(input) {
      const user = requireFamilyUser();
      const normalized = normalizeHealthReadingInput(input);
      requireOwnedSenior(user, normalized.seniorId);
      const reading: HealthReading = {
        ...normalized, id: `demo-health:${instanceId}:${++nextId}`, ownerId: user.id, createdAt: new Date().toISOString(),
      };
      readings = [...readings, reading];
      return { ...reading };
    },
    createSymptoms(input) {
      const user = requireFamilyUser();
      const normalized = normalizeSymptomEntryInput(input);
      requireOwnedSenior(user, normalized.seniorId);
      const entry: SymptomEntry = {
        ...normalized, id: `demo-symptom:${instanceId}:${++nextId}`, ownerId: user.id, createdAt: new Date().toISOString(),
      };
      symptoms = [...symptoms, entry];
      return { ...entry, symptoms: [...entry.symptoms] };
    },
  };
}
