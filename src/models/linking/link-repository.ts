import type { AuthUser } from '../auth/types';
import type { Senior } from '../seniors/types';

import type { LinkCode, LinkRepository, LinkRepositoryOptions } from './types';

const TEN_MINUTES_MS = 10 * 60 * 1000;
const MAX_WRONG_ATTEMPTS = 5;
const MAX_GENERATION_ATTEMPTS = 32;
const INVALID_CODE_MESSAGE = 'Mã liên kết không hợp lệ hoặc đã hết hạn. Vui lòng xin mã mới.';
const COOLDOWN_MESSAGE = 'Bạn đã nhập sai mã nhiều lần. Vui lòng thử lại sau 10 phút.';

type CodeRecord = LinkCode & { ownerId: string; status: 'active' | 'revoked' | 'consumed' };
type Binding = { seniorId: string; accountId: string; ownerId: string };
type Attempts = { count: number; blockedUntil?: number };

function copySenior(senior: Senior): Senior {
  return { ...senior, chronicConditions: [...senior.chronicConditions] };
}

function copyCode(record: LinkCode): LinkCode {
  return { code: record.code, seniorId: record.seniorId, expiresAt: record.expiresAt };
}

/**
 * Session-only demo linking. Metadata stays inside this repository; the lookup
 * callback is a service capability and must not be exposed as a raw UI profile list.
 * Math.random is sufficient only for this demo. Production must use a trusted
 * backend, cryptographically secure code generation, authenticated ownership,
 * durable rate limits, and a transaction that atomically consumes/binds the code.
 */
export function createLinkRepository(
  getCurrentUser: () => AuthUser | null,
  getSeniorById: (id: string) => Senior | undefined,
  options: LinkRepositoryOptions = {},
): LinkRepository {
  const now = options.now ?? Date.now;
  const generateCode = options.generateCode ?? (() => String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0'));
  // Keep revoked/consumed codes reserved so they cannot regain validity in this session.
  const codes = new Map<string, CodeRecord>();
  const profileCodes = new Map<string, string>();
  const profileBindings = new Map<string, Binding>();
  const accountBindings = new Map<string, Binding>();
  const attempts = new Map<string, Attempts>();

  function requireFamily(): AuthUser {
    const user = getCurrentUser();
    if (!user || user.role !== 'family') {
      throw new Error('Vui lòng đăng nhập bằng tài khoản Con cái để quản lý liên kết.');
    }
    return user;
  }

  function requireOwnedSenior(seniorId: string, user: AuthUser): Senior {
    const senior = getSeniorById(seniorId);
    if (!senior || senior.ownerId !== user.id) {
      throw new Error('Không thể quản lý liên kết của hồ sơ này.');
    }
    return senior;
  }

  function getLinkedSenior(): Senior | undefined {
    const user = getCurrentUser();
    if (!user || user.role !== 'senior') return undefined;
    const binding = accountBindings.get(user.id);
    if (!binding) return undefined;
    const senior = getSeniorById(binding.seniorId);
    return senior?.ownerId === binding.ownerId ? copySenior(senior) : undefined;
  }

  function rejectAttempt(accountId: string, timestamp: number): never {
    const state = attempts.get(accountId) ?? { count: 0 };
    const count = state.count + 1;
    if (count >= MAX_WRONG_ATTEMPTS) {
      attempts.set(accountId, { count, blockedUntil: timestamp + TEN_MINUTES_MS });
      throw new Error(COOLDOWN_MESSAGE);
    }
    attempts.set(accountId, { count });
    throw new Error(INVALID_CODE_MESSAGE);
  }

  return {
    getLinkedSenior,
    getLinkedSeniorId() {
      return getLinkedSenior()?.id;
    },
    getProfileLinkStatus(seniorId) {
      const user = requireFamily();
      requireOwnedSenior(seniorId, user);
      return profileBindings.get(seniorId)?.ownerId === user.id;
    },
    issueCode(seniorId, forceNew = false) {
      const user = requireFamily();
      const senior = requireOwnedSenior(seniorId, user);
      if (profileBindings.has(senior.id)) {
        throw new Error('Hồ sơ này đã được liên kết với tài khoản Người cao tuổi.');
      }
      const timestamp = now();
      const previousCode = profileCodes.get(senior.id);
      const previous = previousCode ? codes.get(previousCode) : undefined;
      if (!forceNew && previous?.status === 'active' && previous.ownerId === user.id && previous.expiresAt > timestamp) {
        return copyCode(previous);
      }

      let nextCode: string | undefined;
      for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
        let candidate: string;
        try {
          candidate = generateCode();
        } catch {
          continue;
        }
        if (typeof candidate === 'string' && /^\d{6}$/.test(candidate) && !codes.has(candidate)) {
          nextCode = candidate;
          break;
        }
      }
      if (!nextCode) throw new Error('Chưa tạo được mã liên kết. Vui lòng thử lại.');

      const record: CodeRecord = {
        code: nextCode,
        seniorId: senior.id,
        ownerId: user.id,
        expiresAt: timestamp + TEN_MINUTES_MS,
        status: 'active',
      };
      // Revoke only after a replacement was generated successfully.
      if (previous) previous.status = 'revoked';
      codes.set(nextCode, record);
      profileCodes.set(senior.id, nextCode);
      return copyCode(record);
    },
    linkSenior(code) {
      const user = getCurrentUser();
      if (!user || user.role !== 'senior') {
        throw new Error('Vui lòng đăng nhập bằng tài khoản Người cao tuổi để liên kết hồ sơ.');
      }
      const timestamp = now();
      const state = attempts.get(user.id);
      if (state?.blockedUntil !== undefined) {
        if (state.blockedUntil > timestamp) throw new Error(COOLDOWN_MESSAGE);
        attempts.delete(user.id);
      }
      if (accountBindings.has(user.id)) {
        throw new Error('Tài khoản này đã liên kết với một hồ sơ người thân.');
      }

      const normalizedCode = typeof code === 'string' ? code.trim() : '';
      const record = /^\d{6}$/.test(normalizedCode) ? codes.get(normalizedCode) : undefined;
      if (!record || record.status !== 'active' || record.expiresAt <= timestamp) {
        return rejectAttempt(user.id, timestamp);
      }
      const senior = getSeniorById(record.seniorId);
      if (!senior || senior.ownerId !== record.ownerId || profileBindings.has(record.seniorId)) {
        return rejectAttempt(user.id, timestamp);
      }

      const binding: Binding = { seniorId: senior.id, accountId: user.id, ownerId: record.ownerId };
      record.status = 'consumed';
      profileBindings.set(senior.id, binding);
      accountBindings.set(user.id, binding);
      attempts.delete(user.id);
      return copySenior(senior);
    },
  };
}
