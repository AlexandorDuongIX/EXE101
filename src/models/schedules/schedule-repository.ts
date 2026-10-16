import type { AuthUser } from '../auth/types';

import { normalizeScheduleInput } from './schedule-model';
import type {
  CareSchedule,
  ScheduleInput,
  ScheduleRepository,
  ScheduleSenior,
} from './types';

function copySchedule(schedule: CareSchedule): CareSchedule {
  return schedule.kind === 'medication'
    ? { ...schedule, times: [...schedule.times] }
    : { ...schedule };
}

// Session-memory data only: no medical advice, generated treatment, notifications, or persistence.
// In production, authenticated ownership and recipient links must be enforced by the server.
export function createScheduleRepository(
  getCurrentUser: () => AuthUser | null,
  getOwnedSeniors: () => readonly ScheduleSenior[],
  getLinkedSeniorId: () => string | undefined
): ScheduleRepository {
  let schedules: CareSchedule[] = [];
  let nextId = 0;
  const instanceId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  function requireFamilyUser(): AuthUser {
    const user = getCurrentUser();
    if (!user || user.role !== 'family') {
      throw new Error('Vui lòng đăng nhập bằng tài khoản Con cái để quản lý lịch.');
    }
    return user;
  }

  function requireOwnedSenior(user: AuthUser, input: ScheduleInput) {
    const owned = getOwnedSeniors().some(
      (senior) => senior.id === input.seniorId && senior.ownerId === user.id
    );
    if (!owned) throw new Error('Vui lòng chọn người thân trong danh sách gia đình của bạn.');
  }

  function requireOwnedSchedule(user: AuthUser, id: string): CareSchedule {
    const schedule = schedules.find((item) => item.id === id && item.ownerId === user.id);
    if (!schedule) throw new Error('Không tìm thấy lịch trong tài khoản của bạn.');
    return schedule;
  }

  return {
    list() {
      const user = getCurrentUser();
      if (!user) return [];
      if (user.role === 'family') {
        return schedules.filter((schedule) => schedule.ownerId === user.id).map(copySchedule);
      }
      if (user.role === 'senior') {
        const seniorId = getLinkedSeniorId();
        if (!seniorId) return [];
        return schedules.filter((schedule) => schedule.seniorId === seniorId).map(copySchedule);
      }
      return [];
    },
    create(input) {
      const user = requireFamilyUser();
      const normalized = normalizeScheduleInput(input);
      requireOwnedSenior(user, normalized);
      const now = new Date().toISOString();
      const schedule: CareSchedule = {
        ...normalized,
        id: `demo-schedule:${instanceId}:${++nextId}`,
        ownerId: user.id,
        createdAt: now,
        updatedAt: now,
      };
      schedules = [...schedules, schedule];
      return copySchedule(schedule);
    },
    update(id, input) {
      const user = requireFamilyUser();
      const existing = requireOwnedSchedule(user, id);
      const normalized = normalizeScheduleInput(input);
      requireOwnedSenior(user, normalized);
      const schedule: CareSchedule = {
        ...normalized,
        id: existing.id,
        ownerId: user.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      schedules = schedules.map((item) => item.id === id ? schedule : item);
      return copySchedule(schedule);
    },
    remove(id) {
      const user = requireFamilyUser();
      requireOwnedSchedule(user, id);
      schedules = schedules.filter((schedule) => schedule.id !== id);
    },
  };
}
