import type { AuthUser, DemoLoginInput, UserRole } from './types';

export type DemoOtpChallenge = Readonly<{ phone: string; role: UserRole }>;

function isUserRole(role: unknown): role is UserRole {
  return role === 'family' || role === 'senior' || role === 'caregiver';
}

export function normalizeDemoPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (/^0\d{9}$/.test(digits)) return digits;
  if (/^[1-9]\d{8}$/.test(digits)) return `0${digits}`;
  throw new Error('Vui lòng nhập số điện thoại hợp lệ.');
}

// Explicit demo only: no SMS is sent and no identity is verified by a server.
// The login screen keeps this snapshot while the OTP modal is open.
export function createDemoOtpChallenge(input: {
  phone: string;
  role: UserRole;
}): DemoOtpChallenge {
  if (!isUserRole(input.role)) throw new Error('Vai trò tài khoản không hợp lệ.');
  return Object.freeze({ phone: normalizeDemoPhone(input.phone), role: input.role });
}

export async function authenticateDemoLogin(input: DemoLoginInput): Promise<AuthUser> {
  const challenge = createDemoOtpChallenge(input);
  if (!/^\d{6}$/.test(input.otpCode)) {
    throw new Error('Vui lòng nhập đủ 6 chữ số cho mã OTP demo.');
  }
  // Any six digits are accepted by this mock. Production must replace the service.
  return Object.freeze({
    id: `demo-account:${challenge.role}:${challenge.phone}`,
    role: challenge.role,
    phone: challenge.phone,
  });
}
