import type { ScheduleInput } from './types';

// Check the calendar components directly; Date parsing can silently roll February 30 into March.
export function isValidScheduleDate(value: string): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1000 || month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

export function isValidScheduleTime(value: string): boolean {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function formatScheduleDate(value: string): string {
  if (!isValidScheduleDate(value)) return value;
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function validateScheduleInput(input: ScheduleInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input || (input.kind !== 'medication' && input.kind !== 'appointment')) {
    return { kind: 'Vui lòng chọn loại lịch hợp lệ.' };
  }

  function text(key: string, value: unknown, label: string, max: number, required = true) {
    if (value === undefined && !required) return;
    if (typeof value !== 'string' || (required && !value.trim())) {
      errors[key] = required ? `Vui lòng nhập ${label}.` : `${label} không hợp lệ.`;
    } else if (value.trim().length > max) {
      errors[key] = `${label} tối đa ${max} ký tự.`;
    }
  }

  text('seniorId', input.seniorId, 'người thân', 200);

  if (input.kind === 'medication') {
    text('name', input.name, 'tên thuốc', 120);
    text('dosage', input.dosage, 'liều dùng', 120);
    text('instructions', input.instructions, 'Hướng dẫn', 1000, false);
    if (
      !Array.isArray(input.times) ||
      input.times.length === 0 ||
      input.times.length > 12 ||
      input.times.some((time) => !isValidScheduleTime(time))
    ) {
      errors.times = 'Chọn từ 1 đến 12 giờ uống hợp lệ.';
    }
    if (!isValidScheduleDate(input.startDate)) {
      errors.startDate = 'Vui lòng chọn ngày bắt đầu hợp lệ.';
    }
    if (input.endDate !== undefined && input.endDate !== '') {
      if (!isValidScheduleDate(input.endDate)) {
        errors.endDate = 'Vui lòng chọn ngày kết thúc hợp lệ.';
      } else if (isValidScheduleDate(input.startDate) && input.endDate < input.startDate) {
        errors.endDate = 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.';
      }
    }
  } else {
    text('title', input.title, 'nội dung khám', 160);
    text('facility', input.facility, 'cơ sở khám', 160);
    text('doctor', input.doctor, 'Tên bác sĩ', 120, false);
    text('notes', input.notes, 'Ghi chú', 1000, false);
    if (!isValidScheduleDate(input.date)) {
      errors.date = 'Vui lòng chọn ngày khám hợp lệ.';
    }
    if (!isValidScheduleTime(input.time)) {
      errors.time = 'Vui lòng chọn giờ khám hợp lệ.';
    }
  }
  return errors;
}

export function normalizeScheduleInput(input: ScheduleInput): ScheduleInput {
  const errors = validateScheduleInput(input);
  const firstError = Object.values(errors)[0];
  if (firstError) throw new Error(firstError);

  const recipient = {
    seniorId: input.seniorId.trim(),
  };
  if (input.kind === 'medication') {
    return {
      ...recipient,
      kind: 'medication',
      name: input.name.trim(),
      dosage: input.dosage.trim(),
      times: [...new Set(input.times)].sort(),
      startDate: input.startDate,
      endDate: input.endDate || undefined,
      instructions: input.instructions?.trim() || undefined,
    };
  }
  return {
    ...recipient,
    kind: 'appointment',
    title: input.title.trim(),
    facility: input.facility.trim(),
    doctor: input.doctor?.trim() || undefined,
    date: input.date,
    time: input.time,
    notes: input.notes?.trim() || undefined,
  };
}
