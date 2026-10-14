import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { formatMaskedPhone } from '@/models/auth/phone-model';

import type { OtpModalProps } from './types';

// This hook belongs to the keyed modal content so each opening starts fresh.
export function useOtpController({ visible, phone, onVerify, demoMode = false }: OtpModalProps) {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(45);
  const canResend = timer === 0;
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const confirming = useRef(false);
  const confirmationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (confirmationTimer.current) clearTimeout(confirmationTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!visible || canResend) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, canResend]);

  const handleKeyPress = (val: string) => {
    if (confirming.current) return;
    setOtp((prev) => prev.length < 6 ? prev + val : prev);
  };

  const handleDelete = () => {
    if (confirming.current) return;
    setOtp((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (confirming.current) return;
    setOtp('');
  };

  const handleResendOTP = () => {
    if (!canResend || confirming.current) return;
    setTimer(45);
    setOtp('');
    Alert.alert(
      demoMode ? 'Mã OTP demo' : 'Đã gửi lại mã',
      demoMode ? 'Bạn có thể dùng 6 chữ số bất kỳ. Bản demo không gửi SMS.' : `Mã xác thực OTP mới đã được gửi tới số ${phone}`
    );
  };

  const handleVoiceCall = () => {
    if (demoMode) {
      Alert.alert('Mã OTP demo', 'Bản demo không thực hiện cuộc gọi. Bạn có thể dùng 6 chữ số bất kỳ.');
      return;
    }
    Alert.alert(
      'Cuộc gọi tự động',
      `Hệ thống KithCare đang thực hiện cuộc gọi đọc mã miễn phí tới số ${phone}. Vui lòng chờ máy!`
    );
  };

  const handleConfirm = () => {
    if (confirming.current) return;
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert('Thông báo', 'Vui lòng nhập đủ 6 chữ số mã OTP!');
      return;
    }
    confirming.current = true;
    setVerificationError('');
    setLoading(true);
    confirmationTimer.current = setTimeout(async () => {
      confirmationTimer.current = null;
      if (!mounted.current) return;
      try {
        await onVerify(otp);
      } catch {
        if (mounted.current) setVerificationError('Chưa thể xác thực. Vui lòng thử lại.');
      } finally {
        confirming.current = false;
        if (mounted.current) setLoading(false);
      }
    }, 800);
  };

  return {
    otp,
    timer,
    canResend,
    loading,
    verificationError,
    maskedPhone: formatMaskedPhone(phone),
    handleKeyPress,
    handleDelete,
    handleClear,
    handleResendOTP,
    handleVoiceCall,
    handleConfirm,
  };
}
