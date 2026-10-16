import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppIcon, SeniorIcon, Text } from '@/views/components/ui';
import { AccountAvatar } from '@/views/components/account-avatar';
import { AppColors, OverlayColors, PrimaryColors, Rounded, StatusColors } from '@/views/styles/theme';

type HomeHeaderProps = {
  roleLabel: 'Cao tuổi' | 'Gia đình';
  initials?: string;
  onSOS?: () => void;
};

export function HomeHeader({ roleLabel, initials, onSOS }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logoBox}>
          <AppIcon size={28} />
        </View>
        <View>
          <View style={styles.brandRow}>
            <Text variant="labelLg" bold color={AppColors.primary} style={{ fontSize: 19 }}>
              KithCare
            </Text>
            <View style={styles.roleBadge}>
              <Text variant="bodySm" bold color={AppColors.action} style={{ fontSize: 11 }}>
                {roleLabel}
              </Text>
            </View>
          </View>
          <Text variant="bodySm" color={AppColors.textSecondary} style={{ fontSize: 12 }}>
            Chăm sóc & Kết nối
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={onSOS}
          disabled={!onSOS}
          style={styles.headerSOS}
          activeOpacity={0.85}
          accessibilityLabel="SOS Khẩn cấp"
          accessibilityState={{ disabled: !onSOS }}
        >
          <SeniorIcon name="sos" size={18} color={AppColors.onPrimary} />
          <Text variant="bodySm" bold color={AppColors.onPrimary} style={{ fontSize: 12 }}>
            SOS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellButton} activeOpacity={0.8} disabled accessibilityLabel="Thông báo" accessibilityState={{ disabled: true }}>
          <SeniorIcon name="bell" size={20} color={AppColors.text} />
        </TouchableOpacity>

        <AccountAvatar initials={initials} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: OverlayColors.header,
    borderBottomWidth: 1,
    borderBottomColor: OverlayColors.separator,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: PrimaryColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PrimaryColors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBadge: {
    backgroundColor: StatusColors.success.selected,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: StatusColors.success.border,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 8,
  },
  headerSOS: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: Rounded.full,
    backgroundColor: StatusColors.emergency.action,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.surfaceSelected,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});
