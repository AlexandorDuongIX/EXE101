import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Rounded, Shadows } from '@/constants/theme';
import {
  Text,
  AppIcon,
  Button,
  PhoneInput,
  ZaloIcon,
  GoogleIcon,
  VoiceOverIcon,
} from '@/components/ui';
import { OtpModal } from '@/components/otp-modal';

export type UserRole = 'family' | 'senior' | 'caregiver';

export default function LoginScreen() {
  const [role, setRole] = useState<UserRole>('family');
  const [phone, setPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Dynamic font multiplier for accessibility toggle ("Chữ to & Rõ")
  const fontScale = isLargeFont ? 1.25 : 1.0;

  // Smart Vietnamese Phone Input Handler
  const handlePhoneChange = (rawText: string) => {
    let digits = rawText.replace(/\D/g, '');

    // Limit to 10 digits if starting with '0', or 9 digits if not starting with '0'
    if (digits.startsWith('0')) {
      digits = digits.slice(0, 10);
    } else {
      digits = digits.slice(0, 9);
    }

    // Auto-formatting with spacing
    let formatted = digits;
    if (digits.startsWith('0')) {
      // 0XXX XXX XXX (10 digits)
      if (digits.length > 4 && digits.length <= 7) {
        formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
      } else if (digits.length > 7) {
        formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      }
    } else {
      // XXX XXX XXX (9 digits)
      if (digits.length > 3 && digits.length <= 6) {
        formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
      } else if (digits.length > 6) {
        formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      }
    }

    setPhone(formatted);
  };

  // Normalize phone number (validates 10-digit 09xx or 9-digit 9xx)
  const getNormalizedPhone = (phoneText: string) => {
    const digits = phoneText.replace(/\D/g, '');
    
    if (digits.startsWith('0')) {
      const isValid = digits.length === 10;
      const body = digits.slice(1);
      const display = isValid ? `0${body.slice(0, 3)} ${body.slice(3, 6)} ${body.slice(6)}` : phoneText;
      return { isValid, display };
    } else {
      const isValid = digits.length === 9;
      const display = isValid ? `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}` : phoneText;
      return { isValid, display };
    }
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
    const { isValid, display } = getNormalizedPhone(phone);
    if (!isValid) {
      Alert.alert(
        'Số điện thoại không hợp lệ',
        'Vui lòng nhập đủ 10 số (bắt đầu bằng số 0) hoặc 9 số hợp lệ!\nVí dụ: 0912 345 678 hoặc 912 345 678'
      );
      return;
    }
    
    setNormalizedPhone(display);
    setLoading(true);
    setTimeout(() => {
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

  const handleVerifyOTP = (otpCode: string) => {
    setIsOtpModalOpen(false);
    Alert.alert('Thành công', `Đăng nhập thành công vào KithCare với mã ${otpCode}!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppIcon size={32} />
            <View style={styles.brandTitleRow}>
              <Text variant="headlineSm" bold color={Colors.primary} style={{ fontSize: 19 * fontScale }}>
                KithCare
              </Text>
              <View style={styles.seniorBadge}>
                <Text variant="bodySm" bold color={Colors.primary} style={{ fontSize: 10 * fontScale }}>
                  Senior & Family
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleCallHotline('19001000')}
            style={styles.hotlineButton}
          >
            <Text variant="bodySm" bold color={Colors.secondary} style={{ fontSize: 12 * fontScale }}>
              Hotline 24/7
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Security & Font Toggle */}
          <View style={styles.topControlBar}>
            <View style={styles.securityBadge}>
              <Text variant="bodySm" semiBold color={Colors.primary} style={{ fontSize: 11 * fontScale }}>
                Bảo mật chuẩn y tế
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsLargeFont(!isLargeFont)}
              style={[
                styles.fontToggleBtn,
                isLargeFont ? styles.fontToggleActive : styles.fontToggleInactive,
              ]}
            >
              <Text
                variant="bodySm"
                bold
                color={isLargeFont ? Colors.onPrimary : Colors.onSecondaryFixed}
                style={{ fontSize: 11 * fontScale }}
              >
                {isLargeFont ? 'Chữ Chuẩn' : 'Chữ To & Rõ'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* App Logo & Welcome Title */}
          <View style={styles.welcomeSection}>
            <View style={styles.iconWrapper}>
              <AppIcon size={64} />
            </View>
            <Text variant="headlineMd" bold color={Colors.primary} style={{ fontSize: 22 * fontScale }}>
              KithCare
            </Text>
            <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={{ fontSize: 13 * fontScale, marginTop: 2 }}>
              Connect & Care for Loved Ones
            </Text>
          </View>

          {/* Main Login Card */}
          <View style={[styles.loginCard, Shadows.layer1]}>
            <View style={styles.cardHeader}>
              <Text variant="labelLg" bold color={Colors.onSurface} style={{ fontSize: 16 * fontScale }}>
                Đăng nhập / Đăng ký
              </Text>
              <Text variant="bodySm" color={Colors.onSurfaceVariant} style={{ fontSize: 12 * fontScale }}>
                OTP qua SMS/Zalo
              </Text>
            </View>

            {/* Role Selector */}
            <View style={styles.roleContainer}>
              <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.roleLabel}>
                Vai trò của bạn trong gia đình:
              </Text>
              <View style={styles.roleGrid}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setRole('family')}
                  style={[
                    styles.roleBtn,
                    role === 'family' ? styles.roleBtnActive : styles.roleBtnInactive,
                  ]}
                >
                  <Text
                    variant="labelSm"
                    bold
                    color={role === 'family' ? Colors.onPrimary : Colors.onSurface}
                    align="center"
                    style={{ fontSize: 11 * fontScale }}
                  >
                    Con cái / Người thân
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setRole('senior')}
                  style={[
                    styles.roleBtn,
                    role === 'senior' ? styles.roleBtnActive : styles.roleBtnInactive,
                  ]}
                >
                  <Text
                    variant="labelSm"
                    bold
                    color={role === 'senior' ? Colors.onPrimary : Colors.onSurface}
                    align="center"
                    style={{ fontSize: 11 * fontScale }}
                  >
                    Người cao tuổi
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setRole('caregiver')}
                  style={[
                    styles.roleBtn,
                    role === 'caregiver' ? styles.roleBtnActive : styles.roleBtnInactive,
                  ]}
                >
                  <Text
                    variant="labelSm"
                    bold
                    color={role === 'caregiver' ? Colors.onPrimary : Colors.onSurface}
                    align="center"
                    style={{ fontSize: 11 * fontScale }}
                  >
                    Điều dưỡng
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputSection}>
              <PhoneInput
                label="Số điện thoại"
                value={phone}
                onChangeText={handlePhoneChange}
                rightIcon={
                  phone.length > 0 ? (
                    <TouchableOpacity onPress={handleClearPhone}>
                      <Text variant="bodyMd" color={Colors.outline}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  ) : undefined
                }
              />

              <Button
                title="Tiếp tục nhận mã OTP"
                loading={loading}
                onPress={handleSendOTP}
                style={styles.submitBtn}
              />
            </View>
          </View>

          {/* Voice Assistance Banner for Seniors */}
          <View style={styles.voiceBanner}>
            <View style={styles.voiceLeft}>
              <View style={styles.voiceIconBox}>
                <VoiceOverIcon size={18} color={Colors.secondary} />
              </View>
              <View style={styles.voiceTextGroup}>
                <Text variant="labelSm" bold color={Colors.onSurface} style={{ fontSize: 12 * fontScale }}>
                  Hỗ trợ đọc mã giọng nói
                </Text>
                <Text variant="bodySm" color={Colors.onSurfaceVariant} style={{ fontSize: 11 * fontScale }}>
                  Dành cho Ông Bà mắt kém, khó đọc tin
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleVoiceOTP}
              style={styles.voiceBtn}
            >
              <Text variant="bodySm" bold color={Colors.secondary} style={{ fontSize: 11 * fontScale }}>
                Gọi đọc mã
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Logins */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text variant="bodySm" color={Colors.onSurfaceVariant} style={styles.dividerText}>
              Hoặc đăng nhập với
            </Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialGrid}>
            <TouchableOpacity activeOpacity={0.8} style={styles.socialBtn}>
              <ZaloIcon size={24} style={{ marginRight: 8 }} />
              <Text variant="labelMd" bold color={Colors.onSurface}>
                Zalo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.socialBtn}>
              <GoogleIcon size={22} style={{ marginRight: 8 }} />
              <Text variant="labelMd" bold color={Colors.onSurface}>
                Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Helpline Call Bar */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleCallHotline('18006868')}
            style={styles.helplineBar}
          >
            <Text variant="bodySm" semiBold color={Colors.onSecondaryFixed}>
              Hỗ trợ miễn phí:{' '}
              <Text variant="bodySm" bold color={Colors.secondary}>
                1800 6868
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Footer Terms & HIPAA Compliance */}
          <View style={styles.footer}>
            <Text variant="bodySm" align="center" color={Colors.outline} style={{ fontSize: 11 * fontScale }}>
              Bằng việc tiếp tục, bạn đồng ý với{' '}
              <Text variant="bodySm" bold color={Colors.primaryContainer}>
                Điều khoản
              </Text>{' '}
              &{' '}
              <Text variant="bodySm" bold color={Colors.primaryContainer}>
                Bảo mật y tế
              </Text>{' '}
              của KithCare.
            </Text>

            <View style={styles.hipaaBadge}>
              <Text variant="bodySm" color={Colors.onSurfaceVariant} style={{ fontSize: 11 * fontScale }}>
                Mã hóa chuẩn HIPAA y tế gia đình • 100% An toàn
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* OTP Bottom Sheet Modal */}
        <OtpModal
          visible={isOtpModalOpen}
          phone={normalizedPhone || phone}
          onClose={() => setIsOtpModalOpen(false)}
          onChangePhone={() => setIsOtpModalOpen(false)}
          onVerify={handleVerifyOTP}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  seniorBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Rounded.full,
    marginLeft: 6,
  },
  hotlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Rounded.full,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.full,
  },
  fontToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.full,
  },
  fontToggleInactive: {
    backgroundColor: Colors.secondaryFixed,
  },
  fontToggleActive: {
    backgroundColor: Colors.secondaryContainer,
  },
  welcomeSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.md,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  roleBtn: {
    flex: 1,
    height: 44,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  roleBtnActive: {
    backgroundColor: Colors.primaryContainer,
  },
  roleBtnInactive: {
    backgroundColor: Colors.surfaceContainer,
  },
  inputSection: {
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 16,
  },
  voiceBanner: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Rounded.default,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  voiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  voiceIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondaryFixed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  voiceTextGroup: {
    flex: 1,
  },
  voiceBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: Colors.secondaryContainer,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: Rounded.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  helplineBar: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryFixed,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Rounded.full,
    marginVertical: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
  },
  hipaaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});
