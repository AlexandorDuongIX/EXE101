import { Users } from 'lucide-react-native';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScheduleManagerController } from '@/controllers/schedules/use-schedule-manager-controller';
import { useBottomNavigationScroll } from '@/views/components/navigation/bottom-navigation-visibility';
import { ScheduleContent, ScheduleFormModal } from '@/views/components/schedules';
import { ScheduleDeleteDialog } from '@/views/components/schedules/schedule-delete-dialog';
import { Avatar, Button, Card, Text } from '@/views/components/ui';
import { AppColors, PrimaryColors, Rounded, Spacing } from '@/views/styles/theme';

export default function FamilySchedulesScreen() {
  const controller = useScheduleManagerController();
  const insets = useSafeAreaInsets();
  const navigationScroll = useBottomNavigationScroll();
  const recipientSelector = (
    <View style={styles.recipientSection}>
      <Text variant="labelSm" semiBold color={AppColors.textSecondary}>Lịch của người thân</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipientList}>
        {controller.profiles.map((profile) => {
          const selected = controller.selectedSenior?.id === profile.id;
          return (
            <TouchableOpacity
              key={profile.id}
              accessibilityRole="radio"
              accessibilityLabel={`Lịch của ${profile.fullName}`}
              accessibilityState={{ checked: selected }}
              aria-checked={selected}
              style={[styles.recipient, selected && styles.recipientSelected]}
              activeOpacity={0.8}
              onPress={() => controller.setSelectedId(profile.id)}
            >
              <Avatar source={profile.avatarUri} size={32} ringColor={selected ? PrimaryColors.ring : AppColors.surfaceMuted} />
              <Text variant="labelSm" semiBold numberOfLines={1} style={styles.recipientName} color={selected ? AppColors.primary : AppColors.textSecondary}>
                {profile.fullName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <>
      <ScrollView
        {...navigationScroll}
        testID="family-schedules-scroll"
        style={styles.screen}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {controller.profiles.length ? (
            <ScheduleContent
              schedules={controller.schedules}
              selectedKind={controller.selectedKind}
              onKindChange={controller.setSelectedKind}
              canManage
              onAdd={controller.openAdd}
              onEdit={controller.openEdit}
              onDelete={controller.requestDelete}
              recipientSelector={recipientSelector}
            />
          ) : (
            <View style={styles.noProfiles}>
              <View style={styles.heading}>
                <Text variant="headlineMd" bold accessibilityRole="header">Lịch chăm sóc</Text>
                <Text variant="bodySm" color={AppColors.textSecondary}>Thuốc và lịch khám của người thân, ở cùng một nơi.</Text>
              </View>
              <Card elevated={false} style={styles.emptyCard}>
                <View style={styles.emptyIcon}><Users size={36} color={AppColors.action} /></View>
                <Text variant="headlineSm" semiBold align="center">Thêm người thân trước</Text>
                <Text color={AppColors.textSecondary} align="center">Tạo hồ sơ người thân để bắt đầu quản lý lịch thuốc và lịch khám.</Text>
                <Button title="Thêm người thân" onPress={controller.openRelatives} style={styles.emptyButton} />
              </Card>
            </View>
          )}
        </View>
      </ScrollView>

      <ScheduleFormModal
        visible={!!controller.editor}
        kind={controller.editor?.kind ?? controller.selectedKind}
        editing={!!controller.editor?.id}
        recipientName={controller.profiles.find((profile) => profile.id === controller.editor?.seniorId)?.fullName}
        values={controller.values}
        fieldErrors={controller.fieldErrors}
        submitError={controller.submitError}
        onChange={controller.changeField}
        onSave={controller.save}
        onClose={controller.closeEditor}
      />
      <ScheduleDeleteDialog schedule={controller.pendingDelete} error={controller.deleteError} onCancel={controller.cancelDelete} onConfirm={controller.confirmDelete} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.gutter, paddingTop: Spacing.four },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center' },
  heading: { gap: Spacing.one },
  recipientSection: { gap: Spacing.two },
  recipientList: { gap: Spacing.two, paddingVertical: Spacing.one },
  recipient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: 10, minHeight: 56, borderRadius: Rounded.default, borderWidth: 1, borderColor: PrimaryColors.borderSubtle, backgroundColor: AppColors.surface },
  recipientSelected: { backgroundColor: PrimaryColors.surface, borderColor: PrimaryColors.borderStrong },
  recipientName: { maxWidth: 170 },
  noProfiles: { gap: Spacing.four },
  emptyCard: { marginVertical: 0, paddingVertical: Spacing.five, alignItems: 'center', gap: Spacing.spaceMd },
  emptyIcon: { width: 80, height: 80, borderRadius: Rounded.md, backgroundColor: PrimaryColors.surface, alignItems: 'center', justifyContent: 'center' },
  emptyButton: { width: '100%', maxWidth: 280, paddingHorizontal: Spacing.three },
});
