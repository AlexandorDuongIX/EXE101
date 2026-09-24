import React from 'react';
import { TouchableOpacity, View, StyleSheet, TouchableOpacityProps } from 'react-native';
import { Text } from './text';
import { Colors, Rounded } from '@/constants/theme';

export interface CheckboxProps extends TouchableOpacityProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  disabled = false,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onToggle(!checked)}
      style={[styles.container, disabled && styles.disabled, style]}
      {...props}
    >
      <View
        style={[
          styles.checkboxBox,
          checked ? styles.checkedBox : styles.uncheckedBox,
        ]}
      >
        {checked && (
          <Text variant="labelLg" bold color={Colors.onPrimary} align="center">
            ✓
          </Text>
        )}
      </View>
      {label && (
        <Text variant="bodyMd" color={Colors.onSurface} style={styles.label}>
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
        <Text variant="bodyMd" color={Colors.onSurface} style={styles.label}>
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
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
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
    borderColor: Colors.primaryContainer,
    backgroundColor: 'transparent',
  },
  radioInnerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryContainer,
  },
  label: {
    marginLeft: 12,
  },
  disabled: {
    opacity: 0.5,
  },
});
