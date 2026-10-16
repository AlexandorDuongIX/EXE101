import { useSchedules } from './schedule-context';
import { useScheduleSelection } from './use-schedule-selection';

export function useSeniorSchedulesController() {
  const { schedules } = useSchedules();
  const { selectedKind, setSelectedKind } = useScheduleSelection();
  return { schedules, selectedKind, setSelectedKind };
}
