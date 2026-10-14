// `family` is the existing account role for Con cái / Người thân.
export type UserRole = 'family' | 'senior' | 'caregiver';

export type AuthUser = Readonly<{
  id: string;
  role: UserRole;
  phone: string;
}>;

export type DemoLoginInput = {
  phone: string;
  role: UserRole;
  otpCode: string;
};
