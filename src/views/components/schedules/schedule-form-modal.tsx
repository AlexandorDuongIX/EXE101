import { CalendarDays, Pill, X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ScheduleKind } from '@/models/schedules/types';
import type { ScheduleFormValues } from '@/models/schedules/form-model';
import { Button, Input, Text } from '@/views/components/ui';
import { AppColors, PrimaryColors, Rounded } from '@/views/styles/theme';

import { MedicationTimesField } from './medication-times-field';
import { SchedulePickerField } from './schedule-picker-field';

export type { ScheduleFormValues } from '@/models/schedules/form-model';

export interface ScheduleFormModalProps {
  visible: boolean;
  kind: ScheduleKind;
  editing?: boolean;
  values: ScheduleFormValues;
  fieldErrors?: Partial<Record<keyof ScheduleFormValues, string>>;
  onChange: (field: keyof ScheduleFormValues, value: string) => void;
  onSave: () => void;
  onClose: () => void;
  saving?: boolean;
  recipientName?: string;
  submitError?: string;
}

export function ScheduleFormModal({
  visible,
  kind,
  editing = false,
  values,
  fieldErrors = {},
  onChange,
  onSave,
  onClose,
  saving = false,
  recipientName,
  submitError,
}: ScheduleFormModalProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const medication = kind === 'medication';
  const hasErrors = Object.values(fieldErrors).some(Boolean);

  useEffect(() => {
    if (visible) scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [visible, kind]);

  const inputProps = (field: keyof ScheduleFormValues) => ({
    value: values[field],
    onChangeText: (value: string) => onChange(field, value),
    error: fieldErrors[field],
    editable: !saving,
    containerStyle: styles.inputSurface,
  });

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => { if (!saving) onClose(); }}>
      {visible && (
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel="Đóng biểu mẫu"
            disabled={saving}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={[styles.sheet, { maxHeight: '94%', paddingBottom: Math.max(insets.bottom, 16) }]} accessibilityViewIsModal>
            <View style={styles.handle} accessible={false} />
            <View style={styles.header}>
              <View style={styles.headerIcon} accessible={false}>
                {medication ? <Pill size={24} color={AppColors.action} /> : <CalendarDays size={24} color={AppColors.action} />}
              </View>
              <View style={styles.flex}>
                <Text variant="headlineSm" semiBold accessibilityRole="header">
                  {editing ? 'Sửa' : 'Thêm'} {medication ? 'lịch thuốc' : 'lịch khám'}
                </Text>
                {!!recipientName && <Text variant="bodySm" color={AppColors.textSecondary}>Cho {recipientName}</Text>}
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng biểu mẫu" disabled={saving} onPress={onClose} activeOpacity={0.7} style={styles.closeButton}>
                <X size={22} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} style={styles.formScroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text variant="bodySm" color={AppColors.textSecondary}>Các mục có dấu * là bắt buộc.</Text>
              {hasErrors && (
                <Text variant="bodySm" color={AppColors.error} accessibilityLiveRegion="polite">
                  Kiểm tra lại các mục được đánh dấu bên dưới.
                </Text>
              )}

              {medication ? (
                <>
                  <View style={styles.section}>
                    <Text variant="labelMd" semiBold>Thông tin thuốc</Text>
                    <Input {...inputProps('name')} label="Tên thuốc *" placeholder="Tên thuốc theo đơn" accessibilityLabel="Tên thuốc, bắt buộc" />
                    <Input {...inputProps('dosage')} label="Liều dùng mỗi lần *" placeholder="Nhập liều dùng theo đơn" accessibilityLabel="Liều dùng mỗi lần, bắt buộc" />
                    <Input {...inputProps('instructions')} label="Hướng dẫn uống (không bắt buộc)" placeholder="Lưu ý theo đơn thuốc" multiline textAlignVertical="top" style={styles.multiline} accessibilityLabel="Hướng dẫn uống" />
                  </View>
                  <View style={styles.section}>
                    <Text variant="labelMd" semiBold>Thời gian uống</Text>
                    <MedicationTimesField value={values.times} onChange={(value) => onChange('times', value)} error={fieldErrors.times} disabled={saving} />
                    <SchedulePickerField
                      mode="date" label="Ngày bắt đầu *" accessibilityLabel="Ngày bắt đầu, bắt buộc"
                      placeholder="Chọn ngày bắt đầu" value={values.startDate}
                      onChange={(value) => onChange('startDate', value)} error={fieldErrors.startDate}
                      maximumDate={values.endDate || undefined} disabled={saving}
                    />
                    <SchedulePickerField
                      mode="date" label="Ngày kết thúc (không bắt buộc)" accessibilityLabel="Ngày kết thúc"
                      placeholder="Không giới hạn" value={values.endDate}
                      onChange={(value) => onChange('endDate', value)} error={fieldErrors.endDate}
                      minimumDate={values.startDate || undefined} disabled={saving} clearable
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.section}>
                    <Text variant="labelMd" semiBold>Thông tin buổi khám</Text>
                    <Input {...inputProps('title')} label="Nội dung khám *" placeholder="Ví dụ: Tái khám định kỳ" accessibilityLabel="Nội dung khám, bắt buộc" />
                    <Input {...inputProps('facility')} label="Cơ sở khám / địa chỉ *" placeholder="Tên bệnh viện, phòng khám và địa chỉ" accessibilityLabel="Cơ sở khám hoặc địa chỉ, bắt buộc" />
                    <Input {...inputProps('doctor')} label="Bác sĩ (không bắt buộc)" placeholder="Tên bác sĩ" accessibilityLabel="Bác sĩ" />
                  </View>
                  <View style={styles.section}>
                    <Text variant="labelMd" semiBold>Ngày giờ hẹn</Text>
                    <SchedulePickerField
                      mode="date" label="Ngày khám *" accessibilityLabel="Ngày khám, bắt buộc"
                      placeholder="Chọn ngày khám" value={values.date}
                      onChange={(value) => onChange('date', value)} error={fieldErrors.date} disabled={saving}
                    />
                    <SchedulePickerField
                      mode="time" label="Giờ khám *" accessibilityLabel="Giờ khám, bắt buộc"
                      placeholder="Chọn giờ khám" value={values.time}
                      onChange={(value) => onChange('time', value)} error={fieldErrors.time} disabled={saving}
                    />
                    <Input {...inputProps('notes')} label="Ghi chú (không bắt buộc)" placeholder="Giấy tờ, địa điểm hoặc lưu ý cho buổi khám" multiline textAlignVertical="top" style={styles.multiline} accessibilityLabel="Ghi chú buổi khám" />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.footer}>
              {!!submitError && <Text variant="bodySm" color={AppColors.error} accessibilityLiveRegion="polite" style={styles.submitError}>{submitError}</Text>}
              <Button title={editing ? 'Lưu thay đổi' : medication ? 'Tạo lịch thuốc' : 'Tạo lịch khám'} onPress={onSave} loading={saving} />
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,28,45,0.4)' },
  sheet: { width: '100%', maxWidth: 600, alignSelf: 'center', flexShrink: 1, backgroundColor: AppColors.surface, borderTopLeftRadius: Rounded.lg, borderTopRightRadius: Rounded.lg },
  handle: { height: 4, width: 36, backgroundColor: AppColors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: PrimaryColors.borderSubtle },
  headerIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: PrimaryColors.surface },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: AppColors.surfaceMuted },
  formScroll: { flexShrink: 1 },
  formContent: { padding: 20, gap: 20 },
  section: { gap: 2 },
  inputSurface: { backgroundColor: AppColors.background, borderColor: PrimaryColors.borderSubtle },
  multiline: { minHeight: 84, paddingVertical: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: PrimaryColors.borderSubtle },
  submitError: { marginBottom: 12 },
});
