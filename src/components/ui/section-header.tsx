import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './text';
import { Colors } from '@/constants/theme';

export interface SectionHeaderProps {
  /** Main title */
  title: string;
  /** Optional description below title */
  subtitle?: string;
  /** Optional label on the right side */
  rightLabel?: string;
  /** Right label color override */
  rightLabelColor?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  rightLabel,
  rightLabelColor = Colors.primaryContainer,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text variant="labelLg" bold color={Colors.onSurface}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodySm" color={Colors.onSurfaceVariant} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightLabel && (
        <Text variant="bodySm" semiBold color={rightLabelColor}>
          {rightLabel}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  left: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
});
