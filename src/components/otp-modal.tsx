import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Rounded } from '@/constants/theme';
import { Text, AppIcon, Button, VoiceOverIcon } from '@/components/ui';

export interface OtpModalProps {
  visible: boolean;
  phone: string;
  onClose: () => void;
  onVerify: (otpCode: string) => void;
  onChangePhone: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  visible,
  phone,
  onClose,
  onVerify,
  onChangePhone,
}) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mask phone number: e.g. 0912 345 678 -> 0912 ••• 678
  const formatMaskedPhone = (rawPhone: string) => {
    const digits = rawPhone.replace(/\s+/g, '');
    if (digits.length >= 9) {
      const start = digits.slice(0, 4);
      const end = digits.slice(-3);
      return `${start} ••• ${end}`;
    }
    return rawPhone || '0912 ••• 889';
  };

  // Timer countdown handler
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (visible) {
      setOtp('');
      setTimer(45);
      setCanResend(false);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible]);

  // Handle Numeric Keypad Presses
  const handleKeyPress = (val: string) => {
    if (otp.length < 6) {
      setOtp((prev) => prev + val);
    }
  };

  const handleDelete = () => {
    setOtp((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setOtp('');
  };

  const handleResendOTP = () => {
    if (!canResend) return;
    setTimer(45);
    setCanResend(false);
    setOtp('');
    Alert.alert('Đã gửi lại mã', `Mã xác thực OTP mới đã được gửi tới số ${phone}`);
  };

  const handleVoiceCall = () => {
    Alert.alert(
      'Cuộc gọi tự động',
      `Hệ thống KithCare đang thực hiện cuộc gọi đọc mã miễn phí tới số ${phone}. Vui lòng chờ máy!`
    );
  };

  const handleConfirm = () => {
    if (otp.length < 6) {
      Alert.alert('Thông báo', 'Vui lòng nhập đủ 6 chữ số mã OTP!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onVerify(otp);
    }, 800);
  };

  const keypadKeys = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.bottomSheet}
          onPress={(e) => e.stopPropagation()}
        >
          <SafeAreaView edges={['bottom']} style={styles.safeContainer}>
            {/* Drag Handle Bar */}
            <View style={styles.dragHandleRow}>
              <View style={styles.dragHandle} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerTitleGroup}>
                  <View style={styles.shieldBox}>
                    <AppIcon size={24} />
                  </View>
                  <View>
                    <View style={styles.headerBadgeRow}>
                      <Text variant="labelSm" bold color={Colors.primaryContainer} style={styles.miniTag}>
                        KITHCARE
                      </Text>
                      <View style={styles.dot} />
                      <Text variant="bodySm" color={Colors.outline}>
                        Bảo mật
                      </Text>
                    </View>
                    <Text variant="headlineSm" bold color={Colors.onSurface}>
                      Xác thực mã OTP
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.closeBtn}
                >
                  <Text variant="labelMd" bold color={Colors.outline}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Masked Phone Box */}
              <View style={styles.phoneBox}>
                <Text variant="bodySm" color={Colors.onSurfaceVariant}>
                  Mã xác thực 6 số đã được gửi qua tin nhắn SMS tới số điện thoại:
                </Text>
                <View style={styles.phoneRow}>
                  <Text variant="labelLg" bold color={Colors.onSurface} style={styles.phoneText}>
                    {formatMaskedPhone(phone)}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onChangePhone}
                    style={styles.editPhoneBtn}
                  >
                    <Text variant="labelSm" bold color={Colors.primaryContainer}>
                      Thay đổi số ✎
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 6-Digit OTP Boxes */}
              <View style={styles.otpGrid}>
                {Array.from({ length: 6 }).map((_, index) => {
                  const digit = otp[index];
                  const isCurrent = index === otp.length;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
                        isCurrent && styles.otpBoxActive,
                      ]}
                    >
                      {digit ? (
                        <Text variant="headlineMd" bold color={Colors.primaryContainer}>
                          {digit}
                        </Text>
                      ) : isCurrent ? (
                        <View style={styles.cursorBlink} />
                      ) : (
                        <Text variant="headlineMd" color={Colors.outlineVariant}>
                          •
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Resend OTP Row */}
              <View style={styles.resendRow}>
                <View style={styles.resendTextGroup}>
                  <Text variant="bodySm" color={Colors.onSurfaceVariant}>
                    Chưa nhận được mã?{' '}
                  </Text>
                  {!canResend ? (
                    <Text variant="bodySm" color={Colors.outline}>
                      Gửi lại sau (
                      <Text variant="bodySm" bold color={Colors.primaryContainer}>
                        {timer}s
                      </Text>
                      )
                    </Text>
                  ) : (
                    <Text variant="bodySm" color={Colors.outline}>
                      Bạn có thể gửi lại ngay
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={!canResend}
                  onPress={handleResendOTP}
                  style={[styles.resendBtn, !canResend && styles.disabledText]}
                >
                  <Text
                    variant="labelSm"
                    bold
                    color={canResend ? Colors.primaryContainer : Colors.outline}
                  >
                    ↻ Gửi lại
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Voice Call Fallback */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleVoiceCall}
                style={styles.voiceCallBtn}
              >
                <VoiceOverIcon size={18} color={Colors.secondary} />
                <Text variant="labelSm" bold color={Colors.secondary}>
                  Hoặc nhận cuộc gọi tự động đọc mã (Miễn phí)
                </Text>
              </TouchableOpacity>

              {/* Primary Submit Button */}
              <Button
                title="Xác nhận & Đăng nhập"
                loading={loading}
                onPress={handleConfirm}
                style={styles.confirmBtn}
              />

              {/* Custom Mobile Keypad */}
              <View style={styles.keypadContainer}>
                <View style={styles.keypadGrid}>
                  {keypadKeys.map((item) => (
                    <TouchableOpacity
                      key={item.num}
                      activeOpacity={0.7}
                      onPress={() => handleKeyPress(item.num)}
                      style={styles.keypadButton}
                    >
                      <Text variant="labelLg" bold color={Colors.onSurface}>
                        {item.num}
                      </Text>
                      {item.sub !== '' && (
                        <Text variant="bodySm" color={Colors.outline} style={styles.keypadSub}>
                          {item.sub}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}

                  {/* Row 4: Clear (C), 0, Backspace */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClear}
                    style={styles.keypadSpecialButton}
                  >
                    <Text variant="labelMd" bold color={Colors.outline}>
                      C
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleKeyPress('0')}
                    style={styles.keypadButton}
                  >
                    <Text variant="labelLg" bold color={Colors.onSurface}>
                      0
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleDelete}
                    style={styles.keypadSpecialButton}
                  >
                    <Text variant="labelLg" bold color={Colors.onSurface}>
                      ⌫
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Trust Badge */}
              <View style={styles.trustBadgeRow}>
                <Text variant="bodySm" color={Colors.outline} align="center">
                  Bảo mật 2 lớp chuẩn y tế KithCare
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  safeContainer: {
    width: '100%',
  },
  dragHandleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.outlineVariant,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldBox: {
    width: 40,
    height: 40,
    borderRadius: Rounded.default,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  miniTag: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Rounded.default,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  phoneText: {
    fontSize: 16,
    letterSpacing: 1.2,
  },
  editPhoneBtn: {
    paddingVertical: 2,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 6,
  },
  otpBox: {
    flex: 1,
    height: 52,
    borderRadius: Rounded.default,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  otpBoxEmpty: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: 'transparent',
  },
  otpBoxFilled: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.primaryContainer,
  },
  otpBoxActive: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.primaryContainer,
  },
  cursorBlink: {
    width: 2,
    height: 22,
    backgroundColor: Colors.primaryContainer,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resendTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  disabledText: {
    opacity: 0.5,
  },
  voiceCallBtn: {
    backgroundColor: Colors.secondaryFixed,
    borderRadius: Rounded.default,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  confirmBtn: {
    marginBottom: 16,
  },
  keypadContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
    marginBottom: 10,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  keypadButton: {
    width: '31%',
    height: 48,
    borderRadius: Rounded.default,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadSpecialButton: {
    width: '31%',
    height: 48,
    borderRadius: Rounded.default,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadSub: {
    fontSize: 9,
    marginTop: -2,
  },
  trustBadgeRow: {
    alignItems: 'center',
    marginVertical: 8,
  },
});
