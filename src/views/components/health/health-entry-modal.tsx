import { Activity, Check, ClipboardPlus, Droplets, HeartPulse, Scale, Smile, X } from 'lucide-react-native';
import { useEffect, useRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HealthEntryFormValues } from '@/models/health/health-form-model';
import { VITAL_INPUT_MAX_LENGTH } from '@/models/health/health-model';
import { SchedulePickerField } from '@/views/components/schedules/schedule-picker-field';
import { Button, Input, Text } from '@/views/components/ui';
import { AppColors, HealthColors, PrimaryColors, Rounded } from '@/views/styles/theme';

export interface HealthEntryModalProps {
  visible: boolean;
  mode: 'reading' | 'symptoms';
  recipientName: string;
  values: HealthEntryFormValues;
  errors: Partial<Record<keyof HealthEntryFormValues, string>>;
  onChange: (field: keyof HealthEntryFormValues, value: string) => void;
  onSave: () => void;
  onClose: () => void;
  submitError?: string;
  saving?: boolean;
}

const READING_KINDS = [
  { value: 'blood-pressure', label: 'Huyết áp', icon: HeartPulse },
  { value: 'heart-rate', label: 'Nhịp tim', icon: Activity },
  { value: 'blood-glucose', label: 'Đường huyết', icon: Droplets },
  { value: 'weight', label: 'Cân nặng', icon: Scale },
] as const;
const COMMON_SYMPTOMS = ['Đau đầu', 'Chóng mặt', 'Mệt mỏi', 'Khó ngủ', 'Buồn nôn', 'Đau nhức'];
const SEVERITIES = [
  { value: 'mild', label: 'Nhẹ' },
  { value: 'moderate', label: 'Vừa' },
  { value: 'severe', label: 'Nặng' },
] as const;

function FieldError({ message }: { message?: string }) {
  return message ? <Text variant="bodySm" color={AppColors.error} accessibilityLiveRegion="polite">{message}</Text> : null;
}

function Choice({ label, selected, onPress, disabled, icon, grow = false }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
  icon?: ReactNode;
  grow?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, selected, disabled }}
      aria-checked={selected}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.choice, grow && styles.growChoice, selected && styles.selectedChoice, disabled && styles.disabled]}
    >
      {icon}
      <Text variant="labelSm" semiBold color={selected ? AppColors.primary : AppColors.textSecondary} style={styles.choiceLabel}>{label}</Text>
      {selected && <Check size={16} color={AppColors.action} />}
    </TouchableOpacity>
  );
}

export function HealthEntryModal({
  visible, mode, recipientName, values, errors, onChange, onSave, onClose, submitError, saving = false,
}: HealthEntryModalProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const reading = mode === 'reading';
  const bloodPressure = values.kind === 'blood-pressure';
  const glucose = values.kind === 'blood-glucose';
  const selectedSymptoms = values.symptoms.split('\n').map((value) => value.trim()).filter(Boolean);
  const today = new Date();
  const maximumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const hasErrors = Object.values(errors).some(Boolean);
  const scalar = values.kind === 'heart-rate'
    ? { label: 'Nhịp tim', unit: 'nhịp/phút' }
    : glucose ? { label: 'Đường huyết', unit: values.unit }
      : { label: 'Cân nặng', unit: 'kg' };

  useEffect(() => {
    if (visible) scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [visible, mode]);

  const inputProps = (field: keyof HealthEntryFormValues) => ({
    value: values[field],
    onChangeText: (value: string) => onChange(field, value),
    error: errors[field],
    editable: !saving,
    containerStyle: styles.inputSurface,
  });

  const toggleSymptom = (symptom: string) => {
    const next = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter((value) => value !== symptom)
      : [...selectedSymptoms, symptom];
    onChange('symptoms', next.join('\n'));
    if (next.length && values.severity === 'none') onChange('severity', '');
  };

  const chooseNoSymptoms = () => {
    onChange('symptoms', '');
    onChange('customSymptom', '');
    onChange('severity', 'none');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => { if (!saving) onClose(); }}>
      {visible && (
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}>
          <TouchableOpacity style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Đóng bản ghi sức khỏe" disabled={saving} activeOpacity={1} onPress={onClose} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]} accessibilityViewIsModal>
            <View style={styles.handle} accessible={false} />
            <View style={styles.header}>
              <View style={styles.headerIcon} accessible={false}>
                {reading ? <HeartPulse size={25} color={AppColors.action} /> : <ClipboardPlus size={25} color={AppColors.action} />}
              </View>
              <View style={styles.headerCopy}>
                <Text variant="headlineSm" semiBold accessibilityRole="header">{reading ? 'Ghi chỉ số sức khỏe' : 'Ghi nhận triệu chứng'}</Text>
                <Text variant="bodySm" color={AppColors.textSecondary}>Cho {recipientName}</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Đóng biểu mẫu sức khỏe" disabled={saving} onPress={onClose} activeOpacity={0.75} style={styles.closeButton}>
                <X size={22} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {hasErrors && <Text variant="bodySm" color={AppColors.error} accessibilityLiveRegion="polite">Kiểm tra lại các mục được đánh dấu bên dưới.</Text>}
              {reading ? (
                <>
                  <View style={styles.section}>
                    <Text variant="labelMd" semiBold>Chọn chỉ số</Text>
                    <View style={styles.kindChoices} accessibilityRole="radiogroup" accessibilityLabel="Loại chỉ số sức khỏe">
                      {READING_KINDS.map(({ value, label, icon: Icon }) => (
                        <View key={value} style={styles.kindChoice}>
                          <Choice label={label} selected={values.kind === value} disabled={saving} onPress={() => onChange('kind', value)} icon={<Icon size={20} color={values.kind === value ? AppColors.action : AppColors.textSecondary} />} />
                        </View>
                      ))}
                    </View>
                    <FieldError message={errors.kind} />
                  </View>

                  <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                      <Text variant="labelMd" semiBold>Số đo</Text>
                      {bloodPressure && <Text variant="bodySm" color={AppColors.textSecondary}>mmHg</Text>}
                    </View>
                    <Text variant="bodySm" color={AppColors.textSecondary}>Nhập số đo từ thiết bị hoặc kết quả đã ghi lại.</Text>
                    {bloodPressure ? (
                      <View style={styles.numberRow}>
                        <View style={styles.numberField}>
                          <Input {...inputProps('systolic')} label="Tâm thu *" accessibilityLabel="Huyết áp tâm thu, bắt buộc" placeholder="Nhập số" keyboardType="number-pad" inputMode="numeric" maxLength={VITAL_INPUT_MAX_LENGTH} style={styles.numberInput} />
                        </View>
                        <View style={styles.numberField}>
                          <Input {...inputProps('diastolic')} label="Tâm trương *" accessibilityLabel="Huyết áp tâm trương, bắt buộc" placeholder="Nhập số" keyboardType="number-pad" inputMode="numeric" maxLength={VITAL_INPUT_MAX_LENGTH} style={styles.numberInput} />
                        </View>
                      </View>
                    ) : (
                      <Input {...inputProps('value')} label={`${scalar.label} *`} accessibilityLabel={`${scalar.label}, bắt buộc`} placeholder="Nhập số đo" keyboardType={values.kind === 'heart-rate' ? 'number-pad' : 'decimal-pad'} inputMode={values.kind === 'heart-rate' ? 'numeric' : 'decimal'} maxLength={values.kind === 'heart-rate' ? VITAL_INPUT_MAX_LENGTH : 12} style={styles.numberInput} rightIcon={scalar.unit ? <Text variant="bodySm" color={AppColors.textSecondary}>{scalar.unit}</Text> : undefined} />
                    )}
                    {(bloodPressure || values.kind === 'heart-rate') && <Text variant="bodySm" color={AppColors.textSecondary}>Chỉ nhập số nguyên, tối đa {VITAL_INPUT_MAX_LENGTH} chữ số.</Text>}
                    {glucose && (
                      <>
                        <Text variant="labelSm" color={AppColors.textSecondary}>Đơn vị *</Text>
                        <View style={styles.inlineChoices} accessibilityRole="radiogroup" accessibilityLabel="Đơn vị đường huyết">
                          {['mmol/L', 'mg/dL'].map((unit) => <Choice key={unit} label={unit} selected={values.unit === unit} disabled={saving} onPress={() => onChange('unit', unit)} grow />)}
                        </View>
                        <FieldError message={errors.unit} />
                        <Text variant="labelSm" color={AppColors.textSecondary} style={styles.subheading}>Thời điểm so với bữa ăn</Text>
                        <View style={styles.inlineChoices} accessibilityRole="radiogroup" accessibilityLabel="Thời điểm đo đường huyết">
                          {([
                            { value: 'fasting', label: 'Lúc đói' },
                            { value: 'after-meal', label: 'Sau ăn' },
                            { value: 'unspecified', label: 'Không rõ' },
                          ] as const).map((option) => <Choice key={option.value} label={option.label} selected={values.mealContext === option.value} disabled={saving} onPress={() => onChange('mealContext', option.value)} />)}
                        </View>
                        <FieldError message={errors.mealContext} />
                      </>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.section}>
                    <Choice label="Hôm nay thấy ổn" selected={values.severity === 'none'} disabled={saving} onPress={chooseNoSymptoms} icon={<Smile size={22} color={AppColors.action} />} />
                  </View>
                  <View style={styles.section}>
                    <Text variant="labelMd" semiBold>Triệu chứng gặp phải</Text>
                    <Text variant="bodySm" color={AppColors.textSecondary}>Có thể chọn nhiều triệu chứng.</Text>
                    <View style={styles.inlineChoices}>
                      {COMMON_SYMPTOMS.map((symptom) => {
                        const selected = selectedSymptoms.includes(symptom);
                        return (
                          <TouchableOpacity key={symptom} accessibilityRole="checkbox" accessibilityLabel={symptom} accessibilityState={{ checked: selected, disabled: saving }} aria-checked={selected} disabled={saving} activeOpacity={0.75} onPress={() => toggleSymptom(symptom)} style={[styles.symptomChoice, selected && styles.selectedChoice, saving && styles.disabled]}>
                            {selected && <Check size={16} color={AppColors.action} />}
                            <Text variant="labelSm" semiBold color={selected ? AppColors.primary : AppColors.textSecondary}>{symptom}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <FieldError message={errors.symptoms} />
                    <Input {...inputProps('customSymptom')} label="Triệu chứng khác (không bắt buộc)" accessibilityLabel="Triệu chứng khác" placeholder="Nhập triệu chứng khác" onChangeText={(value) => { onChange('customSymptom', value); if (value.trim() && values.severity === 'none') onChange('severity', ''); }} maxLength={80} />
                  </View>
                  <View style={styles.section}>
                    <Text variant="labelMd" semiBold>Mức độ ghi nhận</Text>
                    <View style={styles.inlineChoices} accessibilityRole="radiogroup" accessibilityLabel="Mức độ triệu chứng">
                      {SEVERITIES.map((severity) => <Choice key={severity.value} label={severity.label} selected={values.severity === severity.value} disabled={saving} onPress={() => onChange('severity', severity.value)} grow />)}
                    </View>
                    <FieldError message={errors.severity} />
                  </View>
                </>
              )}

              <View style={styles.section}>
                <Text variant="labelMd" semiBold>Thời gian ghi nhận</Text>
                <SchedulePickerField mode="date" label="Ngày ghi nhận *" accessibilityLabel="Ngày ghi nhận, bắt buộc" value={values.date} onChange={(value) => onChange('date', value)} error={errors.date} maximumDate={maximumDate} disabled={saving} placeholder="Chọn ngày" />
                <SchedulePickerField mode="time" label="Giờ ghi nhận *" accessibilityLabel="Giờ ghi nhận, bắt buộc" value={values.time} onChange={(value) => onChange('time', value)} error={errors.time} disabled={saving} placeholder="Chọn giờ" />
              </View>
              <View style={styles.section}>
                <Input {...inputProps(reading ? 'note' : 'notes')} label="Ghi chú (không bắt buộc)" accessibilityLabel={reading ? 'Ghi chú chỉ số' : 'Ghi chú triệu chứng'} placeholder="Thêm thông tin cần nhớ" multiline textAlignVertical="top" maxLength={1000} style={styles.noteInput} />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              {!!submitError && <Text variant="bodySm" color={AppColors.error} accessibilityLiveRegion="polite" style={styles.submitError}>{submitError}</Text>}
              <Button title={reading ? 'Lưu chỉ số' : 'Lưu triệu chứng'} onPress={onSave} loading={saving} />
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: HealthColors.modalOverlay },
  sheet: { width: '100%', maxWidth: 600, maxHeight: '94%', alignSelf: 'center', flexShrink: 1, backgroundColor: AppColors.surface, borderTopLeftRadius: Rounded.lg, borderTopRightRadius: Rounded.lg },
  handle: { height: 4, width: 36, borderRadius: 2, backgroundColor: AppColors.border, alignSelf: 'center', marginTop: 12, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: PrimaryColors.borderSubtle },
  headerIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: PrimaryColors.surface, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, minWidth: 0, gap: 2 },
  closeButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.surfaceMuted },
  formScroll: { flexShrink: 1 },
  formContent: { padding: 20, gap: 24 },
  section: { gap: 8 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  subheading: { marginTop: 10 },
  kindChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kindChoice: { flexBasis: '47%', flexGrow: 1, minWidth: 0 },
  inlineChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: PrimaryColors.borderSubtle, backgroundColor: AppColors.background, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  choiceLabel: { flexShrink: 1 },
  growChoice: { flexGrow: 1, flexBasis: 0 },
  selectedChoice: { backgroundColor: PrimaryColors.surface, borderColor: PrimaryColors.borderStrong },
  symptomChoice: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Rounded.full, borderWidth: 1, borderColor: PrimaryColors.borderSubtle, backgroundColor: AppColors.background, flexDirection: 'row', alignItems: 'center', gap: 6 },
  numberRow: { flexDirection: 'row', gap: 12 },
  numberField: { flex: 1, minWidth: 0 },
  numberInput: { fontSize: 22, lineHeight: 32, minWidth: 0, paddingVertical: 8 },
  inputSurface: { backgroundColor: AppColors.background, borderColor: PrimaryColors.borderSubtle },
  noteInput: { minHeight: 90, paddingVertical: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: PrimaryColors.borderSubtle },
  submitError: { marginBottom: 12 },
  disabled: { opacity: 0.5 },
});
