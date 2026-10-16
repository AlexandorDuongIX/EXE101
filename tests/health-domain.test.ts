/// <reference types="node" />

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

import type { AuthUser } from '../src/models/auth/types';
import { buildHomeCarePlan } from '../src/models/health/care-plan';
import {
  createHealthEntryForm,
  healthFormToReading,
  healthFormToSymptoms,
  validateHealthEntryForm,
} from '../src/models/health/health-form-model';
import {
  filterReadingsByWindow,
  formatHealthReading,
  getHealthChartPoints,
  getHealthMetricUnit,
  isValidHealthTimestamp,
  latestReadingsByKind,
  normalizeHealthReadingInput,
  normalizeSymptomEntryInput,
  toLocalDateKey,
  validateHealthReadingInput,
  validateSymptomEntryInput,
} from '../src/models/health/health-model';
import { createHealthRepository } from '../src/models/health/health-repository';
import type { HealthReading, HealthReadingInput, SymptomEntryInput } from '../src/models/health/types';
import type { AppointmentScheduleInput, CareSchedule, MedicationScheduleInput } from '../src/models/schedules/types';

const familyA: AuthUser = { id: 'family-a', role: 'family', phone: '0911111111' };
const familyB: AuthUser = { id: 'family-b', role: 'family', phone: '0922222222' };
const seniorA: AuthUser = { id: 'senior-a', role: 'senior', phone: '0933333333' };
const seniorB: AuthUser = { id: 'senior-b', role: 'senior', phone: seniorA.phone };
const seniors = [
  { id: 'profile-a', ownerId: familyA.id, fullName: 'Nguyễn Văn An' },
  { id: 'profile-a-2', ownerId: familyA.id, fullName: 'Nguyễn Thị Bình' },
  { id: 'profile-b', ownerId: familyB.id, fullName: 'Trần Văn Bảo' },
];
const now = new Date('2026-10-16T12:00:00.000Z');

function reading(overrides: Partial<HealthReadingInput> = {}): HealthReadingInput {
  return { kind: 'heart-rate', seniorId: 'profile-a', recordedAt: '2020-01-01T08:30:00.000Z', value: 72, ...overrides } as HealthReadingInput;
}

function symptoms(overrides: Partial<SymptomEntryInput> = {}): SymptomEntryInput {
  return { seniorId: 'profile-a', recordedAt: '2020-01-01T08:30:00.000Z', symptoms: ['Đau đầu'], severity: 'mild', ...overrides };
}

function saved(input: HealthReadingInput, id: string): HealthReading {
  return { ...input, id, ownerId: familyA.id, createdAt: input.recordedAt };
}

function setup() {
  let currentUser: AuthUser | null = familyA;
  const links = new Map<string, string>();
  const repository = createHealthRepository(
    () => currentUser, () => seniors, () => currentUser ? links.get(currentUser.id) : undefined,
  );
  return {
    repository,
    signIn: (user: AuthUser | null) => { currentUser = user; },
    link: (user: AuthUser, id?: string) => { if (id) links.set(user.id, id); else links.delete(user.id); },
  };
}

test('repository starts empty and records all metric kinds and explicit symptom-free entries without generating data', () => {
  const { repository } = setup();
  assert.deepEqual(repository.listReadings(), []);
  assert.deepEqual(repository.listSymptoms(), []);
  const inputs: HealthReadingInput[] = [
    reading(),
    reading({ kind: 'weight', value: 60.5 }),
    reading({ kind: 'blood-pressure', systolic: 120, diastolic: 80 }),
    reading({ kind: 'blood-glucose', value: 5.4, unit: 'mmol/L', mealContext: 'fasting' }),
  ];
  const created = inputs.map((input) => repository.createReading(input));
  assert.equal(new Set(created.map((item) => item.id)).size, 4);
  assert.ok(created.every((item) => item.ownerId === familyA.id));
  assert.equal(repository.listReadings().length, 4);
  const well = repository.createSymptoms(symptoms({ symptoms: [], severity: 'none' }));
  assert.deepEqual(well.symptoms, []);
  assert.equal(repository.listSymptoms().length, 1);
});

test('family ownership and owned profile checks isolate health data and ignore spoofed owner metadata', () => {
  const { repository, signIn } = setup();
  const first = repository.createReading({ ...reading(), ownerId: familyB.id } as unknown as HealthReadingInput);
  const diary = repository.createSymptoms({ ...symptoms(), ownerId: familyB.id } as SymptomEntryInput);
  assert.equal(first.ownerId, familyA.id);
  assert.equal(diary.ownerId, familyA.id);
  assert.throws(() => repository.createReading(reading({ seniorId: 'profile-b' })), /người thân/);
  assert.throws(() => repository.createSymptoms(symptoms({ seniorId: 'missing' })), /người thân/);
  signIn(familyB);
  assert.deepEqual(repository.listReadings(), []);
  assert.deepEqual(repository.listSymptoms(), []);
  assert.throws(() => repository.createReading(reading()), /người thân/);
  assert.throws(() => repository.createSymptoms(symptoms()), /người thân/);
  repository.createReading(reading({ seniorId: 'profile-b' }));
  repository.createSymptoms(symptoms({ seniorId: 'profile-b' }));
  assert.equal(repository.listReadings().length, 1);
  signIn(familyA);
  assert.deepEqual(repository.listReadings().map((item) => item.id), [first.id]);
  assert.deepEqual(repository.listSymptoms().map((item) => item.id), [diary.id]);
});

test('senior reads only linked profile data, sharing a phone gives no access, and unlink removes access', () => {
  const { repository, signIn, link } = setup();
  const first = repository.createReading(reading());
  const diary = repository.createSymptoms(symptoms());
  repository.createReading(reading({ seniorId: 'profile-a-2' }));
  repository.createSymptoms(symptoms({ seniorId: 'profile-a-2' }));
  signIn(seniorA);
  assert.deepEqual(repository.listReadings(), []);
  assert.deepEqual(repository.listSymptoms(), []);
  link(seniorA, 'profile-a');
  assert.deepEqual(repository.listReadings().map((item) => item.id), [first.id]);
  assert.deepEqual(repository.listSymptoms().map((item) => item.id), [diary.id]);
  signIn(seniorB);
  assert.deepEqual(repository.listReadings(), []);
  assert.deepEqual(repository.listSymptoms(), []);
  link(seniorB, 'profile-a-2');
  assert.equal(repository.listReadings().length, 1);
  assert.notEqual(repository.listReadings()[0].id, first.id);
  link(seniorB);
  assert.deepEqual(repository.listReadings(), []);
  assert.deepEqual(repository.listSymptoms(), []);
});

test('senior, caregiver and signed out accounts cannot record readings or symptoms', () => {
  const { repository, signIn, link } = setup();
  link(seniorA, 'profile-a');
  for (const user of [seniorA, { ...familyA, role: 'caregiver' as const }, null]) {
    signIn(user);
    assert.throws(() => repository.createReading(reading()), /Con cái/);
    assert.throws(() => repository.createSymptoms(symptoms()), /Con cái/);
    assert.deepEqual(repository.listReadings(), []);
    assert.deepEqual(repository.listSymptoms(), []);
  }
});

test('reading validation enforces finite positive structural numbers and pressure ordering without clinical thresholds', () => {
  for (const value of [0, -1, NaN, Infinity, -Infinity, '72', null]) {
    assert.ok(validateHealthReadingInput(reading({ value } as unknown as Partial<HealthReadingInput>), now).value);
  }
  for (const input of [
    reading({ kind: 'blood-pressure', systolic: 80, diastolic: 80 }),
    reading({ kind: 'blood-pressure', systolic: 70, diastolic: 80 }),
    reading({ kind: 'blood-pressure', systolic: NaN, diastolic: 80 }),
  ]) assert.ok(validateHealthReadingInput(input, now).systolic);
  assert.ok(validateHealthReadingInput(reading({ kind: 'blood-pressure', systolic: 120, diastolic: 0 }), now).diastolic);
  assert.deepEqual(validateHealthReadingInput(reading({ kind: 'weight', value: 0.1 }), now), {});
  assert.deepEqual(validateHealthReadingInput(reading({ kind: 'weight', value: 1000000 }), now), {});
  assert.ok(validateHealthReadingInput(reading({ kind: 'blood-glucose', value: 5, unit: 'kg' as 'mmol/L', mealContext: 'fasting' }), now).unit);
  assert.ok(validateHealthReadingInput(reading({ kind: 'blood-glucose', value: 5, unit: 'mmol/L', mealContext: '' as 'fasting' }), now).mealContext);
});

test('pressure and heart rate accept only positive integers up to three digits and invalid writes do not save', () => {
  const { repository } = setup();
  const accepted = [
    reading({ kind: 'blood-pressure', systolic: 128, diastolic: 84 }),
    reading({ kind: 'blood-pressure', systolic: 999, diastolic: 998 }),
    reading({ kind: 'heart-rate', value: 73 }),
    reading({ kind: 'heart-rate', value: 999 }),
  ];
  for (const input of accepted) {
    assert.deepEqual(validateHealthReadingInput(input, now), {});
    repository.createReading(input);
  }
  const savedReadings = repository.listReadings();
  for (const value of [1000, 12345, 1e308, 80.5, 0.5, Infinity, NaN]) {
    const inputs = [
      { input: reading({ kind: 'blood-pressure', systolic: value, diastolic: 70 }), field: 'systolic' },
      { input: reading({ kind: 'blood-pressure', systolic: 999, diastolic: value }), field: 'diastolic' },
      { input: reading({ kind: 'heart-rate', value }), field: 'value' },
    ];
    for (const { input, field } of inputs) {
      assert.ok(validateHealthReadingInput(input, now)[field], `${input.kind}: ${field}=${value}`);
      assert.throws(() => repository.createReading(input), Error);
    }
  }
  assert.deepEqual(repository.listReadings(), savedReadings);
});

test('timestamps require real calendar dates, explicit timezone, real clock time and cannot be in the future', () => {
  for (const recordedAt of ['2026-02-29T08:00:00Z', '2026-04-31T08:00:00Z', '2026-10-16', '2026-10-16T08:00:00', '2026-10-16T24:00:00Z', '2026-10-16T12:60:00Z', '2026-10-16T08:00:60Z', 'not a date', '2026-10-16T08:00:00+24:00']) {
    assert.equal(isValidHealthTimestamp(recordedAt), false, recordedAt);
    assert.ok(validateHealthReadingInput(reading({ recordedAt }), now).recordedAt);
    assert.ok(validateSymptomEntryInput(symptoms({ recordedAt }), now).recordedAt);
  }
  assert.equal(isValidHealthTimestamp('2024-02-29T08:00:00+07:00'), true);
  assert.deepEqual(validateHealthReadingInput(reading({ recordedAt: now.toISOString() }), now), {});
  assert.ok(validateHealthReadingInput(reading({ recordedAt: '2026-10-16T12:00:00.001Z' }), now).recordedAt);
  assert.ok(validateSymptomEntryInput(symptoms({ recordedAt: '2026-10-16T19:01:00+07:00' }), now).recordedAt);
  assert.deepEqual(validateHealthReadingInput(reading({ recordedAt: '2020-01-01T00:00:00Z' }), now), {});
});

test('symptoms require explicit severity with none mutually exclusive and length limits enforced', () => {
  assert.deepEqual(validateSymptomEntryInput(symptoms({ severity: 'none', symptoms: [] }), now), {});
  assert.ok(validateSymptomEntryInput(symptoms({ severity: 'none' }), now).symptoms);
  assert.ok(validateSymptomEntryInput(symptoms({ symptoms: [] }), now).symptoms);
  assert.ok(validateSymptomEntryInput(symptoms({ severity: 'unknown' as 'mild' }), now).severity);
  assert.ok(validateSymptomEntryInput(symptoms({ symptoms: [' '] }), now).symptoms);
  assert.ok(validateSymptomEntryInput(symptoms({ symptoms: ['x'.repeat(81)] }), now).symptoms);
  assert.ok(validateSymptomEntryInput(symptoms({ symptoms: Array(13).fill('Đau đầu') }), now).symptoms);
  assert.ok(validateSymptomEntryInput(symptoms({ notes: 'x'.repeat(1001) }), now).notes);
  assert.ok(validateHealthReadingInput(reading({ note: 'x'.repeat(1001) }), now).note);
  assert.ok(validateHealthReadingInput(reading({ seniorId: '' }), now).seniorId);
});

test('normalization trims entered notes, preserves numeric values and canonicalizes offsets without medical inference', () => {
  const result = normalizeHealthReadingInput(reading({ kind: 'weight', seniorId: ' profile-a ', note: '  Theo máy đo  ', recordedAt: '2026-10-16T15:30:00+07:00', value: 71.123 }), now);
  assert.equal(result.seniorId, 'profile-a');
  assert.equal(result.note, 'Theo máy đo');
  assert.equal(result.recordedAt, '2026-10-16T08:30:00.000Z');
  assert.equal(result.kind === 'weight' && result.value, 71.123);
  const entry = normalizeSymptomEntryInput(symptoms({ symptoms: [' Đau đầu ', 'đau đầu', 'Mệt'], notes: '  Nghỉ ở nhà\nBuổi sáng  ' }), now);
  assert.deepEqual(entry.symptoms, ['Đau đầu', 'Mệt']);
  assert.equal(entry.notes, 'Nghỉ ở nhà\nBuổi sáng');
  assert.equal(entry.severity, 'mild');
  assert.equal(formatHealthReading(reading({ kind: 'weight', value: 60.5 })), '60,5 kg');
  assert.equal(formatHealthReading(reading({ kind: 'blood-pressure', systolic: 120, diastolic: 80 })), '120/80 mmHg');
  assert.equal(getHealthMetricUnit('blood-glucose', 'mg/dL'), 'mg/dL');
});

test('repository rejects malformed and future data without adding records', () => {
  const { repository } = setup();
  for (const input of [
    reading({ value: Infinity }),
    reading({ recordedAt: new Date(Date.now() + 60_000).toISOString() }),
    null as unknown as HealthReadingInput,
    { kind: 'invalid' } as unknown as HealthReadingInput,
    reading({ note: 123 } as unknown as Partial<HealthReadingInput>),
  ]) assert.throws(() => repository.createReading(input), Error);
  for (const input of [symptoms({ severity: 'none' }), null as unknown as SymptomEntryInput, symptoms({ symptoms: null as unknown as string[] })]) {
    assert.throws(() => repository.createSymptoms(input), Error);
  }
  assert.deepEqual(repository.listReadings(), []);
  assert.deepEqual(repository.listSymptoms(), []);
});

test('returned snapshots and input arrays cannot change saved health data', () => {
  const { repository } = setup();
  const input = symptoms();
  const entry = repository.createSymptoms(input);
  const item = repository.createReading(reading());
  input.symptoms.push('Mệt');
  entry.symptoms.push('Đau bụng');
  item.seniorId = 'profile-a-2';
  const copiedSymptoms = repository.listSymptoms();
  copiedSymptoms[0].symptoms.push('Ho');
  copiedSymptoms[0].ownerId = familyB.id;
  const copiedReadings = repository.listReadings();
  copiedReadings[0].ownerId = familyB.id;
  assert.deepEqual(repository.listSymptoms()[0].symptoms, ['Đau đầu']);
  assert.equal(repository.listSymptoms()[0].ownerId, familyA.id);
  assert.equal(repository.listReadings()[0].ownerId, familyA.id);
  assert.equal(repository.listReadings()[0].seniorId, 'profile-a');
});

test('history windows include actual readings from N local calendar days through now and preserve chronological order', () => {
  const localNow = new Date(2026, 9, 16, 12, 0);
  const local = (day: number, hour = 0) => new Date(2026, 9, day, hour).toISOString();
  const records = [
    saved(reading({ recordedAt: local(16, 13) }), 'future'),
    saved(reading({ recordedAt: local(16, 11) }), 'latest'),
    saved(reading({ recordedAt: local(9, 23) }), 'too-old'),
    saved(reading({ recordedAt: local(10) }), 'start'),
    saved(reading({ recordedAt: local(13, 8) }), 'middle'),
  ];
  assert.deepEqual(filterReadingsByWindow(records, 7, localNow).map((item) => item.id), ['start', 'middle', 'latest']);
  assert.deepEqual(filterReadingsByWindow(records, 30, localNow).map((item) => item.id), ['too-old', 'start', 'middle', 'latest']);
  assert.equal(filterReadingsByWindow(records, 90, localNow).length, 4);
  assert.equal(records[0].id, 'future');
  assert.equal(toLocalDateKey(new Date(2026, 9, 16, 0, 30)), '2026-10-16');
  assert.equal(toLocalDateKey('invalid'), '');
});

test('latest values use recorded time rather than insertion order and chart points retain paired pressure values', () => {
  const records = [
    saved(reading({ recordedAt: '2026-10-16T10:00:00Z', value: 75 }), 'newer'),
    saved(reading({ recordedAt: '2026-10-16T08:00:00Z', value: 72 }), 'older'),
    saved(reading({ kind: 'blood-pressure', systolic: 120, diastolic: 80, recordedAt: '2026-10-16T08:00:00Z' }), 'pressure'),
  ];
  assert.equal(latestReadingsByKind(records)['heart-rate']?.id, 'newer');
  const points = getHealthChartPoints(records, 'heart-rate', 7, { now });
  assert.deepEqual(points.map((point) => point.id), ['older', 'newer']);
  assert.equal(points[1].timestamp - points[0].timestamp, 2 * 60 * 60 * 1000);
  const pressure = getHealthChartPoints(records, 'blood-pressure', 7, { now });
  assert.equal(pressure.length, 1);
  assert.equal(pressure[0].value, 120);
  assert.equal(pressure[0].secondaryValue, 80);
  assert.deepEqual(getHealthChartPoints([], 'weight', 7, { now }), []);
});

test('blood glucose charts require a unit and never combine or convert mixed units', () => {
  const records = [
    saved(reading({ kind: 'blood-glucose', value: 5.4, unit: 'mmol/L', mealContext: 'fasting', recordedAt: '2026-10-16T08:00:00Z' }), 'mmol'),
    saved(reading({ kind: 'blood-glucose', value: 100, unit: 'mg/dL', mealContext: 'after-meal', recordedAt: '2026-10-16T09:00:00Z' }), 'mg'),
  ];
  assert.deepEqual(getHealthChartPoints(records, 'blood-glucose', 7, { now }), []);
  assert.deepEqual(getHealthChartPoints(records, 'blood-glucose', 7, { now, glucoseUnit: 'mmol/L' }).map((point) => point.value), [5.4]);
  assert.deepEqual(getHealthChartPoints(records, 'blood-glucose', 7, { now, glucoseUnit: 'mg/dL' }).map((point) => point.value), [100]);
  assert.equal(latestReadingsByKind(records)['blood-glucose']?.id, 'mg');
});

test('latest reading breaks equal measured timestamps by creation time then later insertion', () => {
  const measuredAt = '2026-10-16T08:00:00Z';
  const first = { ...saved(reading({ recordedAt: measuredAt, value: 70 }), 'first'), createdAt: '2026-10-16T08:01:00Z' };
  const newer = { ...saved(reading({ recordedAt: measuredAt, value: 75 }), 'newer'), createdAt: '2026-10-16T08:02:00Z' };
  const olderMeasurementSavedLater = { ...saved(reading({ recordedAt: '2026-10-16T07:00:00Z', value: 65 }), 'older-measurement'), createdAt: '2026-10-16T09:00:00Z' };
  assert.equal(latestReadingsByKind([first, newer, olderMeasurementSavedLater])['heart-rate']?.id, 'newer');
  assert.equal(latestReadingsByKind([newer, first])['heart-rate']?.id, 'newer');
  const sameTimestamps = { ...newer, id: 'later-insertion' };
  assert.equal(latestReadingsByKind([first, newer, sameTimestamps])['heart-rate']?.id, 'later-insertion');
});

test('health forms accept comma decimals and reject blank, malformed, nonfinite or nonpositive numbers', () => {
  const localNow = new Date(2026, 9, 16, 12, 0);
  const form = { ...createHealthEntryForm(localNow), kind: 'weight' as const, value: ' 60,75 ' };
  const converted = healthFormToReading('profile-a', form);
  assert.equal(converted.kind === 'weight' && converted.value, 60.75);
  assert.deepEqual(validateHealthEntryForm('reading', 'profile-a', form, localNow), {});
  for (const value of ['', ' ', 'six', '1,2,3', '1e3', 'Infinity', '-5', '1 000']) {
    const invalid = healthFormToReading('profile-a', { ...form, value });
    assert.equal(invalid.kind === 'weight' && Number.isNaN(invalid.value), true, value);
    assert.ok(validateHealthEntryForm('reading', 'profile-a', { ...form, value }, localNow).value);
  }
  assert.ok(validateHealthEntryForm('reading', 'profile-a', { ...form, value: '0' }, localNow).value);
  const pressure = { ...createHealthEntryForm(localNow), systolic: '120', diastolic: '80' };
  assert.deepEqual(validateHealthEntryForm('reading', 'profile-a', pressure, localNow), {});
});

test('pressure and pulse forms reject overlong or decimal raw text without changing its numeric meaning', () => {
  const localNow = new Date(2026, 9, 16, 12, 0);
  const base = createHealthEntryForm(localNow);
  for (const text of ['0001', '1234', '12.5', '12,5', 'Infinity']) {
    const systolic = { ...base, systolic: text, diastolic: '84' };
    const diastolic = { ...base, systolic: '128', diastolic: text };
    const pulse = { ...base, kind: 'heart-rate' as const, value: text };
    assert.ok(validateHealthEntryForm('reading', 'profile-a', systolic, localNow).systolic, text);
    assert.ok(validateHealthEntryForm('reading', 'profile-a', diastolic, localNow).diastolic, text);
    assert.ok(validateHealthEntryForm('reading', 'profile-a', pulse, localNow).value, text);
  }
  assert.deepEqual(validateHealthEntryForm('reading', 'profile-a', { ...base, systolic: '999', diastolic: '998' }, localNow), {});
  assert.deepEqual(validateHealthEntryForm('reading', 'profile-a', { ...base, kind: 'heart-rate', value: '999' }, localNow), {});
  assert.deepEqual(validateHealthEntryForm('reading', 'profile-a', { ...base, kind: 'weight', value: '60,75' }, localNow), {});
});

test('form timestamps capture the selected local calendar date and clock and reject future or invalid selections', () => {
  const localNow = new Date(2026, 9, 16, 12, 30);
  const form = { ...createHealthEntryForm(localNow), kind: 'weight' as const, value: '60', date: '2026-10-15', time: '09:45' };
  const recorded = new Date(healthFormToReading('profile-a', form).recordedAt);
  assert.equal(recorded.getFullYear(), 2026);
  assert.equal(recorded.getMonth(), 9);
  assert.equal(recorded.getDate(), 15);
  assert.equal(recorded.getHours(), 9);
  assert.equal(recorded.getMinutes(), 45);
  assert.deepEqual(validateHealthEntryForm('reading', 'profile-a', form, localNow), {});
  const tomorrow = { ...form, date: '2026-10-17' };
  assert.equal(validateHealthEntryForm('reading', 'profile-a', tomorrow, localNow).time, 'Thời gian ghi nhận không được ở tương lai.');
  for (const invalid of [{ ...form, date: '2026-02-30' }, { ...form, time: '24:00' }, { ...form, date: '' }]) {
    assert.equal(healthFormToReading('profile-a', invalid).recordedAt, '');
    assert.ok(validateHealthEntryForm('reading', 'profile-a', invalid, localNow).time);
  }
});

test('symptom form requires an explicit selection and distinguishes feeling well from unchecked severity', () => {
  const localNow = new Date(2026, 9, 16, 12, 0);
  const empty = createHealthEntryForm(localNow);
  assert.equal(empty.severity, '');
  assert.ok(validateHealthEntryForm('symptoms', 'profile-a', empty, localNow).severity);
  const well = { ...empty, severity: 'none' as const };
  assert.deepEqual(validateHealthEntryForm('symptoms', 'profile-a', well, localNow), {});
  assert.deepEqual(healthFormToSymptoms('profile-a', well).symptoms, []);
  assert.ok(validateHealthEntryForm('symptoms', 'profile-a', { ...well, symptoms: 'Đau đầu' }, localNow).symptoms);
  const selected = { ...empty, symptoms: 'Đau đầu\nMệt', customSymptom: '  Ho  ', severity: 'mild' as const };
  assert.deepEqual(healthFormToSymptoms('profile-a', selected).symptoms, ['Đau đầu', 'Mệt', 'Ho']);
  assert.deepEqual(validateHealthEntryForm('symptoms', 'profile-a', selected, localNow), {});
});

test('health form rejects nonexistent local clock times at a DST transition instead of moving measurements', () => {
  const modelPath = require.resolve('../src/models/health/health-form-model');
  const script = `const model=require(${JSON.stringify(modelPath)}); const form={...model.createHealthEntryForm(new Date(2026,2,8,12)),kind:'weight',value:'60',date:'2026-03-08',time:'02:30'}; process.stdout.write(JSON.stringify({timestamp:model.healthFormToReading('profile-a',form).recordedAt,errors:model.validateHealthEntryForm('reading','profile-a',form,new Date(2026,2,8,12))}));`;
  const result = spawnSync(process.execPath, ['-e', script], { env: { ...process.env, TZ: 'America/New_York' }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout) as { timestamp: string; errors: Record<string, string> };
  assert.equal(output.timestamp, '');
  assert.ok(output.errors.time);
});

function medicationSchedule(overrides: Partial<MedicationScheduleInput> = {}, id = 'medication'): CareSchedule {
  return {
    kind: 'medication', seniorId: 'profile-a', name: 'Thuốc theo đơn', dosage: 'Liều đã nhập',
    startDate: '2026-10-16', times: ['08:00', '14:00'], ...overrides,
    id, ownerId: familyA.id, createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z',
  };
}

function appointmentSchedule(overrides: Partial<AppointmentScheduleInput> = {}, id = 'appointment'): CareSchedule {
  return {
    kind: 'appointment', seniorId: 'profile-a', title: 'Khám theo lịch hẹn', facility: 'Cơ sở đã nhập',
    date: '2026-10-16', time: '15:00', ...overrides,
    id, ownerId: familyA.id, createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z',
  };
}

test('home care plan filters the selected senior and sorts upcoming appointments while skipping expired appointments', () => {
  const localNow = new Date(2026, 9, 16, 12, 0);
  const schedules = [
    appointmentSchedule({ date: '2026-10-18', time: '08:00' }, 'later'),
    appointmentSchedule({ time: '11:59' }, 'expired'),
    appointmentSchedule({ time: '12:01', seniorId: 'profile-a-2' }, 'other-senior'),
    appointmentSchedule({ time: '16:00' }, 'soon'),
    appointmentSchedule({ time: '13:00' }, 'first'),
    medicationSchedule({ seniorId: 'profile-a-2', times: ['12:01'] }),
  ];
  const plan = buildHomeCarePlan(schedules, 'profile-a', localNow);
  assert.equal(plan.nextAppointment?.scheduleId, 'first');
  assert.equal(plan.nextMedication, undefined);
  assert.equal(plan.todayDoseCount, 0);
  assert.deepEqual(buildHomeCarePlan(schedules, undefined, localNow), { todayDoseCount: 0 });
  assert.deepEqual(buildHomeCarePlan([], 'profile-a', localNow), { todayDoseCount: 0 });
});

test('medication plan counts scheduled times only within inclusive start/end dates and omits ended schedules', () => {
  const localNow = new Date(2026, 9, 16, 12, 0);
  const active = medicationSchedule({ startDate: '2026-10-16', endDate: '2026-10-16' });
  const plan = buildHomeCarePlan([active], 'profile-a', localNow);
  assert.equal(plan.todayDoseCount, 2);
  assert.equal(plan.nextMedication?.time, '14:00');
  assert.equal(plan.nextMedication?.date, '2026-10-16');
  assert.deepEqual(buildHomeCarePlan([medicationSchedule({ startDate: '2026-10-01', endDate: '2026-10-15' })], 'profile-a', localNow), { todayDoseCount: 0 });
  const future = buildHomeCarePlan([medicationSchedule({ startDate: '2026-10-20' })], 'profile-a', localNow);
  assert.equal(future.todayDoseCount, 0);
  assert.equal(future.nextMedication?.date, '2026-10-20');
  assert.equal(future.nextMedication?.time, '08:00');
  assert.deepEqual(Object.keys(plan).sort(), ['nextMedication', 'todayDoseCount']);
  assert.equal('completedDoseCount' in plan, false);
});

test('daily medication advances to tomorrow after the final time, handles month rollover and honors the end date', () => {
  const localNow = new Date(2026, 9, 31, 23, 0);
  const input = medicationSchedule({ startDate: '2026-10-01', times: ['20:00', '08:00', '08:00'] });
  const plan = buildHomeCarePlan([input], 'profile-a', localNow);
  assert.equal(plan.nextMedication?.date, '2026-11-01');
  assert.equal(plan.nextMedication?.time, '08:00');
  assert.equal(plan.todayDoseCount, 2);
  assert.deepEqual(input.kind === 'medication' && input.times, ['20:00', '08:00', '08:00']);
  const ended = buildHomeCarePlan([medicationSchedule({ startDate: '2026-10-01', endDate: '2026-10-31', times: ['08:00'] })], 'profile-a', localNow);
  assert.equal(ended.todayDoseCount, 1);
  assert.equal(ended.nextMedication, undefined);
});

test('care plan skips nonexistent DST appointment times and advances daily medication to the next valid local day', () => {
  const modelPath = require.resolve('../src/models/health/care-plan');
  const schedules = [
    medicationSchedule({ startDate: '2026-03-08', times: ['02:30'] }),
    appointmentSchedule({ date: '2026-03-08', time: '02:30' }, 'gap'),
    appointmentSchedule({ date: '2026-03-08', time: '03:30' }, 'valid'),
  ];
  const script = `const {buildHomeCarePlan}=require(${JSON.stringify(modelPath)});process.stdout.write(JSON.stringify(buildHomeCarePlan(${JSON.stringify(schedules)},'profile-a',new Date(2026,2,8,0,0))));`;
  const result = spawnSync(process.execPath, ['-e', script], { env: { ...process.env, TZ: 'America/New_York' }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout) as ReturnType<typeof buildHomeCarePlan>;
  assert.equal(plan.nextMedication?.date, '2026-03-09');
  assert.equal(plan.nextMedication?.time, '02:30');
  assert.equal(plan.nextAppointment?.scheduleId, 'valid');
});
