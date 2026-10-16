import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/controllers/auth/auth-context';
import { useSeniors } from '@/controllers/seniors/senior-context';
import { useSeniorLink } from '@/controllers/linking/link-context';
import { createScheduleRepository } from '@/models/schedules/schedule-repository';
import type { CareSchedule, ScheduleInput } from '@/models/schedules/types';

type ScheduleContextValue = {
  schedules: readonly CareSchedule[];
  createSchedule: (input: ScheduleInput) => CareSchedule;
  updateSchedule: (id: string, input: ScheduleInput) => CareSchedule;
  deleteSchedule: (id: string) => void;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: PropsWithChildren) {
  const { getCurrentUser } = useAuth();
  const { getProfiles } = useSeniors();
  const { getLinkedSeniorId } = useSeniorLink();
  const [repository] = useState(() => createScheduleRepository(getCurrentUser, getProfiles, getLinkedSeniorId));
  const [, setRevision] = useState(0);

  const createSchedule = useCallback((input: ScheduleInput) => {
    const schedule = repository.create(input);
    setRevision((revision) => revision + 1);
    return schedule;
  }, [repository]);

  const updateSchedule = useCallback((id: string, input: ScheduleInput) => {
    const schedule = repository.update(id, input);
    setRevision((revision) => revision + 1);
    return schedule;
  }, [repository]);

  const deleteSchedule = useCallback((id: string) => {
    repository.remove(id);
    setRevision((revision) => revision + 1);
  }, [repository]);

  return (
    <ScheduleContext.Provider value={{ schedules: repository.list(), createSchedule, updateSchedule, deleteSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedules(): ScheduleContextValue {
  const context = useContext(ScheduleContext);
  if (!context) throw new Error('useSchedules cần nằm trong ScheduleProvider.');
  return context;
}
