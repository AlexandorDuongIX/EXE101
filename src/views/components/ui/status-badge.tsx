import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './text';
import { StatusColors, Rounded } from '@/views/styles/theme';

export type BadgeStatus = 'success' | 'warning' | 'error' | 'info';

export interface StatusBadgeProps {
  /** Display label */
  label: string;
  /** Semantic status color */
  status?: BadgeStatus;
  /** Size variant */
  size?: 'sm' | 'md';
}

const statusColors: Record<BadgeStatus, { bg: string; text: string; dot: string }> = {
  success: { bg: StatusColors.success.surface, text: StatusColors.success.text, dot: StatusColors.success.accent },
  warning: { bg: StatusColors.warning.surface, text: StatusColors.warning.text, dot: StatusColors.warning.accent },
  error: { bg: StatusColors.error.surface, text: StatusColors.error.text, dot: StatusColors.error.accent },
  info: { bg: StatusColors.info.surface, text: StatusColors.info.text, dot: StatusColors.info.accent },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  status = 'success',
  size = 'sm',
}) => {
  const colors = statusColors[status];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg },
        size === 'md' && styles.containerMd,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: colors.dot }]} />
      <Text
        variant="bodySm"
        bold
        color={colors.text}
        style={size === 'sm' ? { fontSize: 11 } : { fontSize: 13 }}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.full,
    gap: 5,
  },
  containerMd: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
