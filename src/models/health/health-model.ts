import type {
  GlucoseUnit,
  HealthChartPoint,
  HealthHistoryWindow,
  HealthMetricKind,
  HealthReading,
  HealthReadingInput,
  SymptomEntryInput,
} from './types';

export const HEALTH_METRIC_LABELS: Record<HealthMetricKind, string> = {
  'blood-pressure': 'Huyết áp',
  'heart-rate': 'Nhịp tim',
  'blood-glucose': 'Đường huyết',
  weight: 'Cân nặng',
};

// Input length constraint, independent of clinical interpretation.
export const VITAL_INPUT_MAX_LENGTH = 3;

export const SYMPTOM_SEVERITY_LABELS = {
  none: 'Không có triệu chứng',
  mild: 'Nhẹ',
  moderate: 'Vừa',
  severe: 'Nặng',
} as const;

export function getHealthMetricUnit(kind: HealthMetricKind, glucoseUnit: GlucoseUnit = 'mmol/L'): string {
  if (kind === 'blood-pressure') return 'mmHg';
  if (kind === 'heart-rate') return 'nhịp/phút';
  if (kind === 'weight') return 'kg';
  return glucoseUnit;
}

export function formatHealthReading(reading: HealthReadingInput): string {
  const formatNumber = (value: number) => String(value).replace('.', ',');
  const value = reading.kind === 'blood-pressure'
    ? `${formatNumber(reading.systolic)}/${formatNumber(reading.diastolic)}`
    : formatNumber(reading.value);
  return `${value} ${getHealthMetricUnit(reading.kind, reading.kind === 'blood-glucose' ? reading.unit : undefined)}`;
}

function isCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 1000 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

// Require an explicit UTC/offset timezone and check components before Date parsing, which can roll dates.
export function isValidHealthTimestamp(value: string): boolean {
  if (typeof value !== 'string') return false;
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!parts) return false;
  const [, year, month, day, hours, minutes, seconds, zone] = parts;
  if (!isCalendarDate(Number(year), Number(month), Number(day))) return false;
  if (Number(hours) > 23 || Number(minutes) > 59 || Number(seconds) > 59) return false;
  if (zone !== 'Z' && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59)) return false;
  return Number.isFinite(Date.parse(value));
}

function validateBase(
  input: { seniorId: string; recordedAt: string },
  now: Date,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (typeof input.seniorId !== 'string' || !input.seniorId.trim() || input.seniorId.trim().length > 200) {
    errors.seniorId = 'Vui lòng chọn người thân hợp lệ.';
  }
  if (!isValidHealthTimestamp(input.recordedAt)) {
    errors.recordedAt = 'Vui lòng chọn ngày và giờ ghi nhận hợp lệ.';
  } else if (!Number.isFinite(now.getTime()) || Date.parse(input.recordedAt) > now.getTime()) {
    errors.recordedAt = 'Thời gian ghi nhận không được ở tương lai.';
  }
  return errors;
}

function validateOptionalText(errors: Record<string, string>, field: string, value: unknown) {
  if (value !== undefined && (typeof value !== 'string' || value.trim().length > 1000)) {
    errors[field] = 'Ghi chú tối đa 1000 ký tự.';
  }
}

export function validateHealthReadingInput(input: HealthReadingInput, now = new Date()): Record<string, string> {
  if (!input || !Object.prototype.hasOwnProperty.call(HEALTH_METRIC_LABELS, input.kind)) {
    return { kind: 'Vui lòng chọn chỉ số hợp lệ.' };
  }
  const errors = validateBase(input, now);
  validateOptionalText(errors, 'note', input.note);
  const positive = (field: string, value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      errors[field] = 'Vui lòng nhập số đo lớn hơn 0.';
    }
  };
  const integerVital = (field: string, value: number) => {
    positive(field, value);
    if (!errors[field] && (!Number.isInteger(value) || value >= 10 ** VITAL_INPUT_MAX_LENGTH)) {
      errors[field] = `Chỉ nhập số nguyên tối đa ${VITAL_INPUT_MAX_LENGTH} chữ số.`;
    }
  };
  if (input.kind === 'blood-pressure') {
    integerVital('systolic', input.systolic);
    integerVital('diastolic', input.diastolic);
    if (!errors.systolic && !errors.diastolic && input.systolic <= input.diastolic) {
      errors.systolic = 'Huyết áp tâm thu phải lớn hơn huyết áp tâm trương.';
    }
  } else {
    if (input.kind === 'heart-rate') integerVital('value', input.value);
    else positive('value', input.value);
    if (input.kind === 'blood-glucose') {
      if (input.unit !== 'mmol/L' && input.unit !== 'mg/dL') errors.unit = 'Vui lòng chọn đơn vị đường huyết.';
      if (!['fasting', 'after-meal', 'unspecified'].includes(input.mealContext)) {
        errors.mealContext = 'Vui lòng chọn thời điểm đo đường huyết.';
      }
    }
  }
  return errors;
}

export function validateSymptomEntryInput(input: SymptomEntryInput, now = new Date()): Record<string, string> {
  if (!input) return { symptoms: 'Vui lòng chọn tình trạng hiện tại.' };
  const errors = validateBase(input, now);
  validateOptionalText(errors, 'notes', input.notes);
  const validSeverity = Object.prototype.hasOwnProperty.call(SYMPTOM_SEVERITY_LABELS, input.severity);
  if (!validSeverity) errors.severity = 'Vui lòng chọn mức độ triệu chứng.';
  const validSymptoms = Array.isArray(input.symptoms)
    && input.symptoms.length <= 12
    && input.symptoms.every((symptom) => typeof symptom === 'string' && !!symptom.trim() && symptom.trim().length <= 80);
  if (!validSymptoms) errors.symptoms = 'Chọn tối đa 12 triệu chứng, mỗi triệu chứng tối đa 80 ký tự.';
  else if (input.severity === 'none' && input.symptoms.length > 0) {
    errors.symptoms = 'Bỏ chọn triệu chứng khi ghi nhận không có triệu chứng.';
  } else if (validSeverity && input.severity !== 'none' && input.symptoms.length === 0) {
    errors.symptoms = 'Vui lòng chọn ít nhất một triệu chứng.';
  }
  return errors;
}

export function normalizeHealthReadingInput(input: HealthReadingInput, now = new Date()): HealthReadingInput {
  const error = Object.values(validateHealthReadingInput(input, now))[0];
  if (error) throw new Error(error);
  const base = { seniorId: input.seniorId.trim(), recordedAt: new Date(input.recordedAt).toISOString(), note: input.note?.trim() || undefined };
  if (input.kind === 'blood-pressure') return { ...base, kind: input.kind, systolic: input.systolic, diastolic: input.diastolic };
  if (input.kind === 'blood-glucose') return { ...base, kind: input.kind, value: input.value, unit: input.unit, mealContext: input.mealContext };
  return { ...base, kind: input.kind, value: input.value };
}

export function normalizeSymptomEntryInput(input: SymptomEntryInput, now = new Date()): SymptomEntryInput {
  const error = Object.values(validateSymptomEntryInput(input, now))[0];
  if (error) throw new Error(error);
  const symptoms: string[] = [];
  const seen = new Set<string>();
  for (const value of input.symptoms) {
    const symptom = value.trim();
    const key = symptom.toLocaleLowerCase('vi-VN');
    if (!seen.has(key)) symptoms.push(symptom);
    seen.add(key);
  }
  return {
    seniorId: input.seniorId.trim(), recordedAt: new Date(input.recordedAt).toISOString(),
    symptoms, severity: input.severity, notes: input.notes?.trim() || undefined,
  };
}

export function toLocalDateKey(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// A window contains today and the preceding N-1 local calendar days; future records are excluded.
export function filterReadingsByWindow(
  readings: readonly HealthReading[],
  days: HealthHistoryWindow,
  now = new Date(),
): HealthReading[] {
  if (![7, 30, 90].includes(days) || !Number.isFinite(now.getTime())) return [];
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return readings
    .filter((reading) => isValidHealthTimestamp(reading.recordedAt)
      && Date.parse(reading.recordedAt) >= start.getTime()
      && Date.parse(reading.recordedAt) <= now.getTime())
    .map((reading) => ({ ...reading }))
    .sort((first, second) => Date.parse(first.recordedAt) - Date.parse(second.recordedAt));
}

export function latestReadingsByKind(readings: readonly HealthReading[]): Partial<Record<HealthMetricKind, HealthReading>> {
  const result: Partial<Record<HealthMetricKind, HealthReading>> = {};
  for (const reading of readings) {
    if (!isValidHealthTimestamp(reading.recordedAt)) continue;
    const previous = result[reading.kind];
    const recordedAt = Date.parse(reading.recordedAt);
    const previousRecordedAt = previous ? Date.parse(previous.recordedAt) : -Infinity;
    const createdAt = Date.parse(reading.createdAt);
    const previousCreatedAt = previous ? Date.parse(previous.createdAt) : -Infinity;
    // Minute-resolution forms can share a measured time. Prefer the newer entry,
    // and the later insertion when both timestamps are equal.
    const winsTie = recordedAt === previousRecordedAt
      && (Number.isFinite(createdAt) ? createdAt : -Infinity)
        >= (Number.isFinite(previousCreatedAt) ? previousCreatedAt : -Infinity);
    if (!previous || recordedAt > previousRecordedAt || winsTie) {
      result[reading.kind] = { ...reading };
    }
  }
  return result;
}

export function getHealthChartPoints(
  readings: readonly HealthReading[],
  kind: HealthMetricKind,
  days: HealthHistoryWindow,
  options: { now?: Date; glucoseUnit?: GlucoseUnit } = {},
): HealthChartPoint[] {
  // Deliberately require an explicit glucose unit: these values cannot share a numeric chart scale.
  if (kind === 'blood-glucose' && !options.glucoseUnit) return [];
  return filterReadingsByWindow(readings, days, options.now)
    .filter((reading) => reading.kind === kind
      && (reading.kind !== 'blood-glucose' || reading.unit === options.glucoseUnit))
    .map((reading) => ({
      id: reading.id, recordedAt: reading.recordedAt, timestamp: Date.parse(reading.recordedAt),
      value: reading.kind === 'blood-pressure' ? reading.systolic : reading.value,
      ...(reading.kind === 'blood-pressure' ? { secondaryValue: reading.diastolic } : {}),
    }));
}
