import React from 'react';
import { TouchableOpacity, View, StyleSheet, TouchableOpacityProps } from 'react-native';
import { Text } from './text';
import { Colors, Rounded } from '@/constants/theme';

export interface ChipProps extends TouchableOpacityProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'amber' | 'teal' | 'outline';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  variant = 'default',
  style,
  ...props
}) => {
  const getColors = () => {
    if (selected) {
      switch (variant) {
        case 'amber':
          return {
            bg: Colors.secondaryContainer,
            text: Colors.onSecondary,
            border: Colors.secondaryContainer,
          };
        case 'teal':
        case 'default':
        default:
          return {
            bg: Colors.primaryContainer,
            text: Colors.onPrimary,
            border: Colors.primaryContainer,
          };
      }
    }

    if (variant === 'outline') {
      return {
        bg: 'transparent',
        text: Colors.onSurfaceVariant,
        border: Colors.outlineVariant,
      };
    }

    return {
      bg: Colors.surfaceContainerLow,
      text: Colors.onSurface,
      border: 'transparent',
    };
  };

  const colors = getColors();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.chipContainer,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text variant="bodyLg" semiBold color={colors.text}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Rounded.full,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginVertical: 4,
  },
  iconContainer: {
    marginRight: 6,
  },
});
