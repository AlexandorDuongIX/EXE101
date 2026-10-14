import React, { useRef, useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Text } from './text';
import { AppColors, Colors, Rounded } from '@/views/styles/theme';

// --- Standard Input Props ---
export interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Override the outer input surface without changing the shared defaults. */
  containerStyle?: StyleProp<ViewStyle>;
  labelColor?: string;
  errorColor?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  labelColor = AppColors.textSecondary,
  errorColor = AppColors.error,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      {label && (
        <Text variant="labelSm" color={labelColor} style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedBorder,
          !!error && [styles.errorBorder, { borderColor: errorColor }],
          containerStyle,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <RNTextInput
          style={[styles.textInput, style]}
          placeholderTextColor={Colors.outline}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {error && (
        <Text variant="bodySm" color={errorColor} style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
};

// --- Phone Input Component (+84 Vietnam Flag) ---
export interface PhoneInputProps extends Omit<InputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  countryCode?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  countryCode = '+84',
  label = 'Số điện thoại',
  error,
  containerStyle,
  labelColor = AppColors.textSecondary,
  errorColor = AppColors.error,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      {label && (
        <Text variant="labelSm" color={labelColor} style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.phoneInputContainer,
          isFocused && styles.focusedBorder,
          !!error && [styles.errorBorder, { borderColor: errorColor }],
          containerStyle,
        ]}
      >
        <TouchableOpacity style={styles.countrySelector} activeOpacity={0.7}>
          <Text variant="bodyLg">🇻🇳</Text>
          <Text variant="labelMd" bold color={AppColors.text} style={styles.countryCodeText}>
            {countryCode}
          </Text>
          <View style={styles.divider} />
        </TouchableOpacity>
        <RNTextInput
          style={styles.phoneTextInput}
          keyboardType="phone-pad"
          placeholder="0912 345 678"
          placeholderTextColor={Colors.outline}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={14}
          {...props}
        />
      </View>
      {error && (
        <Text variant="bodySm" color={errorColor} style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
};

// --- OTP Verification Input (6-pill containers) ---
export interface OTPInputProps {
  length?: number;
  value: string;
  onChangeOTP: (otp: string) => void;
  error?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChangeOTP,
  error,
}) => {
  const inputRef = useRef<RNTextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleCellPress = () => {
    inputRef.current?.focus();
  };

  const digits = value.split('');

  return (
    <View style={styles.fieldContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleCellPress}
        style={styles.otpRow}
      >
        {Array.from({ length }).map((_, index) => {
          const char = digits[index] || '';
          const isCurrentIndex = index === digits.length;
          const isCellFocused = isFocused && (isCurrentIndex || (index === length - 1 && digits.length === length));

          return (
            <View
              key={index}
              style={[
                styles.otpCell,
                isCellFocused && styles.otpCellFocused,
                !!error && styles.errorBorder,
              ]}
            >
              <Text variant="headlineMd" bold align="center" color={AppColors.text}>
                {char}
              </Text>
            </View>
          );
        })}
      </TouchableOpacity>

      {/* Hidden input to handle keyboard */}
      <RNTextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
          onChangeOTP(cleaned);
        }}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {error && (
        <Text variant="bodySm" color={AppColors.error} align="center" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 6,
  },
  inputContainer: {
    minHeight: 56,
    borderRadius: Rounded.default,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInputContainer: {
    minHeight: 56,
    borderRadius: Rounded.default,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  countryCodeText: {
    marginLeft: 6,
    marginRight: 10,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: AppColors.border,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 18,
    color: AppColors.text,
    letterSpacing: 1.2,
  },
  focusedBorder: {
    borderColor: AppColors.action,
    backgroundColor: AppColors.surface,
  },
  errorBorder: {
    borderColor: AppColors.error,
  },
  iconContainer: {
    marginHorizontal: 4,
  },
  errorText: {
    marginTop: 4,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  otpCell: {
    width: 48,
    height: 56,
    borderRadius: Rounded.default,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpCellFocused: {
    borderColor: AppColors.action,
    backgroundColor: AppColors.surface,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
