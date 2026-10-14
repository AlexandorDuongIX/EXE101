import { Redirect } from 'expo-router';
import { CalendarDays, CheckCircle2, HeartPulse, LogOut, Plus, ShieldAlert, Users } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Text } from '@/views/components/ui';
import { MaxContentWidth, Rounded, Spacing } from '@/views/styles/theme';
import { useFamilyHomeController } from '@/controllers/family/use-family-home-controller';
import { AppColors } from '@/views/styles/colors';

export default function FamilyHomeScreen() {
  const { redirectHref, profileCards, showCreatedNotice, handleLogout, openCreateSenior } = useFamilyHomeController();
  const palette = AppColors;

  if (redirectHref) {
    return <Redirect href={redirectHref} />;
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Users size={28} color={palette.primary} />
              <Text variant="headlineMd" bold color={palette.text}>Người thân của bạn</Text>
            </View>
            <Button
              title="Đăng xuất"
              variant="secondary"
              titleColor={palette.textSecondary}
              leftIcon={<LogOut size={18} color={palette.textSecondary} />}
              style={[styles.logoutButton, { borderColor: palette.border }]}
              onPress={handleLogout}
              accessibilityLabel="Đăng xuất tài khoản Con cái"
            />
          </View>

          <Text color={palette.textSecondary}>
            Quản lý hồ sơ cha mẹ, ông bà và người thân được bạn chăm sóc.
          </Text>

          {showCreatedNotice && (
            <View
              style={[styles.notice, { backgroundColor: palette.surfaceSelected }]}
              accessibilityLiveRegion="polite"
            >
              <CheckCircle2 size={22} color={palette.primary} />
              <Text semiBold color={palette.text} style={styles.flexText}>
                Đã tạo hồ sơ người thân
              </Text>
            </View>
          )}

          <View style={[styles.notice, { backgroundColor: palette.surfaceMuted }]}>
            <Text variant="bodySm" color={palette.textSecondary}>
              Đây là dữ liệu demo trong phiên. Hồ sơ và ảnh được giữ trong bộ nhớ,
              sẽ mất khi tải lại trang hoặc mở lại ứng dụng. Hãy dùng thông tin giả để thử.
            </Text>
          </View>

          <Button
            title="Thêm hồ sơ người thân"
            titleColor={palette.onPrimary}
            leftIcon={<Plus size={22} color={palette.onPrimary} />}
            style={{ backgroundColor: palette.action }}
            onPress={openCreateSenior}
          />

          <Text variant="labelMd" semiBold color={palette.text} style={styles.count}>
            {profileCards.length} hồ sơ người thân
          </Text>

          {profileCards.length === 0 && (
            <Card style={[styles.emptyCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Users size={40} color={palette.primary} />
              <Text variant="headlineSm" semiBold color={palette.text}>Chưa có hồ sơ người thân</Text>
              <Text color={palette.textSecondary} align="center">
                Thêm hồ sơ để ghi lại những thông tin cần thiết khi chăm sóc.
              </Text>
            </Card>
          )}

          {profileCards.map((profile) => (
              <Card
                key={profile.id}
                style={[styles.profileCard, { backgroundColor: palette.surface, borderColor: palette.border }]}
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
                  <View style={[styles.notice, { backgroundColor: palette.surfaceSelected }]}>
                    <ShieldAlert size={22} color={palette.primary} />
                    <View style={styles.flexText}>
                      <Text semiBold color={palette.text}>Đã đánh dấu SOS chính cho demo</Text>
                      <Text variant="bodySm" color={palette.textSecondary}>
                        Chưa cấu hình người nhận cuộc gọi hoặc thông báo SOS. Lựa chọn này không gửi cảnh báo.
                      </Text>
                    </View>
                  </View>
                )}
              </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: Spacing.gutter, paddingBottom: Spacing.spaceXl },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.spaceMd },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.spaceSm },
  headerTitle: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.two },
  logoutButton: { minHeight: 44, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  notice: { borderRadius: Rounded.default, padding: Spacing.three, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.spaceSm },
  flexText: { flex: 1, minWidth: 0 },
  count: { marginTop: Spacing.two },
  emptyCard: { alignItems: 'center', gap: Spacing.spaceSm, padding: Spacing.five },
  profileCard: { gap: Spacing.spaceSm, borderWidth: 1, padding: Spacing.four },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.spaceSm },
  notes: { padding: Spacing.three, borderRadius: Rounded.default, gap: Spacing.two },
});
