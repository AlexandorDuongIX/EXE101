import React from 'react';
import { TouchableOpacity, View, StyleSheet, TouchableOpacityProps, StyleProp, TextStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from './text';
import { AppColors, Colors, Rounded } from '@/views/styles/theme';

export interface CheckboxProps extends TouchableOpacityProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  labelColor?: string;
  checkColor?: string;
  boxColor?: string;
  borderColor?: string;
  labelStyle?: StyleProp<TextStyle>;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  disabled = false,
  labelColor = AppColors.text,
  checkColor = AppColors.onPrimary,
  boxColor,
  borderColor,
  labelStyle,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      aria-checked={checked}
      aria-disabled={disabled}
      onPress={() => onToggle(!checked)}
      style={[styles.container, disabled && styles.disabled, style]}
      {...props}
    >
      <View
        style={[
          styles.checkboxBox,
          checked ? styles.checkedBox : styles.uncheckedBox,
          boxColor !== undefined && { backgroundColor: boxColor },
          borderColor !== undefined && { borderColor },
        ]}
      >
        {checked && (
          <Check size={20} color={checkColor} strokeWidth={3} />
        )}
      </View>
      {label && (
        <Text variant="bodyMd" color={labelColor} style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export interface RadioProps extends TouchableOpacityProps {
  selected: boolean;
  onSelect: () => void;
  label?: string;
  disabled?: boolean;
}

export const Radio: React.FC<RadioProps> = ({
  selected,
  onSelect,
  label,
  disabled = false,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onSelect}
      style={[styles.container, disabled && styles.disabled, style]}
      {...props}
    >
      <View
        style={[
          styles.radioBox,
          selected ? styles.radioSelectedBorder : styles.uncheckedBox,
        ]}
      >
        {selected && <View style={styles.radioInnerDot} />}
      </View>
      {label && (
        <Text variant="bodyMd" color={AppColors.text} style={styles.label}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxBox: {
    width: 28,
    height: 28,
    borderRadius: Rounded.sm, // 8px
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  checkedBox: {
    backgroundColor: AppColors.action,
    borderColor: AppColors.action,
  },
  uncheckedBox: {
    backgroundColor: 'transparent',
    borderColor: Colors.outline,
  },
  radioBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  radioSelectedBorder: {
    borderColor: AppColors.action,
    backgroundColor: 'transparent',
  },
  radioInnerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: AppColors.action,
  },
  label: {
    marginLeft: 12,
  },
  disabled: {
    opacity: 0.5,
  },
});
