import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { SeniorIcon } from '@/components/ui/senior-icons';
import { Colors, Rounded, Shadows, Spacing } from '@/constants/theme';

export interface SosEmergencyCardProps extends Omit<TouchableOpacityProps, 'children'> {
  /** Name of primary family contact (e.g. "Con Hoàng") */
  primaryContactName?: string;
  /** Emergency service label (e.g. "Cứu thương 115") */
  emergencyLabel?: string;
  /** Called when the SOS card is pressed */
  onPress?: () => void;
}

export const SosEmergencyCard: React.FC<SosEmergencyCardProps> = ({
  primaryContactName = 'Con Hoàng',
  emergencyLabel = 'Cứu thương 115',
  onPress,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, Shadows.sosGlow, style]}
      accessibilityLabel="Bấm gọi khẩn cấp cho người thân và cứu hộ"
      accessibilityRole="button"
      {...props}
    >
      {/* Decorative background glow */}
      <View style={styles.glowDecor} />

      <View style={styles.content}>
        <View style={styles.leftSection}>
          {/* Icon Container */}
          <View style={styles.iconBox}>
            <SeniorIcon name="emergency" size={32} color="#FFFFFF" filled />
          </View>

          {/* Text Content */}
          <View style={styles.textSection}>
            <View style={styles.titleRow}>
              <Text
                variant="labelLg"
                bold
                color="#FFFFFF"
                style={styles.titleText}
              >
                GỌI KHẨN CẤP
              </Text>
              <View style={styles.sosBadge}>
                <Text variant="bodySm" bold color="#FFFFFF" style={styles.sosBadgeText}>
                  SOS
                </Text>
              </View>
            </View>
            <Text variant="bodySm" color="rgba(255,255,255,0.9)" style={styles.subtitle}>
              Chạm gọi ngay {primaryContactName} hoặc {emergencyLabel}
            </Text>
          </View>
        </View>

        {/* Call Icon */}
        <View style={styles.callButton}>
          <SeniorIcon name="phone" size={24} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DC2626',
    borderRadius: Rounded.md,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  glowDecor: {
    position: 'absolute',
    right: -16,
    bottom: -24,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: Rounded.default,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    letterSpacing: 0.5,
  },
  sosBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Rounded.full,
  },
  sosBadgeText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 20,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
