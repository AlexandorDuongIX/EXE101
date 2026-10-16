/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AuthUser } from '../src/models/auth/types';
import {
  formatScheduleDate,
  isValidScheduleDate,
  normalizeScheduleInput,
  validateScheduleInput,
} from '../src/models/schedules/schedule-model';
import { createScheduleRepository } from '../src/models/schedules/schedule-repository';
import type {
  AppointmentScheduleInput,
  MedicationScheduleInput,
  ScheduleInput,
} from '../src/models/schedules/types';

const familyA: AuthUser = { id: 'family-a', role: 'family', phone: '0911111111' };
const familyB: AuthUser = { id: 'family-b', role: 'family', phone: '0922222222' };
const seniorA: AuthUser = { id: 'senior-a', role: 'senior', phone: '0933333333' };
const seniorB: AuthUser = { id: 'senior-b', role: 'senior', phone: '0944444444' };
const seniors = [
  { id: 'profile-a', ownerId: familyA.id, fullName: 'Nguyễn Văn An' },
  { id: 'profile-a-2', ownerId: familyA.id, fullName: 'Nguyễn Thị Bình' },
  { id: 'profile-b', ownerId: familyB.id, fullName: 'Trần Văn Bảo' },
];

function medication(overrides: Partial<MedicationScheduleInput> = {}): MedicationScheduleInput {
  return {
    kind: 'medication',
    seniorId: 'profile-a',
    name: 'Tên thuốc trên đơn',
    dosage: 'Liều dùng trên đơn',
    times: ['08:00', '20:00'],
    startDate: '2026-10-16',
    ...overrides,
  };
}

function appointment(overrides: Partial<AppointmentScheduleInput> = {}): AppointmentScheduleInput {
  return {
    kind: 'appointment',
    seniorId: 'profile-a',
    title: 'Tái khám theo lịch hẹn',
    facility: 'Phòng khám gia đình',
    date: '2026-11-01',
    time: '09:30',
    ...overrides,
  };
}

function setup() {
  let currentUser: AuthUser | null = familyA;
  const links = new Map<string, string>();
  const repository = createScheduleRepository(
    () => currentUser,
    () => seniors,
    () => currentUser ? links.get(currentUser.id) : undefined
  );
  return {
    repository,
    signIn: (user: AuthUser | null) => { currentUser = user; },
    link: (user: AuthUser, seniorId?: string) => {
      if (seniorId) links.set(user.id, seniorId);
      else links.delete(user.id);
    },
  };
}

test('family can create, read, update and delete both types of manually entered schedule', () => {
  const { repository } = setup();
  const medicine = repository.create(medication());
  const visit = repository.create(appointment());
  assert.equal(medicine.ownerId, familyA.id);
  assert.equal(visit.ownerId, familyA.id);
  assert.notEqual(medicine.id, visit.id);
  assert.equal(repository.list().length, 2);

  const updatedMedicine = repository.update(medicine.id, medication({ name: 'Tên thuốc đã sửa' }));
  const updatedVisit = repository.update(visit.id, appointment({ time: '10:00', notes: 'Mang hồ sơ' }));
  assert.equal(updatedMedicine.id, medicine.id);
  assert.equal(updatedMedicine.createdAt, medicine.createdAt);
  assert.equal(updatedMedicine.kind === 'medication' && updatedMedicine.name, 'Tên thuốc đã sửa');
  assert.equal(updatedVisit.kind === 'appointment' && updatedVisit.time, '10:00');
  assert.equal(updatedVisit.kind === 'appointment' && updatedVisit.notes, 'Mang hồ sơ');
  repository.remove(medicine.id);
  repository.remove(visit.id);
  assert.deepEqual(repository.list(), []);
  assert.throws(() => repository.remove(medicine.id), /Không tìm thấy/);
});

test('family ownership comes from auth and cannot be spoofed when creating or mutating records', () => {
  const { repository, signIn } = setup();
  const created = repository.create({ ...medication(), ownerId: familyB.id } as ScheduleInput);
  assert.equal(created.ownerId, familyA.id);
  signIn(familyB);
  assert.deepEqual(repository.list(), []);
  assert.throws(() => repository.update(created.id, medication({ seniorId: 'profile-b' })), /Không tìm thấy/);
  assert.throws(() => repository.remove(created.id), /Không tìm thấy/);
  assert.throws(() => repository.create(medication()), /người thân/);
  const other = repository.create(appointment({ seniorId: 'profile-b' }));
  assert.deepEqual(repository.list().map((item) => item.id), [other.id]);
  signIn(familyA);
  assert.deepEqual(repository.list().map((item) => item.id), [created.id]);
  assert.throws(() => repository.update(created.id, medication({ seniorId: 'profile-b' })), /người thân/);
  assert.throws(() => repository.create(medication({ seniorId: 'missing' })), /người thân/);
});

test('seniors see only schedules for the explicitly linked profile and shared phones never grant access', () => {
  const { repository, signIn, link } = setup();
  const first = repository.create(medication());
  const second = repository.create(appointment({ seniorId: 'profile-a-2' }));
  signIn(seniorA);
  assert.deepEqual(repository.list(), []);
  link(seniorA, 'profile-a');
  assert.deepEqual(repository.list().map((item) => item.id), [first.id]);
  signIn({ id: 'unlinked', role: 'senior', phone: seniorA.phone });
  assert.deepEqual(repository.list(), []);
  signIn(seniorB);
  assert.deepEqual(repository.list(), []);
  link(seniorB, 'profile-a-2');
  assert.deepEqual(repository.list().map((item) => item.id), [second.id]);
  signIn(familyA);
  repository.update(first.id, medication({ seniorId: 'profile-a-2' }));
  signIn(seniorA);
  assert.deepEqual(repository.list(), []);
  signIn(seniorB);
  assert.equal(repository.list().length, 2);
  link(seniorB);
  assert.deepEqual(repository.list(), []);
  link(seniorB, 'missing-profile');
  assert.deepEqual(repository.list(), []);
});

test('senior, caregiver and signed out sessions cannot write schedules', () => {
  const { repository, signIn } = setup();
  const created = repository.create(medication());
  for (const user of [seniorA, { ...familyA, role: 'caregiver' as const }, null]) {
    signIn(user);
    assert.throws(() => repository.create(medication()), /Con cái/);
    assert.throws(() => repository.update(created.id, medication()), /Con cái/);
    assert.throws(() => repository.remove(created.id), /Con cái/);
    if (!user || user.role === 'caregiver') assert.deepEqual(repository.list(), []);
  }
  signIn(familyA);
  assert.equal(repository.list().length, 1);
});

test('calendar validation rejects rollover dates and checks leap years and date ranges', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-00-10', '2026-10-00', '26-10-16', '2026-1-01', '2026-10-16T08:00:00Z', '0000-01-01']) {
    assert.equal(isValidScheduleDate(date), false, date);
    assert.ok(validateScheduleInput(medication({ startDate: date })).startDate, date);
    assert.ok(validateScheduleInput(appointment({ date })).date, date);
  }
  assert.equal(isValidScheduleDate('2000-02-29'), true);
  assert.equal(isValidScheduleDate('1900-02-29'), false);
  assert.equal(isValidScheduleDate('2028-02-29'), true);
  assert.ok(validateScheduleInput(medication({ endDate: '2026-10-15' })).endDate);
  assert.deepEqual(validateScheduleInput(medication({ endDate: '2026-10-16' })), {});
  assert.deepEqual(validateScheduleInput(medication({ endDate: '' })), {});
  assert.equal(formatScheduleDate('2026-10-16'), '16/10/2026');
});

test('times require real HH:mm values and medication needs between one and twelve entries', () => {
  for (const time of ['8:00', '08:0', '24:00', '12:60', '-1:30', '08:00 AM', '']) {
    assert.ok(validateScheduleInput(medication({ times: [time] })).times, time);
    assert.ok(validateScheduleInput(appointment({ time })).time, time);
  }
  assert.ok(validateScheduleInput(medication({ times: [] })).times);
  assert.ok(validateScheduleInput(medication({ times: Array(13).fill('08:00') })).times);
  assert.deepEqual(validateScheduleInput(medication({ times: ['00:00', '23:59'] })), {});
});

test('normalization preserves entered treatment text and optional notes without deriving medical data', () => {
  const result = normalizeScheduleInput(medication({
    seniorId: ' profile-a ',
    name: '  Tên thuốc trên đơn  ',
    dosage: '  Theo đơn đã nhập  ',
    times: ['20:00', '08:00', '20:00'],
    instructions: '  Dòng một\nDòng hai  ',
    endDate: '',
  }));
  assert.deepEqual(result, medication({
    seniorId: 'profile-a',
    times: ['08:00', '20:00'], endDate: undefined, instructions: 'Dòng một\nDòng hai',
    dosage: 'Theo đơn đã nhập',
  }));
  const visit = normalizeScheduleInput(appointment({ doctor: '  ', notes: '  Đã nhập thủ công  ' }));
  assert.equal(visit.kind === 'appointment' && visit.doctor, undefined);
  assert.equal(visit.kind === 'appointment' && visit.notes, 'Đã nhập thủ công');
});

test('validation reports field errors and repository rejects malformed input without changing records', () => {
  const { repository } = setup();
  const created = repository.create(medication());
  const invalid = [
    medication({ name: ' ' }),
    medication({ name: 'x'.repeat(121) }),
    medication({ dosage: '' }),
    medication({ instructions: 'x'.repeat(1001) }),
    medication({ seniorId: '' }),
    medication({ seniorId: 'x'.repeat(201) }),
    appointment({ title: '' }),
    appointment({ facility: '' }),
    appointment({ doctor: 'x'.repeat(121) }),
    appointment({ notes: 'x'.repeat(1001) }),
    { ...medication(), times: null } as unknown as ScheduleInput,
    { ...medication(), instructions: 123 } as unknown as ScheduleInput,
    { ...appointment(), date: null } as unknown as ScheduleInput,
    { kind: 'unknown' } as unknown as ScheduleInput,
    null as unknown as ScheduleInput,
  ];
  for (const input of invalid) {
    assert.ok(Object.keys(validateScheduleInput(input)).length);
    assert.throws(() => repository.create(input), Error);
    assert.throws(() => repository.update(created.id, input), Error);
  }
  assert.deepEqual(repository.list(), [created]);
});

test('inputs and returned snapshots cannot mutate saved medication times or schedule metadata', () => {
  const { repository } = setup();
  const input = medication();
  const originalTimes = [...input.times];
  const created = repository.create(input);
  assert.deepEqual(input.times, originalTimes);
  input.times.push('22:00');
  input.name = 'Changed input';
  if (created.kind === 'medication') created.times.push('23:00');
  created.ownerId = familyB.id;
  const snapshot = repository.list();
  snapshot[0].seniorId = 'profile-a-2';
  if (snapshot[0].kind === 'medication') snapshot[0].times.push('21:00');
  const stored = repository.list()[0];
  assert.equal(stored.ownerId, familyA.id);
  assert.equal(stored.seniorId, 'profile-a');
  assert.equal(stored.kind === 'medication' && stored.name, 'Tên thuốc trên đơn');
  assert.deepEqual(stored.kind === 'medication' && stored.times, originalTimes);
});
