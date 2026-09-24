import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Typography, Colors } from '@/constants/theme';

export type TypographyVariant = keyof typeof Typography.styles;

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  bold?: boolean;
  semiBold?: boolean;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text: React.FC<TextProps> = ({
  variant = 'bodyMd',
  color = Colors.onSurface,
  bold = false,
  semiBold = false,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const variantStyle = Typography.styles[variant] || Typography.styles.bodyMd;
  const fontFamily = bold
    ? Typography.fontFamilyBold
    : semiBold
    ? Typography.fontFamilySemiBold
    : Typography.fontFamily;

  return (
    <RNText
      style={[
        styles.base,
        variantStyle,
        { color, fontFamily, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
