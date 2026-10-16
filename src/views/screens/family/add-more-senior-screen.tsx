import { CalendarDays, CheckCircle2, Heart, HeartPulse, Link2, Plus, ShieldAlert, Users } from 'lucide-react-native';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAddMoreSeniorController } from '@/controllers/family/use-add-more-senior-controller';
import { useBottomNavigationScroll } from '@/views/components/navigation/bottom-navigation-visibility';
import { Avatar, Button, Card, Text } from '@/views/components/ui';
import { SeniorLinkCodeModal } from '@/views/components/senior/senior-link-code-modal';
import { AppColors, PrimaryColors, Rounded, Spacing } from '@/views/styles/theme';

export default function AddMoreSeniorScreen() {
  const controller = useAddMoreSeniorController();
  const { profileCards, showCreatedNotice, openCreateSenior } = controller;
  const insets = useSafeAreaInsets();
  const navigationScroll = useBottomNavigationScroll();
  const palette = AppColors;

  return (
    <>
      <ScrollView
        {...navigationScroll}
        testID="family-relatives-scroll"
        style={styles.screen}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="headlineMd" bold color={palette.text} accessibilityRole="header">
              Người thân
            </Text>
            <Text variant="bodySm" color={palette.textSecondary}>
              Cùng chăm sóc những người bạn yêu thương.
            </Text>
          </View>

          {showCreatedNotice && (
            <View
              style={styles.createdNotice}
              accessibilityLiveRegion="polite"
            >
              <CheckCircle2 size={18} color={palette.action} />
              <Text variant="bodySm" semiBold color={palette.primary} style={styles.flexText}>
                Đã tạo hồ sơ người thân
              </Text>
            </View>
          )}

          {profileCards.length === 0 ? (
            <Card elevated={false} style={styles.emptyCard}>
              <View style={styles.emptyIcon} accessible={false}>
                <Users size={38} strokeWidth={1.7} color={palette.action} />
                <View style={styles.heartBadge}>
                  <Heart size={15} color={palette.action} fill={palette.action} />
                </View>
              </View>
              <View style={styles.emptyCopy}>
                <Text variant="headlineSm" semiBold color={palette.text} align="center">
                  Chưa có người thân
                </Text>
                <Text variant="bodySm" color={palette.textSecondary} align="center" style={styles.emptyDescription}>
                  Thêm hồ sơ để việc chăm sóc mỗi ngày dễ dàng hơn.
                </Text>
              </View>
              <Button
                title="Thêm người thân"
                accessibilityLabel="Thêm hồ sơ người thân"
                leftIcon={<Plus size={20} color={palette.onPrimary} />}
                style={styles.emptyButton}
                onPress={openCreateSenior}
              />
            </Card>
          ) : (
            <View style={styles.listHeader}>
              <Text variant="bodySm" semiBold color={palette.textSecondary} style={styles.flexText}>
                {profileCards.length} hồ sơ người thân
              </Text>
              <Button
                title="Thêm"
                variant="secondarySoft"
                titleColor={palette.action}
                accessibilityLabel="Thêm hồ sơ người thân"
                leftIcon={<Plus size={18} color={palette.action} />}
                style={styles.addButton}
                onPress={openCreateSenior}
              />
            </View>
          )}

          {profileCards.map((profile) => (
            <TouchableOpacity key={profile.id} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Mã liên kết ${profile.fullName}`} onPress={() => controller.openLinkCode(profile)}>
              <Card
                elevated={false}
                style={styles.profileCard}
              >
                <View style={styles.profileHeader}>
                  <Avatar
                    source={profile.avatarUri}
                    size={64}
                    ringColor={palette.border}
                    fallbackBg={palette.surfaceSelected}
                    fallbackIconColor={palette.primary}
                  />
                  <View style={styles.flexText}>
                    <Text variant="headlineSm" semiBold color={palette.text}>{profile.fullName}</Text>
                    <Text color={palette.textSecondary}>{profile.relationshipLabel} của bạn</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <CalendarDays size={20} color={palette.textSecondary} />
                  <Text color={palette.text}>Sinh năm {profile.birthYear}</Text>
                </View>
                <View style={styles.detailRow}>
                  <HeartPulse size={20} color={palette.primary} />
                  <Text color={palette.text} style={styles.flexText}>
                    {profile.conditionsLabel}
                  </Text>
                </View>
                {!!profile.medicalNotes && (
                  <View style={[styles.notes, { backgroundColor: palette.surfaceMuted }]}>
                    <Text variant="labelSm" semiBold color={palette.text}>Lưu ý khi chăm sóc</Text>
                    <Text color={palette.textSecondary}>{profile.medicalNotes}</Text>
                  </View>
                )}
                {profile.isPrimarySosContact && (
                  <View style={styles.sosNote}>
                    <ShieldAlert size={18} color={palette.primary} />
                    <View style={styles.flexText}>
                      <Text variant="labelSm" semiBold color={palette.text}>Ưu tiên SOS</Text>
                      <Text variant="bodySm" color={palette.textSecondary}>
                        Chưa thiết lập liên hệ khẩn cấp.
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.linkAction}>
                  <Link2 size={18} color={palette.action} />
                  <Text variant="labelSm" semiBold color={palette.action}>{profile.isLinked ? 'Đã liên kết tài khoản' : 'Liên kết tài khoản senior'}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <SeniorLinkCodeModal name={controller.linkProfile?.fullName} code={controller.linkCode} linked={controller.linked} error={controller.linkError} onClose={controller.closeLinkCode} onRegenerate={controller.regenerateCode} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.gutter, paddingTop: Spacing.four },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: Spacing.four },
  header: { gap: Spacing.one },
  createdNotice: { backgroundColor: PrimaryColors.surface, borderRadius: Rounded.default, padding: Spacing.spaceSm, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flexText: { flex: 1, minWidth: 0 },
  emptyCard: { alignItems: 'center', gap: Spacing.four, paddingHorizontal: Spacing.four, paddingVertical: Spacing.five, marginVertical: 0, borderColor: PrimaryColors.borderSubtle, borderRadius: Rounded.md },
  emptyIcon: { width: 88, height: 88, borderRadius: Rounded.full, backgroundColor: PrimaryColors.surface, alignItems: 'center', justifyContent: 'center' },
  heartBadge: { position: 'absolute', right: 0, bottom: 2, width: 28, height: 28, borderRadius: Rounded.full, backgroundColor: PrimaryColors.border, borderWidth: 3, borderColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' },
  emptyCopy: { alignItems: 'center', gap: Spacing.two },
  emptyDescription: { maxWidth: 260 },
  emptyButton: { width: '100%', maxWidth: 280, paddingHorizontal: Spacing.three },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.spaceSm },
  addButton: { minHeight: 44, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, backgroundColor: PrimaryColors.surface },
  profileCard: { backgroundColor: AppColors.surface, borderColor: PrimaryColors.borderSubtle, marginVertical: 0, gap: Spacing.spaceSm, padding: Spacing.four },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.spaceSm },
  notes: { padding: Spacing.three, borderRadius: Rounded.default, gap: Spacing.two },
  sosNote: { borderRadius: Rounded.default, padding: Spacing.spaceSm, backgroundColor: PrimaryColors.surface, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  linkAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderTopWidth: 1, borderTopColor: PrimaryColors.borderSubtle, paddingTop: Spacing.spaceSm, minHeight: 44 },
});
