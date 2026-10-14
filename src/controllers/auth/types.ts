export interface OtpModalProps {
  visible: boolean;
  phone: string;
  onClose: () => void;
  onVerify: (otpCode: string) => void | Promise<void>;
  onChangePhone: () => void;
  demoMode?: boolean;
}
