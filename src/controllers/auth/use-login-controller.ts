import { useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { router } from 'expo-router';

import { useSeniors } from '@/controllers/seniors/senior-context';
import { createDemoOtpChallenge } from '@/models/auth/demo-auth-service';
import { formatPhoneInput, getNormalizedPhone } from '@/models/auth/phone-model';
import type { UserRole } from '@/models/auth/types';

import { useAuth } from './auth-context';
import { getLoginDestination } from './login-destination';

export function useLoginController() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [phone, setPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const { getProfiles } = useSeniors();
  const pendingChallenge = useRef<ReturnType<typeof createDemoOtpChallenge> | null>(null);
  const verifying = useRef(false);
  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (sendTimer.current) clearTimeout(sendTimer.current);
    pendingChallenge.current = null;
  }, []);

  const closeOtpModal = () => {
    pendingChallenge.current = null;
    setIsOtpModalOpen(false);
  };

  const handlePhoneChange = (rawText: string) => {
    setPhone(formatPhoneInput(rawText));
  };

  const handleClearPhone = () => {
    setPhone('');
  };

  const handleCallHotline = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Hỗ trợ hotline', `Vui lòng gọi đến số: ${number}`);
    });
  };

  const handleSendOTP = () => {
    if (loading || pendingChallenge.current || verifying.current) return;
    setLoginError('');
    if (!role) {
      setLoginError('Vui lòng chọn loại tài khoản demo trước khi nhận mã OTP.');
      return;
    }
    const { isValid, display } = getNormalizedPhone(phone);
    if (!isValid) {
      setLoginError('Vui lòng nhập số điện thoại gồm 10 chữ số bắt đầu bằng 0 hoặc 9 chữ số.');
      return;
    }

    const challenge = createDemoOtpChallenge({ phone: display, role });
    pendingChallenge.current = challenge;
    setNormalizedPhone(display);
    setLoading(true);
    sendTimer.current = setTimeout(() => {
      sendTimer.current = null;
      if (pendingChallenge.current !== challenge) return;
      setLoading(false);
      setIsOtpModalOpen(true);
    }, 600);
  };

  const handleVoiceOTP = () => {
    const { isValid, display } = getNormalizedPhone(phone);
    if (!isValid) {
      Alert.alert(
        'Số điện thoại không hợp lệ',
        'Vui lòng nhập đủ 10 số (bắt đầu bằng số 0) hoặc 9 số để nhận cuộc gọi đọc mã OTP!'
      );
      return;
    }
    Alert.alert(
      'Cuộc gọi đọc mã',
      `Hệ thống KithCare đang tự động gọi đến số ${display} để đọc mã OTP. Vui lòng giữ máy!`
    );
  };

  const handleVerifyOTP = async (otpCode: string) => {
    const challenge = pendingChallenge.current;
    if (!challenge || verifying.current) return;
    verifying.current = true;
    try {
      const account = await login({ ...challenge, otpCode });
      if (pendingChallenge.current !== challenge) return;
      pendingChallenge.current = null;
      setIsOtpModalOpen(false);
      // Read after login: the live repository filters profiles for the new session.
      const hasSeniorProfile = account.role === 'family' && getProfiles().length > 0;
      const destination = getLoginDestination(account, hasSeniorProfile);
      if (destination) {
        router.replace(destination);
      } else {
        // Preserve the existing caregiver success flow until its dashboard exists.
        setLoginError('Đã đăng nhập tài khoản Điều dưỡng trong chế độ demo.');
        Alert.alert('Thành công', 'Đã đăng nhập tài khoản Điều dưỡng trong chế độ demo.');
      }
    } catch {
      pendingChallenge.current = null;
      setIsOtpModalOpen(false);
      setLoginError('Chưa thể đăng nhập. Vui lòng nhận lại mã OTP và thử lại.');
    } finally {
      verifying.current = false;
    }
  };

  return {
    role,
    setRole,
    phone,
    normalizedPhone,
    isLargeFont,
    setIsLargeFont,
    loading,
    isOtpModalOpen,
    loginError,
    closeOtpModal,
    handlePhoneChange,
    handleClearPhone,
    handleCallHotline,
    handleSendOTP,
    handleVoiceOTP,
    handleVerifyOTP,
  };
}
