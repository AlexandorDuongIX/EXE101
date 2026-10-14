/** Shared fixed colors for KithCare screens and components. */

export const Colors = {
  // Backward compatibility for Expo template
  light: {
    text: '#111c2d',
    background: '#f9f9ff',
    backgroundElement: '#f0f3ff',
    backgroundSelected: '#e7eeff',
    textSecondary: '#3e4947',
    primary: '#005c55',
  },
  dark: {
    text: '#ecf1ff',
    background: '#111c2d',
    backgroundElement: '#263143',
    backgroundSelected: '#3e4947',
    textSecondary: '#bdc9c6',
    primary: '#80d5cb',
  },

  // Surface tokens
  surface: '#f9f9ff',
  surfaceDim: '#cfdaf2',
  surfaceBright: '#f9f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dee8ff',
  surfaceContainerHighest: '#d8e3fb',
  onSurface: '#111c2d',
  onSurfaceVariant: '#3e4947',
  inverseSurface: '#263143',
  inverseOnSurface: '#ecf1ff',
  outline: '#6e7977',
  outlineVariant: '#bdc9c6',
  surfaceTint: '#006a63',
  surfaceVariant: '#d8e3fb',

  // Primary palette (Deep Warm Teal)
  primary: '#005c55',
  onPrimary: '#ffffff',
  primaryContainer: '#0f766e',
  onPrimaryContainer: '#a3faef',
  inversePrimary: '#80d5cb',
  primaryFixed: '#9cf2e8',
  primaryFixedDim: '#80d5cb',
  onPrimaryFixed: '#00201d',
  onPrimaryFixedVariant: '#00504a',

  // Secondary palette (Warm Amber Coral)
  secondary: '#9d4300',
  onSecondary: '#ffffff',
  secondaryContainer: '#fd761a',
  onSecondaryContainer: '#5c2400',
  secondaryFixed: '#ffdbca',
  secondaryFixedDim: '#ffb690',
  onSecondaryFixed: '#341100',
  onSecondaryFixedVariant: '#783200',

  // Tertiary palette (Amber Gold)
  tertiary: '#734700',
  onTertiary: '#ffffff',
  tertiaryContainer: '#945d00',
  onTertiaryContainer: '#ffe6cc',
  tertiaryFixed: '#ffddb8',
  tertiaryFixedDim: '#ffb95f',
  onTertiaryFixed: '#2a1700',
  onTertiaryFixedVariant: '#653e00',

  // Error & Emergency (Crimson Alert)
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  sosEmergency: '#ef4444',

  // Background & Neutral Base
  background: '#f9f9ff',
  onBackground: '#111c2d',
  slateNavy: '#1e293b',
  tintedIvory: '#fafaf9',
  warmCream: '#f1f5f9',
} as const;

export const PrimaryColors = {
  surface: '#F0FDFA',
  border: '#CCFBF1',
  borderStrong: '#99F6E4',
  borderSubtle: 'rgba(15, 118, 110, 0.08)',
  ring: 'rgba(15, 118, 110, 0.2)',
} as const;

export const StatusColors = {
  success: {
    surface: '#ECFDF5', selected: '#D1FAE5', border: '#A7F3D0',
    borderStrong: '#6EE7B7', accent: '#10B981', action: '#059669', text: '#065F46',
  },
  warning: {
    surface: '#FFFBEB', selected: '#FEF3C7', border: '#FDE68A',
    accent: '#F59E0B', icon: '#D97706', label: '#B45309', text: '#92400E',
  },
  tired: { surface: '#FFF1F2', selected: '#FFE4E6', accent: '#F43F5E', text: '#9F1239' },
  error: { surface: '#FEF2F2', text: '#991B1B', accent: Colors.sosEmergency },
  info: { surface: '#E0F2FE', text: '#0C4A6E', accent: '#0EA5E9' },
  emergency: { action: '#DC2626', text: Colors.onError },
} as const;

export const OverlayColors = {
  header: 'rgba(249,250,255,0.92)',
  separator: 'rgba(0,0,0,0.05)',
  separatorSubtle: 'rgba(0,0,0,0.04)',
  card: 'rgba(255,255,255,0.95)',
  navigation: 'rgba(255,255,255,0.97)',
  white10: 'rgba(255,255,255,0.1)',
  white20: 'rgba(255,255,255,0.2)',
  white25: 'rgba(255,255,255,0.25)',
  white30: 'rgba(255,255,255,0.3)',
  textOnColor: 'rgba(255,255,255,0.9)',
} as const;

/** Fixed application palette shared by every screen, independent of system appearance. */
export const AppColors = {
  background: Colors.background,
  backgroundElement: Colors.surfaceContainerLow,
  backgroundSelected: Colors.surfaceContainer,
  surface: Colors.surfaceContainerLowest,
  surfaceMuted: Colors.surfaceContainerLow,
  surfaceSelected: Colors.surfaceContainer,
  text: Colors.onSurface,
  textSecondary: Colors.onSurfaceVariant,
  primary: Colors.primary,
  action: Colors.primaryContainer,
  onPrimary: Colors.onPrimary,
  secondary: Colors.secondary,
  secondarySoft: '#FFF7ED',
  secondarySoftText: '#C2410C',
  border: Colors.outlineVariant,
  error: Colors.error,
  errorSurface: Colors.errorContainer,
  emergency: StatusColors.emergency.action,
  shadow: '#000',
} as const;

export type AppPalette = Readonly<{ [Key in keyof typeof AppColors]: string }>;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
