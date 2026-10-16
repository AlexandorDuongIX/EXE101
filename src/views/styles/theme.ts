/**
 * Design System Theme - Intergenerational Caregiving & Warm Modern Healthcare
 * Auto-generated based on design specification.
 */

import { Platform } from 'react-native';

import { Colors } from './colors';

export { AppColors, Colors, HealthColors, OverlayColors, PrimaryColors, StatusColors } from './colors';
export type { AppPalette, ThemeColor } from './colors';

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  fontFamily: Platform.select({
    ios: 'BeVietnamPro-Regular',
    android: 'BeVietnamPro_400Regular',
    default: 'Be Vietnam Pro, system-ui, sans-serif',
  }),
  fontFamilyBold: Platform.select({
    ios: 'BeVietnamPro-Bold',
    android: 'BeVietnamPro_700Bold',
    default: 'Be Vietnam Pro, system-ui, sans-serif',
  }),
  fontFamilySemiBold: Platform.select({
    ios: 'BeVietnamPro-SemiBold',
    android: 'BeVietnamPro_600SemiBold',
    default: 'Be Vietnam Pro, system-ui, sans-serif',
  }),

  styles: {
    headlineXl: {
      fontSize: 40,
      fontWeight: '700' as const,
      lineHeight: 52,
    },
    headlineXlMobile: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    headlineLg: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 44,
    },
    headlineLgMobile: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 34,
    },
    headlineMd: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 34,
    },
    headlineSm: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 30,
    },
    bodyXl: {
      fontSize: 20,
      fontWeight: '400' as const,
      lineHeight: 32,
    },
    bodyLg: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 28,
    },
    bodyMd: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 26,
    },
    bodySm: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 22,
    },
    labelLg: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    labelMd: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    labelSm: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
  },
} as const;

export const Rounded = {
  sm: 8,
  default: 16,
  md: 24,
  lg: 32,
  xl: 48,
  full: 9999,
} as const;

export const Spacing = {
  // Legacy numeric tokens
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,

  // New design system tokens
  gutter: 16,
  gutterTablet: 24,
  gutterDesktop: 32,
  margin: 20,
  marginTablet: 32,
  marginDesktop: 48,
  spaceXs: 6,
  spaceSm: 12,
  spaceMd: 20,
  spaceLg: 28,
  spaceXl: 40,
} as const;

export const Shadows = {
  layer1: {
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  layer2: {
    shadowColor: Colors.slateNavy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  sosGlow: {
    shadowColor: Colors.sosEmergency,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
