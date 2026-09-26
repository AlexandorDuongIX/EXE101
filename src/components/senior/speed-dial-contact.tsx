import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';
import { SeniorIcon } from '@/components/ui/senior-icons';
import { Colors, Rounded, Shadows } from '@/constants/theme';

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
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Gọi điện', `Vui lòng gọi đến số: ${phoneNumber}`);
    });
  };

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
        <Avatar source={avatarUri} initials={initials} size={48} ringColor={Colors.surfaceContainer} />
        <View style={styles.textSection}>
          <Text variant="labelMd" bold color={Colors.onSurface} numberOfLines={1}>
            {name}
          </Text>
          <Text
            variant="bodySm"
            color={isDoctor ? Colors.primaryContainer : Colors.onSurfaceVariant}
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
          color={isDoctor ? Colors.primaryContainer : '#FFFFFF'}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.default,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
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
    backgroundColor: '#059669',
  },
  callButtonDoctor: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
});
