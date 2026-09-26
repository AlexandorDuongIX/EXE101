import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './text';
import { Rounded } from '@/constants/theme';

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
  success: { bg: '#ecfdf5', text: '#065f46', dot: '#10b981' },
  warning: { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
  error: { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
  info: { bg: '#e0f2fe', text: '#0c4a6e', dot: '#0ea5e9' },
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
