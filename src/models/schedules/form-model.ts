import type { CareSchedule, ScheduleInput, ScheduleKind } from './types';

export type ScheduleFormValues = {
  name: string;
  dosage: string;
  times: string;
  startDate: string;
  endDate: string;
  instructions: string;
  title: string;
  facility: string;
  doctor: string;
  date: string;
  time: string;
  notes: string;
};

export function createEmptyScheduleForm(): ScheduleFormValues {
  return {
    name: '', dosage: '', times: '', startDate: '', endDate: '',
    instructions: '', title: '', facility: '', doctor: '', date: '', time: '', notes: '',
  };
}

export function scheduleToFormValues(schedule: CareSchedule): ScheduleFormValues {
  const values = createEmptyScheduleForm();
  return schedule.kind === 'medication'
    ? { ...values, name: schedule.name, dosage: schedule.dosage, times: schedule.times.join(', '),
      startDate: schedule.startDate, endDate: schedule.endDate ?? '', instructions: schedule.instructions ?? '' }
    : { ...values, title: schedule.title, facility: schedule.facility, doctor: schedule.doctor ?? '',
      date: schedule.date, time: schedule.time, notes: schedule.notes ?? '' };
}

export function scheduleFormToInput(
  kind: ScheduleKind,
  seniorId: string,
  values: ScheduleFormValues,
): ScheduleInput {
  const recipient = { seniorId };
  return kind === 'medication'
    ? { ...recipient, kind, name: values.name, dosage: values.dosage,
      times: values.times.split(/[,;\n]/).map((time) => time.trim()).filter(Boolean),
      startDate: values.startDate.trim(), endDate: values.endDate.trim() || undefined,
      instructions: values.instructions }
    : { ...recipient, kind, title: values.title, facility: values.facility, doctor: values.doctor,
      date: values.date.trim(), time: values.time.trim(), notes: values.notes };
}
