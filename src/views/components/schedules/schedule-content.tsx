import { CalendarDays, Clock3, MapPin, Pencil, Pill, Plus, Stethoscope, Trash2 } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import type { CareSchedule, ScheduleKind } from '@/models/schedules/types';
import { Button, Card, Text } from '@/views/components/ui';
import { AppColors, PrimaryColors, Rounded } from '@/views/styles/theme';

export interface ScheduleContentProps {
  schedules: readonly CareSchedule[];
  selectedKind: ScheduleKind;
  onKindChange: (kind: ScheduleKind) => void;
  canManage: boolean;
  onAdd?: () => void;
  onEdit?: (schedule: CareSchedule) => void;
  onDelete?: (schedule: CareSchedule) => void;
  seniorMode?: boolean;
  canAdd?: boolean;
  emptyDescription?: string;
  recipientSelector?: ReactNode;
}

function displayDate(value: string) {
  const parts = value.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}

export function ScheduleContent({
  schedules,
  selectedKind,
  onKindChange,
  canManage,
  onAdd,
  onEdit,
  onDelete,
  seniorMode = false,
  canAdd = true,
  emptyDescription,
  recipientSelector,
}: ScheduleContentProps) {
  const isMedication = selectedKind === 'medication';
  const filteredSchedules = schedules.filter((schedule) => schedule.kind === selectedKind);
  const detailVariant = seniorMode ? 'bodyLg' : 'bodyMd';
  const Icon = isMedication ? Pill : CalendarDays;

  return (
    <View style={styles.content}>
      <View style={styles.pageHeading}>
        <Text variant={seniorMode ? 'headlineLg' : 'headlineMd'} bold accessibilityRole="header">
          {seniorMode ? 'Lịch của tôi' : 'Lịch chăm sóc'}
        </Text>
        <Text variant={seniorMode ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>
          {seniorMode ? 'Theo dõi giờ uống thuốc và các buổi khám.' : 'Thuốc và lịch khám của người thân, ở cùng một nơi.'}
        </Text>
      </View>
      {recipientSelector}
      <View style={styles.tabs} accessibilityRole="tablist">
        {([
          { kind: 'medication', label: 'Lịch thuốc', icon: Pill },
          { kind: 'appointment', label: 'Lịch khám', icon: CalendarDays },
        ] as const).map(({ kind, label, icon: TabIcon }) => {
          const selected = selectedKind === kind;
          return (
            <TouchableOpacity
              key={kind}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              aria-selected={selected}
              onPress={() => onKindChange(kind)}
              activeOpacity={0.75}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <TabIcon size={21} color={selected ? AppColors.action : AppColors.textSecondary} />
              <Text variant={seniorMode ? 'labelLg' : 'labelMd'} semiBold color={selected ? AppColors.primary : AppColors.textSecondary}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.flex}>
          <Text variant="headlineSm" semiBold accessibilityRole="header">
            {isMedication ? 'Lịch uống thuốc' : 'Lịch khám bệnh'}
          </Text>
          <Text variant={seniorMode ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>
            {canManage
              ? isMedication ? 'Quản lý thuốc và giờ uống của người thân.' : 'Sắp xếp các buổi khám của người thân.'
              : isMedication ? 'Thuốc và giờ uống gia đình đã sắp xếp.' : 'Các buổi khám gia đình đã sắp xếp.'}
          </Text>
        </View>
        {canManage && filteredSchedules.length > 0 && onAdd && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={isMedication ? 'Thêm lịch thuốc' : 'Thêm lịch khám'}
            accessibilityState={{ disabled: !canAdd }}
            disabled={!canAdd}
            onPress={onAdd}
            activeOpacity={0.75}
            style={[styles.addIcon, !canAdd && styles.disabled]}
          >
            <Plus size={24} color={AppColors.action} />
          </TouchableOpacity>
        )}
      </View>

      {filteredSchedules.length === 0 ? (
        <Card elevated={false} style={styles.emptyCard}>
          <View style={styles.emptyIcon} accessible={false}>
            <Icon size={36} strokeWidth={1.6} color={AppColors.action} />
          </View>
          <View style={styles.emptyCopy}>
            <Text variant={seniorMode ? 'headlineMd' : 'headlineSm'} semiBold align="center">
              {isMedication ? 'Chưa có lịch thuốc' : 'Chưa có lịch khám'}
            </Text>
            <Text variant={seniorMode ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary} align="center" style={styles.emptyDescription}>
              {emptyDescription ?? (canManage
                ? isMedication ? 'Thêm thuốc, liều lượng và giờ uống để người thân dễ theo dõi.' : 'Lưu ngày giờ và nơi khám để người thân dễ theo dõi.'
                : 'Lịch do gia đình tạo sẽ xuất hiện tại đây.')}
            </Text>
          </View>
          {canManage && onAdd && (
            <Button
              title={isMedication ? 'Thêm lịch thuốc' : 'Thêm lịch khám'}
              leftIcon={<Plus size={20} color={AppColors.onPrimary} />}
              onPress={onAdd}
              disabled={!canAdd}
              style={styles.emptyButton}
            />
          )}
        </Card>
      ) : (
        <View style={styles.scheduleList}>
          {filteredSchedules.map((schedule) => {
            const medication = schedule.kind === 'medication';
            const name = medication ? schedule.name : schedule.title;
            const label = medication ? 'lịch thuốc' : 'lịch khám';
            return (
              <Card key={schedule.id} elevated={false} style={styles.scheduleCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, !medication && styles.appointmentIcon]} accessible={false}>
                    {medication ? <Pill size={24} color={AppColors.action} /> : <CalendarDays size={24} color={AppColors.secondary} />}
                  </View>
                  <View style={styles.flex}>
                    <Text variant={seniorMode ? 'headlineMd' : 'headlineSm'} semiBold>{name}</Text>
                    <Text variant={detailVariant} color={AppColors.textSecondary}>
                      {medication ? `Liều dùng: ${schedule.dosage}` : displayDate(schedule.date)}
                    </Text>
                  </View>
                </View>

                {medication ? (
                  <>
                    <View style={styles.times}>
                      {schedule.times.map((time) => (
                        <View key={time} style={styles.timeChip}>
                          <Clock3 size={18} color={AppColors.action} />
                          <Text variant={seniorMode ? 'headlineSm' : 'labelLg'} semiBold color={AppColors.primary}>{time}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.detailRow}>
                      <CalendarDays size={19} color={AppColors.textSecondary} style={styles.detailIcon} />
                      <Text variant={detailVariant} color={AppColors.textSecondary} style={styles.flex}>
                        {displayDate(schedule.startDate)}{schedule.endDate ? ` – ${displayDate(schedule.endDate)}` : ' · Hằng ngày'}
                      </Text>
                    </View>
                    {!!schedule.instructions && (
                      <View style={styles.note}>
                        <Text variant={detailVariant} color={AppColors.text}>{schedule.instructions}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <View style={styles.appointmentTime}>
                      <Clock3 size={20} color={AppColors.action} />
                      <Text variant={seniorMode ? 'headlineMd' : 'headlineSm'} semiBold color={AppColors.primary}>{schedule.time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={20} color={AppColors.textSecondary} style={styles.detailIcon} />
                      <Text variant={detailVariant} style={styles.flex}>{schedule.facility}</Text>
                    </View>
                    {!!schedule.doctor && (
                      <View style={styles.detailRow}>
                        <Stethoscope size={20} color={AppColors.textSecondary} style={styles.detailIcon} />
                        <Text variant={detailVariant} color={AppColors.textSecondary} style={styles.flex}>{schedule.doctor}</Text>
                      </View>
                    )}
                    {!!schedule.notes && (
                      <View style={styles.note}>
                        <Text variant={detailVariant}>{schedule.notes}</Text>
                      </View>
                    )}
                  </>
                )}

                {canManage && (onEdit || onDelete) && (
                  <View style={styles.actions}>
                    {onEdit && (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Sửa ${label} ${name}`}
                        onPress={() => onEdit(schedule)}
                        activeOpacity={0.75}
                        style={styles.editAction}
                      >
                        <Pencil size={17} color={AppColors.action} />
                        <Text variant="labelMd" semiBold color={AppColors.action}>Chỉnh sửa</Text>
                      </TouchableOpacity>
                    )}
                    {onDelete && (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Xóa ${label} ${name}`}
                        onPress={() => onDelete(schedule)}
                        activeOpacity={0.75}
                        style={styles.deleteAction}
                      >
                        <Trash2 size={17} color={AppColors.error} />
                        <Text variant="labelMd" semiBold color={AppColors.error}>Xóa</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20 },
  pageHeading: { gap: 4 },
  flex: { flex: 1, minWidth: 0, gap: 4 },
  tabs: { flexDirection: 'row', gap: 6, padding: 5, backgroundColor: AppColors.surfaceMuted, borderRadius: Rounded.default },
  tab: { flex: 1, minHeight: 52, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tabSelected: { backgroundColor: AppColors.surface },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: PrimaryColors.surface },
  disabled: { opacity: 0.45 },
  emptyCard: { marginVertical: 0, paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center', gap: 20 },
  emptyIcon: { width: 80, height: 80, borderRadius: 28, backgroundColor: PrimaryColors.surface, alignItems: 'center', justifyContent: 'center' },
  emptyCopy: { gap: 8, alignItems: 'center' },
  emptyDescription: { maxWidth: 310 },
  emptyButton: { width: '100%', maxWidth: 300, paddingHorizontal: 12 },
  scheduleList: { gap: 14 },
  scheduleCard: { marginVertical: 0, padding: 20, gap: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: PrimaryColors.surface, alignItems: 'center', justifyContent: 'center' },
  appointmentIcon: { backgroundColor: AppColors.secondarySoft },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12, backgroundColor: PrimaryColors.surface },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailIcon: { marginTop: 3 },
  note: { backgroundColor: AppColors.surfaceMuted, borderRadius: 12, padding: 14 },
  appointmentTime: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, borderTopColor: PrimaryColors.borderSubtle, paddingTop: 12 },
  editAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: PrimaryColors.surface },
  deleteAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44, paddingHorizontal: 14, borderRadius: 12 },
});
