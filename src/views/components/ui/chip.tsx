import React from 'react';
import { TouchableOpacity, View, StyleSheet, TouchableOpacityProps } from 'react-native';
import { Text } from './text';
import { AppColors, Colors, Rounded } from '@/views/styles/theme';

export interface ChipProps extends TouchableOpacityProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'amber' | 'teal' | 'outline';
  textColor?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  variant = 'default',
  textColor,
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
            bg: AppColors.action,
            text: AppColors.onPrimary,
            border: AppColors.action,
          };
      }
    }

    if (variant === 'outline') {
      return {
        bg: 'transparent',
        text: AppColors.textSecondary,
        border: AppColors.border,
      };
    }

    return {
      bg: AppColors.surfaceMuted,
      text: AppColors.text,
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
      <Text variant="bodyLg" semiBold color={textColor ?? colors.text}>
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
