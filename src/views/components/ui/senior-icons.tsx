/**
 * Lightweight icon wrapper for the senior UI.
 * Uses lucide-react-native for a modern, tech-style developer aesthetic.
 */
import React from 'react';
import {
  Phone,
  Mic,
  CheckCircle,
  AlarmClock,
  Heart,
  Volume2,
  ShieldAlert,
  Bell,
  Home,
  Pill,
  Calendar,
  Users,
  Headset,
  Activity,
  ChevronRight,
  CheckSquare,
  RefreshCw,
  Siren,
  TriangleAlert,
  HeartPulse,
} from 'lucide-react-native';

const ICON_MAP = {
  'phone': Phone,
  'mic': Mic,
  'check-circle': CheckCircle,
  'alarm': AlarmClock,
  'heart': Heart,
  'volume-up': Volume2,
  'emergency': ShieldAlert,
  'bell': Bell,
  'home': Home,
  'medication': Pill,
  'calendar': Calendar,
  'group': Users,
  'support': Headset,
  'health': Activity,
  'chevron-right': ChevronRight,
  'task-done': CheckSquare,
  'sync': RefreshCw,
  'e911': Siren,
  'sos': TriangleAlert,
  'cardiology': HeartPulse,
} as const;

export type SeniorIconName = keyof typeof ICON_MAP;

export interface SeniorIconProps {
  name: SeniorIconName;
  size?: number;
  color?: string;
  /** Ignored — kept for backward compat with the old SVG component */
  filled?: boolean;
  style?: object;
}

export const SeniorIcon: React.FC<SeniorIconProps> = ({
  name,
  size = 24,
  color = '#0F172A',
  style,
}) => {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) return null;

  return (
    <IconComponent
      size={size}
      color={color}
      style={style}
    />
  );
};
