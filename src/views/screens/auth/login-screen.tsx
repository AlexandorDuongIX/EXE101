import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors, PrimaryColors, Colors, Rounded, Shadows } from '@/views/styles/theme';
import {
  Text,
  AppIcon,
  Button,
  PhoneInput,
  ZaloIcon,
  GoogleIcon,
  VoiceOverIcon,
} from '@/views/components/ui';
import { OtpModal } from '@/views/components/otp-modal';
import { useLoginController } from '@/controllers/auth/use-login-controller';

export type { UserRole } from '@/models/auth/types';

export default function LoginScreen() {
  const {
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
  } = useLoginController();
  const fontScale = isLargeFont ? 1.25 : 1.0;

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
              <Text variant="headlineSm" bold color={AppColors.primary} style={{ fontSize: 19 * fontScale }}>
                KithCare
              </Text>
              <View style={styles.seniorBadge}>
                <Text variant="bodySm" bold color={AppColors.primary} style={{ fontSize: 10 * fontScale }}>
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
            <Text variant="bodySm" bold color={AppColors.secondary} style={{ fontSize: 12 * fontScale }}>
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
              <Text variant="bodySm" semiBold color={AppColors.primary} style={{ fontSize: 11 * fontScale }}>
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
                color={isLargeFont ? AppColors.onPrimary : Colors.onSecondaryFixed}
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
            <Text variant="headlineMd" bold color={AppColors.primary} style={{ fontSize: 22 * fontScale }}>
              KithCare
            </Text>
            <Text variant="bodyMd" color={AppColors.textSecondary} style={{ fontSize: 13 * fontScale, marginTop: 2 }}>
              Connect & Care for Loved Ones
            </Text>
          </View>

          {/* Main Login Card */}
          <View style={[styles.loginCard, Shadows.layer1]}>
            <View style={styles.cardHeader}>
              <Text variant="labelLg" bold color={AppColors.text} style={{ fontSize: 16 * fontScale }}>
                Đăng nhập / Đăng ký
              </Text>
              <Text variant="bodySm" color={AppColors.textSecondary} style={{ fontSize: 12 * fontScale }}>
                OTP qua SMS/Zalo
              </Text>
            </View>

            <Text variant="bodySm" color={AppColors.textSecondary} style={{ marginBottom: 12 }}>
              Đăng nhập demo: chọn loại tài khoản và nhập mã OTP gồm 6 chữ số bất kỳ.
              Chưa kết nối dịch vụ SMS hay xác thực tài khoản thật.
            </Text>

            {/* Role Selector */}
            <View style={styles.roleContainer}>
              <Text variant="labelSm" color={AppColors.textSecondary} style={styles.roleLabel}>
                Loại tài khoản demo của bạn:
              </Text>
              <View style={styles.roleGrid}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityLabel="Con cái / Người thân"
                  accessibilityState={{ checked: role === 'family' }}
                  aria-checked={role === 'family'}
                  onPress={() => setRole('family')}
                  style={[
                    styles.roleBtn,
                    role === 'family' ? styles.roleBtnActive : styles.roleBtnInactive,
                  ]}
                >
                  <Text
                    variant="labelSm"
                    bold
                    color={role === 'family' ? AppColors.onPrimary : AppColors.text}
                    align="center"
                    style={{ fontSize: 11 * fontScale }}
                  >
                    Con cái / Người thân
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityLabel="Người cao tuổi"
                  accessibilityState={{ checked: role === 'senior' }}
                  aria-checked={role === 'senior'}
                  onPress={() => setRole('senior')}
                  style={[
                    styles.roleBtn,
                    role === 'senior' ? styles.roleBtnActive : styles.roleBtnInactive,
                  ]}
                >
                  <Text
                    variant="labelSm"
                    bold
                    color={role === 'senior' ? AppColors.onPrimary : AppColors.text}
                    align="center"
                    style={{ fontSize: 11 * fontScale }}
                  >
                    Người cao tuổi
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityLabel="Điều dưỡng"
                  accessibilityState={{ checked: role === 'caregiver' }}
                  aria-checked={role === 'caregiver'}
                  onPress={() => setRole('caregiver')}
                  style={[
                    styles.roleBtn,
                    role === 'caregiver' ? styles.roleBtnActive : styles.roleBtnInactive,
                  ]}
                >
                  <Text
                    variant="labelSm"
                    bold
                    color={role === 'caregiver' ? AppColors.onPrimary : AppColors.text}
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
              {!!loginError && (
                <Text variant="bodySm" color={AppColors.error} accessibilityLiveRegion="polite" style={{ marginTop: 8 }}>
                  {loginError}
                </Text>
              )}
            </View>
          </View>

          {/* Voice Assistance Banner for Seniors */}
          <View style={styles.voiceBanner}>
            <View style={styles.voiceLeft}>
              <View style={styles.voiceIconBox}>
                <VoiceOverIcon size={18} color={AppColors.secondary} />
              </View>
              <View style={styles.voiceTextGroup}>
                <Text variant="labelSm" bold color={AppColors.text} style={{ fontSize: 12 * fontScale }}>
                  Hỗ trợ đọc mã giọng nói
                </Text>
                <Text variant="bodySm" color={AppColors.textSecondary} style={{ fontSize: 11 * fontScale }}>
                  Dành cho Ông Bà mắt kém, khó đọc tin
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleVoiceOTP}
              style={styles.voiceBtn}
            >
              <Text variant="bodySm" bold color={AppColors.secondary} style={{ fontSize: 11 * fontScale }}>
                Gọi đọc mã
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Logins */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text variant="bodySm" color={AppColors.textSecondary} style={styles.dividerText}>
              Hoặc đăng nhập với
            </Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialGrid}>
            <TouchableOpacity activeOpacity={0.8} style={styles.socialBtn}>
              <ZaloIcon size={24} style={{ marginRight: 8 }} />
              <Text variant="labelMd" bold color={AppColors.text}>
                Zalo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.socialBtn}>
              <GoogleIcon size={22} style={{ marginRight: 8 }} />
              <Text variant="labelMd" bold color={AppColors.text}>
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
              <Text variant="bodySm" bold color={AppColors.secondary}>
                1800 6868
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Footer Terms & HIPAA Compliance */}
          <View style={styles.footer}>
            <Text variant="bodySm" align="center" color={Colors.outline} style={{ fontSize: 11 * fontScale }}>
              Bằng việc tiếp tục, bạn đồng ý với{' '}
              <Text variant="bodySm" bold color={AppColors.action}>
                Điều khoản
              </Text>{' '}
              &{' '}
              <Text variant="bodySm" bold color={AppColors.action}>
                Bảo mật y tế
              </Text>{' '}
              của KithCare.
            </Text>

            <View style={styles.hipaaBadge}>
              <Text variant="bodySm" color={AppColors.textSecondary} style={{ fontSize: 11 * fontScale }}>
                Mã hóa chuẩn HIPAA y tế gia đình • 100% An toàn
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* OTP Bottom Sheet Modal */}
        <OtpModal
          demoMode
          visible={isOtpModalOpen}
          phone={normalizedPhone || phone}
          onClose={closeOtpModal}
          onChangePhone={closeOtpModal}
          onVerify={handleVerifyOTP}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.background,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surfaceSelected,
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
    backgroundColor: AppColors.surfaceSelected,
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
    backgroundColor: AppColors.surface,
    borderRadius: Rounded.md,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: PrimaryColors.borderSubtle,
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
    backgroundColor: AppColors.action,
  },
  roleBtnInactive: {
    backgroundColor: AppColors.surfaceSelected,
  },
  inputSection: {
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 16,
  },
  voiceBanner: {
    backgroundColor: AppColors.surfaceMuted,
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
    backgroundColor: AppColors.surface,
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
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.surfaceSelected,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.shadow,
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
