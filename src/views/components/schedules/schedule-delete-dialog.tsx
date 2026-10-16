import { Trash2 } from 'lucide-react-native';
import { Modal, StyleSheet, View } from 'react-native';

import type { CareSchedule } from '@/models/schedules/types';
import { Button, Text } from '@/views/components/ui';
import { AppColors, Rounded, Spacing } from '@/views/styles/theme';

type ScheduleDeleteDialogProps = {
  schedule: CareSchedule | null;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ScheduleDeleteDialog({ schedule, error, onCancel, onConfirm }: ScheduleDeleteDialogProps) {
  return (
    <Modal visible={!!schedule} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.icon}><Trash2 size={24} color={AppColors.error} /></View>
          <Text variant="headlineSm" semiBold accessibilityRole="header">
            Xóa {schedule?.kind === 'medication' ? 'lịch thuốc' : 'lịch khám'}?
          </Text>
          <Text color={AppColors.textSecondary}>
            {schedule?.kind === 'medication' ? schedule.name : schedule?.title} sẽ được xóa khỏi lịch của người thân.
          </Text>
          {!!error && <Text variant="bodySm" color={AppColors.error} accessibilityLiveRegion="polite">{error}</Text>}
          <View style={styles.actions}>
            <Button title="Hủy" variant="secondary" titleColor={AppColors.textSecondary} accessibilityLabel="Hủy xóa lịch" style={styles.cancelButton} onPress={onCancel} />
            <Button title="Xóa lịch" accessibilityLabel="Xác nhận xóa lịch" style={styles.deleteButton} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four, backgroundColor: 'rgba(17,28,45,0.4)' },
  dialog: { width: '100%', maxWidth: 400, borderRadius: Rounded.md, backgroundColor: AppColors.surface, padding: Spacing.four, gap: Spacing.three },
  icon: { width: 48, height: 48, borderRadius: Rounded.default, backgroundColor: AppColors.errorSurface, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: Spacing.spaceSm, paddingTop: Spacing.two },
  cancelButton: { flex: 1, minHeight: 48, paddingHorizontal: Spacing.spaceSm, borderColor: AppColors.border },
  deleteButton: { flex: 1, minHeight: 48, paddingHorizontal: Spacing.spaceSm, backgroundColor: AppColors.error },
});
