/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  authenticateDemoLogin,
  createDemoOtpChallenge,
} from '../src/models/auth/demo-auth-service';
import { getLoginDestination } from '../src/controllers/auth/login-destination';
import type { AuthUser, UserRole } from '../src/models/auth/types';
import {
  createEmptySeniorForm,
  normalizeSeniorForm,
  toggleChronicCondition,
  validateSeniorForm,
  type SeniorFormValues,
} from '../src/models/seniors/form-model';
import { createDemoSeniorRepository } from '../src/models/seniors/senior-repository';
import type { CreateSeniorInput } from '../src/models/seniors/types';

function validForm(overrides: Partial<SeniorFormValues> = {}): SeniorFormValues {
  return {
    ...createEmptySeniorForm(),
    fullName: 'Nguyễn Văn An',
    birthYear: '1954',
    relationship: 'father',
    ...overrides,
  };
}

function validInput(overrides: Partial<CreateSeniorInput> = {}): CreateSeniorInput {
  return { ...normalizeSeniorForm(validForm()), ...overrides };
}

async function demoUser(role: UserRole = 'family', phone = '0912345678'): Promise<AuthUser> {
  return authenticateDemoLogin({ phone, role, otpCode: '123456' });
}

test('family login skips creation only when the current account already has a senior profile', async () => {
  const firstLogin = await demoUser();
  let currentUser: AuthUser | null = firstLogin;
  const repository = createDemoSeniorRepository(() => currentUser);
  assert.equal(getLoginDestination(firstLogin, repository.list().length > 0), '/create-senior');
  await repository.create(validInput());
  assert.equal(getLoginDestination(firstLogin, repository.list().length > 0), '/family-home');

  currentUser = null;
  const secondLogin = await demoUser();
  currentUser = secondLogin;
  assert.equal(firstLogin.id, secondLogin.id);
  assert.equal(getLoginDestination(secondLogin, repository.list().length > 0), '/family-home');

  const otherAccount = await demoUser('family', '0987654321');
  currentUser = otherAccount;
  assert.equal(getLoginDestination(otherAccount, repository.list().length > 0), '/create-senior');
  currentUser = secondLogin;
  assert.equal(getLoginDestination(secondLogin, repository.list().length > 0), '/family-home');
});

test('demo routing preserves the destination of every other existing role', async () => {
  for (const hasSeniorProfile of [true, false]) {
    assert.equal(getLoginDestination(await demoUser('senior'), hasSeniorProfile), '/senior-home');
    assert.equal(getLoginDestination(await demoUser('caregiver'), hasSeniorProfile), null);
  }
});

test('the explicit OTP mock snapshots phone and role, normalizes identity and rejects malformed codes', async () => {
  const draft: { phone: string; role: UserRole } = { phone: '912 345 678', role: 'family' };
  const challenge = createDemoOtpChallenge(draft);
  draft.role = 'senior';
  draft.phone = '0987654321';
  assert.ok(Object.isFrozen(challenge));
  const user = await authenticateDemoLogin({ ...challenge, otpCode: '000000' });
  assert.equal(user.role, 'family');
  assert.equal(user.phone, '0912345678');
  assert.equal(user.id, (await demoUser()).id);
  assert.notEqual(user.id, (await demoUser('senior')).id);
  for (const otpCode of ['12345', '1234567', '12a456', ' 123456']) {
    await assert.rejects(authenticateDemoLogin({ ...challenge, otpCode }), /6 chữ số/);
  }
  assert.throws(() => createDemoOtpChallenge({ phone: '123', role: 'family' }), /điện thoại/);
});

test('required fields give Vietnamese errors and permit a four-digit birth year without an age minimum', () => {
  const empty = validateSeniorForm(createEmptySeniorForm(), 2026);
  assert.ok(empty.fullName);
  assert.ok(empty.birthYear);
  assert.ok(empty.relationship);
  assert.ok(validateSeniorForm(validForm({ fullName: ' \t ' }), 2026).fullName);
  assert.ok(validateSeniorForm(validForm({ fullName: 'A\u0301' }), 2026).fullName);
  assert.deepEqual(validateSeniorForm(validForm({ fullName: 'Án', birthYear: '2026' }), 2026), {});
  for (const birthYear of ['999', '0999', '2027', '20e3', '19540', '1954.0']) {
    assert.ok(validateSeniorForm(validForm({ birthYear }), 2026).birthYear);
  }
  assert.deepEqual(validateSeniorForm(validForm({ birthYear: '1000' }), 2026), {});
  assert.ok(validateSeniorForm(validForm({ relationship: 'other', relationshipOther: '  ' }), 2026).relationshipOther);
  assert.deepEqual(
    validateSeniorForm(validForm({ relationship: 'other', relationshipOther: ' Bác ' }), 2026),
    {}
  );
});

test('chronic conditions support multi-select with mutually exclusive none and unknown options', () => {
  let selected: string[] = [];
  selected = toggleChronicCondition(selected, 'hypertension');
  selected = toggleChronicCondition(selected, 'diabetes');
  assert.deepEqual(selected, ['hypertension', 'diabetes']);
  selected = toggleChronicCondition(selected, 'none');
  assert.deepEqual(selected, ['none']);
  selected = toggleChronicCondition(selected, 'unknown');
  assert.deepEqual(selected, ['unknown']);
  selected = toggleChronicCondition(selected, 'other');
  assert.deepEqual(selected, ['other']);
  selected = toggleChronicCondition(selected, 'other');
  assert.deepEqual(selected, []);
  assert.ok(validateSeniorForm(validForm({ chronicConditions: ['none', 'hypertension'] }), 2026).chronicConditions);
  assert.ok(validateSeniorForm(validForm({ chronicConditions: ['none', 'unknown'] }), 2026).chronicConditions);
});

test('normalization trims, deduplicates custom disease labels and preserves notes without inference', () => {
  const input = normalizeSeniorForm(validForm({
    fullName: '  Nguyễn   Văn An  ',
    birthYear: ' 1954 ',
    relationship: 'other',
    relationshipOther: '  Bác  ',
    avatarUri: '  blob:local-preview  ',
    chronicConditions: ['hypertension', 'hypertension', 'diabetes', 'other'],
    chronicConditionOther: 'TĂNG HUYẾT ÁP; tieu duong, Bệnh gout\nbenh gout; Dị ứng; dị ứng',
    medicalNotes: '  Dị ứng hải sản\nĐang dùng thuốc theo đơn.  ',
    isPrimarySosContact: true,
  }));
  assert.equal(input.fullName, 'Nguyễn Văn An');
  assert.equal(input.birthYear, 1954);
  assert.equal(input.relationshipOther, 'Bác');
  assert.equal(input.avatarUri, 'blob:local-preview');
  assert.deepEqual(input.chronicConditions, ['hypertension', 'diabetes']);
  assert.equal(input.chronicConditionOther, 'Bệnh gout, Dị ứng');
  assert.equal(input.medicalNotes, 'Dị ứng hải sản\nĐang dùng thuốc theo đơn.');
  assert.equal(input.isPrimarySosContact, true);
  assert.equal(normalizeSeniorForm(validForm({ relationshipOther: 'stale text' })).relationshipOther, undefined);
  assert.equal(normalizeSeniorForm(validForm({ chronicConditions: ['none'], chronicConditionOther: 'stale text' })).chronicConditionOther, undefined);
  assert.deepEqual(normalizeSeniorForm(validForm({ medicalNotes: 'Tiểu đường' })).chronicConditions, []);
});

test('repository derives ownership from the session and isolates profiles between accounts', async () => {
  const ownerA = await demoUser('family', '0912345678');
  const ownerB = await demoUser('family', '0987654321');
  let currentUser: AuthUser | null = ownerA;
  const repository = createDemoSeniorRepository(() => currentUser);
  const spoofed = { ...validInput({ isPrimarySosContact: true }), ownerId: ownerB.id };
  const createdA = await repository.create(spoofed);
  assert.equal(createdA.ownerId, ownerA.id);
  assert.notEqual(createdA.id, ownerA.id);
  assert.equal(createdA.isPrimarySosContact, true);
  currentUser = ownerB;
  assert.deepEqual(repository.list(), []);
  const createdB = await repository.create(validInput());
  assert.equal(createdB.ownerId, ownerB.id);
  assert.notEqual(createdB.id, createdA.id);
  assert.deepEqual(repository.list().map((profile) => profile.id), [createdB.id]);
  currentUser = ownerA;
  assert.deepEqual(repository.list().map((profile) => profile.id), [createdA.id]);
  currentUser = null;
  assert.deepEqual(repository.list(), []);
  await assert.rejects(repository.create(validInput()), /Con cái/);
  currentUser = await demoUser('senior');
  await assert.rejects(repository.create(validInput()), /Con cái/);
  currentUser = await demoUser('caregiver');
  await assert.rejects(repository.create(validInput()), /Con cái/);
});

test('simultaneous normalized duplicate submits create one record and independent later requests remain possible', async () => {
  const user = await demoUser();
  const repository = createDemoSeniorRepository(() => user);
  const [first, duplicate] = await Promise.all([
    repository.create(validInput({ fullName: '  Nguyễn  Văn An ' })),
    repository.create(validInput()),
  ]);
  assert.equal(first.id, duplicate.id);
  assert.equal(repository.list().length, 1);
  const later = await repository.create(validInput());
  assert.notEqual(later.id, first.id);
  assert.equal(repository.list().length, 2);
});

test('repository validates at the service boundary and cannot save after a session changes', async () => {
  let currentUser: AuthUser | null = await demoUser();
  const repository = createDemoSeniorRepository(() => currentUser);
  for (const input of [
    validInput({ fullName: ' ' }),
    validInput({ birthYear: 20260 }),
    validInput({ birthYear: 1954.5 }),
    validInput({ relationship: 'other', relationshipOther: ' ' }),
    validInput({ chronicConditions: ['none', 'diabetes'] }),
    validInput({ isPrimarySosContact: 'false' as unknown as boolean }),
  ]) {
    await assert.rejects(repository.create(input));
  }
  assert.equal(repository.list().length, 0);
  const pending = repository.create(validInput());
  currentUser = null;
  await assert.rejects(pending, /Con cái/);
  currentUser = await demoUser();
  assert.equal(repository.list().length, 0);
  const oldSessionRequest = repository.create(validInput());
  currentUser = { ...currentUser };
  await assert.rejects(oldSessionRequest, /Phiên đăng nhập đã thay đổi/);
  assert.equal(repository.list().length, 0);
});

test('returned snapshots cannot mutate the repository or the submit input', async () => {
  const user = await demoUser();
  const repository = createDemoSeniorRepository(() => user);
  const input = validInput({ chronicConditions: ['hypertension'] });
  const created = await repository.create(input);
  input.chronicConditions.push('diabetes');
  created.chronicConditions.push('arthritis');
  const snapshot = repository.list();
  snapshot[0].fullName = 'Edited outside the repository';
  snapshot[0].chronicConditions.push('stroke');
  assert.equal(repository.list()[0].fullName, 'Nguyễn Văn An');
  assert.deepEqual(repository.list()[0].chronicConditions, ['hypertension']);
});
