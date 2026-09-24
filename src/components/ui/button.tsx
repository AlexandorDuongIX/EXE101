import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Text } from './text';
import { Colors, Rounded, Shadows } from '@/constants/theme';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'secondarySoft' | 'sos';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  subTitle?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  subTitle,
  style,
  ...props
}) => {
  if (variant === 'sos') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled || loading}
        style={[styles.sosButton, Shadows.sosGlow, disabled && styles.disabled, style]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={Colors.onError} />
        ) : (
          <View style={styles.sosContent}>
            {leftIcon}
            <Text variant="labelLg" bold color={Colors.onError} align="center">
              {title}
            </Text>
            {subTitle && (
              <Text variant="bodySm" color={Colors.onError} align="center">
                {subTitle}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'secondarySoft':
        return styles.secondarySoftContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return Colors.secondary;
      case 'secondarySoft':
        return '#C2410C';
      case 'primary':
      default:
        return Colors.onPrimary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.baseContainer,
        getContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.innerContent}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text variant="labelLg" bold color={getTextColor()} align="center">
            {title}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    minHeight: 56,
    borderRadius: Rounded.full,
    paddingHorizontal: 24,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryContainer: {
    backgroundColor: Colors.primaryContainer, // Deep Warm Teal #0F766E
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.secondaryContainer,
  },
  secondarySoftContainer: {
    backgroundColor: '#FFF7ED',
  },
  sosButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.sosEmergency, // Crimson Alert #EF4444
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  sosContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
