import type { CareSchedule } from '../schedules/types';

import { toLocalDateKey } from './health-model';

export type HomeCarePlan = {
  nextMedication?: { scheduleId: string; name: string; dosage: string; date: string; time: string; instructions?: string };
  nextAppointment?: { scheduleId: string; title: string; facility: string; date: string; time: string; doctor?: string };
  todayDoseCount: number;
};

function localAppointment(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(year, month - 1, day, hours, minutes);
  if (toLocalDateKey(result) !== date || result.getHours() !== hours || result.getMinutes() !== minutes) return new Date(NaN);
  return result;
}

function nextDay(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return toLocalDateKey(new Date(year, month - 1, day + 1, 12));
}

export function buildHomeCarePlan(schedules: readonly CareSchedule[], seniorId?: string, now = new Date()): HomeCarePlan {
  const result: HomeCarePlan = { todayDoseCount: 0 };
  const today = toLocalDateKey(now);
  let nextMedicationAt = Infinity;
  let nextAppointmentAt = Infinity;
  if (!seniorId || !today) return result;
  for (const schedule of schedules) {
    if (schedule.seniorId !== seniorId) continue;
    if (schedule.kind === 'appointment') {
      const at = localAppointment(schedule.date, schedule.time).getTime();
      if (at >= now.getTime() && at < nextAppointmentAt) {
        nextAppointmentAt = at;
        result.nextAppointment = { scheduleId: schedule.id, title: schedule.title, facility: schedule.facility, doctor: schedule.doctor, date: schedule.date, time: schedule.time };
      }
      continue;
    }
    const times = [...new Set(schedule.times)].sort();
    if (schedule.startDate <= today && (!schedule.endDate || today <= schedule.endDate)) result.todayDoseCount += times.length;
    let date = schedule.startDate > today ? schedule.startDate : today;
    // At most today and the following day are needed for a daily medication schedule.
    for (let offset = 0; offset < 2; offset++, date = nextDay(date)) {
      if (schedule.endDate && date > schedule.endDate) break;
      const time = times.find((item) => localAppointment(date, item).getTime() >= now.getTime());
      if (!time) continue;
      const at = localAppointment(date, time).getTime();
      if (at < nextMedicationAt) {
        nextMedicationAt = at;
        result.nextMedication = { scheduleId: schedule.id, name: schedule.name, dosage: schedule.dosage, date, time, instructions: schedule.instructions };
      }
      break;
    }
  }
  return result;
}
