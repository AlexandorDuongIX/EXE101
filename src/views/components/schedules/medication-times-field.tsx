import { X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/views/components/ui';
import { AppColors, PrimaryColors } from '@/views/styles/theme';

import { SchedulePickerField } from './schedule-picker-field';

interface MedicationTimesFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function MedicationTimesField({ value, onChange, error, disabled }: MedicationTimesFieldProps) {
  const [notice, setNotice] = useState<string>();
  const times = [...new Set(value.split(/[,;\n]/).map((time) => time.trim()).filter(Boolean))].sort();

  const chooseTime = (next: string, previous?: string) => {
    if (next !== previous && times.includes(next)) {
      setNotice('Giờ này đã có trong lịch.');
      return;
    }
    setNotice(undefined);
    onChange([...new Set([...times.filter((time) => time !== previous), next])].sort().join(', '));
  };

  const removeTime = (time: string) => {
    setNotice(undefined);
    onChange(times.filter((item) => item !== time).join(', '));
  };

  return (
    <View style={styles.group}>
      <Text variant="labelSm" color={AppColors.textSecondary}>Giờ uống hằng ngày *</Text>
      {times.length > 0 && (
        <View style={styles.times}>
          {times.map((time) => (
            <View key={time} style={styles.timeRow}>
              <View style={styles.timeField}>
                <SchedulePickerField
                  mode="time"
                  label=""
                  accessibilityLabel={`Sửa giờ uống ${time}`}
                  value={time}
                  onChange={(next) => chooseTime(next, time)}
                  disabled={disabled}
                />
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Xóa giờ uống ${time}`}
                disabled={disabled}
                onPress={() => removeTime(time)}
                activeOpacity={0.7}
                style={styles.removeButton}
              >
                <X size={20} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <SchedulePickerField
        mode="time"
        label=""
        accessibilityLabel="Thêm giờ uống"
        placeholder="Thêm giờ uống"
        value=""
        onChange={(time) => chooseTime(time)}
        disabled={disabled || times.length >= 12}
        error={error}
      />
      <Text variant="bodySm" color={AppColors.textSecondary} accessibilityLiveRegion="polite">
        {notice ?? (times.length >= 12 ? 'Đã chọn đủ 12 giờ uống.' : 'Chọn giờ uống theo đơn. Chạm vào giờ đã chọn để sửa.')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6, marginVertical: 8 },
  times: { gap: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeField: { flex: 1, minWidth: 0 },
  removeButton: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, backgroundColor: PrimaryColors.surface,
  },
});
