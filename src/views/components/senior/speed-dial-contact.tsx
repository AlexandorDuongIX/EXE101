import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Text } from '@/views/components/ui/text';
import { Avatar } from '@/views/components/ui/avatar';
import { SeniorIcon } from '@/views/components/ui/senior-icons';
import { AppColors, PrimaryColors, StatusColors, Rounded, Shadows } from '@/views/styles/theme';
import { useSpeedDialController } from '@/controllers/seniors/use-speed-dial-controller';

export interface SpeedDialContactProps {
  /** Display name, e.g. "Con Trai (Hoàng)" */
  name: string;
  /** Subtitle, e.g. "Số thường gọi nhất" */
  subtitle: string;
  /** Avatar image URI */
  avatarUri?: string;
  /** Initials for the avatar */
  initials?: string;
  /** Phone number to call */
  phoneNumber: string;
  /** Visual variant changes the call button color */
  variant?: 'family' | 'doctor';
  /** Optional override for onPress (defaults to Linking.openURL) */
  onPress?: () => void;
}

export const SpeedDialContact: React.FC<SpeedDialContactProps> = ({
  name,
  subtitle,
  avatarUri,
  initials,
  phoneNumber,
  variant = 'family',
  onPress,
}) => {
  const { handlePress } = useSpeedDialController(phoneNumber, onPress);

  const isDoctor = variant === 'doctor';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.container, Shadows.layer1]}
      accessibilityLabel={`Gọi cho ${name}`}
      accessibilityRole="button"
    >
      <View style={styles.leftSection}>
        <Avatar source={avatarUri} initials={initials} size={48} ringColor={AppColors.surfaceSelected} />
        <View style={styles.textSection}>
          <Text variant="labelMd" bold color={AppColors.text} numberOfLines={1}>
            {name}
          </Text>
          <Text
            variant="bodySm"
            color={isDoctor ? AppColors.action : AppColors.textSecondary}
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.callButton,
          isDoctor ? styles.callButtonDoctor : styles.callButtonFamily,
        ]}
      >
        <SeniorIcon
          name={isDoctor ? 'support' : 'phone'}
          size={22}
          color={isDoctor ? AppColors.action : AppColors.onPrimary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface,
    borderRadius: Rounded.default,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.surfaceSelected,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  textSection: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  callButtonFamily: {
    backgroundColor: StatusColors.success.action,
  },
  callButtonDoctor: {
    backgroundColor: PrimaryColors.surface,
    borderWidth: 1,
    borderColor: PrimaryColors.borderStrong,
  },
});
