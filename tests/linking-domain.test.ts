/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AuthUser } from '../src/models/auth/types';
import { createLinkRepository } from '../src/models/linking';
import type { Senior } from '../src/models/seniors/types';

const familyA: AuthUser = { id: 'family-a', role: 'family', phone: '0900000001' };
const familyB: AuthUser = { id: 'family-b', role: 'family', phone: '0900000002' };
const seniorA: AuthUser = { id: 'senior-a', role: 'senior', phone: '0900000003' };
const seniorB: AuthUser = { id: 'senior-b', role: 'senior', phone: '0900000004' };
const caregiver: AuthUser = { id: 'caregiver', role: 'caregiver', phone: '0900000005' };
const TEN_MINUTES = 600_000;

function setup(codeGenerator?: () => string) {
  let user: AuthUser | null = familyA;
  let timestamp = 1_000_000;
  let codeNumber = 0;
  const base: Senior = {
    id: 'profile-a', ownerId: familyA.id, fullName: 'Người thân giả A', birthYear: 1960,
    relationship: 'mother', chronicConditions: [], isPrimarySosContact: false,
    createdAt: '2026-10-16T00:00:00.000Z',
  };
  const profiles = [base, { ...base, id: 'profile-a-2' }, { ...base, id: 'profile-b', ownerId: familyB.id }];
  const repository = createLinkRepository(
    () => user,
    (id) => profiles.find((profile) => profile.id === id),
    { now: () => timestamp, generateCode: codeGenerator ?? (() => String(++codeNumber).padStart(6, '0')) },
  );
  return {
    repository, profiles,
    signIn: (account: AuthUser | null) => { user = account; },
    advance: (milliseconds: number) => { timestamp += milliseconds; },
    now: () => timestamp,
  };
}

test('unlinked and non-senior sessions cannot read a linked profile through gating getters', () => {
  const { repository, signIn } = setup();
  for (const account of [null, familyA, familyB, caregiver, seniorA]) {
    signIn(account);
    assert.equal(repository.getLinkedSenior(), undefined);
    assert.equal(repository.getLinkedSeniorId(), undefined);
  }
});

test('only the family owning a profile may issue codes and inspect its link status', () => {
  const { repository, signIn } = setup();
  assert.equal(repository.getProfileLinkStatus('profile-a'), false);
  assert.throws(() => repository.issueCode('profile-b'), /Không thể quản lý liên kết/);
  assert.throws(() => repository.issueCode('missing'), /Không thể quản lý liên kết/);
  assert.throws(() => repository.getProfileLinkStatus('profile-b'), /Không thể quản lý liên kết/);
  assert.throws(() => repository.getProfileLinkStatus('missing'), /Không thể quản lý liên kết/);
  for (const account of [null, seniorA, caregiver]) {
    signIn(account);
    assert.throws(() => repository.issueCode('profile-a'), /Con cái/);
    assert.throws(() => repository.getProfileLinkStatus('profile-a'), /Con cái/);
  }
  signIn(familyB);
  assert.throws(() => repository.issueCode('profile-a'), /Không thể quản lý liên kết/);
  assert.equal(repository.issueCode('profile-b').seniorId, 'profile-b');
});

test('active six-digit codes expire in ten minutes and reopening preserves the code and expiry', () => {
  const { repository, advance, now } = setup();
  const issued = repository.issueCode('profile-a');
  assert.match(issued.code, /^\d{6}$/);
  assert.equal(issued.code, '000001');
  assert.equal(issued.expiresAt, now() + TEN_MINUTES);
  advance(TEN_MINUTES - 1);
  assert.deepEqual(repository.issueCode('profile-a'), issued);
  advance(1);
  const next = repository.issueCode('profile-a');
  assert.notEqual(next.code, issued.code);
  assert.equal(next.expiresAt, now() + TEN_MINUTES);
});

test('rotation revokes the previous code and a senior can redeem only the replacement', () => {
  const { repository, signIn } = setup();
  const previous = repository.issueCode('profile-a');
  const replacement = repository.issueCode('profile-a', true);
  assert.notEqual(previous.code, replacement.code);
  signIn(seniorA);
  assert.throws(() => repository.linkSenior(previous.code), /không hợp lệ hoặc đã hết hạn/);
  assert.equal(repository.getLinkedSeniorId(), undefined);
  const linked = repository.linkSenior(` ${replacement.code} `);
  assert.equal(linked.id, 'profile-a');
  assert.equal(repository.getLinkedSeniorId(), 'profile-a');
});

test('redeeming consumes the code, links one account to one profile, and updates owner-scoped status', () => {
  const { repository, signIn } = setup();
  const first = repository.issueCode('profile-a');
  const second = repository.issueCode('profile-a-2');
  for (const account of [null, familyA, familyB, caregiver]) {
    signIn(account);
    assert.throws(() => repository.linkSenior(first.code), /Người cao tuổi/);
  }
  signIn(seniorA);
  assert.equal(repository.linkSenior(first.code).id, first.seniorId);
  assert.throws(() => repository.linkSenior(first.code), /đã liên kết/);
  assert.throws(() => repository.linkSenior(second.code), /đã liên kết/);
  signIn(seniorB);
  assert.throws(() => repository.linkSenior(first.code), /không hợp lệ hoặc đã hết hạn/);
  assert.equal(repository.linkSenior(second.code).id, second.seniorId);
  signIn(familyA);
  assert.equal(repository.getProfileLinkStatus('profile-a'), true);
  assert.equal(repository.getProfileLinkStatus('profile-a-2'), true);
  assert.throws(() => repository.issueCode('profile-a', true), /đã được liên kết/);
  signIn(familyB);
  assert.throws(() => repository.getProfileLinkStatus('profile-a'), /Không thể quản lý liên kết/);
  assert.equal(repository.getProfileLinkStatus('profile-b'), false);
});

test('a code is rejected at the exact expiry boundary with the same generic error as unknown codes', () => {
  const { repository, signIn, advance } = setup();
  const issued = repository.issueCode('profile-a');
  advance(TEN_MINUTES);
  signIn(seniorA);
  let expiredMessage = '';
  let unknownMessage = '';
  try { repository.linkSenior(issued.code); } catch (error) { expiredMessage = (error as Error).message; }
  try { repository.linkSenior('999999'); } catch (error) { unknownMessage = (error as Error).message; }
  assert.equal(expiredMessage, unknownMessage);
  assert.match(expiredMessage, /không hợp lệ hoặc đã hết hạn/);
  assert.equal(repository.getLinkedSenior(), undefined);
});

test('fifth wrong attempt starts a per-account ten-minute cooldown, including valid attempts', () => {
  const { repository, signIn, advance } = setup();
  const issued = repository.issueCode('profile-a');
  signIn(seniorA);
  for (let count = 0; count < 4; count += 1) {
    assert.throws(() => repository.linkSenior('999999'), /không hợp lệ hoặc đã hết hạn/);
  }
  assert.throws(() => repository.linkSenior('999999'), /thử lại sau 10 phút/);
  assert.throws(() => repository.linkSenior(issued.code), /thử lại sau 10 phút/);
  signIn(null);
  signIn({ ...seniorA, phone: '0900000099' });
  assert.throws(() => repository.linkSenior(issued.code), /thử lại sau 10 phút/);
  advance(TEN_MINUTES - 1);
  assert.throws(() => repository.linkSenior(issued.code), /thử lại sau 10 phút/);
  advance(1);
  signIn(familyA);
  const fresh = repository.issueCode('profile-a');
  signIn(seniorA);
  assert.equal(repository.linkSenior(fresh.code).id, 'profile-a');
});

test('one senior cooldown does not block another account or consume the valid code', () => {
  const { repository, signIn } = setup();
  const issued = repository.issueCode('profile-a');
  signIn(seniorA);
  for (let count = 0; count < 5; count += 1) assert.throws(() => repository.linkSenior('999999'));
  signIn(seniorB);
  assert.equal(repository.linkSenior(issued.code).id, 'profile-a');
  signIn(seniorA);
  assert.equal(repository.getLinkedSenior(), undefined);
});

test('malformed codes count as failed attempts without exposing profiles or throwing type errors', () => {
  const { repository, signIn } = setup();
  repository.issueCode('profile-a');
  signIn(seniorA);
  for (const code of ['12345', '1234567', '12a456', null as unknown as string]) {
    assert.throws(() => repository.linkSenior(code), /không hợp lệ hoặc đã hết hạn/);
  }
  assert.throws(() => repository.linkSenior(''), /thử lại sau 10 phút/);
  assert.equal(repository.getLinkedSeniorId(), undefined);
});

test('generation retries invalid outputs and collisions, and never reuses revoked session codes', () => {
  const sequence = ['invalid', '12345', '111111', '111111', '222222', '111111', '222222', '333333'];
  const { repository } = setup(() => sequence.shift() ?? '999999');
  const first = repository.issueCode('profile-a');
  const rotated = repository.issueCode('profile-a', true);
  const other = repository.issueCode('profile-a-2');
  assert.equal(first.code, '111111');
  assert.equal(rotated.code, '222222');
  assert.equal(other.code, '333333');
});

test('failed replacement generation is bounded and leaves the previous valid code usable', () => {
  let calls = 0;
  const { repository, signIn } = setup(() => { calls += 1; return '123456'; });
  const issued = repository.issueCode('profile-a');
  assert.throws(() => repository.issueCode('profile-a', true), /Chưa tạo được mã/);
  assert.equal(calls, 33);
  signIn(seniorA);
  assert.equal(repository.linkSenior(issued.code).id, 'profile-a');
});

test('generator exceptions are bounded and produce a useful generic failure', () => {
  let calls = 0;
  const { repository } = setup(() => { calls += 1; throw new Error('internal generator detail'); });
  assert.throws(() => repository.issueCode('profile-a'), /Chưa tạo được mã liên kết/);
  assert.equal(calls, 32);
});

test('returned codes and profiles are snapshots and cannot change repository bindings or source data', () => {
  const { repository, signIn, profiles } = setup();
  const issued = repository.issueCode('profile-a');
  const code = issued.code;
  issued.code = '999999';
  issued.seniorId = 'profile-b';
  issued.expiresAt = 0;
  assert.equal(repository.issueCode('profile-a').code, code);
  signIn(seniorA);
  const linked = repository.linkSenior(code);
  linked.id = 'profile-b';
  linked.ownerId = familyB.id;
  linked.chronicConditions.push('Fake mutation');
  const snapshot = repository.getLinkedSenior()!;
  assert.equal(snapshot.id, 'profile-a');
  assert.equal(snapshot.ownerId, familyA.id);
  assert.deepEqual([...snapshot.chronicConditions], []);
  snapshot.chronicConditions.push('Another mutation');
  assert.deepEqual(repository.getLinkedSenior()!.chronicConditions, []);
  assert.deepEqual(profiles[0].chronicConditions, []);
});

test('deleted or ownership-changed profiles cannot be redeemed or returned through gating getters', () => {
  const { repository, signIn, profiles } = setup();
  const first = repository.issueCode('profile-a');
  const second = repository.issueCode('profile-a-2');
  profiles[1].ownerId = familyB.id;
  signIn(seniorA);
  assert.throws(() => repository.linkSenior(second.code), /không hợp lệ hoặc đã hết hạn/);
  repository.linkSenior(first.code);
  profiles[0].ownerId = familyB.id;
  assert.equal(repository.getLinkedSenior(), undefined);
  assert.equal(repository.getLinkedSeniorId(), undefined);
  profiles[0].ownerId = familyA.id;
  profiles.splice(0, 1);
  assert.equal(repository.getLinkedSenior(), undefined);
  assert.equal(repository.getLinkedSeniorId(), undefined);
});

test('links use authenticated account ids rather than phone matching and remain isolated between demo sessions', () => {
  const { repository, signIn } = setup();
  const code = repository.issueCode('profile-a');
  signIn(seniorA);
  repository.linkSenior(code.code);
  signIn({ ...seniorB, phone: seniorA.phone });
  assert.equal(repository.getLinkedSeniorId(), undefined);
  signIn({ ...seniorA, phone: seniorB.phone });
  assert.equal(repository.getLinkedSeniorId(), 'profile-a');
  signIn(familyA);
  assert.equal(repository.getLinkedSenior(), undefined);
  const fresh = setup();
  fresh.signIn(seniorA);
  assert.equal(fresh.repository.getLinkedSeniorId(), undefined);
  assert.throws(() => fresh.repository.linkSenior(code.code), /không hợp lệ hoặc đã hết hạn/);
});
