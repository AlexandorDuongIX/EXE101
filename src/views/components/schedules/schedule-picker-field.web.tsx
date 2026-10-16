import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/views/components/ui';
import { AppColors, PrimaryColors, Rounded } from '@/views/styles/theme';

import { displayPickerValue, initialPickerDate, parseLocalDate, PickerFieldSurface, PickerSheet, serializePickerValue, type SchedulePickerFieldProps } from './schedule-picker-field.shared';

export type { SchedulePickerFieldProps } from './schedule-picker-field.shared';

const pad = (value: number) => String(value).padStart(2, '0');
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function TimeColumn({ unit, value, count, onChange }: { unit: 'Giờ' | 'Phút'; value: number; count: number; onChange: (value: number) => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const initialValue = useRef(value);
  return (
    <View style={styles.timeColumn}>
      <Text variant="labelMd" semiBold align="center" color={AppColors.textSecondary}>{unit}</Text>
      <ScrollView
        ref={scrollRef}
        style={styles.timeScroll}
        contentContainerStyle={styles.timeOptions}
        nestedScrollEnabled
        showsVerticalScrollIndicator
        accessibilityLabel={`Chọn ${unit.toLowerCase()}`}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollTo({ y: Math.max(initialValue.current - 2, 0) * 44, animated: false })}
      >
        {Array.from({ length: count }, (_, option) => {
          const selected = option === value;
          return (
            <TouchableOpacity
              key={option}
              accessibilityRole="radio"
              accessibilityLabel={`${unit} ${pad(option)}`}
              accessibilityState={{ checked: selected, selected }}
              aria-checked={selected}
              onPress={() => onChange(option)}
              activeOpacity={0.75}
              style={[styles.timeOption, selected && styles.selectedTimeOption]}
            >
              <Text variant="headlineSm" semiBold={selected} color={selected ? AppColors.primary : AppColors.textSecondary} align="center">{pad(option)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function SchedulePickerField(props: SchedulePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => initialPickerDate(props));
  const [month, setMonth] = useState(() => new Date(draft.getFullYear(), draft.getMonth(), 1, 12));
  const { mode, label, accessibilityLabel, onChange, minimumDate, maximumDate } = props;
  const draftValue = serializePickerValue(mode, draft);
  const minimum = parseLocalDate(minimumDate);
  const maximum = parseLocalDate(maximumDate);

  const allowedDate = (date: Date) => (!minimum || date >= minimum) && (!maximum || date <= maximum);
  const openPicker = () => {
    if (props.disabled) return;
    Keyboard.dismiss();
    const initial = initialPickerDate(props);
    setDraft(initial);
    setMonth(new Date(initial.getFullYear(), initial.getMonth(), 1, 12));
    setOpen(true);
  };
  const confirm = () => {
    onChange(draftValue);
    setOpen(false);
  };
  const offset = (month.getDay() + 6) % 7;
  const monthLength = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Math.ceil((offset + monthLength) / 7) * 7;
  const previousMonthEnd = new Date(month.getFullYear(), month.getMonth(), 0, 12);
  const nextMonthStart = new Date(month.getFullYear(), month.getMonth() + 1, 1, 12);
  const canPrevious = !minimum || previousMonthEnd >= minimum;
  const canNext = !maximum || nextMonthStart <= maximum;
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return (
    <>
      <PickerFieldSurface props={props} onOpen={openPicker} />
      {open && (
        <PickerSheet mode={mode} title={label || accessibilityLabel} onCancel={() => setOpen(false)} onConfirm={confirm} confirmDisabled={mode === 'date' && !allowedDate(draft)}>
          {mode === 'date' ? (
            <>
              <View style={styles.monthHeader}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tháng trước" accessibilityState={{ disabled: !canPrevious }} disabled={!canPrevious} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1, 12))} style={[styles.monthButton, !canPrevious && styles.disabled]}>
                  <ChevronLeft size={23} color={AppColors.action} />
                </TouchableOpacity>
                <Text variant="labelLg" semiBold accessibilityRole="header" align="center" style={styles.monthHeading}>Tháng {month.getMonth() + 1}, {month.getFullYear()}</Text>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tháng sau" accessibilityState={{ disabled: !canNext }} disabled={!canNext} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1, 12))} style={[styles.monthButton, !canNext && styles.disabled]}>
                  <ChevronRight size={23} color={AppColors.action} />
                </TouchableOpacity>
              </View>
              <View style={styles.calendar}>
                {WEEKDAYS.map((day) => <View key={day} style={styles.weekday}><Text variant="bodySm" color={AppColors.textSecondary} align="center">{day}</Text></View>)}
                {Array.from({ length: cells }, (_, index) => {
                  const day = index - offset + 1;
                  if (day < 1 || day > monthLength) return <View key={index} style={styles.dayCell} />;
                  const date = new Date(month.getFullYear(), month.getMonth(), day, 12);
                  const value = serializePickerValue('date', date);
                  const selected = value === draftValue;
                  const allowed = allowedDate(date);
                  const isToday = value === serializePickerValue('date', today);
                  return (
                    <View key={index} style={styles.dayCell}>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Chọn ngày ${displayPickerValue('date', value)}`}
                        accessibilityState={{ selected, disabled: !allowed }}
                        aria-selected={selected}
                        aria-pressed={selected}
                        aria-disabled={!allowed}
                        disabled={!allowed}
                        onPress={() => setDraft(date)}
                        activeOpacity={0.75}
                        style={[styles.dayButton, isToday && styles.todayOutline, selected && styles.selectedDay, !allowed && styles.disabled]}
                      >
                        <Text variant="bodyMd" semiBold={selected || isToday} color={selected ? AppColors.onPrimary : isToday ? AppColors.action : AppColors.text} align="center">{day}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Hôm nay" accessibilityState={{ disabled: !allowedDate(today) }} disabled={!allowedDate(today)} onPress={() => { setDraft(today); setMonth(new Date(today.getFullYear(), today.getMonth(), 1, 12)); }} style={[styles.todayButton, !allowedDate(today) && styles.disabled]}>
                <Text variant="labelMd" semiBold color={AppColors.action}>Hôm nay</Text>
              </TouchableOpacity>
              <Text variant="bodyMd" color={AppColors.primary} semiBold align="center" accessibilityLiveRegion="polite">Đã chọn {displayPickerValue('date', draftValue)}</Text>
            </>
          ) : (
            <>
              <Text variant="headlineLg" bold color={AppColors.primary} align="center" accessibilityLiveRegion="polite">{draftValue}</Text>
              <View style={styles.timeColumns}>
                <TimeColumn unit="Giờ" value={draft.getHours()} count={24} onChange={(hours) => { const next = new Date(draft); next.setHours(hours); setDraft(next); }} />
                <Text variant="headlineMd" color={AppColors.textSecondary} style={styles.timeSeparator}>:</Text>
                <TimeColumn unit="Phút" value={draft.getMinutes()} count={60} onChange={(minutes) => { const next = new Date(draft); next.setMinutes(minutes); setDraft(next); }} />
              </View>
              <Text variant="bodySm" color={AppColors.textSecondary} align="center">Cuộn để chọn giờ và phút · Định dạng 24 giờ</Text>
            </>
          )}
        </PickerSheet>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  monthHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  monthButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: PrimaryColors.surface, alignItems: 'center', justifyContent: 'center' },
  monthHeading: { flex: 1, minWidth: 0 },
  calendar: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, height: 28, alignItems: 'center', justifyContent: 'center' },
  dayCell: { width: `${100 / 7}%`, height: 44, alignItems: 'stretch', justifyContent: 'center', paddingHorizontal: 1 },
  dayButton: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  todayOutline: { borderColor: PrimaryColors.borderStrong },
  selectedDay: { backgroundColor: AppColors.action, borderColor: AppColors.action },
  disabled: { opacity: 0.35 },
  todayButton: { alignSelf: 'center', minHeight: 44, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: PrimaryColors.surface, borderRadius: Rounded.full },
  timeColumns: { flexDirection: 'row', alignItems: 'center', gap: 12, maxWidth: 300, width: '100%', alignSelf: 'center' },
  timeColumn: { flex: 1, minWidth: 0, gap: 8 },
  timeScroll: { height: 220, maxHeight: 220, backgroundColor: AppColors.background, borderRadius: 16, borderWidth: 1, borderColor: PrimaryColors.border },
  timeOptions: { paddingHorizontal: 4 },
  timeOption: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  selectedTimeOption: { backgroundColor: PrimaryColors.border },
  timeSeparator: { marginTop: 26 },
});
