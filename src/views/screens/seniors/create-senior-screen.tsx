import React, { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, Check, ChevronLeft, HeartPulse, Info, ShieldAlert, UserRound } from 'lucide-react-native';

import { Button, Card, Checkbox, Chip, Input, Text } from '@/views/components/ui';
import { MaxContentWidth, Rounded, Spacing, Typography } from '@/views/styles/theme';
import {
  useCreateSeniorAccessController,
  useCreateSeniorController,
} from '@/controllers/seniors/use-create-senior-controller';
import { SeniorAvatarPicker } from '@/views/components/senior/senior-avatar-picker';
import {
  CHRONIC_CONDITIONS,
  RELATIONSHIPS,
} from '@/models/seniors/form-model';
import { AppColors } from '@/views/styles/colors';

export default function CreateSeniorScreen() {
  const { redirectHref, userId } = useCreateSeniorAccessController();

  if (redirectHref) {
    return <Redirect href={redirectHref} />;
  }

  return <CreateSeniorForm key={userId} />;
}

function CreateSeniorForm() {
  const palette = AppColors;
  const scrollRef = useRef<ScrollView>(null);
  const {
    values,
    fieldErrors,
    showValidationNotice,
    submitError,
    loading,
    disabled,
    updateFields,
    changeBirthYear,
    changeRelationship,
    changeCondition,
    changeAvatarBusy,
    changeAvatar,
    leaveForm,
    handleSubmit,
  } = useCreateSeniorController({
    onValidationFailed: () => scrollRef.current?.scrollTo({ y: 0, animated: false }),
  });

  const inputColors = {
    labelColor: palette.textSecondary,
    errorColor: palette.error,
    placeholderTextColor: palette.textSecondary,
    containerStyle: { backgroundColor: palette.surfaceMuted },
    style: { color: palette.text, fontFamily: Typography.fontFamily },
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <TouchableOpacity
              onPress={leaveForm}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="Quay lại trang quản lý người thân"
              accessibilityState={{ disabled }}
              style={[styles.backButton, disabled && styles.disabled]}
            >
              <ChevronLeft size={22} color={palette.primary} />
              <Text variant="labelMd" semiBold color={palette.primary}>Quay lại</Text>
            </TouchableOpacity>

            <View style={styles.intro}>
              <Text variant="headlineLgMobile" bold color={palette.text} accessibilityRole="header">
                Tạo hồ sơ người thân
              </Text>
              <Text variant="bodyMd" color={palette.textSecondary}>
                Thêm thông tin của cha mẹ, ông bà hoặc người thân để tiện chăm sóc sức khỏe.
              </Text>
              <Text variant="bodySm" color={palette.textSecondary}>
                Bạn đang đăng nhập với vai trò Con cái. Hồ sơ này dành cho người thân được chăm sóc.
              </Text>
              <Text variant="bodySm" color={palette.textSecondary}>Các mục có dấu * là bắt buộc.</Text>
            </View>

            {showValidationNotice && (
              <View
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={[styles.notice, { backgroundColor: palette.errorSurface, borderColor: palette.error }]}
              >
                <Info size={20} color={palette.error} />
                <Text variant="bodyMd" color={palette.error} style={styles.flexText}>
                  Vui lòng kiểm tra các mục có thông báo lỗi bên dưới.
                </Text>
              </View>
            )}

            <Card elevated={false} style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: palette.surfaceSelected }]}>
                  <UserRound size={24} color={palette.primary} />
                </View>
                <Text variant="headlineSm" semiBold color={palette.text} style={styles.flexText} accessibilityRole="header">
                  1. Thông tin cá nhân
                </Text>
              </View>

              <SeniorAvatarPicker
                uri={values.avatarUri}
                disabled={loading}
                onBusyChange={changeAvatarBusy}
                onChange={changeAvatar}
              />

              <Input
                {...inputColors}
                label="Họ và tên người thân *"
                placeholder="Nhập họ và tên người thân"
                value={values.fullName}
                onChangeText={(fullName) => updateFields({ fullName })}
                error={fieldErrors.fullName}
                aria-required={Platform.OS === 'web' ? true : undefined}
                aria-invalid={Platform.OS === 'web' ? !!fieldErrors.fullName : undefined}
                editable={!disabled}
                autoCapitalize="words"
                autoCorrect={false}
                accessibilityLabel="Họ và tên người thân, bắt buộc"
                accessibilityHint={fieldErrors.fullName}
                returnKeyType="next"
                leftIcon={<UserRound size={20} color={palette.textSecondary} />}
              />
              <Input
                {...inputColors}
                label="Năm sinh *"
                placeholder="Ví dụ: 1958"
                value={values.birthYear}
                onChangeText={changeBirthYear}
                error={fieldErrors.birthYear}
                aria-required={Platform.OS === 'web' ? true : undefined}
                aria-invalid={Platform.OS === 'web' ? !!fieldErrors.birthYear : undefined}
                editable={!disabled}
                keyboardType="number-pad"
                maxLength={4}
                accessibilityLabel="Năm sinh của người thân, bắt buộc, gồm 4 chữ số"
                accessibilityHint={fieldErrors.birthYear}
                leftIcon={<CalendarDays size={20} color={palette.textSecondary} />}
              />

              <View style={styles.fieldGroup}>
                <Text variant="labelSm" color={palette.textSecondary}>Quan hệ với bạn *</Text>
                <Text variant="bodySm" color={palette.textSecondary}>
                  Người thân này là ông, bà, cha, mẹ hoặc người thân của bạn.
                </Text>
                <View style={styles.chipList} accessibilityLabel="Chọn quan hệ của người thân với bạn">
                  {RELATIONSHIPS.map((relationship) => {
                    const selected = values.relationship === relationship.value;
                    return (
                      <Chip
                        key={relationship.value}
                        label={relationship.label}
                        selected={selected}
                        variant="outline"
                        textColor={selected ? palette.onPrimary : palette.text}
                        icon={selected ? <Check size={18} color={palette.onPrimary} /> : undefined}
                        onPress={() => changeRelationship(relationship.value)}
                        disabled={disabled}
                        accessibilityRole="radio"
                        accessibilityLabel={relationship.label}
                        accessibilityState={{ selected, checked: selected, disabled }}
                        aria-checked={selected}
                        aria-disabled={disabled}
                        style={[
                          styles.relationshipChip,
                          {
                            backgroundColor: selected ? palette.action : palette.surfaceMuted,
                            borderColor: selected ? palette.action : palette.border,
                          },
                          disabled && styles.disabled,
                        ]}
                      />
                    );
                  })}
                </View>
                {fieldErrors.relationship && (
                  <Text variant="bodySm" color={palette.error} accessibilityRole="alert">
                    {fieldErrors.relationship}
                  </Text>
                )}
              </View>
              {values.relationship === 'other' && (
                <Input
                  {...inputColors}
                  label="Quan hệ khác *"
                  placeholder="Ví dụ: Bác, Cô, Người được chăm sóc..."
                  value={values.relationshipOther}
                  onChangeText={(relationshipOther) => updateFields({ relationshipOther })}
                  error={fieldErrors.relationshipOther}
                  aria-required={Platform.OS === 'web' ? true : undefined}
                  aria-invalid={Platform.OS === 'web' ? !!fieldErrors.relationshipOther : undefined}
                  editable={!disabled}
                  accessibilityLabel="Quan hệ khác với bạn, bắt buộc"
                  accessibilityHint={fieldErrors.relationshipOther}
                />
              )}
            </Card>

            <Card elevated={false} style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: palette.surfaceSelected }]}>
                  <HeartPulse size={24} color={palette.primary} />
                </View>
                <Text variant="headlineSm" semiBold color={palette.text} style={styles.flexText} accessibilityRole="header">
                  2. Thông tin sức khỏe
                </Text>
              </View>
              <Text variant="labelSm" color={palette.textSecondary}>Bệnh nền thường gặp (không bắt buộc)</Text>
              <Text variant="bodySm" color={palette.textSecondary}>
                Có thể chọn nhiều mục hoặc để trống. Thông tin này không thay thế chẩn đoán của bác sĩ.
              </Text>
              <View style={styles.conditionList}>
                {CHRONIC_CONDITIONS.map((condition) => {
                  const checked = values.chronicConditions.includes(condition.value);
                  return (
                    <Checkbox
                      key={condition.value}
                      checked={checked}
                      onToggle={() => changeCondition(condition.value)}
                      label={condition.label}
                      labelColor={palette.text}
                      labelStyle={styles.flexText}
                      checkColor={palette.onPrimary}
                      boxColor={checked ? palette.action : palette.surface}
                      borderColor={checked ? palette.action : palette.border}
                      disabled={disabled}
                      accessibilityRole="checkbox"
                      accessibilityLabel={condition.label}
                      accessibilityState={{ checked, disabled }}
                      style={[
                        styles.condition,
                        {
                          backgroundColor: checked ? palette.surfaceSelected : palette.surfaceMuted,
                          borderColor: checked ? palette.action : palette.border,
                        },
                      ]}
                    />
                  );
                })}
              </View>
              {fieldErrors.chronicConditions && (
                <Text variant="bodySm" color={palette.error} accessibilityRole="alert">
                  {fieldErrors.chronicConditions}
                </Text>
              )}
              {values.chronicConditions.includes('other') && (
                <Input
                  {...inputColors}
                  label="Bệnh nền khác (không bắt buộc)"
                  placeholder="Nhập bệnh nền khác; ngăn cách bằng dấu phẩy"
                  value={values.chronicConditionOther}
                  onChangeText={(chronicConditionOther) => updateFields({ chronicConditionOther })}
                  editable={!disabled}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Bệnh nền khác, không bắt buộc"
                  style={[inputColors.style, styles.shortTextarea]}
                />
              )}
              <Input
                {...inputColors}
                label="Các lưu ý về sức khỏe (không bắt buộc)"
                placeholder="Ví dụ: dị ứng, thuốc đang dùng, hạn chế vận động, lưu ý khi chăm sóc..."
                value={values.medicalNotes}
                onChangeText={(medicalNotes) => updateFields({ medicalNotes })}
                editable={!disabled}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Các lưu ý về sức khỏe, không bắt buộc"
                style={[inputColors.style, styles.textarea]}
              />
            </Card>

            <Card elevated={false} style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: palette.surfaceSelected }]}>
                  <ShieldAlert size={24} color={palette.primary} />
                </View>
                <Text variant="headlineSm" semiBold color={palette.text} style={styles.flexText} accessibilityRole="header">
                  3. Liên hệ khẩn cấp (SOS)
                </Text>
              </View>
              <Checkbox
                checked={values.isPrimarySosContact}
                onToggle={(isPrimarySosContact) => updateFields({ isPrimarySosContact })}
                label="Đặt người này làm liên hệ khẩn cấp chính (SOS)"
                labelColor={palette.text}
                labelStyle={styles.flexText}
                checkColor={palette.onPrimary}
                boxColor={values.isPrimarySosContact ? palette.action : palette.surface}
                borderColor={values.isPrimarySosContact ? palette.action : palette.border}
                disabled={disabled}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: values.isPrimarySosContact, disabled }}
                style={styles.sosCheckbox}
              />
              <Text variant="bodySm" color={palette.textSecondary}>
                Trong bản demo, lựa chọn này chỉ được lưu vào hồ sơ. Chưa cấu hình người nhận cuộc gọi hoặc thông báo SOS và không gửi cảnh báo.
              </Text>
            </Card>

            <View style={[styles.demoNote, { backgroundColor: palette.surfaceMuted }]}>
              <Info size={20} color={palette.textSecondary} />
              <Text variant="bodySm" color={palette.textSecondary} style={styles.flexText}>
                Hồ sơ demo chỉ được giữ trong phiên đang mở. Hãy dùng thông tin giả để thử tính năng.
              </Text>
            </View>

            <View style={styles.actions}>
              {submitError && (
                <View
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                  style={[styles.notice, { backgroundColor: palette.errorSurface, borderColor: palette.error }]}
                >
                  <Info size={20} color={palette.error} />
                  <Text variant="bodyMd" color={palette.error} style={styles.flexText}>{submitError}</Text>
                </View>
              )}
              <Button
                title={submitError ? 'Thử tạo hồ sơ lại' : 'Tạo hồ sơ'}
                onPress={handleSubmit}
                loading={loading}
                disabled={disabled}
                titleColor={palette.onPrimary}
                style={{ backgroundColor: palette.action }}
                leftIcon={<Check size={22} color={palette.onPrimary} />}
                accessibilityRole="button"
                accessibilityLabel={loading ? 'Đang tạo hồ sơ người thân' : submitError ? 'Thử tạo hồ sơ lại' : 'Tạo hồ sơ người thân'}
                accessibilityState={{ disabled, busy: loading }}
              />
              {loading && (
                <Text variant="bodySm" color={palette.textSecondary} align="center" accessibilityLiveRegion="polite">
                  Đang tạo hồ sơ người thân…
                </Text>
              )}
              <Button
                title="Để sau"
                variant="secondary"
                onPress={leaveForm}
                disabled={disabled}
                titleColor={palette.primary}
                style={{ borderColor: palette.border }}
                accessibilityRole="button"
                accessibilityLabel="Để sau và quay lại trang quản lý người thân"
                accessibilityState={{ disabled }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.gutter, paddingBottom: Spacing.spaceXl },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  backButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.spaceXs,
    paddingVertical: Spacing.spaceSm,
    paddingRight: Spacing.gutter,
  },
  intro: { gap: Spacing.spaceSm, marginBottom: Spacing.spaceMd },
  section: { marginVertical: Spacing.two, padding: Spacing.spaceMd, gap: Spacing.spaceXs },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.spaceSm, marginBottom: Spacing.spaceSm },
  sectionIcon: { width: 44, height: 44, borderRadius: Rounded.default, alignItems: 'center', justifyContent: 'center' },
  flexText: { flex: 1, minWidth: 0 },
  fieldGroup: { marginTop: Spacing.two, gap: Spacing.spaceXs },
  chipList: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.two },
  relationshipChip: { minHeight: 44 },
  conditionList: { marginVertical: Spacing.two },
  condition: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Rounded.default,
    paddingHorizontal: Spacing.spaceSm,
    paddingVertical: Spacing.spaceXs,
    marginVertical: Spacing.one,
  },
  shortTextarea: { minHeight: 88, paddingVertical: Spacing.spaceSm },
  textarea: { minHeight: 128, paddingVertical: Spacing.spaceSm },
  sosCheckbox: { minHeight: 52, marginVertical: Spacing.two },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.spaceSm, padding: Spacing.gutter, borderRadius: Rounded.default, borderWidth: 1 },
  demoNote: { flexDirection: 'row', gap: Spacing.spaceSm, padding: Spacing.gutter, borderRadius: Rounded.default, marginVertical: Spacing.two },
  actions: { gap: Spacing.spaceSm, marginTop: Spacing.spaceSm },
  disabled: { opacity: 0.5 },
});
