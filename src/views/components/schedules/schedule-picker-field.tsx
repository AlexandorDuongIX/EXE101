import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Keyboard, Platform } from 'react-native';

import { AppColors } from '@/views/styles/theme';

import { initialPickerDate, parseLocalDate, PickerFieldSurface, PickerSheet, serializePickerValue, type SchedulePickerFieldProps } from './schedule-picker-field.shared';

export type { SchedulePickerFieldProps } from './schedule-picker-field.shared';

export function SchedulePickerField(props: SchedulePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => initialPickerDate(props));
  const { mode, label, accessibilityLabel, onChange, minimumDate, maximumDate } = props;

  const openPicker = () => {
    if (props.disabled) return;
    Keyboard.dismiss();
    setDraft(initialPickerDate(props));
    setOpen(true);
  };

  const commit = (date: Date) => {
    setOpen(false);
    onChange(serializePickerValue(mode, date));
  };

  return (
    <>
      <PickerFieldSurface props={props} onOpen={openPicker} />
      {open && Platform.OS === 'android' && (
        <DateTimePicker
          mode={mode}
          value={draft}
          minimumDate={mode === 'date' ? parseLocalDate(minimumDate) : undefined}
          maximumDate={mode === 'date' ? parseLocalDate(maximumDate) : undefined}
          presentation="dialog"
          is24Hour
          accentColor={AppColors.action}
          positiveButton={{ label: mode === 'date' ? 'Xác nhận ngày' : 'Xác nhận giờ' }}
          negativeButton={{ label: 'Hủy' }}
          onValueChange={(_, selected) => commit(selected)}
          onDismiss={() => setOpen(false)}
        />
      )}
      {open && Platform.OS !== 'android' && (
        <PickerSheet mode={mode} title={label || accessibilityLabel} onCancel={() => setOpen(false)} onConfirm={() => commit(draft)}>
          <DateTimePicker
            value={draft}
            mode={mode}
            display="spinner"
            minimumDate={mode === 'date' ? parseLocalDate(minimumDate) : undefined}
            maximumDate={mode === 'date' ? parseLocalDate(maximumDate) : undefined}
            locale="vi_VN"
            themeVariant="light"
            accentColor={AppColors.action}
            onValueChange={(_, selected) => setDraft(selected)}
            style={{ width: '100%' }}
          />
        </PickerSheet>
      )}
    </>
  );
}
