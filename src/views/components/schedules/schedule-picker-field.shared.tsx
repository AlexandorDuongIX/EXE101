import { CalendarDays, ChevronDown, Clock3, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isValidScheduleDate, isValidScheduleTime } from '@/models/schedules/schedule-model';
import { Button, Text } from '@/views/components/ui';
import { AppColors, PrimaryColors, Rounded } from '@/views/styles/theme';

export interface SchedulePickerFieldProps {
  mode: 'date' | 'time';
  label: string;
  accessibilityLabel: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  minimumDate?: string;
  maximumDate?: string;
  placeholder?: string;
  clearable?: boolean;
}

export function parseLocalDate(value?: string): Date | undefined {
  if (!value || !isValidScheduleDate(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

const pad = (value: number) => String(value).padStart(2, '0');

export function serializePickerValue(mode: 'date' | 'time', value: Date) {
  return mode === 'date'
    ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
    : `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function displayPickerValue(mode: 'date' | 'time', value: string) {
  if (mode === 'time') return isValidScheduleTime(value) ? value : '';
  if (!isValidScheduleDate(value)) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function initialPickerDate({ mode, value, minimumDate, maximumDate }: SchedulePickerFieldProps) {
  if (mode === 'time') {
    const now = new Date();
    // A daily clock time must not inherit a DST transition from today's date.
    const date = new Date(2000, 0, 1, now.getHours(), now.getMinutes(), 0, 0);
    if (isValidScheduleTime(value)) {
      const [hours, minutes] = value.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  }
  const date = parseLocalDate(value) ?? new Date();
  date.setHours(12, 0, 0, 0);
  const minimum = parseLocalDate(minimumDate);
  const maximum = parseLocalDate(maximumDate);
  if (minimum && date < minimum) return minimum;
  if (maximum && date > maximum) return maximum;
  return date;
}

export function PickerFieldSurface({ props, onOpen }: { props: SchedulePickerFieldProps; onOpen: () => void }) {
  const { mode, label, accessibilityLabel, value, onChange, error, disabled, placeholder, clearable } = props;
  const display = displayPickerValue(mode, value);
  const Icon = mode === 'date' ? CalendarDays : Clock3;
  return (
    <View style={styles.field}>
      {!!label && <Text variant="labelSm" color={AppColors.textSecondary}>{label}</Text>}
      <View style={styles.fieldRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ text: display || placeholder || (mode === 'date' ? 'Chọn ngày' : 'Chọn giờ') }}
          accessibilityState={{ disabled: !!disabled }}
          disabled={disabled}
          activeOpacity={0.75}
          onPress={onOpen}
          style={[styles.fieldButton, !!error && styles.fieldError, disabled && styles.disabled]}
        >
          <Icon size={20} color={AppColors.action} />
          <Text variant="bodyMd" color={display ? AppColors.text : AppColors.textSecondary} style={styles.fieldValue}>
            {display || placeholder || (mode === 'date' ? 'Chọn ngày' : 'Chọn giờ')}
          </Text>
          <ChevronDown size={18} color={AppColors.textSecondary} />
        </TouchableOpacity>
        {clearable && !!value && (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Xóa ${accessibilityLabel}`} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={() => onChange('')} activeOpacity={0.75} style={styles.clearButton}>
            <X size={20} color={AppColors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text variant="bodySm" color={AppColors.error} accessibilityLiveRegion="polite">{error}</Text>}
    </View>
  );
}

export function PickerSheet({ mode, title, onCancel, onConfirm, confirmDisabled, children }: {
  mode: 'date' | 'time';
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const noun = mode === 'date' ? 'ngày' : 'giờ';
  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel={`Đóng bộ chọn ${noun}`} onPress={onCancel} activeOpacity={1} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16), maxHeight: '92%' }]} accessibilityViewIsModal>
          <View style={styles.header}>
            <Text variant="headlineSm" semiBold accessibilityRole="header" style={styles.title}>{title}</Text>
          </View>
          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Hủy chọn ${noun}`} onPress={onCancel} activeOpacity={0.75} style={styles.cancelButton}>
              <Text variant="labelMd" semiBold color={AppColors.textSecondary}>Hủy</Text>
            </TouchableOpacity>
            <Button title={`Xác nhận ${noun}`} accessibilityLabel={`Xác nhận ${noun}`} onPress={onConfirm} disabled={confirmDisabled} style={styles.confirmButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  field: { minWidth: 0, gap: 6, marginVertical: 8 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fieldButton: { flex: 1, minWidth: 0, minHeight: 56, paddingHorizontal: 14, paddingVertical: 12, borderRadius: Rounded.default, backgroundColor: AppColors.background, borderWidth: 1, borderColor: PrimaryColors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: 9 },
  fieldValue: { flex: 1, minWidth: 0 },
  fieldError: { borderColor: AppColors.error },
  disabled: { opacity: 0.5 },
  clearButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, backgroundColor: 'rgba(17,28,45,0.45)' },
  sheet: { width: '100%', maxWidth: 430, flexShrink: 1, backgroundColor: AppColors.surface, borderRadius: Rounded.md, overflow: 'hidden' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { flexShrink: 1 },
  bodyScroll: { flexShrink: 1 },
  body: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: PrimaryColors.borderSubtle },
  cancelButton: { minWidth: 64, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  confirmButton: { flex: 1, paddingHorizontal: 12 },
});
