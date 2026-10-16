import { isValidScheduleDate, isValidScheduleTime } from '../schedules/schedule-model';

import { toLocalDateKey, validateHealthReadingInput, validateSymptomEntryInput, VITAL_INPUT_MAX_LENGTH } from './health-model';
import type { GlucoseMealContext, GlucoseUnit, HealthMetricKind, HealthReadingInput, SymptomEntryInput, SymptomSeverity } from './types';

export type HealthEntryMode = 'reading' | 'symptoms';
const INTEGER_VITAL_PATTERN = new RegExp(`^\\d{1,${VITAL_INPUT_MAX_LENGTH}}$`);
export type HealthEntryFormValues = {
  kind: HealthMetricKind;
  systolic: string;
  diastolic: string;
  value: string;
  unit: GlucoseUnit;
  mealContext: GlucoseMealContext;
  date: string;
  time: string;
  note: string;
  symptoms: string;
  customSymptom: string;
  severity: SymptomSeverity | '';
  notes: string;
};

export function createHealthEntryForm(now = new Date()): HealthEntryFormValues {
  return {
    kind: 'blood-pressure', systolic: '', diastolic: '', value: '', unit: 'mmol/L',
    mealContext: 'unspecified', date: toLocalDateKey(now),
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    note: '', symptoms: '', customSymptom: '', severity: '', notes: '',
  };
}

function recordedAt(values: HealthEntryFormValues): string {
  if (!isValidScheduleDate(values.date) || !isValidScheduleTime(values.time)) return '';
  const [year, month, day] = values.date.split('-').map(Number);
  const [hours, minutes] = values.time.split(':').map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  // Reject a nonexistent local clock time rather than silently moving a measurement.
  if (toLocalDateKey(date) !== values.date || date.getHours() !== hours || date.getMinutes() !== minutes) return '';
  return date.toISOString();
}

function numberValue(value: string, integerVital = false): number {
  const text = value.trim();
  if (integerVital) return INTEGER_VITAL_PATTERN.test(text) ? Number(text) : NaN;
  return /^\d+(?:[.,]\d+)?$/.test(text) ? Number(text.replace(',', '.')) : NaN;
}

export function healthFormToReading(seniorId: string, values: HealthEntryFormValues): HealthReadingInput {
  const base = { seniorId, recordedAt: recordedAt(values), note: values.note };
  if (values.kind === 'blood-pressure') {
    return { ...base, kind: values.kind, systolic: numberValue(values.systolic, true), diastolic: numberValue(values.diastolic, true) };
  }
  if (values.kind === 'blood-glucose') {
    return { ...base, kind: values.kind, value: numberValue(values.value), unit: values.unit, mealContext: values.mealContext };
  }
  return { ...base, kind: values.kind, value: numberValue(values.value, values.kind === 'heart-rate') };
}

export function healthFormToSymptoms(seniorId: string, values: HealthEntryFormValues): SymptomEntryInput {
  return {
    seniorId, recordedAt: recordedAt(values),
    symptoms: [...values.symptoms.split('\n'), values.customSymptom].map((value) => value.trim()).filter(Boolean),
    severity: values.severity as SymptomSeverity, notes: values.notes,
  };
}

export function validateHealthEntryForm(mode: HealthEntryMode, seniorId: string, values: HealthEntryFormValues, now = new Date()): Partial<Record<keyof HealthEntryFormValues, string>> {
  const errors = mode === 'reading'
    ? validateHealthReadingInput(healthFormToReading(seniorId, values), now)
    : validateSymptomEntryInput(healthFormToSymptoms(seniorId, values), now);
  const { recordedAt: dateError, seniorId: recipientError, ...fields } = errors;
  if (mode === 'reading') {
    const vitalFields: ('systolic' | 'diastolic' | 'value')[] = values.kind === 'blood-pressure'
      ? ['systolic', 'diastolic'] : values.kind === 'heart-rate' ? ['value'] : [];
    for (const field of vitalFields) {
      if (values[field].trim() && !INTEGER_VITAL_PATTERN.test(values[field].trim())) {
        fields[field] = `Chỉ nhập số nguyên dương, tối đa ${VITAL_INPUT_MAX_LENGTH} chữ số.`;
      }
    }
  }
  if (recipientError) fields.date = recipientError;
  if (dateError) fields.time = dateError;
  return fields;
}
